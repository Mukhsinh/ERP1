"use client";

import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Activity,
    Search,
    Download,
    Share2,
    Calendar,
    ArrowRight,
    ChevronRight,
    PieChart
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSupabase } from '@/hooks/useSupabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';

export default function BudgetMonitoringPage() {
    const { tenant } = useSupabase();
    const [loading, setLoading] = useState(true);
    const [budgetData, setBudgetData] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalAllocated: 0,
        totalActual: 0,
        totalCommitted: 0,
        variance: 0,
        absorptionRate: 0
    });

    useEffect(() => {
        if (tenant) {
            fetchMonitoringData();
        }
    }, [tenant]);

    const fetchMonitoringData = async () => {
        setLoading(true);
        try {
            const { data: items } = await supabase
                .from('budget_items')
                .select('*, coa:chart_of_accounts(name, code)')
                .order('allocated_amount', { ascending: false });

            if (items) {
                setBudgetData(items);

                const allocated = items.reduce((sum, i) => sum + Number(i.allocated_amount), 0);
                const actual = items.reduce((sum, i) => sum + Number(i.actual_amount), 0);
                const committed = items.reduce((sum, i) => sum + Number(i.committed_amount), 0);

                setStats({
                    totalAllocated: allocated,
                    totalActual: actual,
                    totalCommitted: committed,
                    variance: allocated - (actual + committed),
                    absorptionRate: allocated > 0 ? ((actual + committed) / allocated) * 100 : 0
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const exportToPDF = () => {
        if (budgetData.length === 0) {
            toast.error("Tidak ada data untuk diekspor.");
            return;
        }

        const doc = new jsPDF();

        // Add Header
        doc.setFontSize(18);
        doc.text('Laporan Monitoring Anggaran - ERP AKAPRO', 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 30);

        // Add Summary Tables (Simulated)
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text('Ringkasan Eksekutif:', 14, 45);

        const summaryData = [
            ['Total Budgeted', formatIDR(stats.totalAllocated)],
            ['Total Realisasi', formatIDR(stats.totalActual)],
            ['Total Komitmen', formatIDR(stats.totalCommitted)],
            ['Sisa Anggaran', formatIDR(stats.variance)],
            ['Tingkat Penyerapan', `${stats.absorptionRate.toFixed(2)}%`]
        ];

        autoTable(doc, {
            startY: 50,
            head: [['Parameter', 'Nilai']],
            body: summaryData,
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229] }
        });

        // Add Detailed Table
        doc.text('Rincian per Akun:', 14, (doc as any).lastAutoTable.finalY + 15);

        const tableData = budgetData.map(item => [
            `${item.coa?.code} - ${item.coa?.name}`,
            formatIDR(item.allocated_amount),
            formatIDR(item.actual_amount),
            formatIDR(item.committed_amount),
            `${((Number(item.actual_amount) + Number(item.committed_amount)) / (item.allocated_amount || 1) * 100).toFixed(1)}%`
        ]);

        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 20,
            head: [['Akun', 'Budget', 'Actual', 'Committed', 'Penyerapan']],
            body: tableData,
            headStyles: { fillColor: [79, 70, 229] }
        });

        doc.save(`Budget_Monitoring_${new Date().getTime()}.pdf`);
        toast.success("PDF berhasil diunduh.");
    };

    const formatIDR = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Monitoring Anggaran</h1>
                        <p className="text-slate-500 mt-1 font-medium">Analisis real-time penggunaan anggaran vs realisasi (BVA Analysis).</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={exportToPDF}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all text-xs uppercase tracking-widest"
                        >
                            <Download className="w-4 h-4" />
                            Ekspor PDF
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Budgeted', value: formatIDR(stats.totalAllocated), sub: 'Total Plafon', icon: BarChart3, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                        { label: 'Total Actual', value: formatIDR(stats.totalActual), sub: 'Dana Terpakai', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Committed', value: formatIDR(stats.totalCommitted), sub: 'On-Progress (PO)', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Remaining', value: formatIDR(stats.variance), sub: `${stats.absorptionRate.toFixed(1)}% Penyerapan`, icon: PieChart, color: 'text-amber-600', bg: 'bg-amber-50' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 -mr-4 -mt-4 bg-slate-50 rounded-full w-20 h-20 group-hover:scale-150 transition-all duration-500 opacity-0 group-hover:opacity-100" />
                            <div className={stat.bg + " w-12 h-12 rounded-2xl flex items-center justify-center mb-6"}>
                                <stat.icon className={"w-6 h-6 " + stat.color} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
                            <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-[0.1em]">{stat.label}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{stat.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Detail BVA Table */}
                <div className="bg-white rounded-[40px] border-2 border-slate-50 shadow-sm overflow-hidden">
                    <div className="p-8 border-b-2 border-slate-50 flex justify-between items-center bg-slate-50/20">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Breakdown Realisasi per Akun</h2>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Budget vs Actual vs Commitment</p>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari akun..."
                                className="pl-10 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold outline-none focus:border-indigo-600 w-64 shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Akun & Kode</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Budget</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actual</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Committed</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Penyerapan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-slate-50">
                                {budgetData.map((item, i) => {
                                    const used = Number(item.actual_amount) + Number(item.committed_amount);
                                    const percent = item.allocated_amount > 0 ? (used / item.allocated_amount) * 100 : 0;

                                    return (
                                        <tr key={i} className="hover:bg-slate-50/50 transition-all group">
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{item.coa?.name || 'Unnamed Account'}</p>
                                                <p className="text-[10px] text-slate-400 font-bold font-mono mt-1">{item.coa?.code}</p>
                                            </td>
                                            <td className="px-8 py-6 text-right font-bold text-slate-900 text-sm">{formatIDR(item.allocated_amount)}</td>
                                            <td className="px-8 py-6 text-right font-bold text-blue-600 text-sm">{formatIDR(item.actual_amount)}</td>
                                            <td className="px-8 py-6 text-right font-bold text-emerald-600 text-sm">{formatIDR(item.committed_amount)}</td>
                                            <td className="px-8 py-6 w-64">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                                        <span className={percent > 90 ? 'text-rose-500' : 'text-slate-400'}>{percent.toFixed(1)}%</span>
                                                        <span className="text-slate-300 font-mono italic">Sisa: {formatIDR(item.allocated_amount - used)}</span>
                                                    </div>
                                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-1000 ${percent > 90 ? 'bg-rose-500' : percent > 70 ? 'bg-amber-500' : 'bg-indigo-500'
                                                                }`}
                                                            style={{ width: `${Math.min(percent, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {budgetData.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-16 text-center text-slate-300 text-sm font-bold uppercase tracking-widest italic font-sans">
                                            No tracking data available for current fiscal year.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
