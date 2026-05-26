"use client";

import React, { useState, useEffect } from 'react';
import {
    Package,
    ArrowUpRight,
    Trash2,
    Gift,
    Search,
    Filter,
    Plus,
    ChevronRight,
    Banknote,
    Calendar,
    FileText,
    X,
    TrendingUp,
    AlertCircle,
    Download
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AccountingEngine } from '@/lib/accounting';
import { useSupabase } from '@/hooks/useSupabase';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AssetDisposalPage() {
    const { tenant } = useSupabase();
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [assets, setAssets] = useState<any[]>([]);
    const [disposals, setDisposals] = useState<any[]>([]);

    const [form, setForm] = useState({
        assetId: '',
        type: 'PENJUALAN' as 'PENJUALAN' | 'PENGHAPUSAN' | 'HIBAH',
        date: new Date().toISOString().split('T')[0],
        proceeds: 0,
        desc: '',
        paymentCoa: '', // Only for sale
    });

    useEffect(() => {
        if (tenant) {
            fetchData();
        }
    }, [tenant]);

    const fetchData = async () => {
        // Fetch disposal list
        const { data: dData } = await supabase
            .from('asset_disposals')
            .select('*, asset:asset_register(name, code)')
            .order('disposal_date', { ascending: false });
        if (dData) setDisposals(dData);

        // Fetch assets available for disposal
        const { data: aData } = await supabase
            .from('asset_register')
            .select('*')
            .eq('status', 'ACTIVE');
        if (aData) setAssets(aData);

        // Fetch Bank/Cash COAs for proceeds
        const { data: cData } = await supabase
            .from('chart_of_accounts')
            .select('*')
            .or('code.ilike.1-100%')
            .order('code');
        if (cData) setCoas(cData);
    };

    const [coas, setCoas] = useState<any[]>([]);

    const handleDisposal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) return;

        setLoading(true);
        try {
            const selectedAsset = assets.find(a => a.id === form.assetId);
            if (!selectedAsset) throw new Error("Aset tidak ditemukan.");

            // 1. Record in asset_disposals table
            const { data: disposal, error: dError } = await supabase
                .from('asset_disposals')
                .insert({
                    tenant_id: tenant.id,
                    asset_id: form.assetId,
                    disposal_type: form.type,
                    disposal_date: form.date,
                    proceeds_amount: form.proceeds,
                    reason: form.desc,
                    status: 'COMPLETED'
                })
                .select()
                .single();

            if (dError) throw dError;

            // 2. Automated Journaling
            await AccountingEngine.recordAssetDisposal({
                tenantId: tenant.id,
                branchId: 'MAIN',
                date: form.date,
                ref: `DSP-${disposal.id}`,
                desc: `Pelepasan Aset: ${selectedAsset.name} (${form.type})`,
                assetCoa: selectedAsset.coa_asset_id || '1-10301', // Fallback
                accumDepCoa: selectedAsset.coa_accum_dep_id || '1-10302',
                paymentCoa: form.type === 'PENJUALAN' ? form.paymentCoa : undefined,
                gainLossCoa: '7-10001', // Gain/Loss on Disposal Account
                acquisitionCost: Number(selectedAsset.acquisition_cost),
                totalAccumDep: Number(selectedAsset.accumulated_depreciation || 0),
                proceedsAmount: form.proceeds,
                type: form.type
            });

            // 3. Update asset status
            await supabase
                .from('asset_register')
                .update({ status: 'DISPOSED' })
                .eq('id', form.assetId);

            toast.success("Pelepasan aset berhasil dicatat & terjurnal otomatis.");
            setShowModal(false);
            fetchData();
        } catch (error: any) {
            toast.error("Gagal: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const exportToPDF = () => {
        if (disposals.length === 0) {
            toast.error("Tidak ada data untuk diekspor.");
            return;
        }

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Laporan Pelepasan Aset - ERP AKAPRO', 14, 22);
        doc.setFontSize(11);
        doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 30);

        const tableData = disposals.map(item => [
            `${item.asset?.name} (${item.asset?.code})`,
            item.disposal_type,
            item.disposal_date,
            formatIDR(item.proceeds_amount),
            item.status
        ]);

        autoTable(doc, {
            startY: 40,
            head: [['Nama Aset', 'Jenis', 'Tanggal', 'Proceeds', 'Status']],
            body: tableData,
            headStyles: { fillColor: [79, 70, 229] }
        });

        doc.save(`Asset_Disposals_${new Date().getTime()}.pdf`);
        toast.success("PDF berhasil diunduh.");
    };

    const formatIDR = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Pelepasan Aset</h1>
                        <p className="text-slate-500 mt-1">Kelola penjualan, penghapusan, dan hibah aset secara otomatis terjurnal.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={exportToPDF}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold shadow-sm hover:bg-slate-50 transition-all text-xs"
                        >
                            <Download className="w-4 h-4" />
                            Ekspor PDF
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all active:scale-95 text-xs"
                        >
                            <Plus className="w-5 h-5" />
                            Tambah Pelepasan
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari histori pelepasan..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Aset</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Jenis</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tanggal</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Nilai Proceeds</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {disposals.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-slate-900">{item.asset?.name || 'Unknown Asset'}</p>
                                            <p className="text-[10px] text-slate-400 font-mono">DSP-{item.id.slice(0, 8)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${item.disposal_type === 'PENJUALAN' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                                }`}>
                                                {item.disposal_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                                            {item.disposal_date}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                                            {formatIDR(item.proceeds_amount)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {disposals.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm italic">Belum ada data pelepasan aset.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl relative z-10 overflow-hidden">
                        <div className="p-10">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900">Form Pelepasan Aset</h3>
                                    <p className="text-slate-500 text-xs font-medium mt-1">Double-Entry Journaling System</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X className="w-5 h-5 text-slate-400" /></button>
                            </div>

                            <form className="space-y-6" onSubmit={handleDisposal}>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Pilih Aset</label>
                                    <select
                                        required
                                        value={form.assetId}
                                        onChange={e => setForm({ ...form, assetId: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 transition-all appearance-none"
                                    >
                                        <option value="">-- Pilih Aset Aktif --</option>
                                        {assets.map(a => (
                                            <option key={a.id} value={a.id}>{a.name} ({a.code})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Jenis Pelepasan</label>
                                        <select
                                            value={form.type}
                                            onChange={e => setForm({ ...form, type: e.target.value as any })}
                                            className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 transition-all appearance-none"
                                        >
                                            <option value="PENJUALAN">PENJUALAN</option>
                                            <option value="PENGHAPUSAN">PENGHAPUSAN (Write-off)</option>
                                            <option value="HIBAH">HIBAH / DONASI</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tanggal</label>
                                        <input
                                            type="date"
                                            required
                                            value={form.date}
                                            onChange={e => setForm({ ...form, date: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {form.type === 'PENJUALAN' && (
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nilai Jual (Rp)</label>
                                            <input
                                                type="number"
                                                required
                                                value={form.proceeds}
                                                onChange={e => setForm({ ...form, proceeds: Number(e.target.value) })}
                                                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none font-mono"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Akun Penerimaan</label>
                                            <select
                                                required
                                                value={form.paymentCoa}
                                                onChange={e => setForm({ ...form, paymentCoa: e.target.value })}
                                                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none appearance-none"
                                            >
                                                <option value="">Pilih Akun Kas/Bank...</option>
                                                {coas.map(c => (
                                                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Alasan / Keterangan</label>
                                    <textarea
                                        rows={2}
                                        value={form.desc}
                                        onChange={e => setForm({ ...form, desc: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none"
                                        placeholder="Alasan dilakukan pelepasan aset..."
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all font-sans"
                                    >Batal</button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-[2] py-4 bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-100 hover:bg-slate-900 transition-all font-sans"
                                    >
                                        {loading ? 'Memproses...' : 'Konfirmasi Pelepasan'}
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

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}
