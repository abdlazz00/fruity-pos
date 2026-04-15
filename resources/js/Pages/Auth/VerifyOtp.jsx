import React, { useState, useRef, useEffect } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';

export default function VerifyOtp({ status, email }) {
    const { data, setData, post, processing, errors } = useForm({
        email: email || '',
        otp: '',
    });

    const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);

    const [timeLeft, setTimeLeft] = useState(60);
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        }
    }, [timeLeft]);

    useEffect(() => {
        // Jika ada status sukses baru (misal karena resend OTP), reset form dan timer
        if (status) {
            setOtpArray(['', '', '', '', '', '']);
            setData('otp', '');
            if (inputRefs.current[0]) inputRefs.current[0].focus();
            setTimeLeft(60); // reset timer
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    const handleOtpChange = (index, value) => {
        if (!/^[0-9]*$/.test(value)) return;
        
        const newOtpArray = [...otpArray];
        newOtpArray[index] = value;
        setOtpArray(newOtpArray);
        setData('otp', newOtpArray.join(''));

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text/plain').slice(0, 6).replace(/[^0-9]/g, '');
        if (pastedData) {
            const newOtpArray = [...otpArray];
            pastedData.split('').forEach((char, i) => {
                if (i < 6) newOtpArray[i] = char;
            });
            setOtpArray(newOtpArray);
            setData('otp', newOtpArray.join(''));
            
            // Focus the correct input
            const nextIndex = Math.min(pastedData.length, 5);
            if (inputRefs.current[nextIndex]) {
                inputRefs.current[nextIndex].focus();
            } else if (inputRefs.current[5]) {
                inputRefs.current[5].focus();
            }
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post('/verify-otp');
    };

    const handleResend = () => {
        if (timeLeft > 0) return;
        setIsResending(true);
        router.post('/forgot-password', { email: data.email }, {
            onSuccess: () => {
                setTimeLeft(60);
                setIsResending(false);
            },
            onError: () => setIsResending(false)
        });
    };

    return (
        <div className="min-h-screen flex w-full bg-page font-sans">
            <Head title="Verifikasi OTP - FruityPOS" />
            
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
                            Verifikasi OTP
                        </h1>
                        <p className="text-xl text-gray-100 font-light max-w-md drop-shadow-md leading-relaxed">
                            Kelola inventaris buah segar dan transaksi harian Anda dengan presisi botani. Platform kasir modern untuk pertumbuhan bisnis yang lebih hijau.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right/Bottom Side: OTP Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
                <div className="w-full max-w-[440px]">
                    <div className="text-left mb-10">
                        {/* Mobile Logo */}
                        <div className="lg:hidden w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-md border border-white/10">
                            🍊
                        </div>
                        <h2 className="text-3xl font-bold text-primary mb-2">Verifikasi OTP</h2>
                        <p className="text-text-secondary">
                            Kami telah mengirimkan kode ke email Anda. Masukkan <span className="font-semibold text-text-primary">6 digit kode</span> tersebut untuk melanjutkan.
                        </p>
                    </div>

                    {status && (
                        <div className="mb-6 p-4 rounded-xl bg-success-bg text-success border border-success/20 text-sm font-medium">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-text-primary mb-2">Kode OTP</label>
                            <div className="flex justify-between space-x-2 sm:space-x-4 mb-4">
                                {otpArray.map((digit, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        maxLength="1"
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={handlePaste}
                                        className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl border focus:outline-none focus:ring-4 focus:ring-accent/20 focus:border-accent transition-all duration-200 bg-card ${
                                            errors.otp || errors.email 
                                                ? 'border-danger focus:border-danger text-danger' 
                                                : 'border-border text-text-primary'
                                        }`}
                                        autoFocus={index === 0}
                                    />
                                ))}
                            </div>
                            {(errors.otp || errors.email) && (
                                <p className="mt-2 text-sm text-danger text-center">
                                    {errors.otp || errors.email}
                                </p>
                            )}
                        </div>

                        {/* Timer & Resend */}
                        <div className="flex flex-col items-center justify-center space-y-2 mb-6">
                            <p className="text-sm font-medium text-text-muted">
                                {timeLeft > 0 ? (
                                    <>Kirim ulang kode dalam <span className="text-primary font-bold">00:{timeLeft.toString().padStart(2, '0')}</span></>
                                ) : (
                                    <span>Tidak menerima kode?</span>
                                )}
                            </p>
                            {timeLeft === 0 && (
                                <button
                                    type="button"
                                    disabled={isResending}
                                    onClick={handleResend}
                                    className="text-sm font-bold text-accent hover:text-primary transition-colors focus:outline-none focus:underline"
                                >
                                    {isResending ? 'Mengirim Ulang...' : 'Kirim Ulang Kode OTP'}
                                </button>
                            )}
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing || data.otp.length !== 6}
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-secondary hover:bg-[#205436] focus:outline-none focus:ring-4 focus:ring-accent/30 active:scale-[0.98] transition-all disabled:opacity-75 disabled:active:scale-100 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {processing ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Memverifikasi...
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        Verifikasi OTP
                                        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                        </svg>
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center bg-gray-50/50 p-4 rounded-xl border border-border/50">
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
