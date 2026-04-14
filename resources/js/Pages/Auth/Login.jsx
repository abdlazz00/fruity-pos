import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';

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
        <GuestLayout title="Masuk">
            <div className="text-center mb-8">
                <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xl">
                        🍊
                    </div>
                    <h1 className="text-2xl font-bold text-primary">FruityPOS</h1>
                </div>
                <p className="text-text-secondary text-sm">Sistem Point of Sale & Inventori</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="block text-[13px] text-text-secondary mb-1">Username</label>
                    <input
                        type="text"
                        value={data.username}
                        onChange={e => setData('username', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors ${errors.username ? 'border-danger text-danger' : 'border-border text-text-primary'}`}
                        placeholder="Masukkan username"
                    />
                    {errors.username && <p className="mt-1 text-[12px] text-danger">{errors.username}</p>}
                </div>

                <div>
                    <label className="block text-[13px] text-text-secondary mb-1">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors pr-10"
                            placeholder="••••••••"
                        />
                        <button 
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
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
                    {errors.password && <p className="mt-1 text-[12px] text-danger">{errors.password}</p>}
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-secondary hover:bg-[#245A3D] text-white py-2.5 rounded-lg active:scale-[0.98] transition-all font-medium"
                    >
                        {processing ? 'Memproses...' : 'Masuk'}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
