"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
    Banknote,
    ShoppingCart,
    Search,
    User,
    Plus,
    Minus,
    Trash2,
    CheckCircle2,
    QrCode,
    CreditCard,
    Receipt,
    ChevronRight,
    X,
    MessageCircle,
    Wallet,
    Box,
    Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSupabase } from '@/hooks/useSupabase';
import { toast } from 'sonner';

export default function PosPage() {
    const { tenant } = useSupabase();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<any[]>([]);
    const [customerList, setCustomerList] = useState<any[]>([{ id: 'umum', name: 'Umum / Retail', whatsapp: '' }]);
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState<any[]>([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Tunai');
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [selectedCustomer, setSelectedCustomer] = useState({ id: 'umum', name: 'Umum / Retail', whatsapp: '' });
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (tenant) {
            fetchData();
        }
    }, [tenant]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Products
            const { data: pData } = await supabase
                .from('products')
                .select('*')
                .order('name', { ascending: true });

            setProducts(pData || []);

            // 2. Fetch Customers
            const { data: cData } = await supabase
                .from('customers')
                .select('id, name, whatsapp')
                .eq('status', 'ACTIVE')
                .order('name', { ascending: true });

            const list = cData ? [...cData, { id: 'umum', name: 'Umum / Retail', whatsapp: '' }] : [{ id: 'umum', name: 'Umum / Retail', whatsapp: '' }];
            setCustomerList(list);
            setSelectedCustomer(list[list.length - 1]);

            // 3. Fetch CoAs for Journaling (Cache them)
            const { data: coaData } = await supabase
                .from('chart_of_accounts')
                .select('id, code, name');
            setCoas(coaData || []);

        } catch (error: any) {
            toast.error("Gagal memuat data POS: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const [coas, setCoas] = useState<any[]>([]);

    const subTotal = useMemo(() => cart.reduce((acc, item) => acc + (item.base_price * item.qty), 0), [cart]);
    const tax = subTotal * 0.11;
    const total = subTotal + tax;

    const handleConfirmPayment = async () => {
        if (cart.length === 0 || !tenant) return;
        setIsProcessing(true);
        try {
            const trxId = `POS-${Date.now().toString().slice(-8)}`;
            const date = new Date().toISOString().split('T')[0];

            // 1. Update Inventory (Decrement Stock)
            for (const item of cart) {
                const { error: stockError } = await supabase
                    .from('products')
                    .update({ stock_qty: item.stock_qty - item.qty })
                    .eq('id', item.id);
                if (stockError) throw stockError;
            }

            // 2. Journaling via AccountingEngine
            // Find COA IDs by Code
            const getCoaId = (code: string) => coas.find(c => c.code === code)?.id || coas.find(c => c.code.includes(code))?.id;

            const arCoa = getCoaId('1101'); // Kas Utama as AR fallback for retail
            const incomeCoa = getCoaId('4101'); // Sales Revenue
            const cogsCoa = getCoaId('5101'); // COGS
            const invCoa = getCoaId('1301'); // Inventory

            if (incomeCoa && arCoa) {
                await (await import('@/lib/accounting')).AccountingEngine.recordSales({
                    tenantId: tenant.id,
                    branchId: 'MAIN',
                    date,
                    ref: trxId,
                    desc: `POS Sale: ${selectedCustomer.name} - ${trxId}`,
                    arCoa: arCoa,
                    incomeCoa: incomeCoa,
                    cogsCoa: cogsCoa || incomeCoa, // Fallback if no COGS
                    inventoryCoa: invCoa || arCoa, // Fallback
                    totalSales: total,
                    totalCogs: subTotal * 0.7 // Simplified COGS estimation for demo or use real purchase_price if available
                });
            }

            toast.success(`Transaksi ${trxId} berhasil & Terjurnal!`);
            setCart([]);
            setShowPaymentModal(false);
            fetchData(); // Refresh stock
        } catch (err: any) {
            toast.error('Transaksi gagal: ' + err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const categories = useMemo(() => ['Semua', ...Array.from(new Set(products.map((p) => p.category)))], [products]);

    const filteredProducts = useMemo(() => {
        return products.filter((p) =>
            (p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase())) &&
            (selectedCategory === 'Semua' || p.category === selectedCategory)
        );
    }, [search, selectedCategory, products]);

    const addToCart = (product: any) => {
        if (product.stock_qty <= 0) {
            toast.error("Stok habis!");
            return;
        }
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
            }
            return [...prev, { ...product, qty: 1 }];
        });
    };

    const updateQty = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.qty + delta);
                // In real app, check stock limit here
                return { ...item, qty: newQty };
            }
            return item;
        }));
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const handleWhatsAppReceipt = () => {
        if (!selectedCustomer.whatsapp) {
            toast.error('Pilih pelanggan dengan nomor WhatsApp valid!');
            return;
        }
        const text = `Halo ${selectedCustomer.name}, berikut adalah struk belanja Anda di AKAPRO ERP:\n\nTotal: Rp ${total.toLocaleString('id-ID')}\nStatus: LUNAS\n\nTerima kasih!`;
        window.open(`https://wa.me/${selectedCustomer.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="h-screen bg-slate-50/50 flex flex-col lg:flex-row overflow-hidden font-sans">
            {/* Catalog Side */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden min-w-0 shadow-sm border-r border-slate-100">
                <header className="p-8 pb-4 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                <Wallet className="w-6 h-6 text-indigo-600" />
                                Kasir Utama (POS)
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Status: Connected • POS-01</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5 ml-1 text-left">Pelanggan</p>
                                <select
                                    className="text-xs font-bold text-slate-700 bg-slate-100 px-4 py-2 rounded-xl outline-none border-2 border-transparent focus:border-indigo-600 transition-all appearance-none min-w-[180px]"
                                    value={selectedCustomer.id}
                                    onChange={(e) => setSelectedCustomer(customerList.find((c) => c.id === e.target.value) || customerList[customerList.length - 1])}
                                >
                                    {customerList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-stretch gap-4">
                        <div className="relative group flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari Nama Barang atau SKU..."
                                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3 pl-12 pr-6 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-5 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border-2 ${selectedCategory === cat
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100'
                                        : 'bg-white text-slate-400 border-slate-50 hover:text-slate-600 hover:border-indigo-100'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 pt-2 scrollbar-hide">
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {filteredProducts.map((p) => (
                            <div
                                key={p.id}
                                onClick={() => addToCart(p)}
                                className={`bg-white border-2 rounded-[32px] p-5 shadow-sm transition-all cursor-pointer group flex flex-col justify-between hover:shadow-2xl hover:shadow-indigo-50/50 ${p.stock_qty <= 0 ? 'opacity-50 grayscale' : 'hover:border-indigo-600'}`}
                            >
                                <div className="w-full aspect-square bg-slate-50 rounded-3xl mb-4 flex items-center justify-center border border-slate-50 relative overflow-hidden">
                                    {p.stock_qty <= (p.min_stock || 0) && (
                                        <div className="absolute top-3 left-3 bg-rose-500 text-white px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-tight z-10 animate-pulse">
                                            Limit
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-xl text-[9px] font-bold text-slate-400 border border-slate-100 shadow-sm">
                                        Qty: {p.stock_qty || 0}
                                    </div>
                                    <ShoppingCart className="w-8 h-8 text-indigo-50 group-hover:scale-125 group-hover:text-indigo-200 transition-all duration-500" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[8px] font-black text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-md uppercase">{p.sku}</span>
                                        <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{p.category}</span>
                                    </div>
                                    <h4 className="text-[12px] font-bold text-slate-800 leading-tight line-clamp-2 min-h-[2.4em] group-hover:text-indigo-600 transition-colors uppercase">{p.name}</h4>
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                                        <span className="text-sm font-black text-slate-900 tracking-tight">Rp {(p.base_price || 0).toLocaleString('id-ID')}</span>
                                        <div className="bg-slate-50 p-2 rounded-xl text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-active:scale-90">
                                            <Plus className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cart Side */}
            <div className="w-full lg:w-[420px] xl:w-[480px] flex flex-col bg-white h-screen overflow-hidden">
                <div className="p-8 border-b-2 border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                            <ShoppingCart className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 uppercase text-[10px] tracking-widest mb-0.5">Order Summary</h3>
                            <p className="text-xs font-medium text-slate-400">{cart.length} Items Selected</p>
                        </div>
                    </div>
                    <button onClick={() => setCart([])} className="p-3 text-slate-300 hover:text-rose-500 transition-colors bg-slate-50 rounded-2xl hover:bg-rose-50">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4 scrollbar-hide">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mb-6">
                                <Box className="w-10 h-10 text-slate-200" />
                            </div>
                            <p className="text-xs font-bold text-slate-300 tracking-[0.2em] uppercase italic">Pilih barang untuk memulai</p>
                        </div>
                    ) : cart.map((item) => (
                        <div key={item.id} className="flex gap-4 items-center bg-slate-50/50 p-4 rounded-[28px] border border-slate-50 hover:bg-white hover:border-indigo-100 transition-all group relative hover:shadow-lg hover:shadow-slate-100">
                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="absolute -top-2 -right-2 w-7 h-7 bg-white border-2 border-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-rose-500 shadow-sm hover:bg-rose-500 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-slate-700 truncate mb-1 uppercase">{item.name}</p>
                                <p className="text-[10px] font-bold text-indigo-500 font-mono tracking-tighter">Rp {item.base_price.toLocaleString('id-ID')}</p>
                            </div>
                            <div className="flex items-center gap-3 bg-white px-2 py-1.5 rounded-2xl border-2 border-slate-50 shadow-sm">
                                <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 rounded-xl hover:bg-slate-50 text-slate-400 flex items-center justify-center transition-all active:scale-90">
                                    <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-black w-5 text-center text-slate-900 font-mono">{item.qty}</span>
                                <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center transition-all active:scale-90 shadow-lg shadow-indigo-100">
                                    <Plus className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-8 bg-slate-900 rounded-t-[48px] space-y-6 text-white">
                    <div className="space-y-4 px-2">
                        <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-slate-400">
                            <span>Subtotal Belanja</span>
                            <span className="font-mono text-white text-sm">Rp {subTotal.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-slate-400">
                            <span>Pajak PPN (11%)</span>
                            <span className="font-mono text-emerald-400 text-sm">Rp {tax.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</span>
                        </div>
                        <div className="pt-6 flex justify-between items-center border-t border-white/10">
                            <span className="text-white text-xs font-black uppercase tracking-[0.2em]">Total Akhir</span>
                            <span className="font-black text-white font-mono text-3xl tracking-tighter">Rp {total.toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    <button
                        disabled={cart.length === 0 || isProcessing}
                        onClick={() => setShowPaymentModal(true)}
                        className="w-full bg-indigo-600 hover:bg-white hover:text-indigo-600 text-white font-black py-5 rounded-[24px] transition-all shadow-2xl shadow-indigo-500/20 flex items-center justify-center gap-4 text-xs uppercase tracking-[0.2em] disabled:opacity-50 active:scale-95 group"
                    >
                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                PROSES CHECKOUT
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setShowPaymentModal(false)} />
                    <div className="relative bg-white w-full max-w-xl rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-12 space-y-8">
                            <div className="flex justify-between items-center text-slate-900">
                                <div>
                                    <h3 className="text-3xl font-black tracking-tight">Checkout</h3>
                                    <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase tracking-widest">Metode Pembayaran & Konfirmasi</p>
                                </div>
                                <button onClick={() => setShowPaymentModal(false)} className="w-14 h-14 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-3xl transition-all flex items-center justify-center border-2 border-slate-50 hover:border-indigo-100">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[32px] p-10 text-white text-center space-y-2 shadow-2xl shadow-indigo-200 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-70">Total yang harus dibayar</p>
                                <p className="text-5xl font-black tracking-tighter">Rp {total.toLocaleString('id-ID')}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-6">
                                    {[
                                        { id: 'Tunai', icon: Banknote, label: 'KAS / TUNAI' },
                                        { id: 'Kredit', icon: CreditCard, label: 'TEMPO / HUTANG' },
                                    ].map((m) => (
                                        <button
                                            key={m.id}
                                            onClick={() => setPaymentMethod(m.id)}
                                            className={`flex flex-col items-center gap-4 p-8 rounded-[32px] border-4 transition-all ${paymentMethod === m.id ? 'bg-indigo-50 border-indigo-600' : 'bg-white border-slate-50 hover:bg-slate-50'}`}
                                        >
                                            <div className={`p-5 rounded-2xl ${paymentMethod === m.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-400'}`}>
                                                <m.icon className="w-6 h-6" />
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${paymentMethod === m.id ? 'text-indigo-600' : 'text-slate-400'}`}>{m.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 flex flex-col gap-4">
                                <button
                                    onClick={handleConfirmPayment}
                                    disabled={isProcessing}
                                    className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black shadow-2xl shadow-slate-200 flex items-center justify-center gap-4 text-xs uppercase tracking-[0.2em] transition-all hover:bg-indigo-600 active:scale-95 disabled:opacity-50"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    {isProcessing ? 'SEDANG DIPROSES...' : 'SELESAIKAN TRANSAKSI'}
                                </button>
                                <button
                                    onClick={handleWhatsAppReceipt}
                                    className="w-full bg-emerald-50 text-emerald-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest transition-all hover:bg-emerald-100"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    KIRIM STRUK VIA WHATSAPP
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
