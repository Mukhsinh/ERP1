"use client";

import React, { useState, useMemo } from 'react';
import {
    Receipt,
    Search,
    Plus,
    Filter,
    FileText,
    Banknote,
    Calendar,
    Download,
    Printer,
    ArrowUpRight,
    ArrowDownRight,
    CreditCard,
    History,
    MoreHorizontal,
    CheckCircle2,
    Clock,
    XCircle,
    X,
    FileSpreadsheet,
    LayoutDashboard,
    List,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { supabase } from '@/lib/supabase';

const fallbackInvoices = [
    { id: 'TRX-9901', tanggal: '2024-05-23', dueTanggal: '2024-05-23', customer: 'Umum / Retail', total: 65000, balance: 0, status: 'Paid', method: 'POS - Tunai' },
    { id: 'INV-24-001', tanggal: '2024-05-23', dueTanggal: '2024-06-23', customer: 'Bapak Ahmad', total: 15600000, balance: 0, status: 'Paid', method: 'Invoice' },
];

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<any[]>(fallbackInvoices);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

    const [newInvData, setNewInvData] = useState({
        customer: 'Umum / Retail',
        tanggal: new Date().toISOString().split('T')[0],
        nominal: '',
        tempo: '30',
        memo: ''
    });

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('sales.invoices')
                .select('*')
                .order('tanggal', { ascending: false });
            if (!error && data && data.length > 0) {
                setInvoices(data.map((d: any) => ({
                    id: d.invoice_no || d.id,
                    tanggal: d.tanggal,
                    dueTanggal: d.due_tanggal,
                    customer: d.customer,
                    total: d.total,
                    balance: d.balance,
                    status: d.status,
                    method: d.method,
                    dbId: d.id,
                })));
            }
        } catch { /* fallback stays */ }
        finally { setLoading(false); }
    };

    React.useEffect(() => { fetchInvoices(); }, []);

    const filteredInvoices = useMemo(() => {
        return invoices.filter(inv =>
            inv.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.id?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, invoices]);

    const stats = useMemo(() => {
        const total = invoices.reduce((acc, inv) => acc + (inv.balance || 0), 0);
        const overdue = invoices.filter(i => i.status === 'Overdue').reduce((acc, i) => acc + (i.balance || 0), 0);
        return { total, overdue };
    }, [invoices]);

    const handleAddInvoice = async () => {
        if (!newInvData.nominal) return;
        const id = `INV-24-${String(invoices.length + 1).padStart(3, '0')}`;
        const dueDateObj = new Date(newInvData.tanggal);
        dueDateObj.setDate(dueDateObj.getDate() + parseInt(newInvData.tempo));

        try {
            const { error } = await supabase
                .from('sales.invoices')
                .insert([{
                    invoice_no: id,
                    tanggal: newInvData.tanggal,
                    due_tanggal: dueDateObj.toISOString().split('T')[0],
                    customer: newInvData.customer,
                    total: parseInt(newInvData.nominal),
                    balance: parseInt(newInvData.nominal),
                    status: 'Unpaid',
                    method: 'Invoice',
                }]);
            if (error) throw error;
            fetchInvoices();
        } catch (err: any) {
            // Fallback: add locally
            const newInvoice = {
                id,
                tanggal: newInvData.tanggal,
                dueTanggal: dueDateObj.toISOString().split('T')[0],
                customer: newInvData.customer,
                total: parseInt(newInvData.nominal),
                balance: parseInt(newInvData.nominal),
                status: 'Unpaid',
                method: 'Invoice'
            };
            setInvoices([newInvoice as any, ...invoices]);
        }

        setShowAddModal(false);
        setNewInvData({
            customer: 'Umum / Retail',
            tanggal: new Date().toISOString().split('T')[0],
            nominal: '',
            tempo: '30',
            memo: ''
        });
    };

    const handleProcessPayment = async () => {
        if (!selectedInvoice) return;
        try {
            if (selectedInvoice.dbId) {
                await supabase
                    .from('sales.invoices')
                    .update({ balance: 0, status: 'Paid' })
                    .eq('id', selectedInvoice.dbId);
            }
            fetchInvoices();
        } catch {
            setInvoices(prev => prev.map(inv =>
                inv.id === selectedInvoice.id ? { ...inv, balance: 0, status: 'Paid' } : inv
            ) as any);
        }
        setShowPaymentModal(false);
    };


    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto min-h-screen">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <Receipt className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Piutang & Invoicing</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Manajemen Invoice</h2>
                    <p className="text-slate-500 mt-1 font-medium text-sm">Monitor seluruh tagihan pelanggan dan status piutang perusahaan.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <List className="w-3.5 h-3.5" /> List
                        </button>
                        <button
                            onClick={() => setViewMode('board')}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'board' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <LayoutDashboard className="w-3.5 h-3.5" /> Papan
                        </button>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-slate-900 text-white font-bold px-6 py-3 rounded-2xl text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-100"
                    >
                        <Plus className="w-4 h-4" /> Invoice Baru
                    </button>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white border-2 border-slate-50 rounded-2xl p-6 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Piutang</p>
                    <p className="text-3xl font-bold text-slate-900">Rp {stats.total.toLocaleString('id-ID')}</p>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-lg">
                        <ArrowUpRight className="w-3 h-3" /> +12% dari bulan lalu
                    </div>
                </div>
                <div className="bg-white border-2 border-slate-50 rounded-2xl p-6 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Terlambat</p>
                    <p className="text-3xl font-bold text-rose-600">Rp {stats.overdue.toLocaleString('id-ID')}</p>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-rose-600 bg-rose-50 w-fit px-2 py-1 rounded-lg">
                        <Clock className="w-3 h-3" /> Berisiko Tinggi
                    </div>
                </div>
                <div className="bg-indigo-600 rounded-2xl p-6 shadow-lg shadow-indigo-100 text-white flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Collection Rate</p>
                        <Banknote className="w-5 h-5 opacity-40" />
                    </div>
                    <div className="flex items-end justify-between mt-4">
                        <p className="text-4xl font-bold">92.4%</p>
                        <p className="text-[10px] font-bold uppercase opacity-60 mb-2">Target: 95%</p>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-wrap gap-4 items-center">
                <div className="relative group flex-1 min-w-[300px]">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari Invoice ID atau Nama Pelanggan..."
                        className="w-full bg-white border border-slate-200 rounded-xl py-4 pl-14 pr-8 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-all text-slate-900 shadow-sm"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-white border border-slate-200 p-4 rounded-xl text-slate-500 hover:text-indigo-600 transition-all">
                        <Filter className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase">Filter</span>
                    </button>
                    <button className="flex items-center gap-2 bg-white border border-slate-200 p-4 rounded-xl text-slate-500 hover:text-emerald-600 transition-all">
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* View Content */}
            {viewMode === 'list' ? (
                <div className="bg-white border-2 border-slate-50 rounded-2xl shadow-xl shadow-slate-100/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID / Sumber</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pelanggan</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Total</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Sisa Piutang</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-8 py-5"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredInvoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="px-8 py-6">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600">{inv.id}</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{inv.method}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-800">{inv.customer}</p>
                                                    <p className="text-[9px] text-slate-400 uppercase mt-0.5">{inv.tanggal}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right font-mono text-xs text-slate-400">
                                            Rp {inv.total.toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <p className={`font-mono text-sm font-bold ${inv.balance > 0 ? 'text-indigo-600' : 'text-slate-300 line-through'}`}>
                                                Rp {inv.balance.toLocaleString('id-ID')}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-center">
                                                {inv.status === 'Paid' ? (
                                                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-widest">Lunas</span>
                                                ) : inv.status === 'Overdue' ? (
                                                    <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[9px] font-bold uppercase tracking-widest">Overdue</span>
                                                ) : (
                                                    <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[9px] font-bold uppercase tracking-widest">Unpaid</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {inv.balance > 0 && (
                                                <button
                                                    onClick={() => { setSelectedInvoice(inv); setShowPaymentModal(true); }}
                                                    className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-100"
                                                >
                                                    Bayar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-10">
                    {['Unpaid', 'Partial', 'Overdue', 'Paid'].map((st) => (
                        <div key={st} className="space-y-4">
                            <div className="flex justify-between items-center px-4 py-2 bg-slate-100 rounded-xl border border-slate-200">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{st}</h4>
                                <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                                    {invoices.filter(i => i.status === st).length}
                                </span>
                            </div>
                            <div className="space-y-4">
                                {invoices.filter(i => i.status === st).map(inv => (
                                    <div key={inv.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:border-indigo-200 transition-all cursor-pointer group">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100 uppercase">{inv.id}</span>
                                            <button className="text-slate-300 hover:text-slate-900"><MoreHorizontal className="w-4 h-4" /></button>
                                        </div>
                                        <h5 className="text-xs font-bold text-slate-800 uppercase mb-1">{inv.customer}</h5>
                                        <p className="text-[9px] text-slate-400 font-mono italic mb-4">{inv.tanggal}</p>
                                        <div className="pt-4 border-t border-slate-50 flex justify-between items-end">
                                            <div>
                                                <p className="text-[8px] text-slate-400 uppercase font-bold tracking-widest mb-1">Total</p>
                                                <p className="text-xs font-bold text-slate-900 font-mono">Rp {inv.total.toLocaleString('id-ID')}</p>
                                            </div>
                                            {inv.balance > 0 && (
                                                <div className="text-right">
                                                    <p className="text-[8px] text-indigo-400 uppercase font-bold tracking-widest mb-1">Piutang</p>
                                                    <p className="text-xs font-bold text-indigo-600 font-mono">Rp {inv.balance.toLocaleString('id-ID')}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Add Invoice */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Invoice Baru</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manual Entry Accounts Receivable</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Pelanggan</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-indigo-600 transition-all uppercase"
                                    value={newInvData.customer}
                                    onChange={(e) => setNewInvData({ ...newInvData, customer: e.target.value })}
                                >
                                    <option>Umum / Retail</option>
                                    <option>Toko Maju Jaya</option>
                                    <option>Bapak Ahmad</option>
                                    <option>Cafe Sinar Pagi</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tanggal</label>
                                    <input
                                        type="date"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-indigo-600 transition-all"
                                        value={newInvData.tanggal}
                                        onChange={(e) => setNewInvData({ ...newInvData, tanggal: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nominal (Rp)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-indigo-600 transition-all font-mono"
                                        value={newInvData.nominal}
                                        onChange={(e) => setNewInvData({ ...newInvData, nominal: e.target.value })}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Catatan</label>
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-indigo-600 transition-all h-20 resize-none"
                                    value={newInvData.memo}
                                    onChange={(e) => setNewInvData({ ...newInvData, memo: e.target.value })}
                                    placeholder="Keterangan tagihan..."
                                />
                            </div>
                            <button
                                onClick={handleAddInvoice}
                                className="w-full py-4 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100"
                            >
                                Simpan Invoice
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Payment */}
            {showPaymentModal && selectedInvoice && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)} />
                    <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 text-center space-y-6">
                            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-indigo-100 group">
                                <CreditCard className="w-10 h-10 group-hover:scale-110 transition-transform" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Konfirmasi Pelunasan</h3>
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Tagihan {selectedInvoice.id}</p>
                                <p className="text-3xl font-black text-indigo-600 font-mono">Rp {selectedInvoice.balance.toLocaleString('id-ID')}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setShowPaymentModal(false)} className="py-4 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all">Batal</button>
                                <button
                                    onClick={handleProcessPayment}
                                    className="py-4 bg-emerald-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4" /> LUNASKAN
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
