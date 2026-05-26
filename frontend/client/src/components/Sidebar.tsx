'use client';

import React from 'react';
import Link from 'next/link';
import {
    LayoutDashboard,
    Calculator,
    Warehouse,
    ShoppingBag,
    Truck,
    Users,
    Settings,
    CreditCard,
    ChevronDown
} from 'lucide-react';

const menuGroups = [
    {
        title: 'OPERASIONAL',
        items: [
            { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
            { name: 'POS (Point of Sale)', icon: CreditCard, href: '/pos' },
        ]
    },
    {
        title: 'MANAJEMEN BISNIS',
        items: [
            { name: 'Sales & CRM', icon: ShoppingBag, href: '/sales' },
            { name: 'Procurement', icon: Truck, href: '/procurement' },
            { name: 'Warehouse (WMS)', icon: Warehouse, href: '/warehouse' },
        ]
    },
    {
        title: 'FINANSIAL & AUDIT',
        items: [
            { name: 'Akuntansi (GL)', icon: Calculator, href: '/accounting' },
            { name: 'Forensic Audit', icon: Users, href: '/audit' },
        ]
    },
    {
        title: 'SISTEM',
        items: [
            { name: 'Pengaturan', icon: Settings, href: '/settings' },
        ]
    }
];

export default function Sidebar() {
    return (
        <div className="w-64 h-full bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800">
            <div className="p-6">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                    ERP AKAPRO
                </h1>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">
                    Integrated Enterprise
                </p>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-8">
                {menuGroups.map((group) => (
                    <div key={group.title}>
                        <h2 className="text-[10px] font-bold text-slate-500 mb-3 ml-2 uppercase tracking-tighter">
                            {group.title}
                        </h2>
                        <ul className="space-y-1">
                            {group.items.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors group"
                                    >
                                        <item.icon className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
                                        <span className="text-sm font-medium">{item.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
                        MS
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-semibold truncate">Mukhsin Superadmin</p>
                        <p className="text-[10px] text-slate-400 truncate tracking-tight">mukhsin9@gmail.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
