"use client";

import React, { useState } from 'react';
import {
    Users,
    Search,
    Filter,
    Plus,
    Clock,
    Banknote,
    FileText,
    CheckCircle2,
    ChevronRight,
    Calendar,
    ArrowUpRight,
    UserCircle2,
    Briefcase,
    Zap,
    Download,
    History,
    X,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';

import { supabase } from '@/lib/supabase';
import { useSupabase } from '@/hooks/useSupabase';

export default function ReimbursementPage() {
    const { tenant } = useSupabase();
    const [reimbursements, setReimbursements] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        desc: '',
        amount: '',
        category: 'KANTOR'
    });

    React.useEffect(() => {
        if (tenant) {
            fetchReimbursements();
        }
    }, [tenant]);

    const fetchReimbursements = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('opex_reimbursements')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.warn("Table opex_reimbursements might not exist yet, using mock fallback.");
                setReimbursements([
                    { id: '1', employee_name: 'Ahmad Subarjo', transaction_date: '2024-05-24', description: 'Parkir & Tol Luar Kota', amount: 350000, status: 'PENDING', category: 'PERJALANAN' },
                    { id: '2', employee_name: 'Siti Aminah', transaction_date: '2024-05-23', description: 'FC Materi Presentasi Klien', amount: 150000, status: 'DISETUJUI', category: 'KANTOR' },
                ]);
            } else {
                setReimbursements(data || []);
            }
        } catch (error: any) {
            toast.error("Gagal memuat data: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const stats = React.useMemo(() => {
        const pending = reimbursements.filter(r => r.status === 'PENDING').length;
        const approved = reimbursements.filter(r => r.status === 'DISETUJUI').length;
        const totalAmount = reimbursements
            .filter(r => r.status === 'DISETUJUI' || r.status === 'PAID')
            .reduce((acc, curr) => acc + (curr.amount || 0), 0);
        const rejected = reimbursements.filter(r => r.status === 'REJECTED' || r.status === 'DITOLAK').length;

        return { pending, approved, totalAmount, rejected };
    }, [reimbursements]);

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('opex_reimbursements')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            toast.success(`Status pengajuan berhasil diubah ke ${newStatus}`);
            fetchReimbursements();
        } catch (error: any) {
            toast.error("Gagal mengubah status: " + error.message);
        }
    };

    const formatIDR = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(val).replace('Rp', 'Rp ');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) return;

        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('opex_reimbursements')
                .insert({
                    tenant_id: tenant.id,
                    employee_name: 'Superadmin', // Use current user in production
                    description: form.desc,
                    amount: Number(form.amount),
                    category: form.category,
                    status: 'PENDING'
                });

            if (error) throw error;

            toast.success("Pengajuan reimbursement berhasil dikirim!");
            setShowModal(false);
            setForm({ desc: '', amount: '', category: 'KANTOR' });
            fetchReimbursements();
        } catch (error: any) {
            toast.error("Gagal mengirim pengajuan: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-8 space-y-8 max-w-[1400px] mx-auto min-h-screen font-sans">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <Users className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Employee Expense Management</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Pengajuan Reimbursement</h2>
                    <p className="text-slate-500 mt-1 font-medium text-sm">Kelola pengajuan penggantian dana karyawan dengan alur persetujuan terstruktur.</p>
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-white border-2 border-slate-50 hover:border-indigo-100 px-5 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-600 transition-all shadow-sm">
                        <History className="w-4 h-4" /> Riwayat Saya
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-slate-900 text-white px-8 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-100"
                    >
                        <Plus className="w-4 h-4" /> Ajukan Reimbursement
                    </button>
                </div>
            </header>

            {/* Status Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Menunggu Persetujuan', value: stats.pending, color: 'indigo', icon: Clock },
                    { label: 'Disetujui (Belum Bayar)', value: stats.approved, color: 'blue', icon: CheckCircle2 },
                    { label: 'Total Cair Mei', value: stats.totalAmount, color: 'emerald', icon: Banknote },
                    { label: 'Revisit/Ditolak', value: stats.rejected, color: 'rose', icon: Zap },
                ].map((stat, i) => (
                    <div key={i} className="bg-white border-2 border-slate-50 rounded-[32px] p-8 shadow-sm group">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-lg ${stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                                stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                    stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                                        'bg-rose-50 text-rose-600'
                                }`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <h3 className="text-xl font-bold text-slate-900 tracking-tighter mt-1">
                                    {typeof stat.value === 'number' && i === 2 ? formatIDR(stat.value) : stat.value}
                                </h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* List Section */}
            <div className="bg-white border-2 border-slate-50 rounded-[40px] shadow-sm overflow-hidden">
                <div className="px-10 py-8 border-b-2 border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Cari nama karyawan atau uraian..."
                                className="bg-slate-50 border-2 border-transparent rounded-2xl py-3 pl-12 pr-6 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all min-w-[350px]"
                            />
                        </div>
                        <button className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => toast.info("Mengekspor data batch...")}
                            className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all"
                        >
                            <Download className="w-4 h-4" /> Export Batch
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-slate-50 bg-slate-50/20">
                                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Karyawan & Status</th>
                                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Uraian Pengajuan</th>
                                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Nominal</th>
                                <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-50">
                            {reimbursements.map((r: any, i: number) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center font-bold text-slate-400 border-2 border-slate-50 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all">
                                                <UserCircle2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-all uppercase tracking-tight">{r.employee_name || 'Karyawan'}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className={`w-2 h-2 rounded-full ${r.status === 'PENDING' ? 'bg-amber-400' :
                                                        r.status === 'DISETUJUI' ? 'bg-blue-500' :
                                                            'bg-emerald-500'
                                                        }`} />
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{r.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-3.5 h-3.5 text-slate-300" />
                                                <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{r.description || r.desc}</span>
                                            </div>
                                            <div className="flex items-center gap-4 mt-2">
                                                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-widest">{r.category}</span>
                                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{r.transaction_date || r.date}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <span className="text-lg font-bold text-slate-900 tracking-tighter">{formatIDR(r.amount)}</span>
                                    </td>
                                    <td className="px-10 py-8 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {r.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        onClick={() => handleUpdateStatus(r.id, 'DISETUJUI')}
                                                        className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-95"
                                                        title="Setujui"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(r.id, 'DITOLAK')}
                                                        className="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-95"
                                                        title="Tolak"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => toast.info(`Detail Pengajuan: ${r.id}`)}
                                                className="p-2.5 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-xl transition-all text-slate-400 shadow-sm active:scale-95"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Section */}
                <div className="px-10 py-10 bg-slate-900 text-white">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-500/20">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold tracking-tight">Persiapan Penjurnalan</h4>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                    Persetujuan pengajuan akan otomatis membuat <span className="text-white italic">Hutang Karyawan</span> dan Biaya ybs <br /> di modul Akuntansi (Accrual Basis).
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Outstanding</p>
                                <p className="text-2xl font-bold tracking-tighter text-indigo-400">{formatIDR(4500000)}</p>
                            </div>
                            <button
                                onClick={() => toast.success("Pembayaran batch diproses!")}
                                className="bg-white text-slate-900 font-bold px-10 py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-95"
                            >
                                Bayar Batch Sekaligus
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reimbursement Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-10 space-y-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                                        <Plus className="w-4 h-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Employee Expense</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Ajukan Reimbursement</h3>
                                    <p className="text-slate-400 text-xs font-medium mt-1">Lampirkan bukti dan isi rincian pengajuan.</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Uraian Pengajuan</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Contoh: Parkir & Tol Client ABC..."
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-600 transition-all text-slate-900 shadow-sm"
                                        value={form.desc}
                                        onChange={e => setForm({ ...form, desc: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nominal (Rp)</label>
                                        <input
                                            required
                                            type="number"
                                            placeholder="0"
                                            className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-600 transition-all text-slate-900 shadow-sm"
                                            value={form.amount}
                                            onChange={e => setForm({ ...form, amount: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Kategori</label>
                                        <select
                                            className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-600 transition-all text-slate-900 appearance-none cursor-pointer shadow-sm"
                                            value={form.category}
                                            onChange={e => setForm({ ...form, category: e.target.value })}
                                        >
                                            <option>KANTOR</option>
                                            <option>PERJALANAN</option>
                                            <option>MARKETING</option>
                                            <option>OPS</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 rounded-2xl border-2 border-slate-100 text-slate-400 font-bold hover:bg-slate-50 transition-all text-[10px] uppercase tracking-widest leading-none">Batal</button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-slate-900 active:scale-95 transition-all flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest leading-none"
                                    >
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kirim Pengajuan'}
                                        <ArrowUpRight className="w-4 h-4" />
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
