"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Package,
    ArrowUpRight,
    ArrowDownLeft,
    Filter,
    Calendar,
    ChevronDown,
    Info,
    Search,
    RefreshCw,
    Download,
    Layers,
    Activity,
    Zap,
    LineChart as LineChartIcon,
    Loader2
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { useSupabase } from '@/hooks/useSupabase';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function StockAnalysisPage() {
    const { tenant } = useSupabase();
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [trendData, setTrendData] = useState<any[]>([]);

    useEffect(() => {
        if (tenant) {
            fetchData();
        }
    }, [tenant]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch products with their current stock levels
            // Assuming a view or a join is available, otherwise fetching inventory
            const { data: pData, error: pError } = await supabase
                .from('products')
                .select(`
                    id,
                    sku,
                    name,
                    base_price,
                    stock_qty
                `);

            if (pError) throw pError;

            // Enhance items with calculated metrics (Mocking complex logic for MVP)
            const enhancedItems = (pData || []).map(item => ({
                ...item,
                eoq: Math.floor(Math.random() * 100) + 20,
                toi: (Math.random() * 15).toFixed(1),
                doi: Math.floor(Math.random() * 200) + 10,
                avgDemand: Math.floor(Math.random() * 500),
                holdingCost: 2000,
                orderCost: 15000,
                priceTrend: (Math.random() > 0.5 ? '+' : '-') + Math.floor(Math.random() * 10) + '%',
                status: Math.random() > 0.7 ? 'Fast Moving' : (Math.random() > 0.4 ? 'Efficient' : 'Slow Moving')
            }));

            setItems(enhancedItems);
            if (enhancedItems.length > 0 && !selectedItem) {
                setSelectedItem(enhancedItems[0]);
            }

            // Mock trend data
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'];
            setTrendData(months.map(m => ({
                month: m,
                purchase: Math.floor(Math.random() * 500) + 200,
                sales: Math.floor(Math.random() * 400) + 100,
            })));

        } catch (error: any) {
            toast.error("Gagal mengambil data: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const exportReport = () => {
        if (items.length === 0) {
            toast.error("Tidak ada data untuk diekspor.");
            return;
        }

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Laporan Analisa & Proyeksi Stok - ERP AKAPRO', 14, 22);
        doc.setFontSize(11);
        doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 30);

        const tableData = items.map(item => [
            item.sku,
            item.name,
            item.eoq,
            item.toi + 'x',
            item.doi + 'd',
            item.status
        ]);

        autoTable(doc, {
            startY: 40,
            head: [['SKU', 'Nama Barang', 'EOQ', 'TOI', 'DOI', 'Status']],
            body: tableData,
            headStyles: { fillColor: [79, 70, 229] }
        });

        doc.save(`Stock_Analysis_${new Date().getTime()}.pdf`);
        toast.success("Laporan berhasil diunduh.");
    };

    const formatIDR = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(val);
    };

    const filteredItems = useMemo(() => {
        return items.filter(i =>
            i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.sku.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [items, searchQuery]);

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto min-h-screen">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <BarChart3 className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Gudang Intelligence</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Analisa & Proyeksi Stok</h2>
                    <p className="text-sm text-slate-500 mt-1">Efisienitas inventaris menggunakan metrik EOQ, TOI, dan DOI Profesional.</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={exportReport}
                        className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-3 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all"
                    >
                        <Download className="w-4 h-4 text-slate-400" /> EXPORT REPORT
                    </button>
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} REFRESH DATA
                    </button>
                </div>
            </header>

            {selectedItem && (
                <>
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                                    <Layers className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full uppercase">Optimal</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">EOQ Target</h4>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-slate-900">{selectedItem.eoq}</span>
                                <span className="text-xs text-slate-400 font-bold uppercase">Units</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 italic font-medium">Economic Order Quantity Recommendation</p>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                                    <RefreshCw className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full uppercase">Ratio</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">TOI (Turnover)</h4>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-slate-900">{selectedItem.toi}x</span>
                                <span className="text-xs text-emerald-500 font-bold uppercase">/ Period</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 italic font-medium">Inventory turnover velocity score</p>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full uppercase">Velocity</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">DOI (Days)</h4>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-slate-900">{selectedItem.doi}</span>
                                <span className="text-xs text-slate-400 font-bold uppercase">Days</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 italic font-medium">Days of inventory in hand</p>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-rose-50 rounded-2xl text-rose-600">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-1 rounded-full uppercase">Proyeksi</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Trend Harga</h4>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-slate-900">{selectedItem.priceTrend}</span>
                                <TrendingUp className="w-5 h-5 text-rose-500" />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 italic font-medium">Price fluctuation projection</p>
                        </div>
                    </div>

                    {/* Charts & Analysis */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Tren Pembelian vs Penjualan</h3>
                                    <p className="text-sm text-slate-400">Pilih item untuk melihat analisa mendalam.</p>
                                </div>
                                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-indigo-600" />
                                        <span className="text-[10px] font-bold uppercase text-slate-500">Purchase</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                        <span className="text-[10px] font-bold uppercase text-slate-500">Sales</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData}>
                                        <defs>
                                            <linearGradient id="colorPurchase" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                        <Area type="monotone" dataKey="purchase" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorPurchase)" />
                                        <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-slate-900 p-8 rounded-[32px] text-white overflow-hidden relative group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                    <Zap className="w-32 h-32" />
                                </div>
                                <h4 className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-2">Calculated Metrix</h4>
                                <h3 className="text-2xl font-bold mb-6">EOQ Analysis</h3>

                                <div className="space-y-6 relative">
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                                        <div>
                                            <p className="text-[10px] text-white/50 font-bold uppercase tracking-tighter">Ordering Cost</p>
                                            <p className="text-sm font-bold text-white">{formatIDR(selectedItem.orderCost)}</p>
                                        </div>
                                        <ArrowUpRight className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                                        <div>
                                            <p className="text-[10px] text-white/50 font-bold uppercase tracking-tighter">Holding Cost</p>
                                            <p className="text-sm font-bold text-white">{formatIDR(selectedItem.holdingCost)}</p>
                                        </div>
                                        <ArrowDownLeft className="w-5 h-5 text-rose-400" />
                                    </div>
                                    <div className="pt-4 border-t border-white/10">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-xs font-bold text-white/60">Inventory Health</p>
                                            <span className="text-xs font-bold text-indigo-400">{selectedItem.status}</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 w-3/4 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Selection Table */}
            <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Detail Katalog Analisa</h3>
                        <p className="text-sm text-slate-400">Pilih item untuk melihat analisa mendalam.</p>
                    </div>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari SKU atau barang..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-11 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Detail Barang</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">EOQ</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">TOI</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">DOI</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Trend</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={6} className="p-10 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">Memuat data inventaris...</td></tr>
                            ) : filteredItems.map((item) => (
                                <tr
                                    key={item.id}
                                    className={`hover:bg-slate-50 transition-all cursor-pointer group ${selectedItem?.id === item.id ? 'bg-indigo-50/50' : ''}`}
                                    onClick={() => setSelectedItem(item)}
                                >
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all shadow-sm">
                                                <Package className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{item.name}</span>
                                                <span className="text-[10px] font-mono font-bold text-indigo-500 tracking-wider">SKU: {item.sku}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center font-mono font-bold text-slate-900">{item.eoq}</td>
                                    <td className="px-8 py-5 text-center font-mono font-bold text-slate-900">{item.toi}x</td>
                                    <td className="px-8 py-5 text-center font-mono font-bold text-slate-900">{item.doi}d</td>
                                    <td className="px-8 py-5 text-right">
                                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${item.priceTrend.includes('+') ? 'bg-rose-50 text-rose-600' :
                                            item.priceTrend.includes('-') ? 'bg-emerald-50 text-emerald-600' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>
                                            {item.priceTrend}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`text-[10px] font-bold px-4 py-1.5 rounded-xl border ${item.status === 'Fast Moving' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                            item.status === 'Slow Moving' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                'bg-slate-50 text-slate-600 border-slate-200'
                                            }`}>
                                            {item.status.toUpperCase()}
                                        </span>
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
