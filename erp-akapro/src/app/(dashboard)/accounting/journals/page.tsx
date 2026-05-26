"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AccountingEngine, JournalLine } from '@/lib/accounting';
import { Plus, Trash2, Save, AlertCircle, CheckCircle2, Loader2, Database, History, Zap } from 'lucide-react';

export default function JournalPage() {
    const [coa, setCoa] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [header, setHeader] = useState({
        transactionDate: new Date().toISOString().split('T')[0],
        referenceNo: '', description: '', sourceModule: 'MANUAL'
    });
    const [lines, setLines] = useState<JournalLine[]>([
        { coaId: '', debit: 0, credit: 0 }, { coaId: '', debit: 0, credit: 0 }
    ]);

    useEffect(() => {
        const fetchCoa = async () => {
            const { data } = await supabase.from('chart_of_accounts').select('*').eq('is_active', true);
            setCoa(data || []);
        };
        fetchCoa();
    }, []);

    const addLine = () => setLines([...lines, { coaId: '', debit: 0, credit: 0 }]);
    const removeLine = (index: number) => setLines(lines.filter((_, i) => i !== index));

    const totalDebit = lines.reduce((sum, l) => sum + Number(l.debit), 0);
    const totalCredit = lines.reduce((sum, l) => sum + Number(l.credit), 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.0001;

    const handlePost = async () => {
        setLoading(true); setError(null);
        try {
            const tenantId = (await supabase.from('public.tenants').select('id').limit(1).single()).data?.id;
            const branchId = (await supabase.from('public.branches').select('id').limit(1).single()).data?.id;
            if (!tenantId) throw new Error("Konteks tenant tidak ditemukan.");
            await AccountingEngine.postJournal({
                ...header, tenantId, branchId: branchId || '',
                lines: lines.filter(l => l.coaId && (l.debit > 0 || l.credit > 0))
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            setHeader({ ...header, referenceNo: '', description: '' });
            setLines([{ coaId: '', debit: 0, credit: 0 }, { coaId: '', debit: 0, credit: 0 }]);
        } catch (err: any) { setError(err.message); }
        finally { setLoading(false); }
    };

    return (
        <div className="p-8 space-y-6 max-w-[1400px] mx-auto">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <Database className="w-4 h-4" />
                        <span className="text-[10px] font-semibold uppercase tracking-widest">Mesin Akuntansi</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Jurnal Umum</h2>
                    <p className="text-sm text-slate-500 mt-1">Pencatatan transaksi double-entry untuk validasi mutasi finansial.</p>
                </div>
                <button className="flex items-center gap-2 bg-slate-800 text-white font-semibold px-5 py-2.5 rounded-lg text-xs transition-all shadow-md hover:bg-indigo-600">
                    <History className="w-4 h-4" /> Riwayat Audit
                </button>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Panel Kiri - Header Jurnal */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-blue-500" /> Informasi Jurnal
                            </h3>
                            <p className="text-[10px] text-slate-400 font-medium mt-1">Metadata transaksi</p>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tanggal</label>
                                <input type="date" value={header.transactionDate} onChange={e => setHeader({ ...header, transactionDate: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-4 text-sm font-medium focus:border-indigo-500 outline-none transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">No. Referensi</label>
                                <input placeholder="JV/2024/001" value={header.referenceNo} onChange={e => setHeader({ ...header, referenceNo: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-4 text-sm font-semibold focus:border-indigo-500 outline-none font-mono text-indigo-600 placeholder:text-slate-300" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Keterangan</label>
                                <textarea placeholder="Tujuan pencatatan jurnal ini..." rows={3} value={header.description} onChange={e => setHeader({ ...header, description: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-4 text-sm font-medium focus:border-indigo-500 outline-none resize-none transition-all placeholder:text-slate-300" />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Status Keseimbangan</p>
                                    {isBalanced ? (
                                        <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-100 text-[11px] font-semibold">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Seimbang
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-3 py-1.5 rounded-md border border-rose-100 text-[11px] font-semibold">
                                            <AlertCircle className="w-3.5 h-3.5 animate-pulse" /> Tidak Seimbang
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Selisih</p>
                                    <p className={`text-lg font-bold ${isBalanced ? 'text-slate-300' : 'text-rose-600'}`}>
                                        Rp {Math.abs(totalDebit - totalCredit).toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>
                            <button onClick={handlePost} disabled={loading || !isBalanced || lines.length < 2}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white font-semibold py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 text-sm">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Posting ke Buku Besar
                            </button>
                            {error && <p className="text-xs text-rose-500 bg-rose-50 p-3 rounded-lg border border-rose-100 mt-3">{error}</p>}
                            {success && <p className="text-xs text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100 mt-3">Jurnal berhasil diposting.</p>}
                        </div>
                    </div>
                </div>

                {/* Panel Kanan - Baris Jurnal */}
                <div className="xl:col-span-3 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Entri Double-Entry</h3>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Pencatatan debit dan kredit sesuai PSAK</p>
                        </div>
                        <button onClick={addLine}
                            className="bg-white border border-slate-200 hover:border-indigo-200 px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2">
                            <Plus className="w-3.5 h-3.5 text-indigo-500" /> Tambah Baris
                        </button>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-4 w-[45%]">Akun Sumber (CoA)</th>
                                    <th className="px-6 py-4 text-right">Debit (Rp)</th>
                                    <th className="px-6 py-4 text-right">Kredit (Rp)</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {lines.map((line, idx) => (
                                    <tr key={idx} className="group hover:bg-slate-50/50 transition-all">
                                        <td className="px-6 py-4">
                                            <select value={line.coaId} onChange={e => { const n = [...lines]; n[idx].coaId = e.target.value; setLines(n); }}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:border-indigo-500 outline-none appearance-none cursor-pointer">
                                                <option value="">Pilih akun...</option>
                                                {coa.map(c => (<option key={c.id} value={c.id}>{c.code} - {c.name}</option>))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <input type="number" value={line.debit || ''} onChange={e => { const n = [...lines]; n[idx].debit = Number(e.target.value); if (n[idx].debit > 0) n[idx].credit = 0; setLines(n); }}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-semibold text-emerald-600 text-right font-mono focus:border-emerald-500 outline-none" placeholder="0" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input type="number" value={line.credit || ''} onChange={e => { const n = [...lines]; n[idx].credit = Number(e.target.value); if (n[idx].credit > 0) n[idx].debit = 0; setLines(n); }}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-semibold text-rose-600 text-right font-mono focus:border-rose-500 outline-none" placeholder="0" />
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            {lines.length > 2 && (
                                                <button onClick={() => removeLine(idx)} className="p-2 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-6 bg-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex gap-10">
                            <div>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Debit</p>
                                <p className="text-xl font-bold text-white">Rp {totalDebit.toLocaleString('id-ID')}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Kredit</p>
                                <p className="text-xl font-bold text-white">Rp {totalCredit.toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-lg">
                            <div className={`w-2.5 h-2.5 rounded-full ${isBalanced ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                            <p className="text-[11px] font-semibold text-white">{isBalanced ? 'Verifikasi: Seimbang' : 'Verifikasi: Gagal'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
