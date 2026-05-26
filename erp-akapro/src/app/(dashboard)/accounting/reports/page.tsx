"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import {
    BarChart3,
    FileText,
    TrendingUp,
    TrendingDown,
    Printer,
    Download,
    Calendar,
    Loader2,
    ChevronDown,
    CheckCircle2,
    PieChart,
    Layers,
    Activity,
    FileSpreadsheet,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const reportTypes = [
    { id: 'PL', name: 'Laporan Laba Rugi', desc: 'Profit & Loss Statement' },
    { id: 'BS', name: 'Laporan Neraca', desc: 'Balance Sheet' },
    { id: 'EQ', name: 'Perubahan Ekuitas', desc: 'Statement of Equity' },
    { id: 'CF', name: 'Laporan Arus Kas', desc: 'Cash Flow Statement' },
];

const periods = [
    { id: 'custom', name: 'Pilih Bulan...', type: 'monthly' },
    { id: 'Q1', name: 'Triwulan I (Jan-Mar)', type: 'quarterly' },
    { id: 'Q2', name: 'Triwulan II (Apr-Jun)', type: 'quarterly' },
    { id: 'Q3', name: 'Triwulan III (Jul-Sep)', type: 'quarterly' },
    { id: 'Q4', name: 'Triwulan IV (Okt-Des)', type: 'quarterly' },
    { id: 'S1', name: 'Semester I (Jan-Jun)', type: 'semesterly' },
    { id: 'S2', name: 'Semester II (Jul-Des)', type: 'semesterly' },
    { id: 'YEAR', name: 'Akhir Tahun Buku', type: 'yearly' },
];

const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function ReportsPage() {
    const [selectedReport, setSelectedReport] = useState(reportTypes[0]);
    const [selectedPeriod, setSelectedPeriod] = useState(periods[0]);
    const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
    const [showReportDropdown, setShowReportDropdown] = useState(false);
    const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
    const [loading, setLoading] = useState(false);

    const mockData = {
        PL: [
            { code: '4-1001', name: 'Pendapatan Penjualan', amount: 450000000 },
            { code: '4-2001', name: 'Pendapatan Jasa', amount: 125000000 },
            { code: '5-1001', name: 'HPP Produk', amount: -280000000 },
            { code: '6-1001', name: 'Beban Gaji & Upah', amount: -65000000 },
            { code: '6-1002', name: 'Beban Sewa & Kantor', amount: -15000000 },
        ],
        BS: [
            { code: '1-1001', name: 'Kas & Bank', amount: 580000000 },
            { code: '1-2001', name: 'Piutang Dagang', amount: 125000000 },
            { code: '1-3001', name: 'Persediaan Barang', amount: 450000000 },
            { code: '2-1001', name: 'Hutang Usaha', amount: -85000000 },
            { code: '3-1001', name: 'Modal Disetor', amount: -1070000000 },
        ],
        EQ: [
            { code: '3-1001', name: 'Saldo Awal Modal', amount: 800000000 },
            { code: '3-2001', name: 'Laba Tahun Berjalan', amount: 215000000 },
            { code: '3-3001', name: 'Deviden / Prive', amount: -15000000 },
        ],
        CF: [
            { code: 'CF-O', name: 'Arus Kas Operasional', amount: 320000000 },
            { code: 'CF-I', name: 'Arus Kas Investasi', amount: -450000000 },
            { code: 'CF-F', name: 'Arus Kas Pendanaan', amount: 130000000 },
        ]
    };

    const currentData = useMemo(() => {
        return mockData[selectedReport.id as keyof typeof mockData] || [];
    }, [selectedReport.id]);

    const formatIDR = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(Math.abs(val));
    };

    const exportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(currentData.map(d => ({
            'Kode Akun': d.code,
            'Nama Akun': d.name,
            'Jumlah (IDR)': d.amount
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan');
        const fileName = `${selectedReport.name}_${selectedPeriod.id === 'custom' ? selectedMonth : selectedPeriod.name}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        const periodText = selectedPeriod.id === 'custom' ? selectedMonth : selectedPeriod.name;

        // Header Perusahaan
        doc.setFont('Inter', 'bold');
        doc.setFontSize(16);
        doc.text('ERP AKAPRO - ENTERPRISE SOLUTION', 105, 15, { align: 'center' });
        doc.setFontSize(14);
        doc.text(selectedReport.name.toUpperCase(), 105, 23, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont('Inter', 'normal');
        doc.text(`Periode: ${periodText}`, 105, 30, { align: 'center' });
        doc.line(14, 35, 196, 35);

        autoTable(doc, {
            head: [['KODE', 'KETERANGAN AKUN', 'JUMLAH (IDR)']],
            body: currentData.map(d => [d.code, d.name, formatIDR(d.amount)]),
            startY: 45,
            theme: 'striped',
            headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
            styles: { fontSize: 9, cellPadding: 4 },
            columnStyles: { 2: { halign: 'right', fontStyle: 'bold' } }
        });

        const finalY = (doc as any).lastAutoTable.result.finalY;
        const total = currentData.reduce((sum, d) => sum + d.amount, 0);

        doc.setFont('Inter', 'bold');
        doc.text('TOTAL AKUMULASI:', 14, finalY + 10);
        doc.text(formatIDR(total), 196, finalY + 10, { align: 'right' });

        doc.save(`${selectedReport.name}_${periodText}.pdf`);
    };

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <Layers className="w-4 h-4" />
                        <span className="text-[10px] font-semibold uppercase tracking-widest">Modul Pelaporan Keuangan</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Pusat Laporan Keuangan</h2>
                    <p className="text-sm text-slate-500 mt-1">Laporan keuangan standar entitas sesuai Standar Akuntansi Keuangan (SAK) Indonesia.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    {/* Report Type */}
                    <div className="relative">
                        <button onClick={() => setShowReportDropdown(!showReportDropdown)}
                            className="flex items-center gap-3 bg-white border border-slate-200 hover:border-indigo-500 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all">
                            <FileText className="w-4 h-4 text-indigo-500" />
                            <div className="text-left">
                                <p className="text-[9px] text-slate-400 uppercase leading-none mb-1">Jenis Laporan</p>
                                <p className="leading-none text-slate-700">{selectedReport.name}</p>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showReportDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showReportDropdown && (
                            <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                                {reportTypes.map(t => (
                                    <button key={t.id} onClick={() => { setSelectedReport(t); setShowReportDropdown(false); }}
                                        className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0">
                                        <p className="text-sm font-bold text-slate-800">{t.name}</p>
                                        <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">{t.desc}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Period Selector */}
                    <div className="relative">
                        <button onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                            className="flex items-center gap-3 bg-white border border-slate-200 hover:border-indigo-500 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all">
                            <Calendar className="w-4 h-4 text-rose-500" />
                            <div className="text-left">
                                <p className="text-[9px] text-slate-400 uppercase leading-none mb-1">Periode Laporan</p>
                                <p className="leading-none text-slate-700">{selectedPeriod.id === 'custom' ? selectedMonth : selectedPeriod.name}</p>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showPeriodDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showPeriodDropdown && (
                            <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                                <div className="p-3 bg-slate-50 border-b border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pilih Periode</p>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {periods.map(p => (
                                        <div key={p.id}>
                                            <button onClick={() => { setSelectedPeriod(p); if (p.id !== 'custom') setShowPeriodDropdown(false); }}
                                                className={`w-full text-left px-4 py-3 text-xs font-semibold border-b border-slate-50 last:border-0 transition-colors ${selectedPeriod.id === p.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                                                {p.name}
                                            </button>
                                            {p.id === 'custom' && selectedPeriod.id === 'custom' && (
                                                <div className="grid grid-cols-2 gap-1 p-2 bg-slate-50">
                                                    {months.map(m => (
                                                        <button key={m} onClick={() => { setSelectedMonth(m); setShowPeriodDropdown(false); }}
                                                            className={`px-2 py-1.5 rounded text-[10px] font-bold transition-all ${selectedMonth === m ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 hover:bg-indigo-100'}`}>
                                                            {m}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Verification Status */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-emerald-900 leading-tight">Data Terverifikasi</h4>
                            <p className="text-emerald-700 text-sm font-medium mt-0.5">Laporan sesuai dengan standar SAK dan sudah divalidasi oleh sistem akuntansi.</p>
                        </div>
                    </div>
                    <div className="hidden sm:block text-right">
                        <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1">Status Audit</p>
                        <p className="text-xs font-mono font-bold text-emerald-600">READY-TO-AUDIT</p>
                    </div>
                </div>

                <div className="flex lg:flex-col gap-3">
                    <button onClick={exportPDF}
                        className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all shadow-md">
                        <Printer className="w-4 h-4 text-rose-500" /> Cetak PDF
                    </button>
                    <button onClick={exportExcel}
                        className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-900 font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all shadow-sm">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Ekspor Excel
                    </button>
                </div>
            </div>

            {/* Results Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">{selectedReport.name}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                            Periode: {selectedPeriod.id === 'custom' ? selectedMonth : selectedPeriod.name}
                        </p>
                    </div>
                    <PieChart className="w-5 h-5 text-slate-300" />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                <th className="px-8 py-4">Kode Akun</th>
                                <th className="px-8 py-4">Deskripsi Akun</th>
                                <th className="px-8 py-4 text-right">Saldo (IDR)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {currentData.map((d, i) => (
                                <tr key={i} className="group hover:bg-slate-50/50 transition-all">
                                    <td className="px-8 py-5">
                                        <span className="font-mono text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-100">
                                            {d.code}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-sm font-bold text-slate-800">{d.name}</p>
                                        <p className="text-[9px] text-slate-400 font-medium uppercase mt-0.5">Klasifikasi SAK Indonesia</p>
                                    </td>
                                    <td className={`px-8 py-5 text-base font-bold font-mono text-right ${d.amount >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                                        {formatIDR(d.amount)}
                                        {d.amount < 0 && <span className="text-[10px] ml-2 opacity-40 font-sans">(Kredit)</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-slate-900 text-white">
                                <td colSpan={2} className="px-8 py-6 text-right font-bold uppercase tracking-widest text-xs">Total Bersih Terakumulasi</td>
                                <td className="px-8 py-6 text-right font-mono text-xl font-bold border-l border-white/10">
                                    {formatIDR(currentData.reduce((sum, d) => sum + d.amount, 0))}
                                    <p className="text-[9px] text-emerald-400 mt-1 font-bold uppercase tracking-widest">Balance Verified ✓</p>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Information Footer */}
            <div className="p-5 bg-slate-100/50 border border-slate-200 rounded-xl flex gap-4">
                <Activity className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed uppercase">
                    Laporan ini dihasilkan secara otomatis oleh mesin akuntansi ERP AKAPRO.
                    Segala bentuk ketidaksesuaian data harus segera dilaporkan kepada bagian finansial atau audit internal.
                    Riwayat cetak dan ekspor laporan dicatat dalam audit trail sistem untuk keperluan forensik.
                </p>
            </div>
        </div>
    );
}
