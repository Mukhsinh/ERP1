"use client";

import React, { useState } from 'react';
import {
    UserCheck,
    Search,
    Plus,
    Filter,
    Star,
    MessageSquare,
    Phone,
    MoreHorizontal,
    Calendar,
    Target,
    Zap,
    ArrowRight,
    TrendingUp,
    Clock,
    X,
} from 'lucide-react';

const mockLeads = [
    { id: 'LD-001', name: 'PT. Teknologi Maju', stage: 'Prospek Baru', value: 50000000, color: 'bg-blue-500', contact: 'Bpk. Budi', desc: 'Pengadaan server dan infrastruktur cloud tahap 1.' },
    { id: 'LD-002', name: 'Alamsyah & Co', stage: 'Prospek Baru', value: 12000000, color: 'bg-blue-500', contact: 'Ibu Siska', desc: 'Maintenance tahunan perangkat kantor.' },
    { id: 'LD-003', name: 'Cafe Nusantara', stage: 'Diskusi', value: 8500000, color: 'bg-amber-500', contact: 'Rudi', desc: 'Sistem POS terintegrasi 3 cabang.' },
    { id: 'LD-004', name: 'Global Logistik', stage: 'Diskusi', value: 120000000, color: 'bg-amber-500', contact: 'Haryanto', desc: 'Digitalisasi manajemen gudang skala besar.' },
    { id: 'LD-005', name: 'RS Sehat Sejahtera', stage: 'Negosiasi', value: 450000000, color: 'bg-emerald-500', contact: 'Dr. Linda', desc: 'Software rekam medis kustom SAK-compliant.' },
];

export default function LeadsPage() {
    const [showAddModal, setShowAddModal] = useState(false);

    const LeadCard = ({ lead }: { lead: any }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group cursor-pointer hover:border-indigo-300 transition-all hover:shadow-xl hover:shadow-slate-200/40">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-10 rounded-full ${lead.color} opacity-40`} />
                    <div>
                        <h5 className="text-base font-bold text-slate-800 leading-none group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{lead.name}</h5>
                        <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest">{lead.contact} • {lead.id}</p>
                    </div>
                </div>
                <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                    <MoreHorizontal className="w-4 h-4 text-slate-300" />
                </button>
            </div>

            <p className="text-xs font-semibold text-slate-400 leading-relaxed mb-6 italic">"{lead.desc}"</p>

            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div>
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-1">Nilai Potensial</p>
                    <p className="text-sm font-bold text-slate-900 tracking-tight">Rp {lead.value.toLocaleString('id-ID')}</p>
                </div>
                <div className="flex gap-2">
                    <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                        <Phone className="w-4 h-4" />
                    </button>
                    <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                        <MessageSquare className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );

    const AddLeadModal = () => {
        if (!showAddModal) return null;
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">Prospek Penjualan Baru</h3>
                            <p className="text-slate-400 text-[10px] font-bold mt-3 uppercase tracking-widest">Identifikasi Peluang Bisnis Strategis</p>
                        </div>
                        <button onClick={() => setShowAddModal(false)} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nama Perusahaan / Client</label>
                            <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-6 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all shadow-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Kontak Person (PIC)</label>
                            <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-6 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all shadow-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Estimasi Nilai Kontrak</label>
                            <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-6 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all shadow-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Klasifikasi Prospek</label>
                            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-6 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all appearance-none shadow-sm">
                                <option>Cold Lead (Tujuan Awal)</option>
                                <option>Warm Lead (Follow Up)</option>
                                <option>Hot Lead (Prioritas Tinggi)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Rangkuman Kebutuhan Client</label>
                        <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl py-5 px-8 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all min-h-[120px] shadow-sm resize-none" placeholder="Tuliskan detail kebutuhan atau permintaan client..." />
                    </div>

                    <div className="pt-6 flex gap-4">
                        <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 rounded-xl border border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all">Batal</button>
                        <button className="flex-[2] bg-indigo-600 text-white py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-200 hover:scale-[1.02] transition-all">
                            Aktivasi Pipeline
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto min-h-screen">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <Target className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Growth Engine</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight leading-none">Pipelines & Prospek Penjualan</h2>
                    <p className="text-slate-500 mt-2 text-sm font-medium">Manajemen konversi prospek menjadi pelanggan melalui pipeline yang terstruktur.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center bg-white border border-slate-200 p-1.5 rounded-xl gap-2 shadow-sm">
                        <button className="px-4 py-2 bg-slate-50 text-slate-400 text-[10px] font-bold uppercase rounded-lg">Daftar (List)</button>
                        <button className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-bold uppercase rounded-lg shadow-lg">Papan (Board)</button>
                    </div>
                    <button onClick={() => setShowAddModal(true)} className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-4 rounded-xl text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all hover:scale-105 active:scale-95">
                        <Plus className="w-5 h-5" />
                        Tambah Prospek
                    </button>
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm flex justify-between items-center group hover:border-indigo-300 transition-all">
                    <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Nilai Pipeline</p>
                        <p className="text-3xl font-bold text-slate-900 tracking-tighter">Rp 645,5 JT</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-7 h-7 text-indigo-600" />
                    </div>
                </div>
                <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm flex justify-between items-center group hover:border-emerald-300 transition-all">
                    <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Rasio Konversi</p>
                        <p className="text-3xl font-bold text-slate-900 tracking-tighter">68,2%</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Zap className="w-7 h-7 text-emerald-600" />
                    </div>
                </div>
                <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm flex justify-between items-center group hover:border-amber-300 transition-all">
                    <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Rata-rata Konversi</p>
                        <p className="text-3xl font-bold text-slate-900 tracking-tighter">14 Hari</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Clock className="w-7 h-7 text-amber-600" />
                    </div>
                </div>
            </div>

            {/* Board */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {[
                    { title: 'Prospek Baru', count: 2, color: 'bg-blue-500', stage: 'Prospek Baru' },
                    { title: 'Dalam Diskusi', count: 2, color: 'bg-amber-500', stage: 'Diskusi' },
                    { title: 'Negosiasi Akhir', count: 1, color: 'bg-emerald-500', stage: 'Negosiasi' },
                ].map((col, idx) => (
                    <div key={idx} className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                                <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">{col.title}</h4>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{col.count}</span>
                        </div>

                        <div className="bg-slate-50/40 rounded-3xl p-6 border-2 border-dashed border-slate-200 min-h-[600px] flex flex-col gap-6">
                            {mockLeads.filter(l => l.stage === col.stage).map(lead => (
                                <LeadCard key={lead.id} lead={lead} />
                            ))}
                            <button className="w-full py-10 border-2 border-dashed border-slate-200 rounded-2xl text-slate-300 hover:text-indigo-400 hover:border-indigo-200 hover:bg-white transition-all flex flex-col items-center gap-3 group">
                                <Plus className="w-8 h-8 group-hover:scale-110 transition-transform border-2 border-slate-100 rounded-full p-1" />
                                <span className="text-[9px] font-bold uppercase tracking-widest">Tambah Prospek Baru</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <AddLeadModal />
        </div>
    );
}
