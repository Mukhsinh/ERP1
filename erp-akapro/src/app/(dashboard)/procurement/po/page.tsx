"use client";

import React, { useState, useMemo } from 'react';
import {
    Truck,
    Search,
    Plus,
    Filter,
    PackageCheck,
    History,
    Calendar,
    Download,
    Printer,
    ArrowRight,
    ShoppingBag,
    Clock,
    CheckCircle2,
    XCircle,
    User,
    Package,
    X,
    FileText,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { supabase } from '@/lib/supabase';

const fallbackPOs = [
    { id: 'PO-2024-001', Tanggal: '2024-05-23', supplier: 'PT. Distribusi Nasional', Total: 125000000, Status: 'Selesai', items: 12 },
    { id: 'PO-2024-002', Tanggal: '2024-05-23', supplier: 'Global Parts Corp', Total: 45000000, Status: 'Pending', items: 5 },
    { id: 'PO-2024-003', Tanggal: '2024-05-22', supplier: 'Prima Logistik', Total: 8500000, Status: 'Transit', items: 3 },
    { id: 'PO-2024-004', Tanggal: '2024-05-21', supplier: 'Sinar Abadi Ltd', Total: 2500000, Status: 'Dibatalkan', items: 1 },
];

export default function POPage() {
    const [poList, setPoList] = useState(fallbackPOs);
    const [searchQuery, setSearchQuery] = useState('');
    const [periode, setPeriode] = useState('Mei 2024');
    const [showCreateModal, setShowCreateModal] = useState(false);

    React.useEffect(() => {
        const fetchPOs = async () => {
            try {
                const { data, error } = await supabase
                    .from('procurement.purchase_orders')
                    .select('*')
                    .order('tanggal', { ascending: false });
                if (!error && data && data.length > 0) {
                    setPoList(data.map((d: any) => ({
                        id: d.po_no || d.id,
                        Tanggal: d.tanggal,
                        supplier: d.supplier,
                        Total: d.total,
                        Status: d.status,
                        items: d.items_count || 0,
                    })));
                }
            } catch { /* fallback */ }
        };
        fetchPOs();
    }, []);

    const filteredPOs = useMemo(() => {
        return poList.filter(p =>
            p.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.id.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, poList]);

    const stats = useMemo(() => ({
        total: poList.length,
        pending: poList.filter(p => p.Status === 'Pending').length,
        received: poList.filter(p => p.Status === 'Selesai').length,
        transit: poList.filter(p => p.Status === 'Transit').length,
    }), [poList]);

    const exportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredPOs.map(p => ({
            'PO ID': p.id,
            'Tanggal': p.Tanggal,
            'Supplier': p.supplier,
            'Total': p.Total,
            'Items': p.items,
            'Status': p.Status
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Pesanan Pembelian");
        XLSX.writeFile(workbook, `Purchase_Orders_${periode.replace(/ /g, '_')}.xlsx`);
    };

    const exportPdf = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("LAPORAN Pesanan Pembelian (PENGADAAN)", 14, 22);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Periode: ${periode}`, 14, 30);

        autoTable(doc, {
            head: [['PO ID', 'Tanggal', 'Supplier', 'Nilai PO', 'Status']],
            body: filteredPOs.map(p => [
                p.id, p.Tanggal, p.supplier, `Rp ${p.Total.toLocaleString()}`, p.Status
            ]),
            startY: 40,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] }
        });

        doc.save(`PO_Report_${periode.replace(/ /g, '_')}.pdf`);
    };

    const CreatePOModal = () => {
        if (!showCreateModal) return null;
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowCreateModal(false)} />
                <div className="relative bg-white w-full max-w-5xl rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-4 border-white">
                    <div className="flex flex-col lg:flex-row h-[85vh]">
                        {/* Sidebar Modal */}
                        <div className="lg:w-1/3 bg-slate-900 p-12 text-white flex flex-col justify-between">
                            <div>
                                <div className="w-16 h-16 rounded-[24px] bg-indigo-600 flex items-center justify-center mb-8 shadow-xl shadow-indigo-500/20">
                                    <ShoppingBag className="w-8 h-8" />
                                </div>
                                <h3 className="text-4xl font-bold tracking-tighter leading-none mb-6">Buat Pesanan Baru</h3>
                                <p className="text-slate-400 text-sm font-medium leading-relaxed">Kelola pengadaan barang dengan standar profesional AKAPRO untuk menjaga ketersediaan aset dan stok.</p>
                            </div>

                            <div className="space-y-8">
                                {[
                                    { step: '01', label: 'Identitas Supplier', active: true },
                                    { step: '02', label: 'Spesifikasi Item', active: false },
                                    { step: '03', label: 'Konfirmasi Pengadaan', active: false }
                                ].map((s, idx) => (
                                    <div key={idx} className={`flex items-center gap-6 ${s.active ? 'opacity-100' : 'opacity-30'}`}>
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold ${s.active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-400'}`}>
                                            {s.step}
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Content Modal */}
                        <div className="flex-1 p-12 overflow-y-auto space-y-10 bg-white">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-600" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Procurement Module v4.2</span>
                                </div>
                                <button onClick={() => setShowCreateModal(false)} className="p-4 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-[24px] transition-all">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Mitra Supplier</label>
                                    <div className="relative group">
                                        <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                                        <select className="w-full bg-slate-50 border-2 border-slate-50 rounded-[24px] py-5 pl-14 pr-8 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer shadow-sm">
                                            <option>Pilih Partner Supplier...</option>
                                            <option>PT. Distribusi Nasional</option>
                                            <option>Global Parts Corp</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Lokasi Penerimaan</label>
                                    <div className="relative group">
                                        <Package className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                                        <select className="w-full bg-slate-50 border-2 border-slate-50 rounded-[24px] py-5 pl-14 pr-8 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer shadow-sm">
                                            <option>Gudang Utama (Pusat)</option>
                                            <option>Gudang Logistik Region A</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Daftar Barang Permintaan</label>
                                <div className="bg-slate-50 rounded-[40px] p-12 border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center space-y-6 min-h-[300px] group hover:bg-indigo-50/30 hover:border-indigo-100 transition-all cursor-pointer">
                                    <div className="w-20 h-20 rounded-[32px] bg-white flex items-center justify-center text-slate-200 shadow-xl shadow-slate-200 group-hover:scale-110 group-hover:rotate-3 transition-all">
                                        <ShoppingBag className="w-10 h-10" />
                                    </div>
                                    <div>
                                        <p className="text-base font-bold text-slate-400 tracking-tight">Belum ada item yang ditambahkan</p>
                                        <button className="text-indigo-600 text-xs font-extrabold uppercase tracking-widest mt-4 flex items-center gap-2 mx-auto hover:gap-4 transition-all">
                                            Tambah Item Katalog <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-10 flex gap-6">
                                <button className="flex-1 px-8 py-6 rounded-[24px] border-2 border-slate-100 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">Simpan Draft</button>
                                <button className="flex-[2] bg-indigo-600 text-white px-10 py-6 rounded-[24px] font-bold shadow-2xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.2em]">
                                    Validasi & Rilis Pesanan
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <Truck className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Procurement & Supplier Management</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Pesanan Pembelian (PO)</h2>
                    <p className="text-slate-500 mt-1 font-medium text-sm">Kelola pengadaan barang dan monitor status pesanan supplier secara real-time.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button onClick={exportPdf} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm">
                        <Printer className="w-5 h-5" />
                    </button>
                    <button onClick={exportExcel} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 rounded-xl transition-all shadow-sm">
                        <FileText className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-slate-900 text-white font-bold px-6 py-3 rounded-2xl text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-100"
                    >
                        <Plus className="w-4 h-4" /> Buat PO Baru
                    </button>
                </div>
            </header>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Pesanan', value: stats.total, icon: ShoppingBag, color: 'text-indigo-600', bg: 'bg-indigo-50', sub: 'Keseluruhan Data' },
                    { label: 'Menunggu', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', sub: 'Butuh Follow-up' },
                    { label: 'Berhasil', value: stats.received, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: 'Telah Diterima' },
                    { label: 'Transit', value: stats.transit, icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50', sub: 'Sedang Dikirim' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white border-2 border-slate-50 p-6 rounded-2xl shadow-sm hover:translate-y-[-4px] transition-all group border-b-4 border-b-slate-100">
                        <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                        <p className="text-[10px] font-medium text-slate-400 mt-1">{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-6 items-center">
                <div className="relative group flex-1 min-w-[400px]">
                    <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari PO ID, Referensi Supplier, atau Dokumen..."
                        className="w-full bg-white border-2 border-slate-50 rounded-[28px] py-6 pl-16 pr-10 text-sm font-bold placeholder-slate-300 focus:outline-none focus:border-indigo-500 shadow-sm transition-all text-slate-900"
                    />
                </div>
                <div className="flex gap-4">
                    <button onClick={exportPdf} className="bg-slate-100 text-slate-900 p-6 rounded-[24px] hover:bg-slate-200 transition-all group shadow-sm">
                        <Printer className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </button>
                    <button onClick={exportExcel} className="bg-white border-2 border-slate-50 p-6 rounded-[24px] hover:border-emerald-500 hover:bg-emerald-50 text-emerald-600 transition-all group shadow-sm">
                        <FileText className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </button>
                    <button className="bg-white border-2 border-slate-50 p-6 rounded-[24px] hover:border-indigo-500 hover:bg-indigo-50 text-indigo-600 transition-all group shadow-sm">
                        <Filter className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border-2 border-slate-50 rounded-[40px] shadow-2xl shadow-slate-200/40 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b-2 border-slate-50">
                                <th className="px-12 py-10 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Referensi No</th>
                                <th className="px-12 py-10 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Procurement Date</th>
                                <th className="px-12 py-10 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Partner Supplier</th>
                                <th className="px-12 py-10 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Commitment Value</th>
                                <th className="px-12 py-10 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Lifecycle</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-50">
                            {filteredPOs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-12 py-32 text-center">
                                        <div className="flex flex-col items-center gap-6 text-slate-300">
                                            <ShoppingBag className="w-20 h-20 opacity-10" />
                                            <p className="text-xl font-bold uppercase tracking-[0.2em]">Data Tidak Ditemukan</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredPOs.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50/50 transition-all group cursor-pointer">
                                    <td className="px-12 py-10">
                                        <p className="text-xl font-extrabold text-slate-900 tracking-tighter group-hover:text-indigo-600 transition-colors uppercase">{p.id}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.items} SKU Items</p>
                                        </div>
                                    </td>
                                    <td className="px-12 py-10">
                                        <div className="flex items-center gap-2 text-slate-500 font-bold bg-slate-50 px-4 py-2 rounded-xl w-fit">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-xs uppercase">{p.Tanggal}</span>
                                        </div>
                                    </td>
                                    <td className="px-12 py-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-sm transition-transform group-hover:rotate-6">
                                                <User className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 uppercase tracking-tight">{p.supplier}</p>
                                                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Verified Partner</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-12 py-10 text-right font-mono text-2xl font-extrabold text-slate-900 tracking-tighter">
                                        Rp {p.Total.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-12 py-10">
                                        <div className="flex justify-center">
                                            {p.Status === 'Selesai' ? (
                                                <span className="px-6 py-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-bold uppercase tracking-[0.1em] flex items-center gap-2 shadow-sm">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Selesai
                                                </span>
                                            ) : p.Status === 'Pending' ? (
                                                <span className="px-6 py-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-bold uppercase tracking-[0.1em] flex items-center gap-2 shadow-sm">
                                                    <Clock className="w-4 h-4" />
                                                    Menunggu
                                                </span>
                                            ) : p.Status === 'Transit' ? (
                                                <span className="px-6 py-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 text-[9px] font-bold uppercase tracking-[0.1em] flex items-center gap-2 shadow-sm animate-pulse">
                                                    <Truck className="w-4 h-4" />
                                                    Transit
                                                </span>
                                            ) : (
                                                <span className="px-6 py-3 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 text-[9px] font-bold uppercase tracking-[0.1em] flex items-center gap-2 shadow-sm">
                                                    <XCircle className="w-4 h-4" />
                                                    Dibatalkan
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Footer Mock */}
            <div className="flex items-center justify-between px-10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Menampilkan {filteredPOs.length} dari {poList.length} transaksi procurement</p>
                <div className="flex gap-2">
                    {[1, 2, 3].map(n => (
                        <button key={n} className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${n === 1 ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'}`}>
                            {n}
                        </button>
                    ))}
                </div>
            </div>

            {/* Create PO Modal */}
            <CreatePOModal />
        </div>
    );
}
