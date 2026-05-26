-- ERP AKAPRO MASTER SCHEMA (SAK-COMPLIANT)
-- Unified Fullstack Architecture for Next.js + Supabase

-- 0. EXTENSIONS & SCHEMAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SCHEMA IF NOT EXISTS accounting;
CREATE SCHEMA IF NOT EXISTS warehouse;
CREATE SCHEMA IF NOT EXISTS sales;
CREATE SCHEMA IF NOT EXISTS procurement;

-- 1. AUTH & TENANCY
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    company_tin TEXT, -- NPWP
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location TEXT,
    is_main_branch BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ACCOUNTING (CORE SAK MODULE)
CREATE TABLE IF NOT EXISTS accounting.chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    code TEXT NOT NULL, -- e.g., 1-1001
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE')),
    normal_balance TEXT NOT NULL CHECK (normal_balance IN ('DEBIT', 'CREDIT')),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(tenant_id, code)
);

CREATE TABLE IF NOT EXISTS accounting.journals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reference_no TEXT, -- e.g., INV/2024/001
    description TEXT,
    source_module TEXT NOT NULL, -- e.g., 'SALES', 'POS', 'PROCUREMENT'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounting.general_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_id UUID REFERENCES accounting.journals(id) ON DELETE CASCADE,
    coa_id UUID REFERENCES accounting.chart_of_accounts(id),
    debit DECIMAL(15,2) DEFAULT 0,
    credit DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT balance_check CHECK (debit >= 0 AND credit >= 0)
);

-- 3. WAREHOUSE (INTEGRATED WMS)
CREATE TABLE IF NOT EXISTS warehouse.items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id),
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    unit TEXT DEFAULT 'PCS',
    purchase_price DECIMAL(15,2),
    sale_price DECIMAL(15,2),
    UNIQUE(tenant_id, sku)
);

CREATE TABLE IF NOT EXISTS warehouse.stocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES public.branches(id),
    item_id UUID REFERENCES warehouse.items(id),
    quantity DECIMAL(15,2) DEFAULT 0,
    UNIQUE(branch_id, item_id)
);

-- 4. AUTOMATED JOURNALING (THE ENGINE)
CREATE OR REPLACE FUNCTION accounting.fn_log_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Here we would implement the logic to automatically create journals
    -- based on operational events (insert into sales, warehouse, etc.)
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. RLS POLICIES (MULTI-TENANCY)
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting.journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting.general_ledger ENABLE ROW LEVEL SECURITY;

-- Dynamic Policy: Users can only see data belonging to their tenant
-- (Requires custom claim 'tenant_id' in JWT)
CREATE POLICY tenant_isolation_tenants ON public.tenants 
    USING (id = (auth.jwt() ->> 'tenant_id')::UUID);

CREATE POLICY tenant_isolation_coa ON accounting.chart_of_accounts 
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::UUID);

-- Seeding Superadmin (Manual entry for now via SQL)
-- INSERT INTO public.tenants (name, slug) VALUES ('AKAPRO HQ', 'akapro-hq');
