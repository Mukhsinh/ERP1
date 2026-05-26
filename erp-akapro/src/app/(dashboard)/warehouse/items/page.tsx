"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    Package,
    Search,
    Plus,
    Filter,
    MoreVertical,
    Tag,
    X,
    Database,
    Download,
    Loader2,
    RefreshCw,
    Edit2,
    Trash2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSupabase } from '@/hooks/useSupabase';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function ItemsPage() {
    const { tenant } = useSupabase();
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form state
    const [form, setForm] = useState({
        sku: '',
        name: '',
        category: 'BAHAN BAKU',
        unit: 'Pcs',
        base_price: 0,
        stock_qty: 0,
        min_stock: 5
    });

    useEffect(() => {
        if (tenant) {
            fetchItems();
        }
    }, [tenant]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            setItems(data || []);
        } catch (error: any) {
            toast.error("Gagal memuat data: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) return;

        setSaving(true);
        try {
            const { error } = await supabase
                .from('products')
                .insert([{
                    tenant_id: tenant.id,
                    sku: form.sku,
                    name: form.name,
                    category: form.category,
                    unit: form.unit,
                    base_price: form.base_price,
                    stock_qty: form.stock_qty,
                    min_stock: form.min_stock
                }]);

            if (error) throw error;

            toast.success("Barang berhasil ditambahkan.");
            setShowAddModal(false);
            fetchItems();
            setForm({
                sku: '',
                name: '',
                category: 'BAHAN BAKU',
                unit: 'Pcs',
                base_price: 0,
                stock_qty: 0,
                min_stock: 5
            });
        } catch (error: any) {
            toast.error("Gagal menyimpan: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const filteredItems = useMemo(() => {
        return items.filter(item =>
            item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [items, searchQuery]);

    const formatIDR = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(val);
    };

    const exportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredItems.map(i => ({
            'SKU': i.sku,
            'Nama Barang': i.name,
            'Kategori': i.category,
            'Satuan': i.unit,
            'Harga Dasar': i.base_price,
            'Stok Saat Ini': i.stock_qty
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Katalog Barang");
        XLSX.writeFile(workbook, "Master_Data_Barang.xlsx");
        toast.success("Excel berhasil diunduh.");
    };

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <Database className="w-4 h-4" />
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-600">Master Data Inventaris</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Katalog Barang (WMS)</h2>
                    <p className="text-sm text-slate-500 mt-1">Manajemen SKU, standardisasi satuan, dan kontrol data master produk.</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={fetchItems}
                        className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all"
                    >
                        <RefreshCw className={`w-4 h-4 text-blue-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-slate-900 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> Tambah Barang
                    </button>
                </div>
            </header>

            {/* Tools */}
            <div className="flex flex-wrap gap-4 items-center">
                <div className="relative group flex-1 min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari SKU, nama barang, atau kategori..."
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-indigo-500 shadow-sm transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    <button onClick={exportExcel} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all">
                        <Download className="w-4 h-4 text-indigo-600" /> Ekspor Excel
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Informasi Produk</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kategori & Satuan</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Harga & Stok</th>
                                <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Memuat Katalog...</span>
                                    </td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">Tidak ada barang ditemukan.</td>
                                </tr>
                            ) : filteredItems.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-mono text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 w-fit mb-1.5">{item.sku}</span>
                                            <span className="text-sm font-bold text-slate-800 uppercase tracking-tight">{item.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200 w-fit">
                                                {item.category}
                                            </span>
                                            <span className="text-[10px] font-medium text-slate-400 italic">Satuan: {item.unit}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <p className="text-sm font-bold text-slate-900 font-mono">{formatIDR(item.base_price || 0)}</p>
                                        <p className={`text-[10px] font-bold mt-1 ${item.stock_qty <= (item.min_stock || 0) ? 'text-rose-500' : 'text-emerald-600'}`}>
                                            Stok: {item.stock_qty || 0} {item.unit}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Tambah Barang Baru</h3>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5 tracking-tighter">Registrasi SKU ke sistem pusat</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm"><X className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="p-8 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kode SKU</label>
                                        <input required type="text" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm" placeholder="SKU-XXXX" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kategori</label>
                                        <select className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                            <option>BAHAN BAKU</option>
                                            <option>BARANG JADI</option>
                                            <option>KEMASAN</option>
                                            <option>SPAREPART</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Barang</label>
                                    <input required type="text" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm" placeholder="Nama lengkap..." value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Harga Dasar (Rp)</label>
                                        <input required type="number" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm" value={form.base_price} onChange={e => setForm({ ...form, base_price: Number(e.target.value) })} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Satuan</label>
                                        <input required type="text" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm" placeholder="Pcs, Kg, Box..." value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Stok Awal</label>
                                        <input type="number" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 shadow-sm" value={form.stock_qty} onChange={e => setForm({ ...form, stock_qty: Number(e.target.value) })} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Min. Stok (Warning)</label>
                                        <input type="number" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 shadow-sm" value={form.min_stock} onChange={e => setForm({ ...form, min_stock: Number(e.target.value) })} />
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-slate-800 transition-all">Batal</button>
                                <button type="submit" disabled={saving} className="flex-1 py-4 bg-indigo-600 hover:bg-slate-900 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-100 transition-all flex items-center justify-center">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Registrasi Barang'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
