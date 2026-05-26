-- CONSOLIDATED PUBLIC SCHEMA MIGRATION FOR ERP AKAPRO
-- This migration ensures all required tables are in the 'public' schema
-- for seamless integration with Supabase REST API and RLS consistency.

-- 1. BUDGETING MODULE
CREATE TABLE IF NOT EXISTS public.budget_fiscal_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    year_name TEXT NOT NULL, 
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, year_name)
);

CREATE TABLE IF NOT EXISTS public.budget_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    fiscal_year_id UUID REFERENCES public.budget_fiscal_years(id) ON DELETE CASCADE,
    coa_id UUID REFERENCES accounting.chart_of_accounts(id), -- Assuming accounting schema coa exists or point to public
    department_id TEXT, 
    allocated_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    reserved_amount DECIMAL(15,2) DEFAULT 0,
    committed_amount DECIMAL(15,2) DEFAULT 0,
    actual_amount DECIMAL(15,2) DEFAULT 0,
    status TEXT DEFAULT 'DRAFT', -- DRAFT, PROPOSED, APPROVED
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(fiscal_year_id, coa_id, department_id)
);

-- 2. ASSET MANAGEMENT MODULE
CREATE TABLE IF NOT EXISTS public.asset_register (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('KENDARAAN', 'PROPERTI', 'PERALATAN', 'MESIN')),
    acquisition_date DATE NOT NULL DEFAULT CURRENT_DATE,
    acquisition_cost DECIMAL(15,2) NOT NULL DEFAULT 0,
    accumulated_depreciation DECIMAL(15,2) DEFAULT 0,
    coa_asset_id UUID, -- Reference to CoA
    coa_accum_dep_id UUID,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISPOSED', 'WRITTEN_OFF', 'DONATED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.asset_disposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES public.asset_register(id) ON DELETE CASCADE,
    disposal_type TEXT NOT NULL CHECK (disposal_type IN ('PENJUALAN', 'PENGHAPUSAN', 'HIBAH')),
    disposal_date DATE NOT NULL DEFAULT CURRENT_DATE,
    proceeds_amount DECIMAL(15,2) DEFAULT 0, 
    journal_id UUID, -- Reference to accounting_journals
    reason TEXT,
    status TEXT DEFAULT 'COMPLETED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. OPEX MODULE
CREATE TABLE IF NOT EXISTS public.opex_vouchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('UTILITAS', 'TRANSPORTASI', 'KONSUMSI', 'SEWA', 'LAIN-LAIN')),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    expense_coa_id UUID,
    payment_coa_id UUID,
    status TEXT DEFAULT 'DIBAYAR' CHECK (status IN ('DIBAYAR', 'DIBATALKAN')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ACCOUNTING CORE (FALLBACK TABLES IN PUBLIC IF NOT IN SCHEMA)
CREATE TABLE IF NOT EXISTS public.accounting_journals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    branch_id TEXT DEFAULT 'MAIN',
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reference_no TEXT, 
    description TEXT,
    source_module TEXT NOT NULL, 
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.accounting_general_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_id UUID REFERENCES public.accounting_journals(id) ON DELETE CASCADE,
    coa_id UUID,
    debit DECIMAL(15,2) DEFAULT 0,
    credit DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RLS POLICIES (MULTI-TENANCY)
ALTER TABLE public.budget_fiscal_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_register ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_disposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opex_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_general_ledger ENABLE ROW LEVEL SECURITY;

-- Dynamic Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'tenant_isolation_fy') THEN
        CREATE POLICY tenant_isolation_fy ON public.budget_fiscal_years USING (tenant_id = (auth.jwt() ->> 'tenant_id')::UUID);
    END IF;
    -- Add others similarly if needed, but for now assuming direct tenant_id check
END $$;

-- Repeat for all tables
CREATE POLICY tenant_isolation_bi ON public.budget_items USING (tenant_id = (auth.jwt() ->> 'tenant_id')::UUID);
CREATE POLICY tenant_isolation_ar ON public.asset_register USING (tenant_id = (auth.jwt() ->> 'tenant_id')::UUID);
CREATE POLICY tenant_isolation_ad ON public.asset_disposals USING (tenant_id = (auth.jwt() ->> 'tenant_id')::UUID);
CREATE POLICY tenant_isolation_ov ON public.opex_vouchers USING (tenant_id = (auth.jwt() ->> 'tenant_id')::UUID);
CREATE POLICY tenant_isolation_aj ON public.accounting_journals USING (tenant_id = (auth.jwt() ->> 'tenant_id')::UUID);
CREATE POLICY tenant_isolation_agl ON public.accounting_general_ledger USING (journal_id IN (SELECT id FROM public.accounting_journals));
