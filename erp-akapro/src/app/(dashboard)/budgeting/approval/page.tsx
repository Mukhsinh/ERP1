"use client";

import React, { useState, useEffect } from 'react';
import {
    UserCheck,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    Filter,
    ArrowRight,
    Check,
    X,
    Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function BudgetApprovalPage() {
    const [approvals, setApprovals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchApprovals();
    }, []);

    const fetchApprovals = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('budget_approvals')
                .select('*, budget_fiscal_years(year_name)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setApprovals(data || []);
        } catch (error: any) {
            toast.error("Gagal mengambil data: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, fiscalYearId: string, status: 'APPROVED' | 'REJECTED') => {
        setActionLoading(id);
        try {
            // 1. Update approval status
            const { error: appError } = await supabase
                .from('budget_approvals')
                .update({ status })
                .eq('id', id);

            if (appError) throw appError;

            // 2. If approved, update all budget items for that FY
            if (status === 'APPROVED') {
                const { error: itemError } = await supabase
                    .from('budget_items')
                    .update({ status: 'APPROVED' })
                    .eq('fiscal_year_id', fiscalYearId);

                if (itemError) throw itemError;
            }

            toast.success(`Berhasil ${status === 'APPROVED' ? 'menyetujui' : 'menolak'} anggaran.`);
            fetchApprovals();
        } catch (error: any) {
            toast.error("Gagal memproses: " + error.message);
        } finally {
            setActionLoading(null);
        }
    };

    const stats = {
        pending: approvals.filter(a => a.status === 'PENDING').length,
        approved: approvals.filter(a => a.status === 'APPROVED').length,
        rejected: approvals.filter(a => a.status === 'REJECTED').length,
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Persetujuan Anggaran</h1>
                        <p className="text-slate-500 mt-1">Review dan berikan persetujuan untuk draft atau revisi anggaran.</p>
                    </div>
                </div>

                {/* Performance Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Menunggu Review', value: `${stats.pending} Draft`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                        { label: 'Disetujui', value: `${stats.approved} Dokumen`, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Ditolak/Revisi', value: `${stats.rejected} Dokumen`, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className={stat.bg + " p-3 rounded-xl"}>
                                    <stat.icon className={"w-6 h-6 " + stat.color} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                    <h3 className="text-xl font-bold text-slate-900">{stat.value}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Documents Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-900">Antrian Persetujuan</h2>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Cari pengajuan..."
                                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none w-64"
                                />
                            </div>
                            <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">
                                <Filter className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dokumen Anggaran</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tanggal</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-400">Memuat data...</td>
                                    </tr>
                                ) : approvals.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-400">Tidak ada antrian persetujuan.</td>
                                    </tr>
                                ) : approvals.map((app) => (
                                    <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                    BU
                                                </div>
                                                <div>
                                                    <span className="text-sm font-semibold text-slate-900 block">Anggaran {app.budget_fiscal_years?.year_name}</span>
                                                    <span className="text-[10px] text-slate-400 italic">{app.comments}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                            {new Date(app.created_at).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${app.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                                                app.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' :
                                                    'bg-rose-50 text-rose-600'
                                                }`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {app.status === 'PENDING' ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleAction(app.id, app.fiscal_year_id, 'APPROVED')}
                                                        disabled={!!actionLoading}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
                                                    >
                                                        {actionLoading === app.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Setuju
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(app.id, app.fiscal_year_id, 'REJECTED')}
                                                        disabled={!!actionLoading}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-all disabled:opacity-50"
                                                    >
                                                        <X className="w-3.5 h-3.5" /> Tolak
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400">Selesai</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

