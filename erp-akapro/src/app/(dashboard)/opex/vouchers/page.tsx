"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    Receipt,
    Search,
    Filter,
    Download,
    Plus,
    ArrowUpRight,
    Building2,
    CreditCard,
    FileText,
    History,
    Calendar,
    ChevronDown,
    Zap,
    CheckCircle2,
    Banknote,
    MoreHorizontal,
    Printer,
    Edit3,
    X,
    AlertTriangle,
    Loader2
} from 'lucide-react';
import { AccountingEngine } from '@/lib/accounting';
import { useSupabase } from '@/hooks/useSupabase';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function ExpenseVoucherPage() {
    const { tenant } = useSupabase();
    const [loading, setLoading] = useState(true);
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [coas, setCoas] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [form, setForm] = useState({
        desc: '',
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        paymentCoa: '',
        expenseCoa: ''
    });

    useEffect(() => {
        if (tenant) {
            fetchData();
        }
    }, [tenant]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch vouchers (journals with source_module = 'OPEX')
            const { data: vData, error: vError } = await supabase
                .from('accounting_journals')
                .select(`
                    id,
                    reference_no,
                    transaction_date,
                    description,
                    accounting_general_ledger (
                        id,
                        coa_id,
                        debit,
                        credit,
                        chart_of_accounts (
                            name
                        )
                    )
                `)
                .eq('source_module', 'OPEX')
                .order('transaction_date', { ascending: false });

            if (vError) throw vError;

            // Simplify voucher data
            const simplifiedVouchers = (vData || []).map(v => {
                const expenseLine: any = v.accounting_general_ledger?.find((l: any) => l.debit > 0);
                const paymentLine: any = v.accounting_general_ledger?.find((l: any) => l.credit > 0);

                const getCOAName = (coa: any) => {
                    if (!coa) return 'Unknown AC';
                    if (Array.isArray(coa)) return coa[0]?.name || 'Unknown AC';
                    return coa.name || 'Unknown AC';
                };

                const getCOACode = (coa: any) => {
                    if (!coa) return '-';
                    if (Array.isArray(coa)) return coa[0]?.code || '-';
                    return coa.code || '-';
                };

                return {
                    id: v.reference_no,
                    date: v.transaction_date,
                    desc: v.description,
                    amount: expenseLine?.debit || 0,
                    category: getCOAName(expenseLine?.chart_of_accounts),
                    payment: getCOAName(paymentLine?.chart_of_accounts)
                };
            });

            setVouchers(simplifiedVouchers);

            // Fetch COAs for form
            const coaData = await AccountingEngine.getCoa(tenant!.id);
            setCoas(coaData);

        } catch (error: any) {
            toast.error("Gagal mengambil data: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const formatIDR = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(val).replace('Rp', 'Rp ');
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) return;

        if (!form.expenseCoa || !form.paymentCoa) {
            toast.error("Pilih akun pengeluaran dan pembayaran.");
            return;
        }

        setIsSaving(true);
        try {
            // 1. Budget Check
            const budget = await AccountingEngine.checkBudgetAvailability({
                tenantId: tenant.id,
                coaId: form.expenseCoa,
                amount: form.amount
            });

            if (!budget.available) {
                const confirmed = window.confirm(`Peringatan: Anggaran terlampaui!\nSisa Anggaran: ${formatIDR(budget.remaining || 0)}\n\nLanjutkan posting?`);
                if (!confirmed) {
                    setIsSaving(false);
                    return;
                }
            }

            // 2. Post Journal
            await AccountingEngine.recordExpense({
                tenantId: tenant.id,
                branchId: 'MAIN',
                date: form.date,
                ref: `VOU-${Date.now()}`,
                desc: form.desc,
                expenseCoa: form.expenseCoa,
                paymentCoa: form.paymentCoa,
                amount: form.amount
            });

            toast.success("Voucher berhasil disimpan dan dijurnal otomatis.");
            setShowModal(false);
            setForm({ desc: '', date: new Date().toISOString().split('T')[0], amount: 0, paymentCoa: '', expenseCoa: '' });
            fetchData();
        } catch (error: any) {
            toast.error("Gagal menyimpan: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const filteredVouchers = useMemo(() => {
        return vouchers.filter(v =>
            v.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [vouchers, searchQuery]);

    const totalThisMonth = useMemo(() => {
        const now = new Date();
        return vouchers
            .filter(v => new Date(v.date).getMonth() === now.getMonth())
            .reduce((sum, v) => sum + v.amount, 0);
    }, [vouchers]);

    return (
        <div className="p-8 space-y-8 max-w-[1400px] mx-auto min-h-screen font-sans">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <Receipt className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Operational Expenditure</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Voucher Biaya Operasional</h2>
                    <p className="text-slate-500 mt-1 font-medium text-sm">Pencatatan pengeluaran biaya operasional harian secara cash maupun bank.</p>
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-white border-2 border-slate-50 hover:border-indigo-100 px-5 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-600 transition-all shadow-sm">
                        <Download className="w-4 h-4" /> Ekspor Data
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-slate-900 text-white px-8 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-100"
                    >
                        <Plus className="w-4 h-4" /> Input Biaya Baru
                    </button>
                </div>
            </header>

            {/* Content & Filters */}
            <div className="bg-white border-2 border-slate-50 rounded-[40px] shadow-sm overflow-hidden">
                <div className="px-10 py-10 border-b-2 border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-50/20">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Cari Voucher, Keterangan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white border-2 border-slate-100 rounded-3xl py-4 pl-14 pr-8 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 transition-all min-w-[400px] shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="flex gap-8 items-center bg-slate-900 text-white px-10 py-5 rounded-[32px] shadow-2xl shadow-indigo-100">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Biaya Bulan Ini</p>
                            <p className="text-xl font-bold tracking-tighter">{formatIDR(totalThisMonth)}</p>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="flex items-center gap-3 text-indigo-400">
                            <Zap className="w-5 h-5" />
                            <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Budget Controller<br />Active & Secured</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-slate-50">
                                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">ID Voucher & Tanggal</th>
                                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Uraian & Kategori</th>
                                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Metode Pembayaran</th>
                                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Nominal</th>
                                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={5} className="p-10 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">Memuat voucher...</td></tr>
                            ) : filteredVouchers.map((v, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 w-fit uppercase tracking-widest mb-2">{v.id}</span>
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">{v.date}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border-2 border-slate-50 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all">
                                                <FileText className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-all uppercase tracking-tight leading-tight mb-2">{v.desc}</p>
                                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">{v.category}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                                                <CreditCard className="w-4 h-4" />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{v.payment}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-lg font-bold text-slate-900 tracking-tighter">{formatIDR(v.amount)}</span>
                                            <div className="flex items-center gap-1.5 mt-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Terjurnal Otomatis</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center justify-center gap-2">
                                            <button className="p-3 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl transition-all text-slate-400 shadow-sm active:scale-95">
                                                <Printer className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Input Biaya Baru */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="px-12 py-10 font-sans">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Input Biaya Operasional</h3>
                                    <p className="text-slate-500 text-[10px] font-bold mt-1 uppercase tracking-widest">Pencatatan Real-Time & Budget Control</p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center underline-none"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form className="space-y-6" onSubmit={handleSave}>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Uraian Pengeluaran</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.desc}
                                        onChange={e => setForm({ ...form, desc: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                                        placeholder="Contoh: Pembayaran Internet Kantor Mei"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kategori Biaya</label>
                                        <select
                                            required
                                            value={form.expenseCoa}
                                            onChange={e => setForm({ ...form, expenseCoa: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all appearance-none"
                                        >
                                            <option value="">Pilih Akun Beban...</option>
                                            {coas.filter(c => c.code.startsWith('6')).map(coa => (
                                                <option key={coa.id} value={coa.code}>{coa.code} - {coa.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tanggal Transaksi</label>
                                        <input
                                            type="date"
                                            required
                                            value={form.date}
                                            onChange={e => setForm({ ...form, date: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nominal (Rp)</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={form.amount}
                                            onChange={e => setForm({ ...form, amount: Number(e.target.value) })}
                                            className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-mono"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Akun Pembayaran</label>
                                        <select
                                            required
                                            value={form.paymentCoa}
                                            onChange={e => setForm({ ...form, paymentCoa: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all appearance-none"
                                        >
                                            <option value="">Pilih Akun Bayar...</option>
                                            {coas.filter(c => c.code.startsWith('1-100') || c.code.startsWith('1-101')).map(coa => (
                                                <option key={coa.id} value={coa.code}>{coa.code} - {coa.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-indigo-600 rounded-[32px] p-8 text-white flex items-start gap-4 mt-4 overflow-hidden relative group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                                    <div className="p-3 bg-white/10 rounded-2xl">
                                        <Zap className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-400 mb-1 font-sans">Sistem Budget Control Aktif</p>
                                        <p className="text-xs text-indigo-100/70 leading-relaxed font-medium font-sans">Sistem akan memeriksa sisa anggaran secara otomatis. Transaksi yang melebihi pagu anggaran akan memerlukan konfirmasi tambahan.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-10">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-5 bg-slate-100 text-slate-600 font-bold text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all font-sans"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-[2] py-5 bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-100 hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-50 font-sans"
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Simpan & Posting Jurnal'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
