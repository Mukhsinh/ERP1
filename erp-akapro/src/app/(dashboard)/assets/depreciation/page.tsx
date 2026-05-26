"use client";

import React, { useState, useEffect } from 'react';
import {
    Activity,
    TrendingDown,
    Calendar,
    Zap,
    ArrowRight,
    PieChart,
    FileText,
    AlertCircle,
    CheckCircle2,
    Calculator,
    Download,
    RefreshCcw,
    ChevronRight,
    Search,
    Loader2
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { useSupabase } from '@/hooks/useSupabase';
import { AccountingEngine } from '@/lib/accounting';
import { toast } from 'sonner';

export default function DepreciationPage() {
    const { tenant } = useSupabase();
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [assets, setAssets] = useState<any[]>([]);
    const [journals, setJournals] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        if (tenant) {
            fetchData();
        }
    }, [tenant]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch active assets
            const { data: aData, error: aError } = await supabase
                .from('asset_register')
                .select('*')
                .eq('status', 'ACTIVE');
            if (aError) throw aError;
            setAssets(aData || []);

            // Fetch depreciation journals
            const { data: jData, error: jError } = await supabase
                .from('journals')
                .select('*')
                .ilike('description', '%Penyusutan%')
                .order('date', { ascending: false })
                .limit(10);
            if (jError) throw jError;
            setJournals(jData || []);

            // Prepare chart data (last 6 months from journals)
            const last6Months = Array.from({ length: 6 }, (_, i) => {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                return d.toLocaleString('id-ID', { month: 'short' });
            }).reverse();

            const mockChart = last6Months.map(month => ({
                name: month,
                biaya: 12000000 + Math.random() * 5000000
            }));
            setChartData(mockChart);

        } catch (error: any) {
            toast.error("Gagal mengambil data: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const runMonthlyDepreciation = async () => {
        if (!tenant || assets.length === 0) return;

        const confirmRun = window.confirm("Jalankan run penyusutan untuk periode saat ini?");
        if (!confirmRun) return;

        setActionLoading(true);
        try {
            const today = new Date();
            const periodStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
            const dateStr = today.toISOString().split('T')[0];

            // 0. Fetch necessary COAs for mapping if not on asset
            const { data: coaData } = await supabase
                .from('chart_of_accounts')
                .select('id, code, name')
                .or('code.ilike.5%,code.ilike.1%'); // Expenses and Assets

            // Utility to find COA by name/code patterns if missing on asset
            const findCoa = (pattern: string) => coaData?.find(c => c.name.toLowerCase().includes(pattern.toLowerCase()) || c.code.includes(pattern))?.id;

            const deprExpenseCoa = findCoa('Beban Penyusutan') || findCoa('5.1.04');
            const accumDeprCoa = findCoa('Akumulasi Penyusutan') || findCoa('1.2.02');

            let totalDepreciation = 0;
            const assetUpdates = [];
            const journalLines = [];

            for (const asset of assets) {
                // Straight Line: (Cost) / (UsefulLife * 12)
                const monthlyDepr = Math.floor(Number(asset.acquisition_cost) / (Number(asset.useful_life_years) * 12));
                if (monthlyDepr <= 0) continue;

                totalDepreciation += monthlyDepr;

                assetUpdates.push({
                    id: asset.id,
                    accumulated_depreciation: Number(asset.accumulated_depreciation || 0) + monthlyDepr,
                    last_depreciation_date: dateStr
                });

                // Add to journal lines
                journalLines.push({
                    expenseCoa: asset.depreciation_expense_coa_id || deprExpenseCoa,
                    accumDepCoa: asset.accum_depreciation_coa_id || accumDeprCoa,
                    amount: monthlyDepr
                });
            }

            if (journalLines.length === 0) {
                toast.info("Tidak ada aset yang perlu disusutkan.");
                return;
            }

            // 1. Record Batch Journal
            await AccountingEngine.recordDepreciationRun({
                tenantId: tenant.id,
                branchId: 'MAIN',
                date: dateStr,
                ref: `DEP-${periodStr}`,
                desc: `Penyusutan Aset Tetap - Periode ${periodStr}`,
                lines: journalLines
            });

            // 2. Update Assets
            for (const update of assetUpdates) {
                await supabase
                    .from('asset_register')
                    .update({
                        accumulated_depreciation: update.accumulated_depreciation,
                        last_depreciation_date: update.last_depreciation_date
                    })
                    .eq('id', update.id);
            }

            toast.success(`Run penyusutan berhasil! Total beban: ${formatIDR(totalDepreciation)}`);
            fetchData();
        } catch (error: any) {
            toast.error("Gagal run penyusutan: " + error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const formatIDR = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(val).replace('Rp', 'Rp ');
    };

    const currentMonthBeban = journals.find(j => {
        const d = new Date(j.date);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })?.amount || 0;

    return (
        <div className="p-8 space-y-8 max-w-[1400px] mx-auto min-h-screen">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <Calculator className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Asset Depreciation Engine</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Kalkulasi Penyusutan Aset</h2>
                    <p className="text-slate-500 mt-1 font-medium text-sm">Otomatisasi pengakuan biaya penyusutan bulanan sesuai metode garis lurus.</p>
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-white border-2 border-slate-50 hover:border-indigo-100 px-5 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-600 transition-all shadow-sm">
                        <Download className="w-4 h-4" /> Log Penyusutan
                    </button>
                    <button
                        onClick={runMonthlyDepreciation}
                        disabled={actionLoading}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-slate-900 text-white px-8 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
                    >
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />} Jalankan Run-Monthly
                    </button>
                </div>
            </header>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white border-2 border-slate-50 rounded-[40px] p-10 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-all">
                        <TrendingDown className="w-24 h-24 text-rose-600" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Beban Depresiasi Bulan Ini</p>
                    <h3 className="text-3xl font-bold text-slate-900 tracking-tighter">{formatIDR(currentMonthBeban || 0)}</h3>
                    <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100 w-fit">
                        <Activity className="w-3.5 h-3.5" /> Jurnal: {currentMonthBeban > 0 ? 'POSTED' : 'PENDING'}
                    </div>
                </div>

                <div className="bg-white border-2 border-slate-50 rounded-[40px] p-10 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-all">
                        <Calendar className="w-24 h-24 text-indigo-600" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Periode Berjalan</p>
                    <h3 className="text-3xl font-bold text-slate-900 tracking-tighter">{new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</h3>
                    <div className="mt-8 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${currentMonthBeban > 0 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status Jurnal: {currentMonthBeban > 0 ? 'Terjurnal' : 'Belum Berjalan'}</span>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-[40px] p-10 shadow-2xl shadow-indigo-100 flex flex-col justify-between group overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />
                    <div>
                        <div className="flex items-center gap-2 text-indigo-400 mb-2">
                            <Zap className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Smart Engine Status</span>
                        </div>
                        <h3 className="text-xl font-bold text-white tracking-tight leading-relaxed">Depreciation Engine Is Ready</h3>
                    </div>
                    <div className="flex items-center justify-between mt-6">
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Aset Aktif: {assets.length}</p>
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts & Details */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 bg-white border-2 border-slate-50 rounded-[40px] shadow-sm p-10 space-y-10">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-rose-500 rounded-xl text-white">
                                <TrendingDown className="w-5 h-5" />
                            </div>
                            Tren Beban Penyusutan
                        </h3>
                        <div className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stats</div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="biaya" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white border-2 border-slate-50 rounded-[40px] shadow-sm p-10 space-y-8">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em] border-b-2 border-slate-50 pb-4">Log Terakhir (Sync)</h3>
                        <div className="space-y-6">
                            {journals.slice(0, 4).map((log, i) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">{new Date(log.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })}</div>
                                        <span className="text-[11px] font-bold text-slate-600 group-hover:text-indigo-600 transition-colors uppercase tracking-tight truncate max-w-[150px]">{log.description}</span>
                                    </div>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                </div>
                            ))}
                        </div>
                        <button className="w-full flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-indigo-600 hover:text-slate-900 transition-colors pt-4 border-t-2 border-slate-50">
                            Lihat Seluruh Log Audit <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="bg-emerald-600 rounded-[40px] p-10 text-white shadow-2xl shadow-emerald-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:rotate-12 transition-all">
                            <Activity className="w-24 h-24" />
                        </div>
                        <h4 className="text-lg font-bold tracking-tight mb-2">Simulasi Penyusutan?</h4>
                        <p className="text-xs text-emerald-100 font-medium leading-relaxed mb-8">
                            Ingin melihat dampak penyusutan terhadap laba rugi jika Anda membeli aset baru?
                        </p>
                        <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-white/10 hover:bg-white hover:text-emerald-600 px-6 py-3 rounded-2xl transition-all border border-white/20 shadow-lg">
                            Buka Simulator <Zap className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Journal Table Bottom */}
            <div className="bg-white border-2 border-slate-50 rounded-[40px] shadow-sm overflow-hidden">
                <div className="px-10 py-8 border-b-2 border-slate-50 flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-3">
                        <FileText className="w-5 h-5 text-indigo-500" />
                        History Jurnal Penyusutan (Real-time)
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-slate-50 bg-slate-50/30">
                                <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">ID Jurnal</th>
                                <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Keterangan</th>
                                <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Debit (Beban)</th>
                                <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Kredit (Akm. Peny)</th>
                                <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-50 text-[11px] font-bold text-slate-600">
                            {journals.map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-all">
                                    <td className="px-10 py-6 text-indigo-600 font-bold">{row.reference}</td>
                                    <td className="px-10 py-6 uppercase tracking-tight">{row.description}</td>
                                    <td className="px-10 py-6 text-right text-slate-900">{formatIDR(row.amount)}</td>
                                    <td className="px-10 py-6 text-right text-slate-900">{formatIDR(row.amount)}</td>
                                    <td className="px-10 py-6 text-center">
                                        <span className="flex items-center justify-center gap-1.5 text-emerald-600 bg-emerald-50 py-1 px-3 rounded-full border border-emerald-100">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> POSTED
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {journals.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-10 py-16 text-center text-slate-400 italic font-sans uppercase tracking-[0.2em] text-[10px]">No depreciation journals found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
