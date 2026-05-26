"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    Warehouse,
    Search,
    MapPin,
    AlertTriangle,
    ChevronDown,
    Printer,
    Download,
    ClipboardList,
    FileSpreadsheet,
    Calendar,
    Loader2,
    RefreshCw
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/lib/supabase';
import { useSupabase } from '@/hooks/useSupabase';
import { toast } from 'sonner';

export default function StocksPage() {
    const { tenant } = useSupabase();
    const [loading, setLoading] = useState(true);
    const [stocks, setStocks] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [period, setPeriod] = useState(() => {
        const now = new Date();
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        return `${months[now.getMonth()]} ${now.getFullYear()}`;
    });
    const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

    const periods = [
        'Januari 2024', 'Februari 2024', 'Maret 2024', 'April 2024', 'Mei 2024', 'Juni 2024',
        'Juli 2024', 'Agustus 2024', 'September 2024', 'Oktober 2024', 'November 2024', 'Desember 2024',
        'Triwulan I 2024', 'Triwulan II 2024', 'Semester I 2024', 'Akhir Tahun 2024'
    ];

    useEffect(() => {
        if (tenant) {
            fetchStocks();
        }
    }, [tenant]);

    const fetchStocks = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('id, sku, name, stock_qty, unit, min_stock')
                .order('name', { ascending: true });

            if (error) throw error;

            setStocks((data || []).map(item => ({
                ...item,
                available: item.stock_qty || 0,
                minStock: item.min_stock || 5,
                unit: item.unit || 'Pcs'
            })));
        } catch (error: any) {
            toast.error("Gagal memuat stok: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredStocks = useMemo(() => {
        return stocks.filter(s =>
            (s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || s.sku?.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [stocks, searchQuery]);

    const stats = useMemo(() => {
        return {
            total: stocks.length,
            low: stocks.filter(s => s.available > 0 && s.available <= s.minStock).length,
            empty: stocks.filter(s => s.available === 0).length,
        };
    }, [stocks]);

    const exportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredStocks.map(s => ({
            'SKU': s.sku,
            'Nama Barang': s.name,
            'Stok Tersedia': s.available,
            'Satuan': s.unit,
            'Status': s.available === 0 ? 'KOSONG' : s.available <= s.minStock ? 'MENIPIS' : 'AMAN'
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Stok Gudang");
        XLSX.writeFile(workbook, `Laporan_Stok_${period.replace(/ /g, '_')}.xlsx`);
        toast.success("Excel berhasil diunduh.");
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("LAPORAN STATUS STOK INVENTARIS", 105, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Periode: ${period}`, 14, 25);
        doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 30);
        doc.line(14, 33, 196, 33);

        autoTable(doc, {
            head: [['SKU', 'NAMA BARANG', 'STOK', 'SATUAN', 'STATUS']],
            body: filteredStocks.map(s => [
                s.sku, s.name, s.available, s.unit,
                s.available === 0 ? 'KOSONG' : s.available <= s.minStock ? 'MENIPIS' : 'AMAN'
            ]),
            startY: 38,
            theme: 'striped',
            headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
            styles: { fontSize: 8 },
            columnStyles: { 2: { halign: 'right' } }
        });

        doc.save(`Stok_Gudang_${period.replace(/ /g, '_')}.pdf`);
        toast.success("PDF berhasil diunduh.");
    };

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                        <Warehouse className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Modul Gudang</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Status Stok Gudang</h2>
                    <p className="text-sm text-slate-500 mt-1">Monitoring ketersediaan unit barang secara real-time dari database.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="relative">
                        <button onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                            className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:border-blue-400 transition-all">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span className="text-slate-700">{period}</span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${showPeriodDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showPeriodDropdown && (
                            <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-y-auto max-h-60 py-1">
                                {periods.map(p => (
                                    <button key={p} onClick={() => { setPeriod(p); setShowPeriodDropdown(false); }}
                                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-xs font-bold text-slate-600">
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button onClick={fetchStocks} className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:border-blue-400 transition-all">
                        <RefreshCw className={`w-4 h-4 text-blue-500 ${loading ? 'animate-spin' : ''}`} />
                        <span className="text-slate-700">Refresh</span>
                    </button>
                </div>
            </header>

            {/* Dash Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><ClipboardList className="w-6 h-6" /></div>
                    <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Barang</p><h3 className="text-xl font-bold text-slate-900">{stats.total} SKU</h3></div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><AlertTriangle className="w-6 h-6" /></div>
                    <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Stok Menipis</p><h3 className="text-xl font-bold text-slate-900">{stats.low} Item</h3></div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center"><AlertTriangle className="w-6 h-6" /></div>
                    <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Stok Kosong</p><h3 className="text-xl font-bold text-slate-900">{stats.empty} Item</h3></div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-4 items-center">
                <div className="relative group flex-1 min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari SKU atau nama barang..."
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-blue-500 shadow-sm transition-all" />
                </div>
                <div className="flex gap-2">
                    <button onClick={exportPDF} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all">
                        <Printer className="w-4 h-4 text-rose-500" /> PDF
                    </button>
                    <button onClick={exportExcel} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> EXCEL
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Detail Barang</th>
                                <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Tersedia</th>
                                <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Stok Min.</th>
                                <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                                        <span className="text-sm text-slate-400">Memuat data stok...</span>
                                    </td>
                                </tr>
                            ) : filteredStocks.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">Tidak ada data stok ditemukan.</td>
                                </tr>
                            ) : filteredStocks.map((s) => (
                                <tr key={s.id} className="hover:bg-slate-50/50 transition-all">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-800 uppercase leading-none mb-1.5">{s.name}</span>
                                            <span className="text-[10px] font-mono font-bold text-blue-600">{s.sku}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-base font-bold text-slate-900 font-mono">{s.available}</span>
                                        <span className="text-[9px] text-slate-400 font-bold ml-1.5 uppercase">{s.unit}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-xs font-bold text-slate-400 font-mono">{s.minStock}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            {s.available === 0 ? (
                                                <span className="px-3 py-1 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 text-[9px] font-bold uppercase">STOK KOSONG</span>
                                            ) : s.available <= s.minStock ? (
                                                <span className="px-3 py-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-bold uppercase">PERLU REORDER</span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-bold uppercase">STOK AMAN</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
