"use client";

import React, { useState, useMemo } from 'react';
import {
    CreditCard,
    Search,
    Plus,
    Filter,
    ArrowUpCircle,
    Banknote,
    Calendar,
    Download,
    Printer,
    ArrowRight,
    Wallet,
    History,
    CheckCircle2,
    Clock,
    XCircle,
    Building2,
    Briefcase,
    X,
    FileSpreadsheet,
    TrendingUp,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Payable {
    id: string;
    tanggal: string;
    dueTanggal: string;
    supplier: string;
    total: number;
    balance: number;
    status: string;
}

const mockPayables: Payable[] = [
    { id: 'BILL-24-001', tanggal: '2024-05-23', dueTanggal: '2024-06-23', supplier: 'PT. Distribusi Nasional', total: 125000000, balance: 125000000, status: 'Belum Bayar' },
    { id: 'BILL-24-002', tanggal: '2024-05-23', dueTanggal: '2024-06-05', supplier: 'Global Parts Corp', total: 45000000, balance: 25000000, status: 'Sebagian' },
    { id: 'BILL-24-003', tanggal: '2024-05-22', dueTanggal: '2024-06-22', supplier: 'Prima Logistik', total: 8500000, balance: 0, status: 'Lunas' },
    { id: 'BILL-24-004', tanggal: '2024-04-10', dueTanggal: '2024-05-10', supplier: 'Sinar Abadi Ltd', total: 2500000, balance: 2500000, status: 'Jatuh Tempo' },
];

export default function PayablesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [periode, setPeriode] = useState('Mei 2024');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedBill, setSelectedBill] = useState<Payable | null>(null);

    const filteredPayables = useMemo(() => {
        return mockPayables.filter(p =>
            p.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const totalAP = useMemo(() => mockPayables.reduce((acc, p) => acc + p.balance, 0), []);
    const overdueAP = useMemo(() => mockPayables.filter(i => i.status === 'Jatuh Tempo').reduce((acc, i) => acc + i.balance, 0), []);

    const eksporExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredPayables.map(p => ({
            'No. Tagihan': p.id,
            'Tanggal': p.tanggal,
            'Jatuh Tempo': p.dueTanggal,
            'Supplier': p.supplier,
            'Total': p.total,
            'Sisa Hutang': p.balance,
            'Status': p.status
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Hutang Dagang");
        XLSX.writeFile(workbook, `Hutang_Dagang_${periode.replace(/ /g, '_')}.xlsx`);
    };

    const eksporPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("LAPORAN HUTANG DAGANG", 14, 15);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Periode: ${periode}`, 14, 22);
        doc.text(`Total Kewajiban: Rp ${totalAP.toLocaleString('id-ID')}`, 14, 27);
        doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, 14, 32);

        autoTable(doc, {
            head: [['NO. TAGIHAN', 'SUPPLIER', 'JATUH TEMPO', 'TOTAL', 'SISA', 'STATUS']],
            body: filteredPayables.map(p => [
                p.id, p.supplier, p.dueTanggal, `Rp ${p.total.toLocaleString('id-ID')}`, `Rp ${p.balance.toLocaleString('id-ID')}`, p.status
            ]),
            startY: 40,
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229] }
        });

        doc.save(`Hutang_Dagang_${periode.replace(/ /g, '_')}.pdf`);
    };

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <CreditCard className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Procurement & Payables</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Hutang Dagang (AP)</h2>
                    <p className="text-slate-500 mt-1 font-medium text-sm">Kelola kewajiban pembayaran kepada pemasok dan monitoring arus kas keluar.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-sm hover:border-indigo-400 transition-all text-slate-600">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        {periode}
                    </button>
                    <button className="flex items-center gap-2 bg-indigo-600 hover:bg-slate-900 text-white font-bold px-6 py-3 rounded-2xl text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95">
                        <Plus className="w-4 h-4" /> Catat Hutang
                    </button>
                </div>
            </header>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-8 text-white relative shadow-2xl overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-700" />
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-4">Total Kewajiban Lancar</p>
                            <h3 className="text-5xl font-bold tracking-tight font-mono">Rp {totalAP.toLocaleString('id-ID')}</h3>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
                            <Banknote className="w-10 h-10 text-indigo-400" />
                        </div>
                    </div>

                    <div className="mt-12 grid grid-cols-2 gap-12 pt-8 border-t border-white/5 relative z-10">
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Jatuh Tempo Minggu Ini</p>
                            <p className="text-2xl font-bold text-white font-mono">Rp 45.000.000</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-rose-500/60 uppercase tracking-widest mb-2">Terlewati</p>
                            <p className="text-2xl font-bold text-rose-500 font-mono">Rp {overdueAP.toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-slate-50 rounded-3xl p-8 shadow-sm flex flex-col justify-between group">
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Kesehatan Kas</h4>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between items-end mb-3">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Cash Flow Ratio</span>
                                    <span className="text-xl font-bold text-slate-900">1.4x</span>
                                </div>
                                <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-600 w-[70%] rounded-full" />
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-indigo-50/50 group-hover:border-indigo-100 transition-all">
                                <TrendingUp className="w-5 h-5 text-indigo-600" />
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Prediksi Pengeluaran</p>
                                    <p className="text-sm font-bold text-slate-800">Meningkat 12%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button className="w-full mt-8 py-4 rounded-xl bg-slate-50 text-slate-600 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-3 border border-slate-200">
                        <History className="w-4 h-4" /> Laporan Historis
                    </button>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white border-2 border-slate-50 rounded-3xl shadow-xl shadow-slate-100/50 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="relative group flex-1 max-w-md">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari Tagihan atau Pemasok..."
                            className="w-full bg-slate-50 border border-transparent rounded-2xl py-3 pl-14 pr-6 text-sm font-medium focus:outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-900 shadow-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={eksporPDF} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                            <Printer className="w-4 h-4" />
                        </button>
                        <button onClick={eksporExcel} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 transition-all shadow-sm">
                            <FileSpreadsheet className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left font-medium italic">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">No. Tagihan / Ref</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pemasok</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jatuh Tempo</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Nilai Tagihan</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-indigo-600 uppercase tracking-widest text-right">Sisa Hutang</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredPayables.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-8 py-6">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 not-italic uppercase tracking-tight">{p.id}</p>
                                            <p className="text-[10px] text-slate-400 mt-1">{p.tanggal}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                                <Building2 className="w-5 h-5" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-800 not-italic uppercase tracking-tight">{p.supplier}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-300" />
                                            <span className={`text-[10px] font-bold uppercase not-italic ${p.status === 'Jatuh Tempo' ? 'text-rose-600' : 'text-slate-500'}`}>
                                                {p.dueTanggal}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right not-italic text-[11px] font-bold text-slate-400 font-mono">
                                        Rp {p.total.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-8 py-6 text-right not-italic">
                                        <span className="text-base font-bold text-indigo-600 font-mono">Rp {p.balance.toLocaleString('id-ID')}</span>
                                        {p.status === 'Jatuh Tempo' && <p className="text-[8px] font-bold text-rose-500 uppercase mt-1 tracking-tighter">Overdue</p>}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex justify-center not-italic">
                                            {p.status === 'Lunas' ? (
                                                <span className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Lunas
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setSelectedBill(p);
                                                        setShowPaymentModal(true);
                                                    }}
                                                    className="px-6 py-2 rounded-full bg-indigo-600 text-white text-[9px] font-bold uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
                                                >
                                                    Bayar
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedBill && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)} />
                    <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Konfirmasi Pembayaran</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ref: {selectedBill.id}</p>
                            </div>
                            <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="text-center p-8 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Nilai Pembayaran</p>
                                <p className="text-4xl font-bold text-indigo-600 tracking-tight font-mono">Rp {selectedBill.balance.toLocaleString('id-ID')}</p>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Sumber Rekening</label>
                                    <div className="relative">
                                        <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-6 text-xs font-bold outline-none focus:border-indigo-600 transition-all appearance-none cursor-pointer">
                                            <option>BCA Operasional - **** 8829</option>
                                            <option>Mandiri Bisnis - **** 1102</option>
                                            <option>Kas Kecil Pekalongan</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Catatan Internal</label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Transfer via VA Supplier"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-5 text-xs font-bold outline-none focus:border-indigo-600 transition-all"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 transition-all shadow-2xl shadow-indigo-100"
                            >
                                Proses Pembayaran
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
