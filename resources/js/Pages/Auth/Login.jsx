import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        username: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <div className="min-h-screen flex w-full bg-page font-sans">
            <Head title="Masuk" />
            
            {/* Left/Top Side: Artwork */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-primary">
                {/* Image Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/30 to-primary/95 z-10" />
                <img 
                    src="/images/login-bg.png" 
                    alt="FruityPOS Banner" 
                    className="absolute inset-0 w-full h-full object-cover z-0 opacity-90"
                />
                
                {/* Content */}
                <div className="relative z-20 flex flex-col justify-end p-16 h-full text-white w-full">
                    <div className="mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-white font-bold text-3xl mb-6 shadow-2xl border border-white/20 backdrop-blur-md">
                            🍊
                        </div>
                        <h1 className="text-5xl font-extrabold tracking-tight mb-4 drop-shadow-lg">
                            FruityPOS
                        </h1>
                        <p className="text-xl text-gray-100 font-light max-w-md drop-shadow-md leading-relaxed">
                            Centralized Retail & POS System untuk Toko Buah Multi-Cabang.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right/Bottom Side: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
                <div className="w-full max-w-[440px]">
                    <div className="text-left mb-10">
                        {/* Mobile Logo */}
                        <div className="lg:hidden w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-md border border-white/10">
                            🍊
                        </div>
                        <h2 className="text-3xl font-bold text-primary mb-2">Selamat Datang 👋</h2>
                        <p className="text-text-secondary">Silakan masuk ke akun Anda untuk melanjutkan.</p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Username</label>
                            <input
                                type="text"
                                value={data.username}
                                onChange={e => setData('username', e.target.value)}
                                className={`w-full px-4 py-3.5 bg-card border rounded-xl focus:outline-none focus:ring-4 focus:ring-accent/20 focus:border-accent transition-all duration-200 ${errors.username ? 'border-danger focus:border-danger focus:ring-danger/20 text-danger' : 'border-border text-text-primary'}`}
                                placeholder="Masukkan username"
                            />
                            {errors.username && <p className="mt-2 text-sm text-danger">{errors.username}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    className={`w-full px-4 py-3.5 bg-card border ${errors.password ? 'border-danger focus:border-danger focus:ring-danger/20 text-danger' : 'border-border text-text-primary'} rounded-xl focus:outline-none focus:ring-4 focus:ring-accent/20 focus:border-accent transition-all duration-200 pr-12`}
                                    placeholder="••••••••"
                                />
                                <button 
                                    type="button"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors focus:outline-none"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className="mt-2 text-sm text-danger">{errors.password}</p>}
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-secondary rounded border-gray-300 focus:ring-accent cursor-pointer"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-text-secondary cursor-pointer">
                                    Ingat saya
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link href="/forgot-password" className="font-medium text-secondary hover:text-accent transition-colors">
                                    Lupa password?
                                </Link>
                            </div>
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
                                        Memproses...
                                    </span>
                                ) : 'Masuk Sistem'}
                            </button>
                        </div>
                    </form>
                    
                    <div className="mt-14 text-center text-[13px] text-text-muted">
                        &copy; {new Date().getFullYear()} FruityPOS. All rights reserved.
                    </div>
                </div>
            </div>
        </div>
    );
}
