import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';

export default function ResetPassword({ email }) {
    const { data, setData, post, processing, errors } = useForm({
        email: email || '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post('/reset-password');
    };

    return (
        <div className="min-h-screen flex w-full bg-page font-sans">
            <Head title="Atur Ulang Kata Sandi - FruityPOS" />
            
            {/* Left Side: Brand Experience */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-primary">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/30 to-primary/95 z-10" />
                <img 
                    src="/images/login-bg.png" 
                    alt="FruityPOS Banner" 
                    className="absolute inset-0 w-full h-full object-cover z-0 opacity-90"
                />
                
                <div className="relative z-20 flex flex-col justify-end p-16 h-full text-white w-full">
                    <div className="mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-white font-bold text-3xl mb-6 shadow-2xl border border-white/20 backdrop-blur-md">
                            🍊
                        </div>
                        <h1 className="text-5xl font-extrabold tracking-tight mb-4 drop-shadow-lg">
                            Selamat Datang
                        </h1>
                        <p className="text-xl text-gray-100 font-light max-w-md drop-shadow-md leading-relaxed">
                            Kelola inventaris buah segar dan transaksi harian Anda dengan presisi botani. Platform kasir modern untuk pertumbuhan bisnis yang lebih hijau.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side: Reset Password Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
                <div className="w-full max-w-[440px]">
                    <div className="text-left mb-10">
                        {/* Mobile Logo */}
                        <div className="lg:hidden w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-md border border-white/10">
                            🍊
                        </div>
                        <h2 className="text-3xl font-bold text-primary mb-2">Atur Ulang Kata Sandi</h2>
                        <p className="text-text-secondary">
                            Masukkan kata sandi baru Anda untuk mengamankan kembali akun Anda.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Field: New Password */}
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Kata Sandi Baru</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    className={`w-full pl-11 pr-12 py-3.5 bg-card border rounded-xl focus:outline-none focus:ring-4 focus:ring-accent/20 focus:border-accent transition-all duration-200 tracking-wide ${errors.password ? 'border-danger focus:border-danger text-danger' : 'border-border text-text-primary'}`}
                                    placeholder="••••••••"
                                    required
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-text-primary focus:outline-none"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a10.05 10.05 0 015.188-1.583c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0l-3.29-3.29" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className="mt-2 text-sm text-danger">{errors.password}</p>}
                        </div>

                        {/* Field: Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Konfirmasi Kata Sandi Baru</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </span>
                                <input
                                    type={showPasswordConfirm ? 'text' : 'password'}
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                    className={`w-full pl-11 pr-12 py-3.5 bg-card border rounded-xl focus:outline-none focus:ring-4 focus:ring-accent/20 focus:border-accent transition-all duration-200 tracking-wide ${errors.password_confirmation ? 'border-danger focus:border-danger text-danger' : 'border-border text-text-primary'}`}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-text-primary focus:outline-none"
                                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                >
                                    {showPasswordConfirm ? (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a10.05 10.05 0 015.188-1.583c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0l-3.29-3.29" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Password Requirements Info */}
                        <div className="bg-gray-50/50 p-4 rounded-xl border border-border/50 space-y-2">
                            <div className="flex items-start">
                                <svg className={`w-4 h-4 mt-0.5 mr-2 ${data.password.length >= 8 ? 'text-success' : 'text-text-muted'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className={`text-sm ${data.password.length >= 8 ? 'text-success font-medium' : 'text-text-secondary'}`}>
                                    Minimal 8 Karakter
                                </span>
                            </div>
                            <div className="flex items-start">
                                <svg className={`w-4 h-4 mt-0.5 mr-2 ${data.password === data.password_confirmation && data.password.length > 0 ? 'text-success' : 'text-text-muted'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className={`text-sm ${data.password === data.password_confirmation && data.password.length > 0 ? 'text-success font-medium' : 'text-text-secondary'}`}>
                                    Kata Sandi Sama
                                </span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-secondary hover:bg-[#205436] focus:outline-none focus:ring-4 focus:ring-accent/30 active:scale-[0.98] transition-all disabled:opacity-75 disabled:active:scale-100 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {processing ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Menyimpan...
                                    </span>
                                ) : 'Perbarui Kata Sandi'}
                            </button>
                        </div>
                    </form>
                    
                </div>
            </div>
        </div>
    );
}
