-- MISSING TABLES MIGRATION FOR ERP AKAPRO
-- This migration creates tables identified as missing during check.

-- 1. BRANCHES (in public)
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CHART OF ACCOUNTS (in public)
CREATE TABLE IF NOT EXISTS public.chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE')),
    parent_id UUID REFERENCES public.chart_of_accounts(id),
    is_group BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

-- 3. BUDGET APPROVALS & REVISIONS
CREATE TABLE IF NOT EXISTS public.budget_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    fiscal_year_id UUID REFERENCES public.budget_fiscal_years(id) ON DELETE CASCADE,
    approver_id UUID, -- Link to profiles or auth.users
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.budget_revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    budget_item_id UUID REFERENCES public.budget_items(id) ON DELETE CASCADE,
    previous_amount DECIMAL(15,2) NOT NULL,
    new_amount DECIMAL(15,2) NOT NULL,
    reason TEXT,
    requested_by UUID,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ASSET DEPRECIATION LOGS
CREATE TABLE IF NOT EXISTS public.asset_depreciation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES public.asset_register(id) ON DELETE CASCADE,
    period_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    journal_id UUID REFERENCES public.accounting_journals(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. WAREHOUSE STOCK MOVEMENTS
CREATE TABLE IF NOT EXISTS public.warehouse_stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    product_id UUID, -- Needs product table
    warehouse_id UUID, -- Needs warehouse table
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('IN', 'OUT', 'ADJUSTMENT')),
    qty DECIMAL(15,2) NOT NULL,
    reference_no TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RLS FOR MISSING TABLES
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_depreciation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_stock_movements ENABLE ROW LEVEL SECURITY;

-- 7. INITIAL SEED FOR CHART OF ACCOUNTS (Example for Indonesia)
DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM public.tenants LIMIT 1;
    
    IF v_tenant_id IS NOT NULL THEN
        -- ASSETS
        INSERT INTO public.chart_of_accounts (tenant_id, code, name, account_type) VALUES 
        (v_tenant_id, '1101', 'Kas Utama', 'ASSET'),
        (v_tenant_id, '1102', 'Bank BCA', 'ASSET'),
        (v_tenant_id, '1201', 'Piutang Usaha', 'ASSET'),
        (v_tenant_id, '1301', 'Persediaan Barang', 'ASSET'),
        (v_tenant_id, '1401', 'Aset Tetap - Kendaraan', 'ASSET'),
        (v_tenant_id, '1402', 'Akumulasi Penyusutan Kendaraan', 'ASSET');

        -- LIABILITIES
        INSERT INTO public.chart_of_accounts (tenant_id, code, name, account_type) VALUES 
        (v_tenant_id, '2101', 'Hutang Usaha', 'LIABILITY'),
        (v_tenant_id, '2102', 'Hutang Gaji', 'LIABILITY');

        -- EQUITY
        INSERT INTO public.chart_of_accounts (tenant_id, code, name, account_type) VALUES 
        (v_tenant_id, '3101', 'Modal Saham', 'EQUITY'),
        (v_tenant_id, '3201', 'Laba Ditahan', 'EQUITY');

        -- REVENUE
        INSERT INTO public.chart_of_accounts (tenant_id, code, name, account_type) VALUES 
        (v_tenant_id, '4101', 'Pendapatan Penjualan', 'REVENUE');

        -- EXPENSE
        INSERT INTO public.chart_of_accounts (tenant_id, code, name, account_type) VALUES 
        (v_tenant_id, '5101', 'Beban Gaji', 'EXPENSE'),
        (v_tenant_id, '5102', 'Beban Listrik & Air', 'EXPENSE'),
        (v_tenant_id, '5103', 'Beban Sewa', 'EXPENSE'),
        (v_tenant_id, '5104', 'Beban Penyusutan', 'EXPENSE');
    END IF;
END $$;
