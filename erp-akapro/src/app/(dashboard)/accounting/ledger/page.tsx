"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
    FileText,
    Search,
    Filter,
    Download,
    Calendar,
    ChevronDown,
    ArrowUpRight,
    ArrowDownRight,
    Printer,
    FileSpreadsheet,
    Loader2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/lib/supabase';
import { useSupabase } from '@/hooks/useSupabase';
import { toast } from 'sonner';

export default function LedgerPage() {
    const { tenant } = useSupabase();
    const [ledgerData, setLedgerData] = useState<any[]>([]);
    const [coa, setCoa] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [period, setPeriod] = useState(new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }));

    const fetchLedger = async () => {
        if (!tenant) return;
        try {
            setLoading(true);

            // 1. Fetch CoA to group by accounts
            const { data: coaData } = await supabase
                .from('chart_of_accounts')
                .select('id, code, name')
                .order('code', { ascending: true });

            setCoa(coaData || []);

            // 2. Fetch all GL entries
            const { data: glData, error } = await supabase
                .from('accounting_general_ledger')
                .select(`
                    id,
                    coa_id,
                    debit,
                    credit,
                    created_at,
                    journal:journal_id (
                        reference_no,
                        description,
                        transaction_date
                    )
                `)
                .order('created_at', { ascending: true });

            if (error) throw error;

            // 3. Group by Account
            const grouped = (coaData || []).map(acc => {
                const entries = (glData || [])
                    .filter((entry: any) => entry.coa_id === acc.id)
                    .map((entry: any) => ({
                        id: entry.id,
                        date: entry.journal?.transaction_date || entry.created_at,
                        desc: entry.journal?.description || '-',
                        ref: entry.journal?.reference_no || '-',
                        debit: Number(entry.debit) || 0,
                        credit: Number(entry.credit) || 0,
                    }));

                // Calculate running balance
                let balance = 0;
                const transactions = entries.map(t => {
                    balance += (t.debit - t.credit);
                    return { ...t, balance };
                });

                return {
                    accountCode: acc.code,
                    accountName: acc.name,
                    transactions
                };
            }).filter(group => group.transactions.length > 0);

            setLedgerData(grouped);
        } catch (error: any) {
            toast.error("Gagal memuat buku besar: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tenant) {
            fetchLedger();
        }
    }, [tenant]);

    const filteredData = useMemo(() => {
        return ledgerData.map(group => ({
            ...group,
            transactions: group.transactions.filter((t: any) =>
                t.desc.toLowerCase().includes(search.toLowerCase()) ||
                t.ref.toLowerCase().includes(search.toLowerCase()) ||
                group.accountName.toLowerCase().includes(search.toLowerCase()) ||
                group.accountCode.toLowerCase().includes(search.toLowerCase())
            )
        })).filter(group => group.transactions.length > 0);
    }, [search, ledgerData]);

    const formatIDR = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(val);
    };

    const exportToExcel = () => {
        const flatData = filteredData.flatMap(group =>
            group.transactions.map((t: any) => ({
                'Kode Akun': group.accountCode,
                'Nama Akun': group.accountName,
                Tanggal: t.date,
                Keterangan: t.desc,
                Referensi: t.ref,
                Debit: t.debit,
                Kredit: t.credit,
                Saldo: t.balance
            }))
        );
        const worksheet = XLSX.utils.json_to_sheet(flatData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Buku Besar");
        XLSX.writeFile(workbook, `Buku_Besar_Export.xlsx`);
    };

    const totalDebit = filteredData.reduce((acc, g) => acc + g.transactions.reduce((st: number, t: any) => st + t.debit, 0), 0);
    const totalCredit = filteredData.reduce((acc, g) => acc + g.transactions.reduce((st: number, t: any) => st + t.credit, 0), 0);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto min-h-screen">
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <FileText className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Accounting System</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Buku Besar (General Ledger)</h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Laporan historis transaksi terperinci per akun buku besar.</p>
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[32px] border-2 border-slate-50 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Mutasi Debit</p>
                        <p className="text-3xl font-black text-slate-900 mt-2 tracking-tighter">{formatIDR(totalDebit)}</p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-100/50"><ArrowUpRight className="w-8 h-8" /></div>
                </div>
                <div className="bg-white p-8 rounded-[32px] border-2 border-slate-50 shadow-sm flex items-center justify-between group hover:border-rose-200 transition-all">
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Mutasi Kredit</p>
                        <p className="text-3xl font-black text-slate-900 mt-2 tracking-tighter">{formatIDR(totalCredit)}</p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform shadow-lg shadow-rose-100/50"><ArrowDownRight className="w-8 h-8" /></div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-[32px] border-2 border-slate-50 shadow-sm">
                <div className="relative group flex-1 max-w-md">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari akun, keterangan, atau referensi..."
                        className="w-full bg-slate-50 border-2 border-transparent rounded-[20px] py-4 pl-12 pr-6 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white shadow-sm transition-all" />
                </div>
                <div className="flex gap-3 ml-auto">
                    <button onClick={exportToExcel} className="flex items-center gap-3 bg-slate-900 hover:bg-emerald-600 text-white px-6 py-4 rounded-[20px] text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all active:scale-95">
                        <FileSpreadsheet className="w-4 h-4" /> EXCEL REPORT
                    </button>
                </div>
            </div>

            {/* Account Groups */}
            <div className="space-y-8 pb-20">
                {filteredData.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[40px] border-2 border-slate-50">
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">Buku besar kosong atau tidak ada transaksi ditemukan.</p>
                    </div>
                ) : filteredData.map((group) => (
                    <div key={group.accountCode} className="bg-white border-2 border-slate-50 rounded-[40px] shadow-2xl shadow-slate-100/30 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="px-10 py-8 bg-slate-50/50 border-b-2 border-slate-50 flex justify-between items-center">
                            <div className="flex items-center gap-6">
                                <div className="px-4 py-2 bg-indigo-600 text-white text-[11px] font-black rounded-xl shadow-lg shadow-indigo-100 uppercase tracking-tighter">
                                    {group.accountCode}
                                </div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{group.accountName}</h3>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Saldo Akhir Berjalan</p>
                                <p className={`text-xl font-black font-mono tracking-tighter ${group.transactions[group.transactions.length - 1]?.balance >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                                    {formatIDR(group.transactions[group.transactions.length - 1]?.balance || 0)}
                                </p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b-2 border-slate-50/50">
                                        <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tanggal</th>
                                        <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Keterangan Jurnal</th>
                                        <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Referansi</th>
                                        <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Debit</th>
                                        <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Kredit</th>
                                        <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right bg-slate-50/30">Saldo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-slate-50">
                                    {group.transactions.map((t: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-10 py-6 text-[11px] font-bold text-slate-400 uppercase">{new Date(t.date).toLocaleDateString('id-ID')}</td>
                                            <td className="px-10 py-6 text-xs font-bold text-slate-700 uppercase leading-relaxed max-w-sm">{t.desc}</td>
                                            <td className="px-10 py-6 text-center">
                                                <span className="text-[10px] font-black px-3 py-1.5 rounded-lg bg-white border-2 border-slate-50 text-slate-500 uppercase tracking-tighter shadow-sm group-hover:border-indigo-100 transition-colors">
                                                    {t.ref}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6 text-xs text-right font-black font-mono text-emerald-600">
                                                {t.debit > 0 ? formatIDR(t.debit) : '-'}
                                            </td>
                                            <td className="px-10 py-6 text-xs text-right font-black font-mono text-rose-600">
                                                {t.credit > 0 ? formatIDR(t.credit) : '-'}
                                            </td>
                                            <td className={`px-10 py-6 text-xs text-right font-black font-mono bg-slate-50/10 ${t.balance >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                                                {formatIDR(t.balance)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
