-- ERP AKAPRO ARCHITECTURE UPDATES
-- Focus: Assets, OPEX, Cash Management, and Budgeting schemas

CREATE SCHEMA IF NOT EXISTS assets;
CREATE SCHEMA IF NOT EXISTS opex;
CREATE SCHEMA IF NOT EXISTS cash;
CREATE SCHEMA IF NOT EXISTS budgeting;

-- 1. ASSET REGISTER
CREATE TABLE IF NOT EXISTS assets.registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('KENDARAAN', 'PROPERTI', 'PERALATAN', 'MESIN')),
    acquisition_date DATE NOT NULL DEFAULT CURRENT_DATE,
    acquisition_cost DECIMAL(15,2) NOT NULL DEFAULT 0,
    accumulated_depreciation DECIMAL(15,2) DEFAULT 0,
    funding_source_coa_id UUID REFERENCES accounting.chart_of_accounts(id),
    status TEXT DEFAULT 'AKTIF' CHECK (status IN ('AKTIF', 'DIJUAL', 'RUSAK', 'HABIS_UMUR')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ASSET DISPOSALS
CREATE TABLE IF NOT EXISTS assets.disposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID REFERENCES assets.registry(id) ON DELETE CASCADE,
    disposal_type TEXT NOT NULL CHECK (disposal_type IN ('PENJUALAN', 'PENGHAPUSAN', 'HIBAH')),
    disposal_date DATE NOT NULL DEFAULT CURRENT_DATE,
    proceeds_amount DECIMAL(15,2) DEFAULT 0, 
    journal_id UUID REFERENCES accounting.journals(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. OPEX VOUCHERS
CREATE TABLE IF NOT EXISTS opex.vouchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('UTILITAS', 'TRANSPORTASI', 'KONSUMSI', 'SEWA', 'LAIN-LAIN')),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    payment_coa_id UUID REFERENCES accounting.chart_of_accounts(id),
    status TEXT DEFAULT 'DIBAYAR' CHECK (status IN ('DIBAYAR', 'DIBATALKAN')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CASH TRANSFERS
CREATE TABLE IF NOT EXISTS accounting.cash_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    from_coa_id UUID REFERENCES accounting.chart_of_accounts(id),
    to_coa_id UUID REFERENCES accounting.chart_of_accounts(id),
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BUDGETING SYSTEM
CREATE TABLE IF NOT EXISTS budgeting.fiscal_years (
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

CREATE TABLE IF NOT EXISTS budgeting.budget_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    fiscal_year_id UUID REFERENCES budgeting.fiscal_years(id),
    name TEXT NOT NULL,
    version TEXT DEFAULT 'DRAFT', 
    scenario TEXT DEFAULT 'MODERATE', 
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budgeting.budget_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_plan_id UUID REFERENCES budgeting.budget_plans(id) ON DELETE CASCADE,
    coa_id UUID REFERENCES accounting.chart_of_accounts(id),
    department_id TEXT, 
    allocated_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    reserved_amount DECIMAL(15,2) DEFAULT 0,
    committed_amount DECIMAL(15,2) DEFAULT 0,
    actual_amount DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(budget_plan_id, coa_id, department_id)
);

-- 6. RLS POLICIES
ALTER TABLE assets.registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets.disposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE opex.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting.cash_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgeting.fiscal_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgeting.budget_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgeting.budget_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_assets ON assets.registry 
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::UUID);

CREATE POLICY tenant_isolation_assets_disposals ON assets.disposals 
    USING (asset_id IN (SELECT id FROM assets.registry WHERE tenant_id = (auth.jwt() ->> 'tenant_id')::UUID));

CREATE POLICY tenant_isolation_opex ON opex.vouchers 
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::UUID);

CREATE POLICY tenant_isolation_transfers ON accounting.cash_transfers 
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::UUID);

CREATE POLICY tenant_isolation_fiscal_years ON budgeting.fiscal_years 
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::UUID);

CREATE POLICY tenant_isolation_budget_plans ON budgeting.budget_plans 
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::UUID);
