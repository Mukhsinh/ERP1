"use client";

import React, { useState, useMemo } from 'react';
import {
    Headphones,
    Search,
    Plus,
    Filter,
    MessageSquare,
    PhoneCall,
    Mail,
    UserCircle2,
    Calendar,
    Download,
    Printer,
    ArrowRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    User,
    ChevronRight,
    Star,
    X,
    Send,
} from 'lucide-react';
import * as XLSX from 'xlsx';

const mockTickets = [
    { id: 'TKT-24-101', customer: 'Bapak Ahmad Faisal', whatsapp: '6281234567890', subject: 'Keterlambatan Pengiriman PO-2024-001', priority: 'High', status: 'Open', tanggal: '2024-05-23', duration: '2h' },
    { id: 'TKT-24-102', customer: 'Ibu Ratna Sari', whatsapp: '6282345678901', subject: 'Retur Barang Rusak (Invoice INV-001)', priority: 'Medium', status: 'Processing', tanggal: '2024-05-23', duration: '5h' },
    { id: 'TKT-24-103', customer: 'PT. Maju Bersama', whatsapp: '6283456789012', subject: 'Pertanyaan Program Loyalitas', priority: 'Low', status: 'Selesai', tanggal: '2024-05-22', duration: '24h' },
    { id: 'TKT-24-104', customer: 'Budi Santoso', whatsapp: '6284567890123', subject: 'Pembayaran Belum Terverifikasi', priority: 'High', status: 'Open', tanggal: '2024-05-21', duration: '48h' },
];

export default function CrmPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [showTicketModal, setShowTicketModal] = useState(false);

    const filteredTickets = useMemo(() => {
        return mockTickets.filter(t =>
            (filterStatus === 'All' || t.status === filterStatus) &&
            (t.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.subject.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [searchQuery, filterStatus]);

    const stats = useMemo(() => ({
        open: mockTickets.filter(t => t.status === 'Open').length,
        processing: mockTickets.filter(t => t.status === 'Processing').length,
        selesai: mockTickets.filter(t => t.status === 'Selesai').length,
        avgSla: '98.2%'
    }), []);

    const handleWhatsAppResponse = (phone: string, subject: string) => {
        const message = encodeURIComponent(`Halo, kami dari Tim Support ERP AKAPRO. Terkait tiket: ${subject}. Mohon ditunggu, kami sedang memproses kendala Anda.`);
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    };

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <Headphones className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">CRM & Customer Experience</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Pusat Layanan Pelanggan</h2>
                    <p className="text-slate-500 mt-1 font-medium text-sm">Monitor dan respon cepat setiap kendala pelanggan secara omnichannel.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                        {['All', 'Open', 'Processing', 'Selesai'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filterStatus === s ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setShowTicketModal(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-slate-900 text-white font-bold px-6 py-3 rounded-2xl text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-100"
                    >
                        <Plus className="w-4 h-4" /> Tiket Baru
                    </button>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Tiket Baru', value: stats.open, icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-50', sub: 'Perlu Respon Segera' },
                    { label: 'Dalam Proses', value: stats.processing, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', sub: 'Sedang Ditangani' },
                    { label: 'Selesai', value: stats.selesai, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: 'Terverifikasi' },
                    { label: 'Customer Satisfaction', value: stats.avgSla, icon: Star, color: 'text-blue-600', bg: 'bg-blue-50', sub: 'SLA Performance' },
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

            {/* Search & Export */}
            <div className="flex flex-wrap gap-4 items-center">
                <div className="relative group flex-1 min-w-[300px]">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari ID Tiket, Nama Pelanggan, atau Keluhan..."
                        className="w-full bg-white border border-slate-200 rounded-xl py-4 pl-14 pr-8 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-all text-slate-900 shadow-sm"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-white border border-slate-200 p-4 rounded-xl text-slate-500 hover:text-indigo-600 transition-all shadow-sm">
                        <Filter className="w-4 h-4" />
                    </button>
                    <button className="flex items-center gap-2 bg-white border border-slate-200 p-4 rounded-xl text-slate-500 hover:text-emerald-600 transition-all shadow-sm">
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Ticket Table */}
            <div className="bg-white border-2 border-slate-50 rounded-2xl shadow-xl shadow-slate-100/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-medium">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID Tiket / Subjek</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pelanggan</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prioritas</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 italic">
                            {filteredTickets.map((t) => (
                                <tr key={t.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-8 py-6">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 not-italic uppercase tracking-tight">{t.id}</p>
                                            <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{t.subject}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-800 not-italic uppercase">{t.customer}</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{t.whatsapp}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${t.priority === 'High' ? 'bg-rose-50 text-rose-600' :
                                                t.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'
                                            }`}>
                                            {t.priority}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex justify-center">
                                            {t.status === 'Open' ? (
                                                <span className="flex items-center gap-2 px-3 py-1 rounded-lg bg-rose-50 text-rose-600 text-[9px] font-bold uppercase tracking-widest">
                                                    <AlertCircle className="w-3 h-3" /> Waiting
                                                </span>
                                            ) : t.status === 'Processing' ? (
                                                <span className="flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-50 text-amber-600 text-[9px] font-bold uppercase tracking-widest">
                                                    <Clock className="w-3 h-3" /> Responding
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-widest">
                                                    <CheckCircle2 className="w-3 h-3" /> Solved
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleWhatsAppResponse(t.whatsapp, t.subject)}
                                                className="p-2 border border-emerald-100 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex items-center gap-2 text-[10px] font-bold group"
                                            >
                                                <Send className="w-3.5 h-3.5" />
                                                <span className="hidden lg:inline uppercase">Respon WA</span>
                                            </button>
                                            <button className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-indigo-600 hover:text-white transition-all">
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Ticket Modal */}
            {showTicketModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowTicketModal(false)} />
                    <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Buat Tiket Baru</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Dokumentasi Layanan Pelanggan</p>
                            </div>
                            <button onClick={() => setShowTicketModal(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama / WhatsApp Pelanggan</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-indigo-600 transition-all"
                                    placeholder="Contoh: Bapak Ahmad - 0812..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Prioritas</label>
                                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-indigo-600 transition-all">
                                        <option>Low</option>
                                        <option>Medium</option>
                                        <option>High / Urgent</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kategori</label>
                                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-indigo-600 transition-all">
                                        <option>Komplain Pengiriman</option>
                                        <option>Masalah Pembayaran</option>
                                        <option>Retur Barang</option>
                                        <option>Pertanyaan Produk</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Detail Masalah</label>
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-indigo-600 transition-all h-24 resize-none"
                                    placeholder="Tuliskan keluhan pelanggan secara detail..."
                                />
                            </div>
                            <button
                                onClick={() => setShowTicketModal(false)}
                                className="w-full py-4 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100"
                            >
                                Buat & Kirim Notifikasi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
