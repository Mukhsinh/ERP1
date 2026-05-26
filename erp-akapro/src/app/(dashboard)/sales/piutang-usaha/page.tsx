"use client";

import React, { useState, useMemo } from 'react';
import {
    Receipt,
    Search,
    Calendar,
    Download,
    Printer,
    CheckCircle2,
    Clock,
    XCircle,
    AlertTriangle,
    Building2,
    FileSpreadsheet,
    TrendingUp,
    Users,
    Banknote,
    ArrowRight,
    ChevronDown,
    Filter,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Receivable {
    id: string;
    tanggal: string;
    dueTanggal: string;
    pelanggan: string;
    total: number;
    balance: number;
    status: string;
    aging: number; // days overdue (negative = not yet due)
}

const mockReceivables: Receivable[] = [
    { id: 'INV-24-001', tanggal: '2024-05-01', dueTanggal: '2024-05-31', pelanggan: 'PT. Maju Jaya Abadi', total: 85000000, balance: 85000000, status: 'Belum Bayar', aging: -8 },
    { id: 'INV-24-002', tanggal: '2024-04-15', dueTanggal: '2024-05-15', pelanggan: 'CV. Berkah Sentosa', total: 32000000, balance: 12000000, status: 'Sebagian', aging: 8 },
    { id: 'INV-24-003', tanggal: '2024-04-20', dueTanggal: '2024-05-20', pelanggan: 'Toko Sumber Makmur', total: 15000000, balance: 0, status: 'Lunas', aging: 0 },
    { id: 'INV-24-004', tanggal: '2024-03-10', dueTanggal: '2024-04-10', pelanggan: 'PT. Global Teknik', total: 120000000, balance: 120000000, status: 'Jatuh Tempo', aging: 43 },
    { id: 'INV-24-005', tanggal: '2024-02-01', dueTanggal: '2024-03-01', pelanggan: 'UD. Cahaya Timur', total: 28000000, balance: 28000000, status: 'Jatuh Tempo', aging: 83 },
    { id: 'INV-24-006', tanggal: '2024-04-25', dueTanggal: '2024-05-25', pelanggan: 'PT. Indo Raya Persada', total: 67500000, balance: 45000000, status: 'Sebagian', aging: -2 },
];

const periods = ['Mei 2024', 'April 2024', 'Maret 2024', 'Februari 2024', 'Januari 2024'];

export default function ReceivablesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [periode, setPeriode] = useState('Mei 2024');
    const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

    const filteredReceivables = useMemo(() => {
        return mockReceivables.filter(r =>
            r.pelanggan.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const totalAR = useMemo(() => mockReceivables.reduce((acc, r) => acc + r.balance, 0), []);
    const overdueAR = useMemo(() => mockReceivables.filter(r => r.aging > 0).reduce((acc, r) => acc + r.balance, 0), []);
    const currentAR = useMemo(() => mockReceivables.filter(r => r.aging <= 0 && r.balance > 0).reduce((acc, r) => acc + r.balance, 0), []);

    const agingBuckets = useMemo(() => {
        const buckets = { current: 0, d1_30: 0, d31_60: 0, d61_90: 0, d90plus: 0 };
        mockReceivables.forEach(r => {
            if (r.balance === 0) return;
            if (r.aging <= 0) buckets.current += r.balance;
            else if (r.aging <= 30) buckets.d1_30 += r.balance;
            else if (r.aging <= 60) buckets.d31_60 += r.balance;
            else if (r.aging <= 90) buckets.d61_90 += r.balance;
            else buckets.d90plus += r.balance;
        });
        return buckets;
    }, []);

    const eksporExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredReceivables.map(r => ({
            'No. Faktur': r.id,
            'Tanggal': r.tanggal,
            'Jatuh Tempo': r.dueTanggal,
            'Pelanggan': r.pelanggan,
            'Total': r.total,
            'Sisa Piutang': r.balance,
            'Status': r.status,
            'Umur (Hari)': r.aging > 0 ? r.aging : 0,
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Piutang Usaha");
        XLSX.writeFile(workbook, `Piutang_Usaha_${periode.replace(/ /g, '_')}.xlsx`);
    };

    const eksporPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("LAPORAN PIUTANG USAHA", 14, 15);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Periode: ${periode}`, 14, 22);
        doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, 14, 27);

        autoTable(doc, {
            head: [['NO. FAKTUR', 'PELANGGAN', 'JATUH TEMPO', 'TOTAL', 'SISA', 'AGING', 'STATUS']],
            body: filteredReceivables.map(r => [
                r.id, r.pelanggan, r.dueTanggal,
                `Rp ${r.total.toLocaleString('id-ID')}`,
                `Rp ${r.balance.toLocaleString('id-ID')}`,
                r.aging > 0 ? `${r.aging} Hari` : '-',
                r.status
            ]),
            startY: 35,
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229] },
            styles: { fontSize: 8 },
        });

        doc.save(`Piutang_Usaha_${periode.replace(/ /g, '_')}.pdf`);
    };

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <Receipt className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Financial Operations</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Piutang Usaha (AR)</h2>
                    <p className="text-slate-500 mt-1 font-medium text-sm">Monitoring tagihan pelanggan, laporan umur piutang, dan efektivitas penagihan.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="relative">
                        <button
                            onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                            className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-sm hover:border-indigo-400 transition-all text-slate-600"
                        >
                            <Calendar className="w-4 h-4" />
                            {periode}
                            <ChevronDown className="w-3 h-3" />
                        </button>
                        {showPeriodDropdown && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                {periods.map(p => (
                                    <button
                                        key={p}
                                        onClick={() => { setPeriode(p); setShowPeriodDropdown(false); }}
                                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-600 border-l-2 border-transparent hover:border-indigo-600 transition-all"
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button onClick={eksporPDF} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95">
                        <Printer className="w-4 h-4 text-indigo-400" /> Print Report
                    </button>
                    <button onClick={eksporExcel} className="flex items-center gap-2 bg-white border border-emerald-100 hover:bg-emerald-600 hover:text-white text-emerald-600 font-bold px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-sm active:scale-95">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>
            </header>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Outstanding', value: totalAR, icon: Banknote, color: 'text-indigo-600', bg: 'bg-indigo-50', sub: 'Semua Faktur Belum Lunas' },
                    { label: 'Belum Jatuh Tempo', value: currentAR, icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: 'Tagihan Berjalan' },
                    { label: 'Melewati Tempo', value: overdueAR, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50', sub: 'Perlu Follow Up Segera' },
                    { label: 'Efektivitas Tagih', value: '88.4%', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', sub: 'Collection Performance' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white border-2 border-slate-50 p-6 rounded-2xl shadow-sm hover:translate-y-[-4px] transition-all group border-b-4 border-b-slate-100">
                        <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
                            {typeof stat.value === 'number' ? `Rp ${stat.value.toLocaleString('id-ID')}` : stat.value}
                        </p>
                        <p className="text-[10px] font-medium text-slate-400 mt-1">{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* Aging Report Visual */}
            <div className="bg-white border-2 border-slate-50 rounded-2xl shadow-sm p-8 group">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Analisa Umur Piutang (Aging AR)</h3>
                    </div>
                </div>
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-6">
                        {[
                            { label: 'Current', value: agingBuckets.current, color: 'bg-emerald-500', t: 'Safe' },
                            { label: '1-30 Days', value: agingBuckets.d1_30, color: 'bg-amber-500', t: 'Watch' },
                            { label: '31-60 Days', value: agingBuckets.d31_60, color: 'bg-orange-500', t: 'Delay' },
                            { label: '61-90 Days', value: agingBuckets.d61_90, color: 'bg-rose-500', t: 'Alert' },
                            { label: '>90 Days', value: agingBuckets.d90plus, color: 'bg-red-600', t: 'Critical' },
                        ].map((b, idx) => (
                            <div key={idx} className="space-y-4">
                                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                    <div className={`h-full ${b.color} transition-all duration-1000 delay-200`} style={{ width: `${totalAR > 0 ? (b.value / totalAR) * 100 : 0}%` }} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{b.label}</p>
                                    <p className="text-xs font-bold text-slate-800 font-mono mt-1">Rp {b.value.toLocaleString('id-ID')}</p>
                                    <p className={`text-[8px] font-bold mt-1 uppercase ${b.label === 'Current' ? 'text-emerald-500' : 'text-slate-300'}`}>{b.t}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border-2 border-slate-50 rounded-2xl shadow-xl shadow-slate-100/50 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4">
                    <div className="relative group flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari Faktur atau Pelanggan..."
                            className="w-full bg-slate-50 border border-transparent rounded-xl py-2.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:bg-white focus:border-indigo-400 transition-all text-slate-900 shadow-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-medium italic">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 italic">
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Faktur / Tanggal</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pelanggan</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jatuh Tempo</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Total Tagihan</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-indigo-600 uppercase tracking-widest text-right">Sisa Piutang</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredReceivables.map((r) => (
                                <tr key={r.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-8 py-6">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 not-italic uppercase tracking-tight">{r.id}</p>
                                            <p className="text-[10px] text-slate-400 mt-1">{r.tanggal}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all text-[10px] font-bold uppercase not-italic">
                                                {r.pelanggan.charAt(0)}
                                            </div>
                                            <span className="text-xs font-bold text-slate-700 not-italic uppercase">{r.pelanggan}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-slate-300" />
                                            <span className={`text-[10px] font-bold uppercase not-italic ${r.aging > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                                                {r.dueTanggal}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right not-italic text-[11px] font-bold text-slate-400 font-mono">
                                        Rp {r.total.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-8 py-6 text-right not-italic">
                                        <span className="text-base font-bold text-indigo-600 font-mono">Rp {r.balance.toLocaleString('id-ID')}</span>
                                        {r.aging > 0 && <p className="text-[8px] font-bold text-rose-500 uppercase mt-0.5 tracking-tighter">Overdue {r.aging} Days</p>}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex justify-center">
                                            {r.status === 'Lunas' ? (
                                                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-bold uppercase tracking-widest inline-flex items-center gap-1.5 not-italic">
                                                    <CheckCircle2 className="w-3 h-3" /> Paid
                                                </span>
                                            ) : r.status === 'Jatuh Tempo' ? (
                                                <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 text-[9px] font-bold uppercase tracking-widest inline-flex items-center gap-1.5 not-italic">
                                                    <XCircle className="w-3 h-3" /> Overdue
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-bold uppercase tracking-widest inline-flex items-center gap-1.5 not-italic">
                                                    <Clock className="w-3 h-3" /> Partial
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
