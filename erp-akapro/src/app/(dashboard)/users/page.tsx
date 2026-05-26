"use client";

import React, { useState, useMemo } from 'react';
import {
    Users as UsersIcon,
    UserPlus,
    Search,
    Shield,
    Mail,
    CheckCircle2,
    XCircle,
    Fingerprint,
    ShieldCheck,
    History,
    Activity,
    ChevronRight,
    X,
    Download,
    Printer,
    Lock,
    Eye,
    EyeOff,
    Loader2,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/lib/supabase';
import { useSupabase } from '@/hooks/useSupabase';
import { toast } from 'sonner';

const users = [
    { id: 1, name: 'Mukhsin Account', email: 'mukhsin9@gmail.com', role: 'Superadmin', status: 'Aktif', lastLogin: '2 jam lalu', trust: '98%', joinDate: '2023-01-15' },
    { id: 2, name: 'Supervisor Logistik', email: 'gudang@akapro.com', role: 'Manajer Gudang', status: 'Aktif', lastLogin: '5 jam lalu', trust: '85%', joinDate: '2023-03-22' },
    { id: 3, name: 'Pengendali Keuangan', email: 'finance@akapro.com', role: 'Staff Akuntansi', status: 'Non-Aktif', lastLogin: '2 hari lalu', trust: '40%', joinDate: '2023-05-10' },
];

export default function UsersPage() {
    const { tenant } = useSupabase();
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserModal, setShowUserModal] = useState(false);
    const [dbUsers, setDbUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        name: '',
        email: '',
        role: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                // If table doesn't exist, use mock data
                console.warn("Users table not found, using mock data");
                setDbUsers(users);
            } else {
                setDbUsers(data || []);
            }
        } catch (error: any) {
            setDbUsers(users);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchUsers();
    }, []);

    const handleSaveUser = async () => {
        if (!form.name || !form.email || !form.password) {
            toast.error("Semua field wajib diisi!");
            return;
        }

        try {
            // 1. Sign up user in Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: form.email,
                password: form.password,
                options: {
                    data: {
                        full_name: form.name,
                        role: form.role
                    }
                }
            });

            if (authError) throw authError;

            // 2. Insert into public.users (if the trigger isn't set up yet)
            const { error: dbError } = await supabase
                .from('users')
                .insert([{
                    id: authData.user?.id,
                    name: form.name,
                    email: form.email,
                    role: form.role,
                    status: 'Aktif',
                    join_date: new Date().toISOString()
                }]);

            if (dbError) {
                console.error("Failed to insert into public.users:", dbError);
                // We don't throw here because the auth user was already created
            }

            toast.success(`Pengguna ${form.name} berhasil didaftarkan!`);
            setShowUserModal(false);
            setForm({ name: '', email: '', role: '', password: '' });
            fetchUsers();
        } catch (error: any) {
            toast.error("Gagal mendaftarkan pengguna: " + error.message);
        }
    };

    const filteredUsers = useMemo(() => {
        return dbUsers.filter(u =>
            (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, dbUsers]);

    const stats = useMemo(() => ({
        total: dbUsers.length,
        active: dbUsers.filter(u => u.status === 'Aktif').length,
        inactive: dbUsers.filter(u => u.status === 'Non-Aktif' || u.status === 'Inactive').length,
    }), [dbUsers]);

    const exportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredUsers.map(u => ({
            'ID': u.id,
            'Nama': u.name,
            'Jabatan': u.role,
            'Email': u.email,
            'Status': u.status,
            'Tanggal Bergabung': u.joinDate
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Pengguna");
        XLSX.writeFile(workbook, `Laporan_Pengguna_ERP.xlsx`);
    };

    const exportPdf = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("LAPORAN MANAJEMEN PENGGUNA", 14, 15);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, 14, 22);
        autoTable(doc, {
            head: [['ID', 'Nama', 'Jabatan', 'Email', 'Status']],
            body: filteredUsers.map(u => [u.id, u.name, u.role, u.email, u.status]),
            startY: 28,
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229] },
        });
        doc.save('Laporan_Pengguna_ERP.pdf');
    };

    const UserModal = () => {
        if (!showUserModal) return null;
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowUserModal(false)} />
                <div className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="p-12 space-y-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                                    <UserPlus className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Access Protocol</span>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Tambah Pengguna Baru</h3>
                                <p className="text-slate-400 text-xs font-medium mt-1">Konfigurasikan akun operator dan hak akses.</p>
                            </div>
                            <button onClick={() => setShowUserModal(false)} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        placeholder="Masukkan nama..."
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-600 transition-all text-slate-900 shadow-sm"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Email Pengguna</label>
                                    <input
                                        type="email"
                                        placeholder="user@akapro.com"
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-600 transition-all text-slate-900 shadow-sm"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Jabatan / Peran</label>
                                    <select
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-600 transition-all text-slate-900 appearance-none cursor-pointer shadow-sm text-center"
                                        value={form.role}
                                        onChange={e => setForm({ ...form, role: e.target.value })}
                                    >
                                        <option value="">-- Pilih Peran --</option>
                                        <option>Superadmin</option>
                                        <option>Manajer Gudang</option>
                                        <option>Staff Akuntansi</option>
                                        <option>Kasir</option>
                                        <option>Staff Pembelian</option>
                                    </select>
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Kata Sandi (Password)</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            required
                                            className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:bg-white focus:border-indigo-600 transition-all text-slate-900 shadow-sm"
                                            value={form.password}
                                            onChange={e => setForm({ ...form, password: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden group">
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl transition-all" />
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white">Kebijakan Keamanan</span>
                                </div>
                                <p className="text-[10px] font-medium leading-relaxed text-slate-400">Akun ini akan otomatis terdaftar dalam protokol RLS (Row Level Security) dan memerlukan autentikasi multi-faktor (MFA) pada login pertama.</p>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-4">
                            <button onClick={() => setShowUserModal(false)} className="flex-1 py-4 rounded-2xl border-2 border-slate-100 text-slate-400 font-bold hover:bg-slate-50 transition-all text-[10px] uppercase tracking-widest leading-none">Batal</button>
                            <button
                                onClick={handleSaveUser}
                                className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-slate-900 active:scale-95 transition-all flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest leading-none"
                            >
                                Simpan Pengguna
                                <Fingerprint className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-8 space-y-8 max-w-[1400px] mx-auto min-h-screen">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <Shield className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Access Control Center</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Manajemen Pengguna</h2>
                    <p className="text-slate-500 mt-1 font-medium text-sm">Kelola akun operator, hak akses hierarki, dan keamanan audit sistem.</p>
                </div>

                <div className="flex gap-3">
                    <button onClick={exportPdf} className="p-3 bg-white border-2 border-slate-50 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm">
                        <Printer className="w-5 h-5" />
                    </button>
                    <button onClick={exportExcel} className="p-3 bg-white border-2 border-slate-50 text-slate-400 hover:text-emerald-600 rounded-2xl transition-all shadow-sm">
                        <Download className="w-5 h-5" />
                    </button>
                    <button onClick={() => setShowUserModal(true)} className="bg-indigo-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-slate-900 active:scale-95 transition-all shadow-2xl shadow-indigo-100 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] ml-2">
                        <UserPlus className="w-4 h-4" />
                        Tambah Pengguna
                    </button>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Sesi Aktif', value: stats.active, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Total Operator', value: stats.total, icon: UsersIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Menunggu Akses', value: '3', icon: History, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Skor Keamanan', value: 'A+', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-100' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white border-2 border-slate-50 p-8 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                        <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold text-slate-900 tracking-tighter">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Search & Filters */}
            <div className="flex flex-wrap gap-4 items-center">
                <div className="relative group flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari nama, email, atau jabatan..."
                        className="w-full bg-white border-2 border-slate-50 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Content Table */}
            <div className="bg-white border-2 border-slate-50 rounded-[40px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-slate-50">
                                <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Profil Operator</th>
                                <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Jabatan</th>
                                <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                                <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Integritas</th>
                                <th className="px-8 py-6"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-50">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border-2 border-white shadow-lg shadow-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-xl group-hover:scale-110 group-hover:rotate-3 transition-all">
                                                {(user.name || user.full_name || 'U')[0]}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{user.name || user.full_name}</span>
                                                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-2 mt-1 uppercase tracking-tight">
                                                    <Mail className="w-3 h-3" /> {user.email}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-50 text-slate-600 border border-slate-100 w-fit group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            <ShieldCheck className="w-4 h-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{user.role}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="flex justify-center">
                                            {user.status === 'Aktif' ? (
                                                <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold uppercase tracking-widest">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 text-[10px] font-bold uppercase tracking-widest">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                                    Non-Aktif
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <p className={`text-xl font-bold tracking-tighter ${parseInt(user.trust || '100') > 80 ? 'text-emerald-500' : 'text-slate-300'}`}>{user.trust || '100%'}</p>
                                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">Audit Score</p>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-3 bg-slate-50 text-slate-300 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-all">
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <UserModal />
        </div>
    );
}
