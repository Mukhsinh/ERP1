"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
    Users, Plus, Search, Filter, Mail, Phone, MapPin,
    MoreHorizontal, Edit, Trash2, ExternalLink, ShieldCheck,
    Download, FileSpreadsheet, Printer, Globe, UserCheck,
    ChevronRight, X, Calendar, Banknote, MessageCircle,
    Loader2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jspdf from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/lib/supabase';
import { useSupabase } from '@/hooks/useSupabase';
import { toast } from 'sonner';

export default function PelangganPage() {
    const { tenant } = useSupabase();
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('Semua Kategori');
    const [showAddModal, setShowAddModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [newCustomer, setNewCustomer] = useState({
        name: '',
        category: 'Retail',
        email: '',
        phone: '',
        whatsapp: '',
        address: '',
        contact_person: ''
    });

    const fetchCustomers = async () => {
        if (!tenant) return;
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('customers') // Using public.customers
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCustomers(data || []);
        } catch (error: any) {
            toast.error('Gagal mengambil data pelanggan: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tenant) {
            fetchCustomers();
        }
    }, [tenant]);

    const handleSaveCustomer = async () => {
        if (!newCustomer.name || !newCustomer.whatsapp) {
            toast.error('Nama dan WhatsApp wajib diisi');
            return;
        }

        try {
            setIsSaving(true);
            const code = `PEL-${Math.floor(1000 + Math.random() * 9000)}`;
            const { error } = await supabase
                .from('customers')
                .insert([{
                    ...newCustomer,
                    tenant_id: tenant?.id,
                    code,
                    status: 'ACTIVE'
                }]);

            if (error) throw error;

            toast.success('Pelanggan berhasil didaftarkan');
            setShowAddModal(false);
            setNewCustomer({
                name: '',
                category: 'Retail',
                email: '',
                phone: '',
                whatsapp: '',
                address: '',
                contact_person: ''
            });
            fetchCustomers();
        } catch (error: any) {
            toast.error('Gagal menyimpan: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const filteredCustomers = useMemo(() => {
        return customers.filter(c =>
            (c.name?.toLowerCase().includes(search.toLowerCase()) ||
                c.code?.toLowerCase().includes(search.toLowerCase()) ||
                c.contact_person?.toLowerCase().includes(search.toLowerCase())) &&
            (filterCategory === 'Semua Kategori' || c.category === filterCategory)
        );
    }, [search, filterCategory, customers]);

    const categories = ['Semua Kategori', 'Retail', 'Grosir', 'VIP', 'Corporate'];

    const exportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredCustomers.map(c => ({
            'Kode': c.code,
            'Nama Pelanggan': c.name,
            'Kategori': c.category,
            'CP': c.contact_person,
            'Email': c.email,
            'WhatsApp': c.whatsapp,
            'Alamat': c.address,
            'Status': c.status
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Daftar Pelanggan");
        XLSX.writeFile(workbook, "Data_Pelanggan_ERP.xlsx");
    };

    const handleOpenWhatsApp = (phone: string) => {
        const cleanPhone = phone.replace(/\D/g, '');
        window.open(`https://wa.me/${cleanPhone}`, '_blank');
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
            {/* Header Area */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-500 mb-1">
                        <Users className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Database Pelanggan & CRM</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Manajemen Pelanggan</h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Kelola basis data pelanggan dan monitoring loyalitas secara real-time.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button onClick={exportExcel} className="p-3.5 bg-white border-2 border-slate-50 text-slate-400 hover:text-emerald-500 rounded-2xl transition-all shadow-sm">
                        <FileSpreadsheet className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-3 bg-indigo-600 hover:bg-slate-900 text-white font-bold px-8 py-4 rounded-3xl text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-100"
                    >
                        <Plus className="w-4 h-4" />
                        Registrasi Pelanggan Baru
                    </button>
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Database', value: customers.length, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Entitas Aktif', value: customers.filter(c => c.status === 'ACTIVE').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Kategori VIP', value: customers.filter(c => c.category === 'VIP').length, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'New This Month', value: '0', color: 'text-violet-600', bg: 'bg-violet-50' },
                ].map((stat, i) => (
                    <div key={i} className={`bg-white p-6 rounded-[32px] border-2 border-slate-50 shadow-sm flex items-center gap-5 hover:translate-y-[-4px] transition-all`}>
                        <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-lg shadow-slate-100`}>
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
                            <p className="text-xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter & Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-[32px] border-2 border-slate-50 shadow-sm">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Cari berdasarkan nama, kode, atau kontak..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] py-4 pl-12 pr-6 text-xs font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-300"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-6 py-4 rounded-[22px] text-[10px] font-bold uppercase tracking-widest transition-all border-2 ${filterCategory === cat ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100' : 'bg-white text-slate-400 border-slate-50 hover:text-slate-600'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border-2 border-slate-50 rounded-[40px] shadow-2xl shadow-slate-100/30 overflow-hidden min-h-[500px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b-2 border-slate-50">
                                <th className="px-10 py-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profil Pelanggan</th>
                                <th className="px-10 py-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Informasi Kontak</th>
                                <th className="px-10 py-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-10 py-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-50">
                            {filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-10 py-32 text-center text-slate-400 font-bold uppercase tracking-widest text-xs italic">
                                        Data pelanggan tidak ditemukan atau belum ada registrasi baru.
                                    </td>
                                </tr>
                            ) : filteredCustomers.map((cust) => (
                                <tr key={cust.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm border-2 border-indigo-100 transition-transform group-hover:scale-110">
                                                {cust.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{cust.name}</p>
                                                <p className="text-[10px] font-bold text-slate-300 mt-1 uppercase tracking-widest">{cust.code} • <span className="text-indigo-400/60">{cust.category}</span></p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Mail className="w-3.5 h-3.5" />
                                                <span className="text-[11px] font-bold lowercase tracking-tight">{cust.email || 'No Email'}</span>
                                            </div>
                                            <button
                                                onClick={() => handleOpenWhatsApp(cust.whatsapp)}
                                                className="flex items-center gap-2 text-emerald-500 hover:text-emerald-700 transition-colors bg-emerald-50 px-3 py-1.5 rounded-xl border-2 border-emerald-100"
                                            >
                                                <MessageCircle className="w-3.5 h-3.5" />
                                                <span className="text-[11px] font-black">+{cust.whatsapp}</span>
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-center text-xs">
                                        <span className={`px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm border-2 ${cust.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                            {cust.status === 'ACTIVE' ? 'DIAMANKAN' : 'DIBEKUKAN'}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center justify-end gap-3">
                                            <button className="p-3.5 bg-slate-50 text-slate-400 hover:bg-white hover:text-indigo-600 rounded-2xl transition-all border-2 border-transparent hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-100/30">
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button className="p-3.5 bg-slate-50 text-slate-400 hover:bg-rose-500 hover:text-white rounded-2xl transition-all">
                                                <Trash2 className="w-5 h-5" />
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl" onClick={() => setShowAddModal(false)} />
                    <div className="relative bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-8 border-white">
                        <div className="px-12 py-12 bg-slate-50/50 border-b-2 border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Registrasi Pelanggan</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Siklus Hidup CRM • Baru</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="w-14 h-14 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-3xl transition-all flex items-center justify-center border-2 border-slate-100 hover:border-rose-100">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-12 space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        value={newCustomer.name}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                        className="w-full bg-slate-50 border-4 border-slate-50 rounded-3xl p-5 text-sm font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-sm"
                                        placeholder="Nama entitas..."
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Kategori Bisnis</label>
                                    <select
                                        value={newCustomer.category}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, category: e.target.value })}
                                        className="w-full bg-slate-50 border-4 border-slate-50 rounded-3xl p-5 text-sm font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-sm appearance-none outline-none"
                                    >
                                        <option>Retail</option>
                                        <option>Grosir</option>
                                        <option>VIP</option>
                                        <option>Corporate</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">WhatsApp ID</label>
                                    <input
                                        type="text"
                                        value={newCustomer.whatsapp}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, whatsapp: e.target.value })}
                                        className="w-full bg-slate-50 border-4 border-slate-50 rounded-3xl p-5 text-sm font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-sm font-mono"
                                        placeholder="628..."
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Email Profil</label>
                                    <input
                                        type="email"
                                        value={newCustomer.email}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                        className="w-full bg-slate-50 border-4 border-slate-50 rounded-3xl p-5 text-sm font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-sm"
                                        placeholder="email@example.com"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Domisili Penagihan</label>
                                <textarea
                                    value={newCustomer.address}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                    className="w-full bg-slate-50 border-4 border-slate-50 rounded-[32px] p-6 text-sm font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all h-28 resize-none shadow-sm"
                                    placeholder="Alamat lengkap..."
                                />
                            </div>
                            <div className="pt-8 flex gap-6">
                                <button onClick={() => setShowAddModal(false)} className="flex-1 py-6 text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-slate-50 rounded-3xl transition-all">Batalkan</button>
                                <button
                                    onClick={handleSaveCustomer}
                                    disabled={isSaving}
                                    className="flex-[2] py-6 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-3xl shadow-2xl shadow-slate-200 hover:bg-indigo-600 transition-all hover:scale-[1.02] active:scale-95 disabled:bg-slate-300"
                                >
                                    {isSaving ? 'MEMPROSES DATABASE...' : 'KONFIRMASI PENDAFTARAN'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
