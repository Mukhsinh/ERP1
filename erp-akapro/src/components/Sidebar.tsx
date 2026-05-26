"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    BookOpen,
    Warehouse,
    ShoppingCart,
    Truck,
    Banknote,
    Wallet,
    Users,
    Settings,
    ChevronRight,
    ChevronDown,
    Database,
    BarChart3,
    FileText,
    Calculator,
    Package,
    ArrowLeftRight,
    UserCheck,
    Receipt,
    CreditCard,
    Headphones,
    LogOut,
    ShieldCheck,
    Zap,
    History,
    Activity,
    ArrowUpRight,
} from 'lucide-react';

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}

interface MenuItem {
    name: string;
    icon: React.ElementType;
    href: string;
}

interface MenuGroup {
    title: string;
    icon: React.ElementType;
    items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
    {
        title: 'Penganggaran',
        icon: Activity,
        items: [
            { name: 'Konfigurasi Budget', icon: Settings, href: '/budgeting/config' },
            { name: 'Perencanaan Budget', icon: Calculator, href: '/budgeting/planning' },
            { name: 'Workflow Approval', icon: UserCheck, href: '/budgeting/approval' },
            { name: 'Revisi & Amandemen', icon: History, href: '/budgeting/revision' },
            { name: 'Monitoring & Analisis', icon: BarChart3, href: '/budgeting/monitoring' },
        ],
    },
    {
        title: 'Manajemen Penjualan',
        icon: ShoppingCart,
        items: [
            { name: 'Daftar Pelanggan', icon: Users, href: '/sales/pelanggan' },
            { name: 'Pesanan Penjualan', icon: ShoppingCart, href: '/sales/orders' },
            { name: 'Faktur & Piutang', icon: Receipt, href: '/sales/invoices' },
            { name: 'Piutang Usaha', icon: CreditCard, href: '/sales/piutang-usaha' },
            { name: 'Prospek Pelanggan', icon: UserCheck, href: '/sales/leads' },
            { name: 'Kasir (POS)', icon: Wallet, href: '/pos' },
        ],
    },
    {
        title: 'Manajemen Pembelian',
        icon: Truck,
        items: [
            { name: 'Daftar Supplier', icon: Users, href: '/procurement/suppliers' },
            { name: 'Pesanan Pembelian', icon: Truck, href: '/procurement/po' },
            { name: 'Hutang Dagang', icon: CreditCard, href: '/procurement/payables' },
        ],
    },
    {
        title: 'Manajemen Aset',
        icon: Package,
        items: [
            { name: 'Register Aset', icon: Database, href: '/assets/register' },
            { name: 'Pelepasan Aset', icon: ArrowUpRight, href: '/assets/disposal' },
            { name: 'Penyusutan Aset', icon: Calculator, href: '/assets/depreciation' },
        ],
    },
    {
        title: 'Manajemen Gudang',
        icon: Warehouse,
        items: [
            { name: 'Data Barang', icon: Package, href: '/warehouse/items' },
            { name: 'Saldo Awal Barang', icon: FileText, href: '/warehouse/beginning-inventory' },
            { name: 'Mutasi Barang', icon: ArrowLeftRight, href: '/warehouse/mutations' },
            { name: 'Stok Barang', icon: Warehouse, href: '/warehouse/stocks' },
            { name: 'Analisa Stok Barang', icon: BarChart3, href: '/warehouse/stock-analysis' },
        ],
    },
    {
        title: 'Manajemen Biaya',
        icon: Receipt,
        items: [
            { name: 'Voucher OPEX', icon: FileText, href: '/opex/vouchers' },
            { name: 'Reimbursement', icon: Banknote, href: '/opex/reimbursement' },
        ],
    },
    {
        title: 'Manajemen Kas',
        icon: Wallet,
        items: [
            { name: 'Kondisi Kas', icon: Activity, href: '/cash-management' },
            { name: 'Pergeseran Kas', icon: ArrowLeftRight, href: '/cash-management/transfer' },
            { name: 'Buku Kas Pembantu', icon: History, href: '/cash-management/ledger' },
        ],
    },
    {
        title: 'Akuntansi',
        icon: Database,
        items: [
            { name: 'Bagan Akun (CoA)', icon: BookOpen, href: '/accounting/coa' },
            { name: 'Jurnal Umum', icon: Receipt, href: '/accounting/journals' },
            { name: 'Buku Besar', icon: FileText, href: '/accounting/ledger' },
            { name: 'Neraca Lajur', icon: Calculator, href: '/accounting/worksheet' },
            { name: 'Laporan Keuangan', icon: BarChart3, href: '/accounting/reports' },
        ],
    },
    {
        title: 'Manajemen Retensi',
        icon: Headphones,
        items: [
            { name: 'CRM Dashboard', icon: LayoutDashboard, href: '/crm' },
            { name: 'Tiket Bantuan', icon: Headphones, href: '/crm/tickets' },
        ],
    },
    {
        title: 'Administrasi',
        icon: ShieldCheck,
        items: [
            { name: 'Manajemen Pengguna', icon: Users, href: '/users' },
            { name: 'Pengaturan Sistem', icon: Settings, href: '/settings' },
            { name: 'Audit Trail', icon: History, href: '/admin/audit' },
        ],
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
        Object.fromEntries(menuGroups.map(g => [g.title, false]))
    );

    const toggleGroup = (title: string) => {
        setExpandedGroups(prev => ({ ...prev, [title]: !prev[title] }));
    };

    const isDashboardActive = pathname === '/';

    return (
        <aside className="w-[270px] h-screen bg-white flex flex-col border-r border-slate-200 fixed left-0 top-0 z-50 shadow-lg font-sans">
            {/* Logo */}
            <div className="px-7 pt-8 pb-6">
                <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/25">
                        <Banknote className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none font-sans">AKAPRO ERP</h1>
                        <p className="text-[10px] text-blue-600 uppercase tracking-[0.15em] font-semibold mt-1 font-sans">Sistem Perusahaan</p>
                    </div>
                </div>
            </div>

            {/* Dashboard - Top Level */}
            <div className="px-5 mb-2">
                <Link
                    href="/"
                    className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 font-sans",
                        isDashboardActive
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                            : "text-slate-900 hover:bg-slate-50 hover:text-indigo-600"
                    )}
                >
                    <LayoutDashboard className={cn("w-[18px] h-[18px]", isDashboardActive ? "text-white" : "text-slate-900")} />
                    <span className="font-sans">Dashboard Utama</span>
                    {isDashboardActive && <div className="ml-auto w-2 h-2 rounded-full bg-white/50 animate-pulse" />}
                </Link>
            </div>

            <div className="mx-5 border-t border-slate-100 my-1" />

            {/* Navigation Groups */}
            <nav className="flex-1 overflow-y-auto px-5 pb-6 space-y-3 scrollbar-hide pt-2 font-sans">
                {menuGroups.map((group) => (
                    <div key={group.title} className="space-y-1">
                        <button
                            onClick={() => toggleGroup(group.title)}
                            className="w-full flex items-center justify-between px-3 py-2 group hover:bg-slate-50 rounded-lg transition-all"
                        >
                            <div className="flex items-center gap-2.5">
                                <group.icon className="w-4 h-4 text-slate-900 group-hover:text-indigo-600 transition-colors" />
                                <span className={cn(
                                    "text-[12px] font-bold tracking-tight transition-colors font-sans",
                                    expandedGroups[group.title] ? "text-indigo-600" : "text-slate-900 group-hover:text-indigo-600"
                                )}>
                                    {group.title}
                                </span>
                            </div>
                            {expandedGroups[group.title]
                                ? <ChevronDown className="w-3 h-3 text-indigo-600" />
                                : <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600" />
                            }
                        </button>

                        {expandedGroups[group.title] && (
                            <div className="space-y-0.5 pl-4 border-l-2 border-slate-50 ml-5 mt-1 font-sans">
                                {group.items.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200 font-sans",
                                                isActive
                                                    ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 rounded-l-none"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                                            )}
                                        >
                                            <item.icon className={cn(
                                                "w-4 h-4 shrink-0",
                                                isActive ? "text-indigo-600" : "text-slate-400"
                                            )} />
                                            <span className="truncate font-sans">{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </nav>

            {/* User Profile */}
            <div className="px-5 py-5 border-t border-slate-100 bg-slate-50/30">
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-all group cursor-pointer border border-transparent hover:border-slate-100">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center shadow-sm">
                        <span className="text-xs font-bold text-white">SA</span>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                        <p className="text-xs font-bold text-slate-900 truncate">Superadmin</p>
                        <p className="text-[10px] text-slate-500 truncate font-medium">mukhsin9@gmail.com</p>
                    </div>
                    <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-all" />
                </div>
            </div>
        </aside>
    );
}
