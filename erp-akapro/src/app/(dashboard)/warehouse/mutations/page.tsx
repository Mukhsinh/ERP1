"use client";

import React, { useState, useMemo } from 'react';
import {
    ArrowLeftRight,
    Search,
    Calendar,
    ArrowUpRight,
    ArrowDownLeft,
    Filter,
    Plus,
    Minus,
    Download,
    Printer,
    Package,
    History,
    X,
    CheckCircle2,
    Building2,
    FileSpreadsheet,
    MapPin,
    ChevronDown,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const warehouses = [
    { id: 'WH-01', name: 'Gudang Pusat (Jakarta)', type: 'Utama' },
    { id: 'WH-02', name: 'Gudang Cabang (Semarang)', type: 'Cabang' },
    { id: 'WH-03', name: 'Gudang Transit (Surabaya)', type: 'Transit' },
];

const periods = [
    'Januari 2024', 'Februari 2024', 'Maret 2024', 'April 2024', 'Mei 2024', 'Juni 2024',
    'Triwulan I 2024', 'Triwulan II 2024', 'Semester I 2024', 'Akhir Tahun 2024'
];

const mockMutations = [
    { id: 1, tanggal: '2024-05-23 09:15', sku: 'BRG-001', name: 'Premium Espresso Machine', type: 'IN', qty: 5, ref: 'PO-2024-001', user: 'Admin', wh: 'WH-01', balance: 25 },
    { id: 2, tanggal: '2024-05-23 10:30', sku: 'BRG-002', name: 'Arabica Coffee Beans 1kg', type: 'OUT', qty: 12, ref: 'SO-2024-088', user: 'Kasir 1', wh: 'WH-01', balance: 48 },
    { id: 3, tanggal: '2024-05-22 14:00', sku: 'BRG-001', name: 'Premium Espresso Machine', type: 'OUT', qty: 1, ref: 'SO-2024-089', user: 'Admin', wh: 'WH-01', balance: 20 },
    { id: 4, tanggal: '2024-05-22 16:45', sku: 'BRG-003', name: 'Paper Filter V60', type: 'IN', qty: 50, ref: 'RETUR-002', user: 'Admin', wh: 'WH-02', balance: 110 },
];

export default function MutationsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [period, setPeriod] = useState('Mei 2024');
    const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState(warehouses[0]);
    const [showWhDropdown, setShowWhDropdown] = useState(false);
    const [showInModal, setShowInModal] = useState(false);
    const [showOutModal, setShowOutModal] = useState(false);

    const filteredMutations = useMemo(() => {
        return mockMutations.filter(m =>
            m.wh === selectedWarehouse.id &&
            (m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.ref.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [searchQuery, selectedWarehouse]);

    const exportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredMutations.map(m => ({
            'Waktu': m.tanggal,
            'SKU': m.sku,
            'Item': m.name,
            'Jenis': m.type === 'IN' ? 'MASUK' : 'KELUAR',
            'Qty': m.qty,
            'Referensi': m.ref,
            'Operator': m.user
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Log Mutasi");
        XLSX.writeFile(workbook, `Mutasi_Barang_${selectedWarehouse.id}_${period}.xlsx`);
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.setFont('Inter', 'bold');
        doc.setFontSize(16);
        doc.text("LAPORAN MUTASI INVESTARIS", 105, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont('Inter', 'normal');
        doc.text(`Gudang: ${selectedWarehouse.name}`, 14, 25);
        doc.text(`Periode: ${period}`, 14, 30);
        doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, 14, 35);
        doc.line(14, 38, 196, 38);

        autoTable(doc, {
            head: [['WAKTU', 'SKU', 'NAMA BARANG', 'TIPE', 'QTY', 'REF']],
            body: filteredMutations.map(m => [
                m.tanggal, m.sku, m.name, m.type, m.qty, m.ref
            ]),
            startY: 45,
            theme: 'striped',
            headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
            styles: { fontSize: 8 }
        });

        doc.save(`Mutasi_${selectedWarehouse.id}_${period}.pdf`);
    };

    const StockModal = ({ type, isOpen, onClose }: { type: 'IN' | 'OUT', isOpen: boolean, onClose: () => void }) => {
        if (!isOpen) return null;
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
                <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className={`p-6 ${type === 'IN' ? 'bg-indigo-600' : 'bg-rose-600'} text-white`}>
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                                {type === 'IN' ? <Plus className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                                Input Barang {type === 'IN' ? 'Masuk' : 'Keluar'}
                            </h3>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gudang Tujuan</label>
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700">{selectedWarehouse.name}</div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Waktu Transaksi</label>
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700">{new Date().toLocaleString('id-ID')}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pilih Barang</label>
                                <select className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500">
                                    <option>-- Cari SKU/Barang --</option>
                                    <option>Premium Espresso Machine</option>
                                    <option>Arabica Coffee Beans 1kg</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kuantitas (Qty)</label>
                                <input type="number" placeholder="0" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Referensi Dokumen</label>
                            <input type="text" placeholder="PO-XXXX / SO-XXXX / DO-XXXX" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Keterangan Tambahan</label>
                            <textarea rows={3} placeholder="Catatan untuk log mutasi..." className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 resize-none" />
                        </div>

                        <div className="pt-4 flex gap-4">
                            <button onClick={onClose} className="flex-1 py-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:bg-slate-50 rounded-xl transition-all">Batalkan</button>
                            <button className={`flex-[2] py-4 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg ${type === 'IN' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
                                Konfirmasi Transaksi
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <History className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Audit Trail</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Mutasi & Pergerakan Barang</h2>
                    <p className="text-sm text-slate-500 mt-1">Laporan historis keluar-masuk barang pada entitas pergudangan.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="relative">
                        <button onClick={() => setShowWhDropdown(!showWhDropdown)}
                            className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:border-indigo-400 transition-all">
                            <MapPin className="w-4 h-4 text-rose-500" />
                            <span className="text-slate-700">{selectedWarehouse.name}</span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${showWhDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showWhDropdown && (
                            <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                                {warehouses.map(w => (
                                    <button key={w.id} onClick={() => { setSelectedWarehouse(w); setShowWhDropdown(false); }}
                                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-xs font-bold text-slate-600">
                                        {w.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <button onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                            className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:border-indigo-400 transition-all">
                            <Calendar className="w-4 h-4 text-indigo-500" />
                            <span className="text-slate-700">{period}</span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${showPeriodDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showPeriodDropdown && (
                            <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-y-auto max-h-60 py-1">
                                {periods.map(p => (
                                    <button key={p} onClick={() => { setPeriod(p); setShowPeriodDropdown(false); }}
                                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-xs font-bold text-slate-600">
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button onClick={() => setShowInModal(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-widest shadow-md">
                        <Plus className="w-4 h-4" /> Masuk
                    </button>
                    <button onClick={() => setShowOutModal(true)} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-widest shadow-md">
                        <Minus className="w-4 h-4" /> Keluar
                    </button>
                </div>
            </header>

            <div className="flex flex-wrap gap-4 items-center">
                <div className="relative group flex-1 min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari SKU, Barang, atau Referensi..."
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-indigo-500 shadow-sm transition-all" />
                </div>
                <div className="flex gap-2">
                    <button onClick={exportPDF} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all">
                        <Printer className="w-4 h-4 text-rose-500" /> CETAK PDF
                    </button>
                    <button onClick={exportExcel} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> EXCEL
                    </button>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Waktu & SKU</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Informasi Barang</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Tipe</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Qty</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Referensi</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right text-indigo-600">Saldo Akhir</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredMutations.map((m) => (
                                <tr key={m.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-400 mb-1">{m.tanggal}</span>
                                            <span className="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded w-fit">{m.sku}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                <Package className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-bold text-slate-800 uppercase">{m.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center">
                                            {m.type === 'IN' ? (
                                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-bold uppercase">
                                                    <ArrowDownLeft className="w-3 h-3" /> MASUK
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 text-[9px] font-bold uppercase">
                                                    <ArrowUpRight className="w-3 h-3" /> KELUAR
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`text-sm font-bold font-mono ${m.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {m.type === 'IN' ? '+' : '-'}{m.qty}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-700 tracking-tight">{m.ref}</span>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase">PIC: {m.user}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-900 border-l border-slate-50">
                                        <span className="bg-slate-900 text-white px-3 py-1 rounded-lg shadow-sm">
                                            {m.balance}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <StockModal type="IN" isOpen={showInModal} onClose={() => setShowInModal(false)} />
            <StockModal type="OUT" isOpen={showOutModal} onClose={() => setShowOutModal(false)} />
        </div>
    );
}
