"use client";

import React, { useState, useEffect } from 'react';
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    ArrowRight,
    Search,
    Filter,
    Download,
    Activity,
    AlertCircle,
    CheckCircle2,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    PieChart,
    Building2,
    Briefcase,
    Zap,
    X
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    Pie,
    PieChart as RePieChart
} from 'recharts';

const dataLikuiditas = [
    { name: 'Kas Tunai', value: 450000000, color: '#6366f1' },
    { name: 'Bank', value: 1250000000, color: '#4f46e5' },
    { name: 'Setara Kas', value: 800000000, color: '#10b981' },
];

const dataArusKas = [
    { name: '01 Mei', saldo: 2100 },
    { name: '05 Mei', saldo: 2350 },
    { name: '10 Mei', saldo: 2200 },
    { name: '15 Mei', saldo: 2600 },
    { name: '20 Mei', saldo: 2450 },
    { name: '24 Mei', saldo: 2500 },
];

export default function CashPositionPage() {
    const [showOptimizeModal, setShowOptimizeModal] = useState(false);
    const totalCash = dataLikuiditas.reduce((sum, item) => sum + item.value, 0);
    const minOperational = 500000000; // Target Saldo Minimum
    const idleCash = totalCash - minOperational;

    const formatIDR = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(val).replace('Rp', 'Rp ');
    };

    return (
        <div className="p-8 space-y-8 max-w-[1400px] mx-auto min-h-screen">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <Activity className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Treasury & Liquidity Control</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Kondisi Kas (Cash Position)</h2>
                    <p className="text-slate-500 mt-1 font-medium text-sm">Monitoring likuiditas real-time, analisis dana mengendap, dan proyeksi arus kas.</p>
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-white border-2 border-slate-50 hover:border-indigo-100 px-5 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-600 transition-all shadow-sm">
                        <Download className="w-4 h-4" /> Ekspor Laporan
                    </button>
                    <button
                        onClick={() => setShowOptimizeModal(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-slate-900 text-white px-8 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-100"
                    >
                        <Zap className="w-4 h-4" /> Optimalisasi Kas
                    </button>
                </div>
            </header>

            {/* Cash Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border-2 border-slate-50 rounded-[40px] p-8 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                        <Building2 className="w-24 h-24 text-indigo-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Kas & Bank</p>
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tighter mt-0.5">{formatIDR(totalCash)}</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 w-fit">
                        <ArrowUpRight className="w-3.5 h-3.5" /> +4.2% Bulan Ini
                    </div>
                </div>

                <div className="bg-white border-2 border-slate-50 rounded-[40px] p-8 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                        <Activity className="w-24 h-24 text-rose-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dana Mengendap (Idle Cash)</p>
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tighter mt-0.5">{formatIDR(idleCash)}</h3>
                        </div>
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Target Saldo Min: <span className="text-slate-900">{formatIDR(minOperational)}</span>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-[40px] p-8 shadow-2xl shadow-indigo-100 flex flex-col justify-between group overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />
                    <div>
                        <div className="flex items-center gap-2 text-indigo-400 mb-2">
                            <PieChart className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Rasio Likuiditas</span>
                        </div>
                        <h3 className="text-xl font-bold text-white tracking-tight">Status Kas Operasional</h3>
                    </div>
                    <div className="mt-8 flex items-end justify-between">
                        <div>
                            <p className="text-3xl font-bold text-white tracking-tighter">Sangat Sehat</p>
                            <p className="text-[10px] text-slate-400 font-medium mt-1">Sertifikasi Likuiditas: 24/05/2026</p>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all">
                            <CheckCircle2 className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Liquid Assets Breakdown */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white border-2 border-slate-50 rounded-[40px] p-10 shadow-sm flex flex-col items-center">
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight text-center mb-10 uppercase tracking-widest border-b-2 border-slate-50 pb-4 w-full">Alokasi Likuiditas</h3>

                        <div className="h-[250px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie
                                        data={dataLikuiditas}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {dataLikuiditas.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(val: any) => formatIDR(Number(val))}
                                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                </RePieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
                                <p className="text-lg font-bold text-slate-900 tracking-tighter">{formatIDR(totalCash / 1000000)}M</p>
                            </div>
                        </div>

                        <div className="w-full space-y-4 mt-10">
                            {dataLikuiditas.map((item) => (
                                <div key={item.name} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-lg" style={{ backgroundColor: item.color }} />
                                        <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-bold text-slate-900">{formatIDR(item.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-[40px] p-8 text-white group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-all">
                            <TrendingUp className="w-32 h-32 text-indigo-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 text-indigo-400 mb-4">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Rekomendasi Treasury</span>
                            </div>
                            <p className="text-sm font-medium leading-relaxed text-slate-300">
                                Ditemukan dana mengendap sebesar <span className="text-white font-bold">{formatIDR(idleCash)}</span>.
                                Disarankan untuk menempatkan dana ke <span className="text-indigo-400 font-bold underline underline-offset-4 decoration-2">Deposito Berjangka</span> untuk meningkatkan optimalisasi imbal hasil bulanan.
                            </p>
                            <button className="mt-8 w-full py-4 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-2xl hover:bg-white hover:text-slate-900 transition-all shadow-xl shadow-indigo-500/20 active:scale-95">Eskusi Penempatan Dana</button>
                        </div>
                    </div>
                </div>

                {/* Right: Cash Flow Projection & Accounts */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white border-2 border-slate-50 rounded-[40px] shadow-sm p-10 space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                                    <div className="p-2 bg-indigo-600 rounded-xl text-white">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    Historis Saldo Kas & Bank
                                </h3>
                                <p className="text-slate-400 text-xs font-medium mt-2">Tren fluktuasi likuiditas harian (dalam Juta Rp).</p>
                            </div>
                        </div>

                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dataArusKas}>
                                    <defs>
                                        <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={15} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="saldo" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorSaldo)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Detailed Subsidiary Accounts */}
                    <div className="bg-white border-2 border-slate-50 rounded-[40px] shadow-sm overflow-hidden">
                        <div className="px-10 py-8 border-b-2 border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-900 rounded-xl text-white">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 tracking-tight">Rincian Sub-Akun & Likuiditas</h3>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Update 5 Menit Lalu</span>
                            </div>
                        </div>
                        <div className="divide-y-2 divide-slate-50">
                            {[
                                { name: 'Kas Kecil (Petty Cash)', type: 'KAS TUNAI', balance: 15000000, color: 'indigo' },
                                { name: 'Brankas Utama (Vault)', type: 'KAS TUNAI', balance: 435000000, color: 'indigo' },
                                { name: 'Bank BCA Operasional', type: 'BANK', balance: 820000000, color: 'blue' },
                                { name: 'Bank Mandiri Payroll', type: 'BANK', balance: 430000000, color: 'blue' },
                                { name: 'Deposito Bank Mega (3 bln)', type: 'SETARA KAS', balance: 800000000, color: 'emerald' },
                            ].map((acc, i) => (
                                <div key={i} className="px-10 py-8 flex items-center justify-between hover:bg-slate-50/50 transition-all group cursor-pointer">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl group-hover:rotate-6 transition-all shadow-lg shadow-slate-100 ${acc.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                                            acc.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                                'bg-emerald-50 text-emerald-600'
                                            }`}>
                                            {acc.name[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{acc.name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{acc.type}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-slate-900 tracking-tighter">{formatIDR(acc.balance)}</p>
                                        <div className="flex items-center justify-end gap-1.5 mt-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Sesuai Buku Besar</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal Optimalisasi Kas */}
            {showOptimizeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowOptimizeModal(false)} />
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="px-12 py-10">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Optimalisasi Treasury</h3>
                                    <p className="text-slate-500 text-xs font-medium mt-1 uppercase tracking-widest">Manajemen Likuiditas & Idle Cash</p>
                                </div>
                                <button
                                    onClick={() => setShowOptimizeModal(false)}
                                    className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="bg-indigo-600 rounded-[32px] p-8 text-white mb-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-20">
                                    <TrendingUp className="w-20 h-20" />
                                </div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 mb-2">Analisis Sistem</p>
                                <h4 className="text-xl font-bold mb-4 tracking-tight">Ditemukan Saldo Mengendap Sebesar {formatIDR(idleCash)}</h4>
                                <p className="text-xs text-indigo-100/70 font-medium leading-relaxed">
                                    Berdasarkan target saldo operasional harian {formatIDR(minOperational)}, Anda memiliki kelebihan likuiditas yang dapat dioptimalkan melalui instrumen keuangan berjangka.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Rekomendasi Tindakan</h5>
                                <div className="grid grid-cols-1 gap-4">
                                    <button className="flex items-center justify-between p-6 bg-slate-50 border-2 border-transparent hover:border-indigo-600 rounded-3xl transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm transition-all group-hover:bg-indigo-600 group-hover:text-white">
                                                <Building2 className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-slate-900">Pindah ke Deposito Berjangka</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Estimasi Yield: 4.5% - 5.5% p.a</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-all" />
                                    </button>

                                    <button className="flex items-center justify-between p-6 bg-slate-50 border-2 border-transparent hover:border-indigo-600 rounded-3xl transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-sm transition-all group-hover:bg-emerald-600 group-hover:text-white">
                                                <Zap className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-slate-900">Pelunasan Hutang Dipercepat</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Menghemat Biaya Bunga Pinjaman</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 transition-all" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-12">
                                <button
                                    onClick={() => setShowOptimizeModal(false)}
                                    className="flex-1 py-5 bg-slate-100 text-slate-600 font-bold text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
                                >
                                    Tutup
                                </button>
                                <button className="flex-[2] py-5 bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-100 hover:bg-slate-900 transition-all active:scale-95">
                                    Buka Menu Transfer Dana
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
