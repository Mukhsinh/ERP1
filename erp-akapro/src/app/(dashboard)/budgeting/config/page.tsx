"use client";

import React, { useState, useEffect } from 'react';
import {
    Settings,
    Calendar,
    Lock,
    Unlock,
    Plus,
    Search,
    ChevronRight,
    Play,
    Loader2,
    X,
    Database
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSupabase } from '@/hooks/useSupabase';
import { toast } from 'sonner';

export default function BudgetConfigPage() {
    const { tenant } = useSupabase();
    const [loading, setLoading] = useState(true);
    const [fiscalYears, setFiscalYears] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form state
    const [form, setForm] = useState({
        year_name: '',
        start_date: new Date().getFullYear() + '-01-01',
        end_date: new Date().getFullYear() + '-12-31',
        is_active: false
    });

    useEffect(() => {
        if (tenant) {
            fetchFiscalYears();
        }
    }, [tenant]);

    const fetchFiscalYears = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('budget_fiscal_years')
                .select('*')
                .order('year_name', { ascending: false });

            if (error) throw error;
            setFiscalYears(data || []);
        } catch (error: any) {
            toast.error("Gagal memuat data: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) return;

        setSaving(true);
        try {
            // If setting as active, deactivate others first (simplified)
            if (form.is_active) {
                await supabase
                    .from('budget_fiscal_years')
                    .update({ is_active: false })
                    .eq('tenant_id', tenant.id);
            }

            const { error } = await supabase
                .from('budget_fiscal_years')
                .insert({
                    tenant_id: tenant.id,
                    ...form
                });

            if (error) throw error;

            toast.success("Tahun fiskal berhasil dibuat.");
            setShowModal(false);
            fetchFiscalYears();
        } catch (error: any) {
            toast.error("Gagal menyimpan: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const toggleLock = async (id: string, currentLock: boolean) => {
        try {
            const { error } = await supabase
                .from('budget_fiscal_years')
                .update({ is_locked: !currentLock })
                .eq('id', id);

            if (error) throw error;
            toast.success(`Tahun fiskal ${!currentLock ? 'dikunci' : 'dibuka'}.`);
            fetchFiscalYears();
        } catch (error: any) {
            toast.error("Gagal update status: " + error.message);
        }
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Konfigurasi Anggaran</h1>
                        <p className="text-slate-500 mt-1">Atur tahun fiskal, pusat biaya, dan parameter kontrol anggaran.</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Tahun Fiskal Baru
                    </button>
                </div>

                {/* Fiscal Years List */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center text-slate-900">
                        <h2 className="text-lg font-bold">Daftar Tahun Fiskal</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari tahun..."
                                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-64 text-slate-900"
                            />
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {loading ? (
                            <div className="p-12 text-center">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
                                <p className="text-sm text-slate-400 font-medium font-sans">Memuat data fiskal...</p>
                            </div>
                        ) : fiscalYears.length === 0 ? (
                            <div className="p-12 text-center">
                                <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-sm text-slate-400 font-medium font-sans">Belum ada tahun fiskal. Silakan tambah baru.</p>
                            </div>
                        ) : fiscalYears.map((fy) => (
                            <div key={fy.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${fy.is_active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-400'}`}>
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{fy.year_name}</h3>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-0.5 font-sans">{fy.start_date} s/d {fy.end_date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="flex gap-6">
                                        <div className="text-center">
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1.5 font-sans">Status</p>
                                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${fy.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {fy.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </div>
                                        <div className="text-center group cursor-pointer" onClick={() => toggleLock(fy.id, fy.is_locked)}>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1.5 font-sans">Status Kunci</p>
                                            {fy.is_locked ?
                                                <div className="flex items-center gap-1.5 text-rose-600">
                                                    <Lock className="w-3.5 h-3.5" /> <span className="text-[10px] font-bold uppercase">Terkunci</span>
                                                </div> :
                                                <div className="flex items-center gap-1.5 text-indigo-500">
                                                    <Unlock className="w-3.5 h-3.5" /> <span className="text-[10px] font-bold uppercase">Terbuka</span>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                    <button className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition-all">
                                        <Settings className="w-4 h-4 text-slate-400" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Control settings placeholder */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 -mr-10 -mt-10 bg-amber-500/5 rounded-full w-40 h-40 group-hover:scale-110 transition-all" />
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                                <Play className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Logika Kontrol Anggaran</h2>
                                <p className="text-xs text-slate-400 font-medium font-sans">Penegakan kebijakan untuk voucher</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-amber-100 transition-all cursor-pointer">
                                <div>
                                    <p className="font-bold text-slate-900">Kontrol Ketat (Blokir)</p>
                                    <p className="text-xs text-slate-500 font-medium font-sans">Mencegah transaksi jika melebihi anggaran.</p>
                                </div>
                                <div className="w-12 h-6 bg-indigo-600 rounded-full relative">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all cursor-pointer">
                                <div>
                                    <p className="font-bold text-slate-900">Persetujuan Multi-level</p>
                                    <p className="text-xs text-slate-500 font-medium font-sans">Wajibkan persetujuan untuk over-budget.</p>
                                </div>
                                <div className="w-12 h-6 bg-slate-200 rounded-full relative">
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 -mr-10 -mt-10 bg-blue-500/5 rounded-full w-40 h-40 group-hover:scale-110 transition-all" />
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                                <Database className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Pusat Biaya (Cost Centers)</h2>
                                <p className="text-xs text-slate-400 font-medium font-sans">Alokasi departemen</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {['Keuangan & Administrasi', 'Penjualan & Pemasaran', 'Operasional', 'TI & Infrastruktur'].map((dept, i) => (
                                <div key={i} className="flex items-center justify-between p-3 px-4 hover:bg-slate-50 rounded-xl transition-all cursor-pointer group/item">
                                    <span className="text-sm text-slate-700 font-bold font-sans">{dept}</span>
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover/item:text-indigo-600 transition-all" />
                                </div>
                            ))}
                            <button className="w-full mt-4 py-3 border-2 border-dashed border-slate-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:border-indigo-200 hover:bg-indigo-50/50 rounded-2xl transition-all font-sans">+ Tambah Departemen</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden">
                        <div className="p-10">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900">Tahun Fiskal Baru</h3>
                                    <p className="text-slate-500 text-xs font-medium mt-1 font-sans">Definisikan periode penganggaran baru</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X className="w-5 h-5 text-slate-400" /></button>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 font-sans">Nama Tahun Fiskal</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="cth: TA 2024"
                                        className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 transition-all font-sans"
                                        value={form.year_name}
                                        onChange={e => setForm({ ...form, year_name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 font-sans">Mulai</label>
                                        <input
                                            required
                                            type="date"
                                            className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none font-sans"
                                            value={form.start_date}
                                            onChange={e => setForm({ ...form, start_date: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 font-sans">Selesai</label>
                                        <input
                                            required
                                            type="date"
                                            className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none font-sans"
                                            value={form.end_date}
                                            onChange={e => setForm({ ...form, end_date: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-5 bg-indigo-50 rounded-2xl cursor-pointer" onClick={() => setForm({ ...form, is_active: !form.is_active })}>
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${form.is_active ? 'bg-indigo-600 border-indigo-600' : 'border-indigo-200'}`}>
                                        {form.is_active && <div className="w-2 h-2 bg-white rounded-full" />}
                                    </div>
                                    <span className="text-xs font-bold text-indigo-700 font-sans uppercase tracking-widest">Set sebagai Tahun Aktif</span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full py-5 bg-indigo-600 hover:bg-slate-900 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-100 transition-all font-sans"
                                >
                                    {saving ? 'Menyimpan...' : 'Simpan Tahun Fiskal'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
