"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
    ShoppingCart,
    Search,
    Plus,
    Filter,
    Clock,
    CheckCircle2,
    XCircle,
    Calendar,
    Download,
    Printer,
    ChevronDown,
    User,
    CreditCard,
    Package,
    ArrowRight,
    X,
    FileSpreadsheet,
    Loader2,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/lib/supabase';
import { useSupabase } from '@/hooks/useSupabase';
import { toast } from 'sonner';

export default function SalesOrdersPage() {
    const { tenant } = useSupabase();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        if (tenant) {
            fetchOrders();
        }
    }, [tenant]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            // We fetch from accounting_journals where source_module is SALES or POS
            const { data, error } = await supabase
                .from('accounting_journals')
                .select('*')
                .or('source_module.eq.SALES,source_module.eq.POS')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error: any) {
            toast.error("Gagal memuat data pesanan: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(o =>
            (statusFilter === 'All' || o.source_module === statusFilter) &&
            (o.description?.toLowerCase().includes(searchQuery.toLowerCase()) || o.reference_no?.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [searchQuery, statusFilter, orders]);

    const stats = useMemo(() => ({
        total: orders.length,
        pos: orders.filter(o => o.source_module === 'POS').length,
        sales: orders.filter(o => o.source_module === 'SALES').length,
    }), [orders]);

    const exportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredOrders.map(o => ({
            'Ref No': o.reference_no,
            'Tanggal': new Date(o.created_at).toLocaleDateString('id-ID'),
            'Keterangan': o.description,
            'Module': o.source_module
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Pesanan Penjualan");
        XLSX.writeFile(workbook, `Sales_Orders_Export.xlsx`);
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto min-h-screen">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-violet-600 mb-1">
                        <ShoppingCart className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Revenue Flow</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Pesanan Penjualan (Sales Orders)</h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Monitoring transaksi dari POS dan Faktur Penjualan secara terpusat.</p>
                </div>
            </header>

            {/* Dash Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { label: 'Total Pesanan', value: stats.total, icon: ShoppingCart, color: 'text-violet-600', bg: 'bg-violet-50' },
                    { label: 'Dari Kasir (POS)', value: stats.pos, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Backroom Sales', value: stats.sales, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white border-2 border-slate-50 p-6 rounded-[32px] shadow-sm flex items-center gap-6 hover:translate-y-[-4px] transition-all">
                        <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-lg shadow-slate-100`}>
                            <stat.icon className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-[32px] border-2 border-slate-50 shadow-sm">
                <div className="relative group flex-1 min-w-[300px]">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari Ref No atau Keterangan..."
                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-3.5 pl-12 pr-6 text-xs font-bold text-slate-900 focus:outline-none focus:border-violet-500 focus:bg-white shadow-sm transition-all" />
                </div>
                <div className="flex gap-2">
                    <button onClick={exportExcel} className="flex items-center gap-3 bg-slate-900 hover:bg-violet-600 text-white px-6 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-95">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> EKSPOR EXCEL
                    </button>
                    <button onClick={fetchOrders} className="p-3.5 bg-slate-50 text-slate-400 hover:text-violet-600 rounded-2xl transition-all border-2 border-transparent hover:border-violet-100">
                        <Package className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border-2 border-slate-50 rounded-[40px] shadow-2xl shadow-slate-100/30 overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b-2 border-slate-50">
                                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Referansi & Tanggal</th>
                                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deskripsi Transaksi</th>
                                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Module</th>
                                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-50">
                            {filteredOrders.length === 0 ? (
                                <tr><td colSpan={4} className="px-10 py-32 text-center text-slate-400 font-bold uppercase tracking-widest text-xs italic">Data pesanan tidak ditemukan atau sinkronisasi tertunda.</td></tr>
                            ) : filteredOrders.map((o) => (
                                <tr key={o.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-900 mb-1 group-hover:text-violet-600 transition-colors uppercase">{o.reference_no}</span>
                                            <span className="text-[10px] font-mono font-bold text-slate-400">{new Date(o.created_at).toLocaleDateString('id-ID')}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <p className="text-xs font-bold text-slate-600 uppercase leading-relaxed max-w-md">{o.description}</p>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex justify-center">
                                            <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm border-2 ${o.source_module === 'POS' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                                {o.source_module}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <button className="p-3 bg-slate-50 text-slate-400 hover:bg-violet-600 hover:text-white rounded-xl transition-all shadow-sm">
                                            <Printer className="w-4 h-4" />
                                        </button>
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
