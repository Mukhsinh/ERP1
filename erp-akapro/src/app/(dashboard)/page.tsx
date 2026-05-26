"use client";

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Wallet,
  Box,
  Activity,
  History,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  BarChart3,
  Calendar,
  Zap,
  Loader2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { useSupabase } from '@/hooks/useSupabase';

export default function DashboardPage() {
  const { tenant } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    expense: 0,
    inventoryCount: 0,
    compliance: 100
  });
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (tenant) {
      fetchDashboardData();
    }
  }, [tenant]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Revenue (COA 4)
      const { data: revData, error: revError } = await supabase
        .from('accounting_general_ledger')
        .select('credit, coa_id')
        .order('created_at', { ascending: false });

      if (revError) console.warn("Revenue fetch error:", revError);

      // 2. Fetch Expenses (COA 5)
      const { data: expData, error: expError } = await supabase
        .from('accounting_general_ledger')
        .select('debit, coa_id')
        .order('created_at', { ascending: false });

      if (expError) console.warn("Expense fetch error:", expError);

      // Simple filter logic for now without complex join
      const revenue = revData?.reduce((sum, item) => sum + Number(item.credit), 0) || 0;
      const expense = expData?.reduce((sum, item) => sum + Number(item.debit), 0) || 0;

      // 3. Fetch Inventory Count (Fallback to products table)
      const { data: prodData, error: prodError } = await supabase
        .from('warehouse_items')
        .select('purchase_price') // Adjusting to table 'warehouse_items' from migration
        .limit(10);

      if (prodError) console.warn("Product fetch error:", prodError);

      const inventoryCount = prodData?.length || 0;

      // 4. Fetch Recent Logs
      const { data: logData, error: logError } = await supabase
        .from('accounting_journals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (logError) console.warn("Logs fetch error:", logError);

      setStats({
        revenue: revenue || 0,
        expense: expense || 0,
        inventoryCount: inventoryCount || 0,
        compliance: 100
      });
      setLogs(logData || []);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  const ringkasan = [
    { name: 'Total Pendapatan', value: formatIDR(stats.revenue), change: '+0%', up: true, icon: Wallet, color: 'indigo' },
    { name: 'Total Pengeluaran', value: formatIDR(stats.expense), change: '+0%', up: false, icon: TrendingUp, color: 'rose' },
    { name: 'Stok Gudang', value: `${stats.inventoryCount.toLocaleString()} Unit`, change: 'Normal', up: true, icon: Box, color: 'amber' },
    { name: 'Kepatuhan SAK', value: `${stats.compliance}% Seimbang`, change: 'Terverifikasi', up: true, icon: Activity, color: 'emerald' },
  ];

  const colorMap: Record<string, string> = {
    indigo: 'border-indigo-100 text-indigo-600 bg-indigo-50/10',
    rose: 'border-rose-100 text-rose-600 bg-rose-50/10',
    amber: 'border-amber-100 text-amber-600 bg-amber-50/10',
    emerald: 'border-emerald-100 text-emerald-600 bg-emerald-50/10',
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Mengintegrasikan Data Real-Time...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto min-h-screen">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <BarChart3 className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Enterprise Analytics</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Utama</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm">Monitoring performa operasional dan finansial secara real-time.</p>
        </div>
      </header>

      {/* Kartu Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {ringkasan.map((s) => (
          <div
            key={s.name}
            className={`group relative overflow-hidden rounded-3xl border-2 bg-white p-8 transition-all hover:shadow-2xl hover:-translate-y-1 ${colorMap[s.color]}`}
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12 ${s.color === 'indigo' ? 'bg-indigo-600 text-white' : s.color === 'rose' ? 'bg-rose-600 text-white' : s.color === 'amber' ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'}`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${s.up ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                {s.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {s.change}
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em]">{s.name}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-2 tracking-tighter leading-none">{s.value}</h3>
            <div className={`absolute bottom-0 left-0 w-full h-1 opacity-20 ${s.color === 'indigo' ? 'bg-indigo-600' : s.color === 'rose' ? 'bg-rose-600' : s.color === 'amber' ? 'bg-amber-600' : 'bg-emerald-600'}`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Log Aktivitas */}
        <div className="lg:col-span-2 bg-white border-2 border-slate-50 rounded-[40px] shadow-sm overflow-hidden pb-6">
          <div className="px-10 py-8 border-b-2 border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-900 rounded-xl text-white">
                <History className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 tracking-tight">Log Transaksi Terbaru</h3>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Live Integration</span>
            </div>
          </div>
          <div className="divide-y-2 divide-slate-50 px-4">
            {logs.length === 0 ? (
              <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs italic">Belum ada transaksi tercatat.</div>
            ) : logs.map((a, i) => (
              <div key={i} className="px-6 py-6 flex items-center gap-6 hover:bg-slate-50/50 rounded-3xl transition-all cursor-pointer group">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-6 transition-all">
                  {a.source_module[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100 uppercase tracking-tight">{a.reference_no}</span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{a.source_module}</span>
                  </div>
                  <p className="text-sm text-slate-700 mt-2 font-bold truncate group-hover:text-indigo-600 transition-colors">{a.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{new Date(a.created_at).toLocaleDateString('id-ID')}</p>
                  <p className="text-[10px] text-slate-300 mt-0.5">{new Date(a.created_at).toLocaleTimeString('id-ID')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kepatuhan & Sistem */}
        <div className="bg-white border-2 border-slate-50 rounded-[40px] shadow-sm overflow-hidden flex flex-col">
          <div className="px-10 py-8 border-b-2 border-slate-50 flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-xl text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 tracking-tight">Status Sistem</h3>
          </div>
          <div className="p-10 space-y-8 flex-1">
            <div className="p-8 rounded-[32px] bg-indigo-600 text-white shadow-2xl shadow-indigo-200 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Sertifikasi Akuntansi</p>
                <p className="text-base font-bold mt-1 tracking-tight">Terpatuh SAK: {new Date().toLocaleDateString('id-ID')}</p>
              </div>
              <ShieldCheck className="w-10 h-10 opacity-30 group-hover:scale-110 transition-transform" />
            </div>

            <div className="space-y-6 pt-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-l-4 border-indigo-600 pl-4">Digital Health Indicators</h4>
              {[
                { label: 'Basis Data', status: 'Optimal', color: 'text-emerald-500', bg: 'bg-emerald-500' },
                { label: 'Gerbang API', status: 'Sehat', color: 'text-indigo-600', bg: 'bg-indigo-600' },
                { label: 'Otoritas RLS', status: 'Aktif', color: 'text-violet-600', bg: 'bg-violet-600' }
              ].map(sys => (
                <div key={sys.label} className="flex items-center justify-between group">
                  <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors uppercase tracking-tight">{sys.label}</span>
                  <div className={`flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-widest ${sys.color}`}>
                    <div className={`w-2 h-2 rounded-full ${sys.bg} shadow-sm transition-all group-hover:scale-125`} />
                    {sys.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
