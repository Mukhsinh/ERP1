import React from 'react';
import {
    TrendingUp,
    TrendingDown,
    Activity,
    Package,
    ChevronRight
} from 'lucide-react';

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Ringkasan</h1>
                <p className="text-slate-500 text-sm">Selamat datang kembali, Pak Mukhsin. Berikut ikhtisar bisnis Anda hari ini.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Penjualan"
                    value="Rp 128.450.000"
                    change="+12.5%"
                    trend="up"
                    icon={TrendingUp}
                    color="blue"
                />
                <StatCard
                    title="Hutang Usaha"
                    value="Rp 45.200.000"
                    change="-2.1%"
                    trend="down"
                    icon={TrendingDown}
                    color="red"
                />
                <StatCard
                    title="Stok Rendah"
                    value="12 Item"
                    change="Perlu Restock"
                    trend="neutral"
                    icon={Package}
                    color="emerald"
                />
                <StatCard
                    title="Efisiensi Audit"
                    value="98.2%"
                    change="Excellent"
                    trend="up"
                    icon={Activity}
                    color="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800">Aliran Kas Terintegrasi</h3>
                        <button className="text-sm text-blue-600 font-semibold flex items-center gap-1 hover:underline">
                            Lihat Laporan SAK <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="h-64 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 italic">
                        [Visualisasi Grafik Keuangan Real-time]
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6">Log Audit Forensik</h3>
                    <div className="space-y-4">
                        <AuditItem
                            type="ALERT"
                            msg="Percobaan Split-Purchase terdeteksi: Vendor ABC"
                            time="1 jam yang lalu"
                        />
                        <AuditItem
                            type="INFO"
                            msg="Penyusutan Aset Otomatis Berhasil"
                            time="4 jam yang lalu"
                        />
                        <AuditItem
                            type="WARNING"
                            msg="Stock-out Warning: Produk SKU-102"
                            time="6 jam yang lalu"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, change, trend, icon: Icon, color }: any) {
    const colors: any = {
        blue: 'bg-blue-50 text-blue-600',
        red: 'bg-red-50 text-red-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        purple: 'bg-purple-50 text-purple-600',
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-xl ${colors[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' :
                        trend === 'down' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'
                    }`}>
                    {change}
                </span>
            </div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{title}</p>
            <h4 className="text-xl font-bold text-slate-900 mt-1">{value}</h4>
        </div>
    );
}

function AuditItem({ type, msg, time }: any) {
    const badgeColors: any = {
        ALERT: 'bg-red-500',
        WARNING: 'bg-amber-500',
        INFO: 'bg-blue-500',
    };

    return (
        <div className="flex gap-3">
            <div className={`w-1.5 h-1.5 rounded-full mt-2 ${badgeColors[type]}`} />
            <div className="flex-1">
                <p className="text-sm text-slate-700 leading-tight">{msg}</p>
                <p className="text-[10px] text-slate-400 mt-1">{time}</p>
            </div>
        </div>
    );
}
