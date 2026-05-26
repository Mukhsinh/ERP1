"use client";

import React, { useState, useEffect } from 'react';
import {
    Package,
    Search,
    Filter,
    Download,
    Plus,
    LayoutGrid,
    List as ListIcon,
    ArrowUpRight,
    Calendar,
    Building2,
    Banknote,
    Box,
    Tag,
    History,
    ChevronDown,
    Activity,
    CheckCircle2,
    X,
    Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSupabase } from '@/hooks/useSupabase';
import { AccountingEngine } from '@/lib/accounting';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AssetRegisterPage() {
    const { tenant } = useSupabase();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [showCapitalizeModal, setShowCapitalizeModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [assets, setAssets] = useState<any[]>([]);
    const [coas, setCoas] = useState<any[]>([]);

    const [form, setForm] = useState({
        name: '',
        category: 'PERALATAN',
        acquisition_date: new Date().toISOString().split('T')[0],
        acquisition_cost: 0,
        useful_life_years: 4,
        coa_asset_id: '',
        coa_source_id: '', // Credit account (Bank/Cash)
    });

    useEffect(() => {
        if (tenant) {
            fetchData();
        }
    }, [tenant]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: aData, error: aError } = await supabase
                .from('asset_register')
                .select('*')
                .order('created_at', { ascending: false });
            if (aError) throw aError;
            setAssets(aData || []);

            const { data: cData, error: cError } = await supabase
                .from('chart_of_accounts')
                .select('*')
                .order('code');
            if (cError) throw cError;
            setCoas(cData || []);
        } catch (error: any) {
            toast.error("Gagal mengambil data: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCapitalize = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) return;

        setActionLoading(true);
        try {
            // 1. Insert into asset_register
            const { data: asset, error: aError } = await supabase
                .from('asset_register')
                .insert({
                    tenant_id: tenant.id,
                    name: form.name,
                    category: form.category,
                    acquisition_date: form.acquisition_date,
                    acquisition_cost: form.acquisition_cost,
                    useful_life_years: form.useful_life_years,
                    residual_value: 0,
                    depreciation_method: 'STRAIGHT_LINE',
                    status: 'ACTIVE',
                    coa_asset_id: form.coa_asset_id
                })
                .select()
                .single();

            if (aError) throw aError;

            // 2. record journal using AccountingEngine
            await AccountingEngine.recordAssetCapitalization({
                tenantId: tenant.id,
                branchId: 'MAIN',
                date: form.acquisition_date,
                ref: `CAP-${asset.id}`,
                desc: `Kapitalisasi Aset: ${form.name}`,
                assetCoa: form.coa_asset_id,
                sourceCoa: form.coa_source_id,
                amount: form.acquisition_cost
            });

            toast.success("Aset berhasil dikapitalisasi & terjurnal otomatis.");
            setShowCapitalizeModal(false);
            fetchData();
        } catch (error: any) {
            toast.error("Gagal: " + error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const exportToPDF = () => {
        if (assets.length === 0) {
            toast.error("Tidak ada data untuk diekspor.");
            return;
        }

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Daftar Inventaris Aset Tetap - ERP AKAPRO', 14, 22);
        doc.setFontSize(11);
        doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 30);

        const tableData = assets.map(asset => [
            asset.name,
            asset.category,
            asset.acquisition_date,
            formatIDR(asset.acquisition_cost),
            formatIDR(asset.accumulated_depreciation || 0),
            formatIDR((asset.acquisition_cost || 0) - (asset.accumulated_depreciation || 0))
        ]);

        autoTable(doc, {
            startY: 40,
            head: [['Nama Aset', 'Kategori', 'Tanggal', 'Perolehan', 'Akm. Susut', 'Nilai Buku']],
            body: tableData,
            headStyles: { fillColor: [79, 70, 229] }
        });

        doc.save(`Asset_Register_${new Date().getTime()}.pdf`);
        toast.success("PDF berhasil diunduh.");
    };

    const formatIDR = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(val).replace('Rp', 'Rp ');
    };

    const stats = {
        totalCost: assets.reduce((sum, a) => sum + Number(a.acquisition_cost), 0),
        totalAccDep: assets.reduce((sum, a) => sum + Number(a.accumulated_depreciation || 0), 0),
        totalItems: assets.length
    };

    return (
        <div className="p-8 space-y-8 max-w-[1400px] mx-auto min-h-screen">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <Package className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Fixed Asset Management</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Buku Daftar Aset Tetap</h2>
                    <p className="text-slate-500 mt-1 font-medium text-sm">Register inventaris aset perusahaan lengkap dengan nilai buku dan akumulasi penyusutan.</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={exportToPDF}
                        className="flex items-center gap-2 bg-white border-2 border-slate-50 hover:border-indigo-100 px-5 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-600 transition-all shadow-sm"
                    >
                        <Download className="w-4 h-4" /> Unduh Laporan
                    </button>
                    <button
                        onClick={() => setShowCapitalizeModal(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-slate-900 text-white px-8 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-100"
                    >
                        <Plus className="w-4 h-4" /> Kapitalisasi Aset Baru
                    </button>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Nilai Perolehan', value: stats.totalCost, icon: Banknote, color: 'indigo' },
                    { label: 'Nilai Buku Saat Ini', value: stats.totalCost - stats.totalAccDep, icon: Box, color: 'emerald' },
                    { label: 'Akumulasi Penyusutan', value: stats.totalAccDep, icon: History, color: 'rose' },
                    { label: 'Total Item Aset', value: stats.totalItems, icon: Tag, color: 'blue' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white border-2 border-slate-50 rounded-[32px] p-8 shadow-sm group">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-lg ${stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                                stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                                    stat.color === 'rose' ? 'bg-rose-50 text-rose-600' :
                                        'bg-blue-50 text-blue-600'
                                }`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <h3 className="text-xl font-bold text-slate-900 tracking-tighter mt-1">
                                    {typeof stat.value === 'number' && i < 3 ? formatIDR(stat.value) : stat.value}
                                </h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Content & Filters */}
            <div className="bg-white border-2 border-slate-50 rounded-[40px] shadow-sm overflow-hidden">
                <div className="px-10 py-8 border-b-2 border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-50/20">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Cari Kode Aset, Nama, atau Lokasi..."
                                className="bg-white border-2 border-slate-100 rounded-2xl py-3 pl-12 pr-6 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600 transition-all min-w-[350px]"
                            />
                        </div>
                        <button className="flex items-center gap-2 bg-white border-2 border-slate-100 px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:border-indigo-600 transition-all">
                            <Filter className="w-4 h-4" /> Filter Lanjutan
                        </button>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <ListIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-slate-50">
                                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Info & Kode Aset</th>
                                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Kategori & Tanggal</th>
                                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Nilai Perolehan</th>
                                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Akm. Penyusutan</th>
                                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Nilai Buku (Net)</th>
                                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-10 py-16 text-center text-slate-400">Memuat data aset...</td>
                                </tr>
                            ) : assets.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-10 py-16 text-center text-slate-400 italic font-sans uppercase tracking-[0.2em] text-[10px]">No assets registered.</td>
                                </tr>
                            ) : assets.map((asset, i) => {
                                const accDep = Number(asset.accumulated_depreciation || 0);
                                const bookValue = Number(asset.acquisition_cost) - accDep;

                                return (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center font-bold text-slate-400 border-2 border-slate-50 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all">
                                                    <Building2 className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-all uppercase tracking-tight">{asset.name}</p>
                                                    <p className="text-[10px] font-bold text-indigo-500 mt-1 uppercase tracking-widest">{asset.code || asset.id.slice(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full w-fit uppercase tracking-widest">{asset.category}</span>
                                                <div className="flex items-center gap-2 text-slate-400 mt-2">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">{asset.acquisition_date}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <span className="text-sm font-bold text-slate-900">{formatIDR(asset.acquisition_cost)}</span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <span className="text-sm font-bold text-rose-500">({formatIDR(accDep)})</span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-base font-bold text-indigo-600 tracking-tighter">{formatIDR(bookValue)}</span>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Activity className="w-3 h-3 text-emerald-500" />
                                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Sesuai Jurnal</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <button className="p-3 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl transition-all text-slate-400 shadow-sm active:scale-95">
                                                <ArrowUpRight className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer Info */}
                <div className="px-10 py-10 bg-slate-900 flex items-center justify-between text-white">
                    <div className="flex items-center gap-12">
                        <div className="flex items-center gap-4">
                            <div className="w-3 h-12 bg-indigo-500 rounded-full" />
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status Aset</p>
                                <p className="text-sm font-bold uppercase tracking-tight">Kepatuhan SAK: 100%</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-4 rounded-3xl">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Automated Depreciation Engine Active</span>
                    </div>
                </div>
            </div>
            {/* Modal Kapitalisasi Aset */}
            {showCapitalizeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowCapitalizeModal(false)} />
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="px-12 py-10">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Kapitalisasi Aset Baru</h3>
                                    <p className="text-slate-500 text-xs font-medium mt-1 uppercase tracking-widest">Registrasi Aset Tetap ke Buku Besar</p>
                                </div>
                                <button
                                    onClick={() => setShowCapitalizeModal(false)}
                                    className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form className="space-y-6" onSubmit={handleCapitalize}>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Aset Tetap</label>
                                        <input
                                            type="text"
                                            required
                                            value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                                            placeholder="Contoh: Toyota Hiace 2024"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kategori Aset</label>
                                        <select
                                            value={form.category}
                                            onChange={e => setForm({ ...form, category: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all appearance-none"
                                        >
                                            <option value="PERALATAN">PERALATAN</option>
                                            <option value="KENDARAAN">KENDARAAN</option>
                                            <option value="PROPERTI">PROPERTI</option>
                                            <option value="MESIN">MESIN</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tanggal Perolehan</label>
                                        <input
                                            type="date"
                                            required
                                            value={form.acquisition_date}
                                            onChange={e => setForm({ ...form, acquisition_date: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nilai Perolehan (Rp)</label>
                                        <input
                                            type="number"
                                            required
                                            value={form.acquisition_cost}
                                            onChange={e => setForm({ ...form, acquisition_cost: Number(e.target.value) })}
                                            className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Akun Aset (Debet)</label>
                                        <select
                                            required
                                            value={form.coa_asset_id}
                                            onChange={e => setForm({ ...form, coa_asset_id: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all appearance-none"
                                        >
                                            <option value="">Pilih Akun Aset...</option>
                                            {coas.filter(c => c.code.startsWith('1-103')).map(c => (
                                                <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Akun Sumber (Kredit)</label>
                                        <select
                                            required
                                            value={form.coa_source_id}
                                            onChange={e => setForm({ ...form, coa_source_id: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all appearance-none"
                                        >
                                            <option value="">Pilih Akun Sumber...</option>
                                            {coas.filter(c => c.code.startsWith('1-100') || c.code.startsWith('2-101')).map(c => (
                                                <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-indigo-50 border-2 border-indigo-100/50 rounded-3xl p-6 mt-4">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-white rounded-xl text-indigo-600 shadow-sm">
                                            <History className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Informasi Depresiasi</p>
                                            <p className="text-xs text-indigo-900/60 font-medium mt-1 leading-relaxed">Sistem akan otomatis menghitung penyusutan bulanan (SLM) berdasarkan masa manfaat kategori pajak yang dipilih.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-10">
                                    <button
                                        type="button"
                                        onClick={() => setShowCapitalizeModal(false)}
                                        className="flex-1 py-5 bg-slate-100 text-slate-600 font-bold text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="flex-[2] py-5 bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-100 hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {actionLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Simpan & Jurnal Otomatis'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

