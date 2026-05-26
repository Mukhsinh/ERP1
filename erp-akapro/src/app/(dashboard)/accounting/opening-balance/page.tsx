'use client';

import React, { useState } from 'react';
import {
    Zap, Save, Search, RefreshCw, FileSpreadsheet,
    AlertCircle, CheckCircle2, Info
} from 'lucide-react';

interface OpeningBalance {
    id: string;
    accountCode: string;
    accountName: string;
    type: 'DEBIT' | 'KREDIT';
    amount: number;
}

const mockAccounts: OpeningBalance[] = [
    { id: '1', accountCode: '1101', accountName: 'Kas Utama', type: 'DEBIT', amount: 0 },
    { id: '2', accountCode: '1102', accountName: 'Bank BCA', type: 'DEBIT', amount: 0 },
    { id: '3', accountCode: '1201', accountName: 'Piutang Usaha', type: 'DEBIT', amount: 0 },
    { id: '4', accountCode: '1301', accountName: 'Persediaan Barang', type: 'DEBIT', amount: 0 },
    { id: '5', accountCode: '2101', accountName: 'Hutang Usaha', type: 'KREDIT', amount: 0 },
    { id: '6', accountCode: '3101', accountName: 'Modal Saham', type: 'KREDIT', amount: 0 },
    { id: '7', accountCode: '3201', accountName: 'Laba Ditahan', type: 'KREDIT', amount: 0 },
];

export default function OpeningBalancePage() {
    const [balances, setBalances] = useState<OpeningBalance[]>(mockAccounts);
    const [search, setSearch] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const filteredBalances = balances.filter(b =>
        b.accountName.toLowerCase().includes(search.toLowerCase()) ||
        b.accountCode.includes(search)
    );

    const handleAmountChange = (id: string, value: string) => {
        const num = parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0;
        setBalances(prev => prev.map(b => b.id === id ? { ...b, amount: num } : b));
    };

    const totalDebit = balances.filter(b => b.type === 'DEBIT').reduce((acc, b) => acc + b.amount, 0);
    const totalCredit = balances.filter(b => b.type === 'KREDIT').reduce((acc, b) => acc + b.amount, 0);
    const difference = totalDebit - totalCredit;
    const isBalanced = difference === 0;

    const formatIDR = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(val).replace('Rp', 'Rp ').trim();
    };

    const handleSave = async () => {
        if (!isBalanced) {
            alert('Saldo tidak balance! Selisih: ' + formatIDR(Math.abs(difference)));
            return;
        }
        setIsSaving(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1500));
        setIsSaving(false);
        alert('Saldo awal akuntansi berhasil disimpan dan dikunci!');
    };

    return (
        <div className="p-8 space-y-8 max-w-6xl mx-auto min-h-screen">
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <Zap className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Setup Configuration</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Saldo Awal Akuntansi</h2>
                    <p className="text-sm text-slate-500 mt-1">Input saldo awal per akun untuk inisialisasi pembukuan.</p>
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-3 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> IMPORT EXCEL
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 ${isBalanced
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                            : 'bg-slate-400 cursor-not-allowed text-white'
                            }`}
                    >
                        {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        SIMPAN SALDO
                    </button>
                </div>
            </header>

            {/* Validation Banner */}
            <div className={`p-6 rounded-2xl border flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500 ${isBalanced
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                : 'bg-rose-50 border-rose-100 text-rose-800'
                }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isBalanced ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                    }`}>
                    {isBalanced ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                    <p className="text-sm font-bold uppercase tracking-wide opacity-80">Pemeriksaan Keseimbangan (Balance)</p>
                    <h3 className="text-2xl font-black">
                        {isBalanced ? 'SELARAS (BALANCED)' : `SELISIH: ${formatIDR(Math.abs(difference))}`}
                    </h3>
                </div>
                <div className="flex gap-8 pr-4">
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-bold opacity-60">Total Debit</p>
                        <p className="text-lg font-bold">{formatIDR(totalDebit)}</p>
                    </div>
                    <div className="text-right border-l border-current/20 pl-8">
                        <p className="text-[10px] uppercase font-bold opacity-60">Total Kredit</p>
                        <p className="text-lg font-bold">{formatIDR(totalCredit)}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari kode atau nama akun..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-xl py-3 pl-11 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 px-4 py-2 bg-slate-50 rounded-lg">
                        <Info className="w-4 h-4 text-indigo-400" />
                        <span className="text-[11px] font-bold uppercase">Gunakan Titik Untuk Desimal</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kode Akun</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Akun</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Tipe Normal</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Saldo Awal (Rp)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredBalances.map((item) => (
                                <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors group">
                                    <td className="px-8 py-5">
                                        <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50/50 px-2 py-1 rounded">
                                            {item.accountCode}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-bold text-slate-700">{item.accountName}</td>
                                    <td className="px-8 py-5 text-center">
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${item.type === 'DEBIT'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-rose-100 text-rose-700'
                                            }`}>
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex justify-end">
                                            <input
                                                type="text"
                                                value={item.amount === 0 ? '' : item.amount.toLocaleString('id-ID')}
                                                onChange={(e) => handleAmountChange(item.id, e.target.value)}
                                                className="w-48 bg-white border border-slate-200 rounded-lg py-2.5 px-4 text-right text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all group-hover:bg-white"
                                                placeholder="0"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredBalances.length === 0 && (
                    <div className="p-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-slate-200" />
                        </div>
                        <h3 className="text-slate-900 font-bold">Akun tidak ditemukan</h3>
                        <p className="text-sm text-slate-400 mt-1">Coba kata kunci lain atau periksa bagan akun.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
