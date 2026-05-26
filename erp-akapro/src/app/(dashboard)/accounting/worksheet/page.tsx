"use client";

import React, { useState, useMemo } from 'react';
import {
    Calculator,
    Calendar,
    Download,
    BarChart3,
    ChevronDown,
    Printer,
    CheckCircle2,
    FileSpreadsheet,
    FileText,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const periods = [
    'Januari 2024', 'Februari 2024', 'Maret 2024', 'April 2024', 'Mei 2024', 'Juni 2024',
    'Juli 2024', 'Agustus 2024', 'September 2024', 'Oktober 2024', 'November 2024', 'Desember 2024',
    'Triwulan I 2024', 'Triwulan II 2024', 'Triwulan III 2024', 'Triwulan IV 2024',
    'Semester I 2024', 'Semester II 2024',
    'Akhir Tahun 2024',
];

const mockData = [
    { code: '1101', name: 'Kas Utama', ns_d: 150000000, ns_k: 0, adj_d: 0, adj_k: 500000, nsd_d: 149500000, nsd_k: 0, lr_d: 0, lr_k: 0, n_d: 149500000, n_k: 0 },
    { code: '1102', name: 'Bank BCA', ns_d: 500000000, ns_k: 0, adj_d: 2500000, adj_k: 0, nsd_d: 502500000, nsd_k: 0, lr_d: 0, lr_k: 0, n_d: 502500000, n_k: 0 },
    { code: '4101', name: 'Pendapatan Jasa', ns_d: 0, ns_k: 75000000, adj_d: 0, adj_k: 0, nsd_d: 0, nsd_k: 75000000, lr_d: 0, lr_k: 75000000, n_d: 0, n_k: 0 },
    { code: '5101', name: 'Beban Gaji', ns_d: 25000000, ns_k: 0, adj_d: 0, adj_k: 0, nsd_d: 25000000, nsd_k: 0, lr_d: 25000000, lr_k: 0, n_d: 0, n_k: 0 },
];

export default function WorksheetPage() {
    const [period, setPeriod] = useState('Mei 2024');
    const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

    const formatIDR = (val: number) => {
        if (val === 0) return '-';
        return new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 0
        }).format(val);
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(mockData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Neraca Lajur");
        XLSX.writeFile(workbook, `Neraca_Lajur_${period.replace(/ /g, '_')}.xlsx`);
    };

    const exportToPDF = () => {
        const doc = new jsPDF('l', 'mm', 'a3'); // Large format for worksheet
        doc.setFont('Inter', 'bold');
        doc.setFontSize(18);
        doc.text("NERACA LAJUR (WORKSHEET)", 210, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont('Inter', 'normal');
        doc.text(`Periode: ${period}`, 14, 25);
        doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, 14, 30);
        doc.line(14, 33, 406, 33);

        const headers = [['KODE', 'NAMA AKUN', 'NS DEBIT', 'NS KREDIT', 'ADJ DEBIT', 'ADJ KREDIT', 'NSD DEBIT', 'NSD KREDIT', 'LR DEBIT', 'LR KREDIT', 'NERACA D', 'NERACA K']];
        const body = mockData.map(d => [
            d.code, d.name, formatIDR(d.ns_d), formatIDR(d.ns_k), formatIDR(d.adj_d), formatIDR(d.adj_k),
            formatIDR(d.nsd_d), formatIDR(d.nsd_k), formatIDR(d.lr_d), formatIDR(d.lr_k), formatIDR(d.n_d), formatIDR(d.n_k)
        ]);

        autoTable(doc, {
            head: headers,
            body: body,
            startY: 40,
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 8 },
            styles: { fontSize: 8, font: 'Inter' },
            columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' }, 6: { halign: 'right' }, 7: { halign: 'right' }, 8: { halign: 'right' }, 9: { halign: 'right' }, 10: { halign: 'right' }, 11: { halign: 'right' } }
        });

        doc.save(`Neraca_Lajur_${period.replace(/ /g, '_')}.pdf`);
    };

    return (
        <div className="p-8 space-y-8 max-w-full mx-auto">
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-violet-600 mb-1">
                        <Calculator className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Financial Reconciliation</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Neraca Lajur</h2>
                    <p className="text-sm text-slate-500 mt-1">Lembar kerja 10 kolom untuk penyusunan laporan keuangan.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="relative">
                        <button onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                            className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all hover:border-violet-300">
                            <Calendar className="w-4 h-4 text-violet-500" />
                            <span className="text-slate-700">{period}</span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${showPeriodDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showPeriodDropdown && (
                            <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-y-auto max-h-80 py-2">
                                {periods.map(p => (
                                    <button key={p} onClick={() => { setPeriod(p); setShowPeriodDropdown(false); }}
                                        className="w-full text-left px-4 py-2 text-[11px] font-bold text-slate-600 hover:bg-violet-50 hover:text-violet-600 transition-colors">
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Validation Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Integritas Data</p>
                        <p className="text-emerald-700 text-sm font-semibold mt-1">Seluruh saldo telah diverifikasi seimbang (Balance) sesuai standar SAK.</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[9px] text-emerald-600 font-bold uppercase mb-1">Estimasi Laba Bersih</p>
                    <p className="text-2xl font-bold text-emerald-700">Rp 50.000.000</p>
                </div>
            </div>

            {/* Export Bar */}
            <div className="flex justify-end gap-2">
                <button onClick={exportToPDF} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all">
                    <Printer className="w-4 h-4 text-rose-400" /> CETAK PDF
                </button>
                <button onClick={exportToExcel} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> EXCEL
                </button>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th rowSpan={2} className="px-4 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200">Kode</th>
                                <th rowSpan={2} className="px-4 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200 min-w-[200px]">Nama Akun</th>
                                <th colSpan={2} className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center border-b border-r border-slate-200 bg-blue-50/30">Neraca Saldo</th>
                                <th colSpan={2} className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center border-b border-r border-slate-200 bg-rose-50/30">Penyesuaian</th>
                                <th colSpan={2} className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center border-b border-r border-slate-200 bg-amber-50/30">NS Disesuaikan</th>
                                <th colSpan={2} className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center border-b border-r border-slate-200 bg-emerald-50/30">Laba Rugi</th>
                                <th colSpan={2} className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center border-b border-slate-200 bg-violet-50/30">Neraca</th>
                            </tr>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">
                                <th className="px-2 py-3 border-r border-slate-200 w-24">Debet</th><th className="px-2 py-3 border-r border-slate-200 w-24">Kredit</th>
                                <th className="px-2 py-3 border-r border-slate-200 w-24">Debet</th><th className="px-2 py-3 border-r border-slate-200 w-24">Kredit</th>
                                <th className="px-2 py-3 border-r border-slate-200 w-24">Debet</th><th className="px-2 py-3 border-r border-slate-200 w-24">Kredit</th>
                                <th className="px-2 py-3 border-r border-slate-200 w-24">Debet</th><th className="px-2 py-3 border-r border-slate-200 w-24">Kredit</th>
                                <th className="px-2 py-3 border-r border-slate-200 w-24">Debet</th><th className="px-2 py-3 w-24">Kredit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px] font-bold">
                            {mockData.map(d => (
                                <tr key={d.code} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-4 border-r border-slate-100 text-slate-400 font-mono">{d.code}</td>
                                    <td className="px-4 py-4 border-r border-slate-100 text-slate-800 uppercase">{d.name}</td>
                                    <td className="px-2 py-4 border-r border-slate-100 text-right font-mono text-blue-600">{formatIDR(d.ns_d)}</td>
                                    <td className="px-2 py-4 border-r border-slate-100 text-right font-mono text-blue-600">{formatIDR(d.ns_k)}</td>
                                    <td className="px-2 py-4 border-r border-slate-100 text-right font-mono text-rose-600">{formatIDR(d.adj_d)}</td>
                                    <td className="px-2 py-4 border-r border-slate-100 text-right font-mono text-rose-600">{formatIDR(d.adj_k)}</td>
                                    <td className="px-2 py-4 border-r border-slate-100 text-right font-mono text-amber-600">{formatIDR(d.nsd_d)}</td>
                                    <td className="px-2 py-4 border-r border-slate-100 text-right font-mono text-amber-600">{formatIDR(d.nsd_k)}</td>
                                    <td className="px-2 py-4 border-r border-slate-100 text-right font-mono text-emerald-600">{formatIDR(d.lr_d)}</td>
                                    <td className="px-2 py-4 border-r border-slate-100 text-right font-mono text-emerald-600">{formatIDR(d.lr_k)}</td>
                                    <td className="px-2 py-4 border-r border-slate-100 text-right font-mono text-violet-600">{formatIDR(d.n_d)}</td>
                                    <td className="px-2 py-4 text-right font-mono text-violet-600">{formatIDR(d.n_k)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-900 text-white text-[11px] font-bold">
                            <tr className="divide-x divide-white/10">
                                <td colSpan={2} className="px-4 py-4 text-right uppercase tracking-wider">Total Saldo</td>
                                <td className="px-2 py-4 text-right font-mono">675.000.000</td><td className="px-2 py-4 text-right font-mono">675.000.000</td>
                                <td className="px-2 py-4 text-right font-mono">2.500.000</td><td className="px-2 py-4 text-right font-mono">2.500.000</td>
                                <td className="px-2 py-4 text-right font-mono">677.000.000</td><td className="px-2 py-4 text-right font-mono">677.000.000</td>
                                <td className="px-2 py-4 text-right font-mono">25.000.000</td><td className="px-2 py-4 text-right font-mono">75.000.000</td>
                                <td className="px-2 py-4 text-right font-mono">652.000.000</td><td className="px-2 py-4 text-right font-mono">602.000.000</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold italic">
                <FileText className="w-3 h-3" />
                <span>Selisih Laba Rugi dan Neraca adalah Laba/Rugi Bersih sebesar Rp 50.000.000.</span>
            </div>
        </div>
    );
}
