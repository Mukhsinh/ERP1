"use client";

import React, { useState } from 'react';
import {
    ArrowLeftRight,
    Wallet,
    Building2,
    ArrowRight,
    Save,
    X,
    AlertCircle,
    CheckCircle2,
    Info,
    History,
    Search,
    ChevronRight,
    Zap,
    Briefcase
} from 'lucide-react';

const accounts = [
    { id: '1', name: 'Kas Kecil (Petty Cash)', balance: 15000000, type: 'KAS TUNAI' },
    { id: '2', name: 'Brankas Utama (Vault)', balance: 435000000, type: 'KAS TUNAI' },
    { id: '3', name: 'Bank BCA Operasional', balance: 820000000, type: 'BANK' },
    { id: '4', name: 'Bank Mandiri Payroll', balance: 430000000, type: 'BANK' },
    { id: '5', name: 'Deposito Bank Mega', balance: 800000000, type: 'SETARA KAS' },
];

export default function CashTransferPage() {
    const [fromAccount, setFromAccount] = useState('');
    const [toAccount, setToAccount] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [isTransferring, setIsTransferring] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const formatIDR = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(val).replace('Rp', 'Rp ');
    };

    const handleTransfer = async () => {
        if (!fromAccount || !toAccount || !amount || amount === '0') return;

        setIsTransferring(true);
        // Simulate API call to /api/cash-management/transfer
        await new Promise(resolve => setTimeout(resolve, 2000));

        setIsTransferring(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);

        setFromAccount('');
        setToAccount('');
        setAmount('');
        setDescription('');
    };

    return (
        <div className="p-8 space-y-8 max-w-[1400px] mx-auto min-h-screen">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <ArrowLeftRight className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Treasury Operations</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Aksi Pergeseran Kas</h2>
                    <p className="text-slate-500 mt-1 font-medium text-sm">Pemindahan dana antar akun kas, bank, dan penempatan deposito berjangka.</p>
                </div>

                <button className="flex items-center gap-3 bg-white border-2 border-slate-50 hover:border-indigo-100 px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-600 transition-all shadow-sm">
                    <History className="w-4 h-4" /> Riwayat Transfer
                </button>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Transfer Form Container */}
                <div className="xl:col-span-8">
                    <div className="bg-white border-2 border-slate-50 rounded-[40px] shadow-sm p-12 space-y-12">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                                <div className="p-2 bg-indigo-600 rounded-xl text-white">
                                    <Zap className="w-5 h-5" />
                                </div>
                                Konfigurasi Pemindahan Dana
                            </h3>
                            {showSuccess && (
                                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-100 animate-in fade-in slide-in-from-top-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Transfer Berhasil & Terjurnal</span>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-11 gap-6 items-center">
                            {/* Source Account */}
                            <div className="md:col-span-5 space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Akun Asal (Sumber Dana)</label>
                                <div className="relative group">
                                    <select
                                        value={fromAccount}
                                        onChange={(e) => setFromAccount(e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-3xl py-5 px-8 text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all appearance-none cursor-pointer shadow-sm"
                                    >
                                        <option value="">-- Pilih Akun Asal --</option>
                                        {accounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.name} ({formatIDR(acc.balance)})</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            {/* Arrow Divider */}
                            <div className="md:col-span-1 flex justify-center pt-6">
                                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shadow-lg shadow-indigo-100/50">
                                    <ArrowRight className="w-6 h-6" />
                                </div>
                            </div>

                            {/* Destination Account */}
                            <div className="md:col-span-5 space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Akun Tujuan (Destinasi)</label>
                                <div className="relative group">
                                    <select
                                        value={toAccount}
                                        onChange={(e) => setToAccount(e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-3xl py-5 px-8 text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all appearance-none cursor-pointer shadow-sm"
                                    >
                                        <option value="">-- Pilih Akun Tujuan --</option>
                                        {accounts.filter(acc => acc.id !== fromAccount).map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.name} ({formatIDR(acc.balance)})</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <Briefcase className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nominal Transfer (IDR)</label>
                                <div className="relative">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Rp</div>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0"
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-3xl py-5 pl-14 pr-8 text-2xl font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-sm tracking-tighter"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Keterangan / Memo</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Contoh: Pengisian petty cash operasional"
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-3xl py-5 px-8 text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-[32px] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                                    <Info className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-400 mb-1">Impact Penjurnalan Otomatis</p>
                                    <p className="text-xs text-slate-400 leading-relaxed font-medium">Transaksi ini akan memicu jurnal <span className="text-white">Double-Entry</span> secara real-time. Debet pada akun tujuan dan Kredit pada akun asal.</p>
                                </div>
                            </div>
                            <button
                                onClick={handleTransfer}
                                disabled={isTransferring || !fromAccount || !toAccount || !amount}
                                className="w-full md:w-auto bg-indigo-600 hover:bg-white hover:text-slate-900 disabled:opacity-30 text-white font-bold px-12 py-5 rounded-[24px] shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all text-[11px] uppercase tracking-[0.2em] whitespace-nowrap"
                            >
                                {isTransferring ? 'Memproses...' : 'Eksekusi Transfer'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Transfer Rules & Summary */}
                <div className="xl:col-span-4 space-y-8">
                    <div className="bg-white border-2 border-slate-50 rounded-[40px] shadow-sm p-10 space-y-8">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em] border-b-2 border-slate-50 pb-4">Protokol Pemindahan Dana</h3>

                        <div className="space-y-6">
                            {[
                                { title: 'Verifikasi Saldo', desc: 'Sistem memvalidasi ketersediaan dana pada akun asal sebelum eksekusi.', icon: CheckCircle2 },
                                { title: 'Sinkronisasi GL', desc: 'Buku besar akuntansi akan diperbarui secara otomatis dan instan.', icon: CheckCircle2 },
                                { title: 'Jejak Audit', desc: 'Setiap pergeseran dicatat lengkap dengan User ID dan timestamp.', icon: CheckCircle2 },
                            ].map((rule, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <rule.icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight">{rule.title}</h4>
                                        <p className="text-[10px] text-slate-400 font-medium mt-1 leading-relaxed">{rule.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-indigo-600 rounded-[40px] p-10 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:rotate-12 transition-all">
                            <ArrowLeftRight className="w-24 h-24 text-white" />
                        </div>
                        <h4 className="text-lg font-bold tracking-tight mb-2">Penempatan Deposito?</h4>
                        <p className="text-xs text-indigo-100 font-medium leading-relaxed mb-8">
                            Gunakan menu ini untuk memindahkan dana dari Bank ke Rekening Deposito. Sistem akan otomatis menjurnal transaksi sebagai <span className="text-white font-bold">Penempatan Setara Kas</span>.
                        </p>
                        <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-white/10 hover:bg-white hover:text-indigo-600 px-6 py-3 rounded-2xl transition-all border border-white/20">
                            Pelajari Selengkapnya <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
