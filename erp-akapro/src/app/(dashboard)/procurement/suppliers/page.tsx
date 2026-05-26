'use client';

import React, { useState, useMemo } from 'react';
import {
    Truck, Plus, Search, Filter, Mail, Phone, MapPin,
    MoreHorizontal, Edit, Trash2, ExternalLink, ShieldCheck,
    Download, FileSpreadsheet, Printer, Globe, UserCheck,
    ChevronRight, X, Calendar, Package, Briefcase, Building2,
    CheckCircle2, Banknote, User
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Supplier {
    id: string;
    code: string;
    name: string;
    category: 'Bahan Baku' | 'Peralatan' | 'Habis Pakai' | 'Layanan' | 'Lainnya' | 'Import' | 'Eksklusif';
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    status: 'ACTIVE' | 'INACTIVE';
    lastTransaction: string;
    totalPurchase?: number;
}

const mockSuppliers: Supplier[] = [
    {
        id: '1',
        code: 'SUP-001',
        name: 'PT. Distribusi Nasional',
        category: 'Bahan Baku',
        contactPerson: 'Andi Wijaya',
        email: 'andi@distribusi.com',
        phone: '0812-3456-7890',
        address: 'Jl. Industri No. 45, Jakarta Selatan',
        status: 'ACTIVE',
        lastTransaction: '2024-05-20',
        totalPurchase: 125
    },
    {
        id: '2',
        code: 'SUP-002',
        name: 'Global Machines Ltd',
        category: 'Import',
        contactPerson: 'Sarah Chen',
        email: 'sales@globalmachines.com',
        phone: '+65 6789 0123',
        address: 'Marina Bay Financial Centre, Singapore',
        status: 'ACTIVE',
        lastTransaction: '2024-05-15',
        totalPurchase: 42
    },
    {
        id: '3',
        code: 'SUP-003',
        name: 'CV. Plastik Jaya',
        category: 'Habis Pakai',
        contactPerson: 'Budi Santoso',
        email: 'budi@plastikjaya.co.id',
        phone: '021-5678-9012',
        address: 'Kawasan Industri Jababeka, Bekasi',
        status: 'INACTIVE',
        lastTransaction: '2023-12-10',
        totalPurchase: 89
    },
];

export default function SuppliersPage() {
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('Semua Kategori');
    const [showAddModal, setShowAddModal] = useState(false);

    const filteredSuppliers = useMemo(() => {
        return mockSuppliers.filter(s =>
            (s.name.toLowerCase().includes(search.toLowerCase()) ||
                s.code.toLowerCase().includes(search.toLowerCase()) ||
                s.contactPerson.toLowerCase().includes(search.toLowerCase())) &&
            (filterCategory === 'Semua Kategori' || s.category === filterCategory)
        );
    }, [search, filterCategory]);

    const categories = ['Semua Kategori', 'Bahan Baku', 'Peralatan', 'Habis Pakai', 'Layanan'];

    const exportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredSuppliers.map(s => ({
            'Kode': s.code,
            'Nama Supplier': s.name,
            'Kategori': s.category,
            'Kontak': s.contactPerson,
            'Email': s.email,
            'Telepon': s.phone,
            'Alamat': s.address,
            'Status': s.status,
            'Transaksi Terakhir': s.lastTransaction
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Daftar Supplier");
        XLSX.writeFile(workbook, "Data_Supplier_Pengadaan.xlsx");
    };

    const exportPdf = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("LAPORAN DATA SUPPLIER (PENGADAAN)", 14, 22);
        autoTable(doc, {
            head: [['Kode', 'Nama Supplier', 'Kategori', 'Telepon', 'Status']],
            body: filteredSuppliers.map(s => [s.code, s.name, s.category, s.phone, s.status]),
            startY: 30,
        });
        doc.save("Laporan_Supplier.pdf");
    };

    return (
        <div className="p-8 space-y-10 max-w-7xl mx-auto min-h-screen animate-in fade-in duration-700 bg-white">
            {/* Header Area */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-slate-50 pb-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-indigo-600">
                        <div className="p-2 bg-indigo-50 rounded-2xl shadow-inner">
                            <Truck className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] leading-none">Supplied Chain Management</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">Daftar Supplier</h1>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest max-w-xl leading-relaxed italic">Direktori mitra logistik dan pemasok strategis untuk rantai pasokan korporasi.</p>
                </div>

                <div className="flex flex-wrap gap-4">
                    <button className="flex items-center gap-3 bg-slate-50 border-2 border-slate-100 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:border-indigo-600 hover:bg-white transition-all group">
                        <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                        Unduh Template
                    </button>
                    <button className="flex items-center gap-3 bg-slate-50 border-2 border-slate-100 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:border-indigo-600 hover:bg-white transition-all group">
                        <Download className="w-5 h-5 text-indigo-500" />
                        Import CSV
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-4 bg-slate-900 hover:bg-indigo-600 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Tambah Supplier Baru
                    </button>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Total Supplier', value: mockSuppliers.length, icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Active Partners', value: mockSuppliers.filter(s => s.status === 'ACTIVE').length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Global Vendors', value: mockSuppliers.filter(s => s.category === 'Import').length, icon: Globe, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'Total PO Value', value: 'Rp 2.4B', icon: Banknote, color: 'text-rose-500', bg: 'bg-rose-50' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white border-2 border-slate-50 p-8 rounded-[48px] shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-150 transition-transform">
                            <stat.icon className="w-24 h-24" />
                        </div>
                        <div className="flex justify-between items-start relative z-10">
                            <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm`}>
                                <stat.icon className="w-7 h-7" />
                            </div>
                        </div>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-2 tabular-nums">{stat.value}</h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters and Search */}
            <div className="flex flex-wrap gap-6 items-center bg-slate-50 p-4 rounded-[40px] border border-slate-100 shadow-inner">
                <div className="relative group flex-1 min-w-[300px]">
                    <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search Identity, Company, or Contact Person..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border-2 border-transparent rounded-[32px] py-6 pl-16 pr-8 text-sm font-black shadow-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-300 tracking-tight"
                    />
                </div>

                <div className="flex gap-3 px-2 overflow-x-auto no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-8 py-5 rounded-[28px] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterCategory === cat
                                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100'
                                : 'bg-white text-slate-400 border-2 border-slate-100 hover:border-indigo-100 hover:text-indigo-600 shadow-sm'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="flex gap-3 ml-auto pr-4">
                    <button onClick={exportPdf} className="p-6 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                        <Printer className="w-5 h-5" />
                    </button>
                    <button onClick={exportExcel} className="p-6 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                        <FileSpreadsheet className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white border-2 border-slate-50 rounded-[64px] shadow-2xl shadow-indigo-100/30 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900">
                                <th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-white/5">Provider Entity</th>
                                <th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-white/5 text-center">Contact Personnel</th>
                                <th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-white/5 text-center">Operational State</th>
                                <th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-white/5 text-center">Procurement Volume</th>
                                <th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-white/5 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredSuppliers.length > 0 ? filteredSuppliers.map((sup) => (
                                <tr key={sup.id} className="hover:bg-slate-50/80 transition-all group cursor-pointer">
                                    <td className="px-12 py-10">
                                        <div className="flex items-center gap-7">
                                            <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-[32px] flex items-center justify-center font-black text-3xl text-slate-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:-rotate-6 transition-all duration-500 shadow-inner">
                                                {sup.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50/50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-indigo-100/50">
                                                        {sup.code}
                                                    </span>
                                                </div>
                                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter group-hover:text-indigo-600 transition-colors uppercase leading-none">{sup.name}</h3>
                                                <div className="flex items-center gap-2 mt-3 text-slate-400 italic">
                                                    <MapPin className="w-4 h-4 text-indigo-400" />
                                                    <span className="text-[11px] font-bold uppercase truncate max-w-[280px] leading-none">{sup.address}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-12 py-10">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-900 transition-colors">
                                                <Mail className="w-4 h-4 text-indigo-600" />
                                                <span className="text-[11px] font-black italic lowercase tracking-tight">{sup.email}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-900 transition-colors">
                                                <Phone className="w-4 h-4 text-indigo-600" />
                                                <span className="text-[11px] font-black font-mono tracking-tighter">{sup.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-300 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 w-fit group-hover:bg-white transition-colors">
                                                <User className="w-3.5 h-3.5 text-indigo-400" />
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{sup.contactPerson}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-12 py-10 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <span className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 shadow-sm ${sup.status === 'ACTIVE'
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                : 'bg-slate-50 text-slate-300 border-slate-100'
                                                }`}>
                                                {sup.status === 'ACTIVE' ? 'VERIFIED' : 'SUSPENDED'}
                                            </span>
                                            <span className="px-5 py-2 rounded-2xl bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.3em] shadow-xl group-hover:bg-indigo-600 transition-all">
                                                {sup.category}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-12 py-10 text-center">
                                        <div className="space-y-1">
                                            <div className="text-4xl font-black text-slate-900 tracking-tighter tabular-nums group-hover:scale-110 transition-transform">{sup.totalPurchase}</div>
                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Orders Placed</div>
                                            <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-indigo-600">
                                                <Globe className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Global Sourcing</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-12 py-10">
                                        <div className="flex items-center justify-center gap-3">
                                            <button className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all flex items-center justify-center shadow-sm">
                                                <Edit className="w-6 h-6" />
                                            </button>
                                            <button className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-50 text-slate-400 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all flex items-center justify-center shadow-sm">
                                                <Trash2 className="w-6 h-6" />
                                            </button>
                                            <button className="w-14 h-14 rounded-2xl bg-indigo-600 text-white hover:bg-slate-900 transition-all flex items-center justify-center shadow-2xl shadow-indigo-100 active:scale-90 group-hover:-rotate-12">
                                                <ExternalLink className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="py-60 text-center">
                                        <div className="flex flex-col items-center gap-6 opacity-20 grayscale">
                                            <Building2 className="w-32 h-32 text-slate-400 animate-pulse" />
                                            <h3 className="text-3xl font-black text-slate-900 uppercase tracking-[0.4em]">Zero Vendors Found</h3>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Placeholder */}
            <div className="flex flex-col sm:flex-row justify-between items-center px-12 gap-8">
                <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">Supply System Registry | Showing {filteredSuppliers.length} of {mockSuppliers.length} Vendors</p>
                <div className="flex gap-3">
                    {[1, 2, 3].map(p => (
                        <button key={p} className={`w-14 h-14 rounded-2xl font-black text-[11px] transition-all border-2 ${p === 1 ? 'bg-slate-900 text-white border-slate-900 shadow-2xl shadow-indigo-100' : 'bg-white border-slate-50 text-slate-400 hover:bg-slate-50'}`}>
                            {p.toString().padStart(2, '0')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Modal Placeholder */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[64px] shadow-2xl p-16 relative animate-in zoom-in-95 duration-500 overflow-hidden">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-50 rounded-full -ml-32 -mt-32 opacity-50" />

                        <button onClick={() => setShowAddModal(false)} className="absolute top-10 right-10 p-4 bg-slate-50 rounded-[28px] text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all z-10">
                            <X className="w-7 h-7" />
                        </button>

                        <div className="mb-14 relative z-10">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-3 leading-none">Mitra Baru Entry</h2>
                            <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest italic">Otentikasi data supplier baru untuk sistem pengadaan terintegrasi.</p>
                        </div>

                        <div className="space-y-10 mb-14 relative z-10">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vendor Classification</label>
                                    <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] py-6 px-8 text-[11px] font-black uppercase tracking-widest focus:border-indigo-500 focus:bg-white transition-all outline-none appearance-none cursor-pointer">
                                        <option>Lokal</option>
                                        <option>Nasional</option>
                                        <option>Import</option>
                                        <option>Exclusive</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registry ID (Auto)</label>
                                    <input type="text" value="SUPP-2024-XXX" disabled className="w-full bg-slate-100 border-2 border-slate-100 rounded-[28px] py-6 px-8 text-sm font-black text-slate-400 tracking-widest" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company / Institution Legal Name</label>
                                <input type="text" placeholder="ENTER COMPANY NAME..." className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] py-6 px-8 text-sm font-black focus:border-indigo-500 focus:bg-white transition-all outline-none uppercase placeholder:text-slate-300" />
                            </div>
                        </div>

                        <button className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-8 rounded-[36px] shadow-2xl shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4 text-[11px] uppercase tracking-[0.4em]">
                            <Plus className="w-6 h-6" />
                            AUTHORIZE SUPPLIER DATA
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
