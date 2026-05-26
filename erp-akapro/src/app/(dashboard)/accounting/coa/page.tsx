"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Plus, Search, BookOpen, CheckCircle2, XCircle, Loader2, X, Filter,
    ArrowUpRight, ArrowDownLeft, Wallet,
} from 'lucide-react';

interface CoaRow {
    id: string; code: string; name: string; category: string; normal_balance: string; is_active: boolean;
}

const categoryLabels: Record<string, string> = {
    ASSET: 'Aset', LIABILITY: 'Liabilitas', EQUITY: 'Ekuitas', REVENUE: 'Pendapatan', EXPENSE: 'Beban',
};
const categoryStyles: Record<string, string> = {
    ASSET: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    LIABILITY: 'bg-rose-50 text-rose-600 border-rose-100',
    EQUITY: 'bg-violet-50 text-violet-600 border-violet-100',
    REVENUE: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    EXPENSE: 'bg-amber-50 text-amber-600 border-amber-100',
};
const defaultAccounts = [
    { code: '1-1001', name: 'Kas Kotak', category: 'ASSET', normal_balance: 'DEBIT' },
    { code: '1-1002', name: 'Bank BCA Utama', category: 'ASSET', normal_balance: 'DEBIT' },
    { code: '1-2001', name: 'Piutang Dagang', category: 'ASSET', normal_balance: 'DEBIT' },
    { code: '2-1001', name: 'Hutang Dagang', category: 'LIABILITY', normal_balance: 'CREDIT' },
    { code: '3-1001', name: 'Modal Saham', category: 'EQUITY', normal_balance: 'CREDIT' },
    { code: '4-1001', name: 'Penjualan Produk', category: 'REVENUE', normal_balance: 'CREDIT' },
    { code: '5-1001', name: 'HPP Produk', category: 'EXPENSE', normal_balance: 'DEBIT' },
];

export default function CoAPage() {
    const [coa, setCoa] = useState<CoaRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ code: '', name: '', category: 'ASSET', normal_balance: 'DEBIT' });

    const fetchCoa = async () => {
        setLoading(true);
        const { data } = await supabase.from('chart_of_accounts').select('*').order('code', { ascending: true });
        if (data) setCoa(data);
        setLoading(false);
    };
    useEffect(() => { fetchCoa(); }, []);

    const handleSeedDefaults = async () => {
        setSaving(true);
        for (const acc of defaultAccounts) {
            await supabase.from('chart_of_accounts').upsert({ ...acc, is_active: true }, { onConflict: 'code' });
        }
        await fetchCoa();
        setSaving(false);
    };

    const handleAddAccount = async () => {
        setSaving(true);
        await supabase.from('chart_of_accounts').insert({ ...form, is_active: true });
        setShowModal(false);
        setForm({ code: '', name: '', category: 'ASSET', normal_balance: 'DEBIT' });
        await fetchCoa();
        setSaving(false);
    };

    const filtered = coa.filter(a =>
        a.code.toLowerCase().includes(search.toLowerCase()) || a.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 space-y-6 max-w-7xl mx-auto">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <BookOpen className="w-4 h-4" />
                        <span className="text-[10px] font-semibold uppercase tracking-widest">Modul Akuntansi</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Bagan Akun (CoA)</h2>
                    <p className="text-sm text-slate-500 mt-1">Struktur hierarki akun finansial sesuai standar pelaporan SAK Indonesia.</p>
                </div>
                <div className="flex gap-3">
                    {coa.length === 0 && !loading && (
                        <button onClick={handleSeedDefaults} disabled={saving}
                            className="flex items-center gap-2 bg-slate-800 hover:bg-indigo-600 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg text-xs transition-all shadow-md">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                            Muat Akun Standar SAK
                        </button>
                    )}
                    <button onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg text-xs transition-all shadow-md">
                        <Plus className="w-4 h-4" />
                        Tambah Akun Baru
                    </button>
                </div>
            </header>

            {/* Ringkasan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Total Akun Aktif', value: coa.length.toString(), sub: 'Integritas Data', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Kelompok Aset', value: coa.filter(a => a.category === 'ASSET').length.toString(), sub: 'Aset Lancar & Tetap', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Liabilitas/Ekuitas', value: coa.filter(a => ['LIABILITY', 'EQUITY'].includes(a.category)).length.toString(), sub: 'Kewajiban & Modal', color: 'text-rose-600', bg: 'bg-rose-50' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
                        <div className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* Pencarian */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative group flex-1 min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari kode akun atau nama akun..."
                        className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-all shadow-sm" />
                </div>
                <button className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all">
                    <Filter className="w-4 h-4" /> Filter Kategori
                </button>
            </div>

            {/* Tabel */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Kode & Nama Akun</th>
                                <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Klasifikasi</th>
                                <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Saldo Normal</th>
                                <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-20 text-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
                                    <p className="text-sm text-slate-400">Memuat data...</p>
                                </td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-300">
                                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm font-medium">Belum ada data akun</p>
                                </td></tr>
                            ) : filtered.map((a) => (
                                <tr key={a.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="bg-slate-800 text-white font-mono text-[10px] font-semibold px-3 py-1.5 rounded-md group-hover:bg-indigo-600 transition-colors">{a.code}</span>
                                            <span className="text-sm font-semibold text-slate-800">{a.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-semibold px-3 py-1.5 rounded-full border ${categoryStyles[a.category] || 'bg-slate-50 border-slate-100'}`}>
                                            {categoryLabels[a.category] || a.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {a.normal_balance === 'DEBIT' ? (
                                            <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-semibold bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-100 w-fit">
                                                <ArrowUpRight className="w-3.5 h-3.5" /> Debit
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-rose-600 text-[11px] font-semibold bg-rose-50 px-3 py-1.5 rounded-md border border-rose-100 w-fit">
                                                <ArrowDownLeft className="w-3.5 h-3.5" /> Kredit
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {a.is_active ? (
                                            <div className="flex items-center justify-center gap-1.5 text-indigo-600 text-[11px] font-semibold">
                                                <CheckCircle2 className="w-4 h-4" /> Aktif
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px] font-medium">
                                                <XCircle className="w-4 h-4" /> Nonaktif
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="px-3 py-1.5 bg-slate-50 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all text-xs font-semibold">Ubah</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Tambah Akun */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white w-full max-w-lg rounded-xl shadow-2xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Tambah Akun Baru</h3>
                                <p className="text-xs text-slate-500 mt-1">Daftarkan akun baru ke dalam bagan akun perusahaan.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Kode Akun</label>
                                    <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="cth. 1-1001"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-4 text-sm font-semibold focus:outline-none focus:border-indigo-500 font-mono text-indigo-600" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Nama Akun</label>
                                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama Akun"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-4 text-sm font-semibold focus:outline-none focus:border-indigo-500 text-slate-800" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Kategori</label>
                                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-4 text-sm font-semibold focus:outline-none focus:border-indigo-500 appearance-none">
                                        <option value="ASSET">Aset (1xxxx)</option>
                                        <option value="LIABILITY">Liabilitas (2xxxx)</option>
                                        <option value="EQUITY">Ekuitas (3xxxx)</option>
                                        <option value="REVENUE">Pendapatan (4xxxx)</option>
                                        <option value="EXPENSE">Beban (5xxxx)</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Saldo Normal</label>
                                    <select value={form.normal_balance} onChange={(e) => setForm({ ...form, normal_balance: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-4 text-sm font-semibold focus:outline-none focus:border-indigo-500 appearance-none">
                                        <option value="DEBIT">Debit</option>
                                        <option value="CREDIT">Kredit</option>
                                    </select>
                                </div>
                            </div>
                            <button onClick={handleAddAccount} disabled={saving || !form.code || !form.name}
                                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-sm mt-4">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                Simpan Akun
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
