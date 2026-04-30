<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;



use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Requests\LoginRequest;
use App\Enums\Role;
use App\Mail\SendOtpMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;

class AuthController extends Controller
{
    public function showLogin()
    {
        return Inertia::render('Auth/Login');
    }

    public function showForgotPassword()
    {
        return Inertia::render('Auth/ForgotPassword');
    }

    public function sendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        // 1. Generate OTP 6 Digit
        $otp = rand(100000, 999999);

        // 2. Simpan ke Cache selama 10 menit
        Cache::put('otp_' . $request->email, $otp, now()->addMinutes(10));

        // 3. Kirim Email
        try {
            Mail::to($request->email)->send(new SendOtpMail($otp));
            return redirect()->route('password.verify', ['email' => $request->email])->with('status', 'Kode OTP 6-Digit telah dikirimkan ke email Anda!');
        } catch (\Exception $e) {
            return back()->withErrors(['email' => 'Gagal mengirim email. Pastikan konfigurasi SMTP Anda sudah benar.']);
        }
    }

    public function showVerifyOtp(Request $request)
    {
        if (!$request->has('email')) {
            return redirect()->route('password.request');
        }
        return Inertia::render('Auth/VerifyOtp', [
            'email' => $request->query('email'),
            'status' => session('status')
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6'
        ]);

        $cachedOtp = Cache::get('otp_' . $request->email);

        if (!$cachedOtp || (string)$cachedOtp !== $request->otp) {
            return back()->withErrors(['otp' => 'Kode OTP tidak valid atau sudah kadaluarsa.'])->withInput();
        }

        // OTP is valid
        Cache::forget('otp_' . $request->email);

        // Berikan izin untuk reset password dengan menyimpan session
        session(['reset_password_email' => $request->email]);

        return redirect()->route('password.reset.form');
    }

    public function showResetPassword()
    {
        if (!session('reset_password_email')) {
            return redirect()->route('password.request')->withErrors(['email' => 'Sesi Anda telah berakhir, silakan request OTP kembali.']);
        }

        return Inertia::render('Auth/ResetPassword', [
            'email' => session('reset_password_email')
        ]);
    }

    public function resetPassword(Request $request)
    {
        if (!session('reset_password_email') || session('reset_password_email') !== $request->email) {
            return redirect()->route('password.request')->withErrors(['email' => 'Akses tidak valid atau sesi kadaluarsa.']);
        }

        $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $user = \App\Models\User::where('email', $request->email)->first();
        if (!$user) {
            return back()->withErrors(['email' => 'Pengguna tidak ditemukan.']);
        }

        $user->password = \Illuminate\Support\Facades\Hash::make($request->password);
        $user->save();

        session()->forget('reset_password_email');

        return redirect()->route('login')->with('status', 'Kata sandi berhasil diatur ulang! Silakan login dengan kata sandi baru Anda.');
    }

    public function login(LoginRequest $request)
    {
        $credentials = $request->only('username', 'password');

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();
            
            // Temporary, check role later for specific redirection
            $user = Auth::user();
            if ($user->role === Role::OWNER) {
                return redirect()->intended('/dashboard');
            } elseif ($user->role === Role::STOCKIST) {
                return redirect()->intended('/master/products');
            } elseif ($user->role === Role::KASIR) {
                return redirect()->intended('/pos/offline');
            } elseif ($user->role === Role::ADMIN) {
                return redirect()->intended('/pos/online');
            }

            return redirect()->intended('/dashboard');
        }

        return back()->withErrors([
            'username' => 'The provided credentials do not match our records.',
        ])->onlyInput('username');
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }

    public function showChangePassword()
    {
        return Inertia::render('Auth/ChangePassword');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'password' => 'required|min:8|confirmed',
        ]);

        $user = auth()->user();
        $user->password = \Illuminate\Support\Facades\Hash::make($request->password);
        $user->must_change_password = false;
        $user->save();

        return redirect('/dashboard')->with('status', 'Kata sandi berhasil diubah.');
    }
}
