"use client";

import React, { useState, useEffect } from 'react';
import {
    History,
    RefreshCcw,
    ArrowUpRight,
    AlertCircle,
    Search,
    Edit3,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function BudgetRevisionPage() {
    const [revisions, setRevisions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [form, setForm] = useState({
        reason: '',
        type: 'SHIFT' as 'SHIFT' | 'EMERGENCY',
        details: ''
    });

    useEffect(() => {
        fetchRevisions();
    }, []);

    const fetchRevisions = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('budget_revisions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRevisions(data || []);
        } catch (error: any) {
            toast.error("Gagal mengambil data: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRevision = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const { error } = await supabase
                .from('budget_revisions')
                .insert({
                    reason: form.reason,
                    type: form.type,
                    status: 'PENDING',
                    details: { note: form.details }
                });

            if (error) throw error;
            toast.success("Pengajuan revisi berhasil dikirim.");
            setShowModal(false);
            setForm({ reason: '', type: 'SHIFT', details: '' });
            fetchRevisions();
        } catch (error: any) {
            toast.error("Gagal membuat revisi: " + error.message);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Revisi & Amandemen</h1>
                        <p className="text-slate-500 mt-1">Lakukan pergeseran antar budget line atau ajukan penambahan anggaran darurat.</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                    >
                        <RefreshCcw className="w-5 h-5" />
                        Buat Pengajuan Revisi
                    </button>
                </div>

                {/* Info Alert */}
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-amber-900">Perhatian: Policy Pergeseran Anggaran</p>
                        <p className="text-[13px] text-amber-700 mt-0.5">Pergeseran anggaran antar Cost Center memerlukan persetujuan Direktur Keuangan. Pergeseran dalam satu departemen dapat disetujui Manajer terkait.</p>
                    </div>
                </div>

                {/* Revision History */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center text-slate-900">
                        <h2 className="text-lg font-bold">Riwayat Amandemen</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari histori..."
                                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none w-64 text-slate-900"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-slate-400">
                                <tr>
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest">ID Revisi</th>
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest">Tanggal</th>
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest">Deskripsi</th>
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Memuat data...</td>
                                    </tr>
                                ) : revisions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Belum ada riwayat revisi.</td>
                                    </tr>
                                ) : revisions.map((rev) => (
                                    <tr key={rev.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-xs font-black text-indigo-600 font-mono tracking-tighter">{rev.id.slice(0, 8)}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500 font-medium font-sans">
                                            {new Date(rev.created_at).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-slate-900 line-clamp-1">{rev.reason}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-tight ${rev.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                                                rev.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' :
                                                    'bg-rose-50 text-rose-600'
                                                }`}>
                                                {rev.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="p-2 hover:bg-white border border-transparent hover:border-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-all">
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Revision Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden">
                        <div className="p-10">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Pengajuan Revisi</h3>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Formulir Amandemen Anggaran</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><AlertCircle className="w-5 h-5 text-slate-400 rotate-180" /></button>
                            </div>

                            <form onSubmit={handleCreateRevision} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Alasan Revisi / Deskripsi Singkat</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="cth: Pergeseran plafon IT ke Ops"
                                        className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 transition-all"
                                        value={form.reason}
                                        onChange={e => setForm({ ...form, reason: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Jenis Revisi</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, type: 'SHIFT' })}
                                            className={`p-4 rounded-2xl border-2 transition-all text-xs font-bold ${form.type === 'SHIFT' ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-white border-slate-100 text-slate-400'}`}
                                        >
                                            Pergeseran (Shift)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, type: 'EMERGENCY' })}
                                            className={`p-4 rounded-2xl border-2 transition-all text-xs font-bold ${form.type === 'EMERGENCY' ? 'bg-rose-50 border-rose-600 text-rose-700' : 'bg-white border-slate-100 text-slate-400'}`}
                                        >
                                            Darurat (Emergency)
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Detail Amandemen</label>
                                    <textarea
                                        rows={3}
                                        className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-medium text-slate-600 focus:outline-none focus:border-indigo-600 transition-all"
                                        placeholder="Tuliskan rincian akun dan nilai yang berubah..."
                                        value={form.details}
                                        onChange={e => setForm({ ...form, details: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="w-full py-5 bg-indigo-600 hover:bg-slate-900 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-100 transition-all"
                                >
                                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Kirim Pengajuan'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

