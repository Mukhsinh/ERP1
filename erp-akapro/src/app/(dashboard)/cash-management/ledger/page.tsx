"use client";

import React, { useState } from 'react';
import {
    History,
    Search,
    Filter,
    Download,
    Printer,
    Calendar,
    ChevronDown,
    ArrowUpRight,
    ArrowDownRight,
    Briefcase,
    Building2,
    FileText,
    Activity,
    CheckCircle2
} from 'lucide-react';

const mockTransactions = [
    { id: 'JRN-001', date: '2024-05-24', ref: 'TF-001', desc: 'Pergeseran Kas: Brankas Utama -> Bank BCA', debit: 50000000, credit: 0, balance: 820000000, acc: 'Bank BCA Operasional' },
    { id: 'JRN-002', date: '2024-05-23', ref: 'INV-2024-101', desc: 'Pelunasan Faktur: CV Maju Jaya', debit: 12500000, credit: 0, balance: 770000000, acc: 'Bank BCA Operasional' },
    { id: 'JRN-003', date: '2024-05-22', ref: 'OPEX-099', desc: 'Pembayaran Listrik & Internet Mei', debit: 0, credit: 3200000, balance: 757500000, acc: 'Bank BCA Operasional' },
    { id: 'JRN-004', date: '2024-05-21', ref: 'TF-002', desc: 'Penempatan Deposito Berjangka Mega', debit: 0, credit: 500000000, balance: 760700000, acc: 'Bank BCA Operasional' },
];

export default function CashLedgerPage() {
    const [selectedAccount, setSelectedAccount] = useState('Bank BCA Operasional');

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
                        <History className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Subsidiary Daily Ledger</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Buku Kas Pembantu</h2>
                    <p className="text-slate-500 mt-1 font-medium text-sm">Rincian mutasi kas dan bank dengan kalkulasi saldo berjalan (Running Balance).</p>
                </div>

                <div className="flex gap-3">
                    <button className="p-3 bg-white border-2 border-slate-50 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm">
                        <Printer className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-white border-2 border-slate-50 text-slate-400 hover:text-emerald-600 rounded-2xl transition-all shadow-sm">
                        <Download className="w-5 h-5" />
                    </button>
                    <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center gap-4 shadow-xl">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Sinkronisasi 100% GL</span>
                    </div>
                </div>
            </header>

            {/* Quick Filter Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-white border-2 border-slate-50 p-6 rounded-[32px] shadow-sm">
                <div className="lg:col-span-4 relative group">
                    <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <select
                        value={selectedAccount}
                        onChange={(e) => setSelectedAccount(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all appearance-none cursor-pointer"
                    >
                        <option>Bank BCA Operasional</option>
                        <option>Kas Kecil (Petty Cash)</option>
                        <option>Brankas Utama</option>
                        <option>Bank Mandiri Payroll</option>
                    </select>
                </div>
                <div className="lg:col-span-3 relative group">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input type="date" className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all" />
                </div>
                <div className="lg:col-span-4 relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input type="text" placeholder="Cari deskripsi, referensi atau nominal..." className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all" />
                </div>
                <div className="lg:col-span-1 flex justify-center">
                    <button className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Ledger Table */}
            <div className="bg-white border-2 border-slate-50 rounded-[40px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-slate-50 bg-slate-50/30">
                                <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Tanggal & ID Jurnal</th>
                                <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Uraian Transaksi</th>
                                <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Debet</th>
                                <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Kredit</th>
                                <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Saldo Berjalan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-50">
                            {mockTransactions.map((trx, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-8 py-7">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900">{trx.date}</span>
                                            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 w-fit mt-1.5 uppercase tracking-widest">{trx.id}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-7">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-3.5 h-3.5 text-slate-300" />
                                                <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{trx.desc}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Ref: {trx.ref}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-7 text-right">
                                        {trx.debit > 0 ? (
                                            <span className="text-sm font-bold text-emerald-600 flex items-center justify-end gap-1.5">
                                                <ArrowUpRight className="w-4 h-4" /> {formatIDR(trx.debit)}
                                            </span>
                                        ) : <span className="text-slate-200">--</span>}
                                    </td>
                                    <td className="px-8 py-7 text-right">
                                        {trx.credit > 0 ? (
                                            <span className="text-sm font-bold text-rose-500 flex items-center justify-end gap-1.5">
                                                <ArrowDownRight className="w-4 h-4" /> {formatIDR(trx.credit)}
                                            </span>
                                        ) : <span className="text-slate-200">--</span>}
                                    </td>
                                    <td className="px-8 py-7 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-base font-bold text-slate-900 tracking-tighter">{formatIDR(trx.balance)}</span>
                                            <div className="flex items-center gap-1.5 mt-1.5">
                                                <Activity className="w-3 h-3 text-emerald-500" />
                                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Verifikasi: OK</span>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Section - Totals */}
                <div className="p-10 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex gap-16">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Total Debet Masuk</p>
                            <p className="text-2xl font-bold text-emerald-400 tracking-tighter">{formatIDR(62500000)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Total Kredit Keluar</p>
                            <p className="text-2xl font-bold text-rose-400 tracking-tighter">{formatIDR(503200000)}</p>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] flex items-center gap-6">
                        <div>
                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-1">Saldo Akhir Periode</p>
                            <p className="text-3xl font-bold text-white tracking-tighter">{formatIDR(820000000)}</p>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-500/50">
                            <CheckCircle2 className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
