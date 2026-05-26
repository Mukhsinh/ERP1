"use client";

import React, { useState, useEffect } from 'react';
import {
    Calculator,
    Layers,
    ArrowRight,
    Plus,
    Search,
    ChevronDown,
    Save,
    Send,
    X,
    TrendingUp
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSupabase } from '@/hooks/useSupabase';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download } from 'lucide-react';

export default function BudgetPlanningPage() {
    const { tenant } = useSupabase();
    const [loading, setLoading] = useState(false);
    const [fiscalYear, setFiscalYear] = useState<any>(null);
    const [budgetItems, setBudgetItems] = useState<any[]>([]);
    const [coas, setCoas] = useState<any[]>([]);

    useEffect(() => {
        if (tenant) {
            fetchData();
        }
    }, [tenant]);

    const fetchData = async () => {
        // 1. Get active fiscal year
        const { data: fy } = await supabase
            .from('budget_fiscal_years')
            .select('*')
            .eq('is_active', true)
            .maybeSingle();
        setFiscalYear(fy);

        if (fy) {
            // 2. Get existing items for this FY
            const { data: items } = await supabase
                .from('budget_items')
                .select('*')
                .eq('fiscal_year_id', fy.id);
            if (items && items.length > 0) {
                setBudgetItems(items);
            }
        }

        // 3. Get Expense COAs (typically start with 5 or 6 in standard systems)
        const { data: coaData } = await supabase
            .from('chart_of_accounts')
            .select('*')
            .or('code.ilike.5%,code.ilike.6%')
            .order('code', { ascending: true });
        setCoas(coaData || []);
    };

    const addLine = () => {
        setBudgetItems([...budgetItems, { coa_id: '', allocated_amount: 0, status: 'DRAFT' }]);
    };

    const removeLine = (index: number) => {
        setBudgetItems(budgetItems.filter((_, i) => i !== index));
    };

    const handleSave = async (isSubmission = false) => {
        if (!tenant || !fiscalYear) {
            toast.error("Tahun fiskal aktif tidak ditemukan.");
            return;
        }

        setLoading(true);
        try {
            const itemsToSave = budgetItems.map(item => ({
                tenant_id: tenant.id,
                fiscal_year_id: fiscalYear.id,
                coa_id: item.coa_id,
                allocated_amount: item.allocated_amount,
                actual_amount: item.actual_amount || 0,
                committed_amount: item.committed_amount || 0,
                status: isSubmission ? 'PROPOSED' : 'DRAFT'
            }));

            // In a real scenario, we might want to upsert or clear and re-insert
            // For simplicity here, we'll try to insert/update
            const { error: upsertError } = await supabase
                .from('budget_items')
                .upsert(itemsToSave, { onConflict: 'fiscal_year_id,coa_id' });

            if (upsertError) throw upsertError;

            if (isSubmission) {
                await supabase.from('budget_approvals').insert({
                    tenant_id: tenant.id,
                    fiscal_year_id: fiscalYear.id,
                    status: 'PENDING',
                    comments: 'Pengajuan anggaran baru'
                });
            }

            toast.success(isSubmission ? "Anggaran berhasil diajukan untuk review." : "Draft anggaran berhasil disimpan.");
            fetchData();
        } catch (error: any) {
            toast.error("Gagal menyimpan: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const exportToPDF = () => {
        if (budgetItems.length === 0) {
            toast.error("Tidak ada data untuk diekspor.");
            return;
        }

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Perencanaan Anggaran - ERP AKAPRO', 14, 22);
        doc.setFontSize(11);
        doc.text(`Tahun Fiskal: ${fiscalYear?.year_name || 'N/A'}`, 14, 30);

        const tableData = budgetItems.map(item => {
            const coa = coas.find(c => c.id === item.coa_id);
            return [
                coa ? `${coa.code} - ${coa.name}` : item.coa_id,
                formatIDR(item.allocated_amount),
                item.status || 'DRAFT'
            ];
        });

        autoTable(doc, {
            startY: 40,
            head: [['Akun COA', 'Alokasi Dana', 'Status']],
            body: tableData,
            headStyles: { fillColor: [79, 70, 229] }
        });

        doc.save(`Budget_Planning_${fiscalYear?.year_name}.pdf`);
        toast.success("PDF berhasil diunduh.");
    };

    const formatIDR = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
    };

    const totalProposed = budgetItems.reduce((sum, item) => sum + Number(item.allocated_amount), 0);

    return (
        <div className="p-8 bg-slate-50 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Perencanaan Anggaran</h1>
                        <p className="text-slate-500 mt-1">
                            {fiscalYear ? `Periode Aktif: ${fiscalYear.year_name} (${fiscalYear.start_date} s/d ${fiscalYear.end_date})` : 'Belum ada tahun fiskal aktif.'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={exportToPDF}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold shadow-sm hover:bg-slate-50 transition-all text-xs"
                        >
                            <Download className="w-4 h-4" />
                            Unduh PDF
                        </button>
                        <button
                            onClick={() => handleSave(false)}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold shadow-sm hover:bg-slate-50 transition-all disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            Simpan Draft
                        </button>
                        <button
                            onClick={() => handleSave(true)}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" />
                            Ajukan Review
                        </button>
                    </div>
                </div>

                {/* Planning Setup */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-slate-900">Alokasi per Akun (CoA)</h2>
                            <button
                                onClick={addLine}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-all"
                            >
                                <Plus className="w-4 h-4" /> Tambah Baris
                            </button>
                        </div>

                        <div className="space-y-4">
                            {budgetItems.map((item, i) => (
                                <div key={i} className="group p-5 bg-slate-50/50 hover:bg-white border hover:border-indigo-100 border-slate-100 rounded-2xl transition-all relative">
                                    <button
                                        onClick={() => removeLine(i)}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-rose-50 text-rose-500 rounded-full border border-rose-100 items-center justify-center hidden group-hover:flex"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase ml-1">Akun Pengeluaran (COA)</p>
                                            <select
                                                value={item.coa_id}
                                                onChange={e => {
                                                    const newItems = [...budgetItems];
                                                    newItems[i].coa_id = e.target.value;
                                                    setBudgetItems(newItems);
                                                }}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500"
                                            >
                                                <option value="">Pilih Akun...</option>
                                                {coas.map(c => (
                                                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase ml-1">Anggaran Dialokasikan (Rp)</p>
                                            <input
                                                type="number"
                                                value={item.allocated_amount}
                                                onChange={e => {
                                                    const newItems = [...budgetItems];
                                                    newItems[i].allocated_amount = Number(e.target.value);
                                                    setBudgetItems(newItems);
                                                }}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {budgetItems.length === 0 && (
                                <div className="text-center py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
                                    <Calculator className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                    <p className="text-sm text-slate-400 font-medium">Belum ada alokasi. Klik 'Tambah Baris' untuk memulai.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[32px] text-white shadow-xl shadow-indigo-100 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-8 -mr-8 -mt-8 bg-white/10 rounded-full w-32 h-32 blur-2xl group-hover:scale-150 transition-all" />
                            <TrendingUp className="w-8 h-8 mb-4 opacity-50" />
                            <h2 className="text-xl font-bold mb-2">Simulasi Anggaran</h2>
                            <p className="text-sm text-indigo-100 mb-6 font-medium leading-relaxed">Gunakan sisa saldo tahun lalu atau lakukan kenaikan (%) masal secara otomatis.</p>
                            <button className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                                Run Smart Calculation <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden">
                            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <div className="w-2 h-6 bg-indigo-600 rounded-full" />
                                Ringkasan Alokasi
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-slate-500 font-medium">Beban Operasional</span>
                                    <span className="text-sm font-bold text-slate-900">{formatIDR(totalProposed)}</span>
                                </div>
                                <div className="pt-4 border-t border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Total Pengajuan</span>
                                        <span className="text-xl font-black text-indigo-600 tracking-tighter">{formatIDR(totalProposed)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
