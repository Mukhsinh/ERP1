"use client";

import React, { useState } from 'react';
import {
    Settings,
    Shield,
    Globe,
    Bell,
    Database,
    Zap,
    Lock,
    Key,
    Save,
    History,
    Activity,
    Server,
    Smartphone,
    Cloud,
    CheckCircle2,
    ChevronRight,
    Search,
    ShieldCheck,
} from 'lucide-react';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('Profil');

    const sidebarItems = [
        { label: 'Profil Perusahaan', icon: Globe, sub: 'Identitas & wilayah' },
        { label: 'Keamanan', icon: ShieldCheck, sub: 'Akses & autentikasi' },
        { label: 'Notifikasi', icon: Bell, sub: 'Peringatan & SMTP' },
        { label: 'Integrasi', icon: Zap, sub: 'API & webhooks' },
        { label: 'Log Audit', icon: History, sub: 'Jejak aktivitas' },
    ];

    return (
        <div className="p-8 space-y-8 max-w-[1400px] mx-auto min-h-screen">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <Settings className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Enterprise Configuration</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Pengaturan Sistem</h2>
                    <p className="text-slate-500 mt-1 font-medium text-sm">Kelola identitas perusahaan, keamanan, dan integrasi Infrastruktur.</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white border border-slate-200 px-5 py-2.5 rounded-2xl flex items-center gap-3 shadow-sm group hover:border-indigo-200 transition-all">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Cloud Sync: Aktif</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-3 space-y-2">
                    <div className="bg-white border-2 border-slate-50 rounded-3xl p-4 shadow-sm">
                        {sidebarItems.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => setActiveTab(item.label)}
                                className={`w-full group flex items-center gap-4 p-4 rounded-2xl transition-all text-left mb-1 ${activeTab === item.label
                                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 translate-x-2'
                                    : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${activeTab === item.label ? 'bg-white/20' : 'bg-slate-100'}`}>
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-bold text-[11px] uppercase tracking-wider">{item.label}</p>
                                    <p className={`text-[9px] font-medium mt-0.5 truncate ${activeTab === item.label ? 'text-indigo-100' : 'text-slate-400'}`}>
                                        {item.sub}
                                    </p>
                                </div>
                                <ChevronRight className={`w-4 h-4 transition-all ${activeTab === item.label ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
                            </button>
                        ))}
                    </div>

                    <div className="p-8 bg-slate-900 rounded-3xl text-white relative overflow-hidden group mt-6">
                        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
                        <Activity className="w-6 h-6 text-indigo-400 mb-4" />
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status Server</p>
                        <h4 className="text-3xl font-bold tracking-tight">99.98%</h4>
                        <div className="flex items-center gap-2 mt-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">Normal Operation</span>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-9 space-y-6">
                    {activeTab === 'Profil Perusahaan' && (
                        <div className="bg-white border-2 border-slate-50 rounded-[40px] shadow-sm p-12 space-y-12">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                                        <div className="p-2 bg-indigo-600 rounded-xl text-white">
                                            <Globe className="w-5 h-5" />
                                        </div>
                                        Profil Perusahaan
                                    </h3>
                                    <p className="text-slate-400 text-xs font-medium mt-2">Atur identitas resmi yang akan muncul pada invoice dan laporan.</p>
                                </div>
                                <button className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all">
                                    <Search className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nama Perusahaan</label>
                                    <input
                                        type="text"
                                        defaultValue="PT. AKAPRO GLOBAL SOLUSI"
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-sm"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Email Resmi</label>
                                    <input
                                        type="email"
                                        defaultValue="admin@akapro.id"
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-sm"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Mata Uang Basis</label>
                                    <select className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all appearance-none cursor-pointer shadow-sm">
                                        <option>Rupiah Indonesia (IDR)</option>
                                        <option>US Dollar (USD)</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">NPWP / Tax ID</label>
                                    <input
                                        type="text"
                                        defaultValue="01.234.567.8-901.000"
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all shadow-sm"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-3">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Alamat Kantor Pusat</label>
                                    <textarea
                                        rows={4}
                                        defaultValue="Jl. Jlamprang No. 233, Pekalongan, Jawa Tengah, Indonesia"
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-3xl py-4 px-6 text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all resize-none shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="pt-8 flex justify-end">
                                <button className="bg-indigo-600 text-white font-bold px-10 py-5 rounded-3xl hover:bg-slate-900 active:scale-95 transition-all shadow-2xl shadow-indigo-200 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em]">
                                    <Save className="w-4 h-4" />
                                    Perbarui Profil
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab !== 'Profil Perusahaan' && (
                        <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[40px] p-24 text-center group">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 mx-auto shadow-xl group-hover:scale-110 transition-transform">
                                <Lock className="w-10 h-10 text-slate-300" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 uppercase tracking-widest">Modul Terkunci</h4>
                            <p className="text-slate-400 text-sm font-medium mt-4 max-w-sm mx-auto leading-relaxed">
                                Fitur ini sedang dalam pengembangan atau memerlukan lisensi Enterprise tambahan untuk diaktifkan.
                            </p>
                        </div>
                    )}

                    {/* Quick Settings Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                        <div className="bg-white border-2 border-slate-50 rounded-3xl p-8 hover:border-indigo-200 transition-all shadow-sm group">
                            <div className="flex gap-6 items-start">
                                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 transition-all group-hover:bg-indigo-600 group-hover:text-white">
                                    <Database className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-slate-900 uppercase tracking-tight">Data Backup</h4>
                                    <p className="text-[11px] text-slate-400 mt-2 font-medium leading-relaxed">Cadangkan seluruh basis data ERP ke Amazon S3 sekarang juga.</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white border-2 border-slate-50 rounded-3xl p-8 hover:border-emerald-200 transition-all shadow-sm group">
                            <div className="flex gap-6 items-start">
                                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 transition-all group-hover:bg-emerald-600 group-hover:text-white">
                                    <Key className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-slate-900 uppercase tracking-tight">API Management</h4>
                                    <p className="text-[11px] text-slate-400 mt-2 font-medium leading-relaxed">Kelola kunci akses API untuk integrasi pihak ketiga eksternal.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
