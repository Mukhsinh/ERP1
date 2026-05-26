"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Banknote,
    Mail,
    Lock,
    Loader2,
    AlertCircle,
    ArrowRight,
    ShieldCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Attempting login for:', email);
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
                setLoading(false);
            } else {
                window.location.href = '/';
            }
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan sistem');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Elegant decorative backgrounds */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px]" />

            <div className="w-full max-w-md z-10">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-[32px] bg-gradient-to-br from-indigo-600 to-indigo-800 shadow-2xl shadow-indigo-200 mb-8 group transition-transform hover:scale-110 hover:rotate-3">
                        <Banknote className="w-10 h-10 text-white" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tighter">ERP AKAPRO</h1>
                        <div className="flex items-center justify-center gap-2">
                            <div className="h-[1px] w-4 bg-slate-200" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Management System</p>
                            <div className="h-[1px] w-4 bg-slate-200" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[48px] shadow-2xl shadow-slate-200/50 border-2 border-slate-50 relative group">
                    <div className="absolute -top-4 -right-4 p-4 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-100 rotate-12 transition-transform group-hover:rotate-0">
                        <ShieldCheck className="w-6 h-6" />
                    </div>

                    <form onSubmit={handleLogin} className="space-y-8">
                        {error && (
                            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-4 text-rose-600 text-xs font-bold animate-shake">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-indigo-600" />
                                Email Perusahaan
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                                    placeholder="name@company.co.id"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between ml-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-indigo-600" />
                                    Kata Sandi
                                </label>
                                <a href="#" className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors">Lupa Password?</a>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-5 rounded-[24px] text-xs uppercase tracking-widest transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 mt-4 hover:translate-y-[-2px] active:translate-y-[0px]"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Masuk ke Dashboard</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-12 space-y-4">
                    <p className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                        &copy; 2024 ERP AKAPRO Professional. Patuh Standar SAK Indonesia.
                    </p>
                    <div className="flex items-center justify-center gap-6 opacity-30 grayscale hover:grayscale-0 transition-all duration-500 cursor-help">
                        <div className="h-4 w-12 bg-slate-400 rounded-sm" /> {/* Placeholder for security certifications */}
                        <div className="h-4 w-16 bg-slate-400 rounded-sm" />
                        <div className="h-4 w-10 bg-slate-400 rounded-sm" />
                    </div>
                </div>
            </div>
        </div>
    );
}
