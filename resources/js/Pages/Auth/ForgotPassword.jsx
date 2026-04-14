import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    // Simulasi state sukses jika OTP dikirim (untuk UI mockup)
    // Di aplikasi nyata, kita akan mengarahkan ke halaman input OTP
    const submit = (e) => {
        e.preventDefault();
        post('/forgot-password');
    };

    return (
        <div className="min-h-screen flex w-full bg-page font-sans">
            <Head title="Lupa Password" />
            
            {/* Left/Top Side: Artwork (Consistent with Login) */}
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
                            FruityPOS
                        </h1>
                        <p className="text-xl text-gray-100 font-light max-w-md drop-shadow-md leading-relaxed">
                            Pemulihan Keamanan Terpusat untuk Operasional Sistem Anda.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right/Bottom Side: Forgot Password Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
                <div className="w-full max-w-[440px]">
                    <div className="text-left mb-10">
                        {/* Mobile Logo */}
                        <div className="lg:hidden w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-md border border-white/10">
                            🍊
                        </div>
                        <h2 className="text-3xl font-bold text-primary mb-2">Lupa Password? 🔐</h2>
                        <p className="text-text-secondary">
                            Jangan khawatir. Masukkan email yang terdaftar, dan kami akan mengirimkan <span className="font-semibold text-text-primary">6-digit kode OTP</span> untuk mereset password Anda.
                        </p>
                    </div>

                    {status && (
                        <div className="mb-6 p-4 rounded-xl bg-success-bg text-success border border-success/20 text-sm font-medium">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Alamat Email</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </span>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className={`w-full pl-11 pr-4 py-3.5 bg-card border rounded-xl focus:outline-none focus:ring-4 focus:ring-accent/20 focus:border-accent transition-all duration-200 ${errors.email ? 'border-danger focus:border-danger focus:ring-danger/20 text-danger' : 'border-border text-text-primary'}`}
                                    placeholder="contoh@buah.com"
                                    required
                                    autoFocus
                                />
                            </div>
                            {errors.email && <p className="mt-2 text-sm text-danger">{errors.email}</p>}
                        </div>

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
                                        Mengirim...
                                    </span>
                                ) : 'Kirim Kode OTP'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center text-sm font-medium text-text-secondary hover:text-accent transition-colors"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Kembali ke Halaman Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
