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
            return back()->with('status', 'Kode OTP 6-Digit telah dikirimkan ke email Anda!');
        } catch (\Exception $e) {
            return back()->withErrors(['email' => 'Gagal mengirim email. Pastikan konfigurasi SMTP Anda sudah benar.']);
        }
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
}
