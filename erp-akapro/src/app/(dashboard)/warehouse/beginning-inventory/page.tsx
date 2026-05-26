'use client';

import React, { useState } from 'react';
import {
    Package, Save, Search, RefreshCw, FileSpreadsheet,
    AlertCircle, CheckCircle2, Building2, LayoutGrid, List, Plus, X
} from 'lucide-react';

interface InventoryBalance {
    id: string;
    sku: string;
    name: string;
    category: string;
    unit: string;
    beginningStock: number;
    unitCost: number;
}

const mockInventory: InventoryBalance[] = [
    { id: '1', sku: 'BRG-001', name: 'Premium Espresso Machine', category: 'Mesin', unit: 'Pcs', beginningStock: 0, unitCost: 15000000 },
    { id: '2', sku: 'BRG-002', name: 'Arabica Coffee Beans 1kg', category: 'Bahan Baku', unit: 'Bag', beginningStock: 0, unitCost: 120000 },
    { id: '3', sku: 'BRG-003', name: 'Paper Filter V60', category: 'Habis Pakai', unit: 'Pack', beginningStock: 0, unitCost: 45000 },
];

export default function BeginningInventoryPage() {
    const [inventory, setInventory] = useState<InventoryBalance[]>(mockInventory);
    const [search, setSearch] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    const [showAddModal, setShowAddModal] = useState(false);

    const filteredInventory = inventory.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.sku.includes(search)
    );

    const handleStockChange = (id: string, value: string) => {
        const num = Math.max(0, parseInt(value) || 0);
        setInventory(prev => prev.map(i => i.id === id ? { ...i, beginningStock: num } : i));
    };

    const formatIDR = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(val).replace('Rp', 'Rp ').trim();
    };

    const totalValue = inventory.reduce((acc, i) => acc + (i.beginningStock * i.unitCost), 0);
    const totalItems = inventory.reduce((acc, i) => acc + i.beginningStock, 0);

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise(r => setTimeout(r, 1500));
        setIsSaving(false);
        alert('Saldo awal barang berhasil disimpan!');
    };

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto min-h-screen">
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <Package className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Inventory Setup</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Saldo Awal Barang</h2>
                    <p className="text-sm text-slate-500 mt-1">Inisialisasi stok gudang dan nilai aset persediaan awal.</p>
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-3 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all">
                        <FileSpreadsheet className="w-4 h-4 text-slate-400" /> UNDUH TEMPLATE
                    </button>
                    <button className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-3 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> IMPORT DATA
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> TAMBAH BARANG
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95"
                    >
                        {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        SIMPAN PERUBAHAN
                    </button>
                </div>
            </header>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm group hover:border-indigo-200 transition-all">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Kuantitas Awal</p>
                    <div className="flex items-end justify-between mt-2">
                        <p className="text-3xl font-bold text-slate-900">{totalItems.toLocaleString('id-ID')} <span className="text-sm font-bold text-slate-400">Items</span></p>
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600"><Package className="w-6 h-6" /></div>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm group hover:border-emerald-200 transition-all">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Nilai Persediaan</p>
                    <div className="flex items-end justify-between mt-2">
                        <p className="text-3xl font-bold text-slate-900 font-mono italic">{formatIDR(totalValue)}</p>
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600"><CheckCircle2 className="w-6 h-6" /></div>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm group hover:border-rose-200 transition-all">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gudang Aktif</p>
                    <div className="flex items-end justify-between mt-2">
                        <p className="text-2xl font-bold text-slate-900">Gudang Utama</p>
                        <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600"><Building2 className="w-6 h-6" /></div>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
                <div className="relative group flex-1 max-w-md">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari SKU atau nama barang..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-6 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500 shadow-sm transition-all"
                    />
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl ml-auto">
                    <button
                        onClick={() => setViewMode('table')}
                        className={`p-2.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {viewMode === 'table' ? (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">SKU & Produk</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kategori</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Harga Pokok (Avg)</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Satuan</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Stok Awal</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Total Nilai</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredInventory.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded w-fit mb-1">{item.sku}</span>
                                                <span className="text-sm font-bold text-slate-800">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full uppercase">
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right text-sm font-mono font-bold text-slate-600">
                                            {formatIDR(item.unitCost)}
                                        </td>
                                        <td className="px-8 py-5 text-center text-xs font-bold text-slate-400">{item.unit}</td>
                                        <td className="px-8 py-5">
                                            <div className="flex justify-end">
                                                <input
                                                    type="number"
                                                    value={item.beginningStock || ''}
                                                    onChange={(e) => handleStockChange(item.id, e.target.value)}
                                                    className="w-32 bg-white border border-slate-200 rounded-lg py-2 px-3 text-right text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500 shadow-sm transition-all"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right font-mono font-bold text-indigo-600">
                                            {formatIDR(item.beginningStock * item.unitCost)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {filteredInventory.map((item) => (
                        <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{item.sku}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{item.category}</span>
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 mb-6">{item.name}</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400 font-bold uppercase">Harga Satuan</span>
                                    <span className="text-slate-700 font-bold">{formatIDR(item.unitCost)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-400 font-bold uppercase">Stok Awal</span>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={item.beginningStock || ''}
                                            onChange={(e) => handleStockChange(item.id, e.target.value)}
                                            className="w-24 bg-slate-50 border-none rounded-lg py-2 px-3 text-right text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                            placeholder="0"
                                        />
                                        <span className="text-xs font-bold text-slate-400 italic">{item.unit}</span>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                                    <span className="text-xs text-indigo-600 font-bold uppercase tracking-tight">Total Nilai</span>
                                    <span className="text-lg font-mono font-bold text-indigo-600">{formatIDR(item.beginningStock * item.unitCost)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <ItemModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
        </div>
    );

    function ItemModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
        if (!isOpen) return null;
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
                <div className="relative bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                    <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold tracking-tight">Tambah Barang Manual</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Setup Saldo Awal Inventaris</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                            <X className="w-5 h-5 " />
                        </button>
                    </div>

                    <div className="p-10 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">SKU Barang</label>
                                <input type="text" placeholder="BRG-XXXX" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kategori</label>
                                <select className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500">
                                    <option>Bahan Baku</option>
                                    <option>Mesin</option>
                                    <option>Habis Pakai</option>
                                    <option>Lainnya</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Barang / Produk</label>
                            <input type="text" placeholder="Masukkan nama barang..." className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all" />
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Stok Awal</label>
                                <input type="number" placeholder="0" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500" />
                            </div>
                            <div className="space-y-2 text-center">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 ">Satuan</label>
                                <input type="text" placeholder="Pcs/Ltr" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-bold text-slate-700 text-center" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">HPP Satuan</label>
                                <input type="number" placeholder="0" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500" />
                            </div>
                        </div>

                        <div className="pt-6 flex gap-4">
                            <button onClick={onClose} className="flex-1 py-5 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:bg-slate-50 rounded-2xl transition-all">Batalkan</button>
                            <button className="flex-[2] py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-95">
                                Tambahkan Sebagai Saldo Awal
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
