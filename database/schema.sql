-- ERP AKAPRO MASTER SCHEMA
-- SAK-Compliant Integrated Enterprise ERP
-- Target: PostgreSQL 15+

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- SCHEMAS
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS accounting;
CREATE SCHEMA IF NOT EXISTS warehouse;
CREATE SCHEMA IF NOT EXISTS sales;
CREATE SCHEMA IF NOT EXISTS procurement;
CREATE SCHEMA IF NOT EXISTS common;

-- ==========================================
-- 1. AUTH & RBAC MODULE
-- ==========================================

CREATE TABLE auth.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    scaling_mode VARCHAR(20) NOT NULL CHECK (scaling_mode IN ('EMKM', 'EP', 'IFRS')),
    tax_id VARCHAR(50), -- NPWP
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE auth.branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES auth.tenants(id),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES auth.tenants(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255),
    is_superadmin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE auth.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES auth.tenants(id),
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE auth.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'acc:coa:read'
    name VARCHAR(255) NOT NULL
);

CREATE TABLE auth.role_permissions (
    role_id UUID REFERENCES auth.roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES auth.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE auth.user_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES auth.roles(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES auth.branches(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id, branch_id)
);

-- ==========================================
-- 2. ACCOUNTING (GL & CoA) MODULE
-- ==========================================

CREATE TABLE accounting.chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES auth.tenants(id),
    code VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE')),
    parent_id UUID REFERENCES accounting.chart_of_accounts(id),
    is_group BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(tenant_id, code)
);

CREATE TABLE accounting.general_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES auth.tenants(id),
    branch_id UUID NOT NULL REFERENCES auth.branches(id),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reference_no VARCHAR(100) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id),
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'POSTED', 'VOID', 'CLOSED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE accounting.journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gl_id UUID NOT NULL REFERENCES accounting.general_ledger(id) ON DELETE CASCADE,
    coa_id UUID NOT NULL REFERENCES accounting.chart_of_accounts(id),
    debit DECIMAL(19, 4) DEFAULT 0,
    credit DECIMAL(19, 4) DEFAULT 0,
    mapping_tag VARCHAR(50),
    CONSTRAINT balance_check CHECK ((debit > 0 AND credit = 0) OR (debit = 0 AND credit > 0)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. WAREHOUSE & INVENTORY MODULE
-- ==========================================

CREATE TABLE warehouse.warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES auth.branches(id),
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE warehouse.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES auth.tenants(id),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    uom VARCHAR(20) DEFAULT 'PCS',
    default_coa_id UUID REFERENCES accounting.chart_of_accounts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE warehouse.inventory_levels (
    warehouse_id UUID REFERENCES warehouse.warehouses(id),
    product_id UUID REFERENCES warehouse.products(id),
    qty_on_hand DECIMAL(19, 4) DEFAULT 0,
    qty_reserved DECIMAL(19, 4) DEFAULT 0,
    PRIMARY KEY (warehouse_id, product_id)
);

-- ==========================================
-- 4. SALES & CRM MODULE
-- ==========================================

CREATE TABLE sales.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES auth.tenants(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    tax_id VARCHAR(50), -- NPWP/NIK
    credit_limit DECIMAL(19, 4) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE sales.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES auth.branches(id),
    customer_id UUID NOT NULL REFERENCES sales.customers(id),
    invoice_no VARCHAR(100) UNIQUE NOT NULL,
    invoice_date DATE DEFAULT CURRENT_DATE,
    total_amount DECIMAL(19, 4) DEFAULT 0,
    tax_amount DECIMAL(19, 4) DEFAULT 0,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'UNPAID' CHECK (status IN ('UNPAID', 'PARTIAL', 'PAID', 'VOID')),
    gl_id UUID REFERENCES accounting.general_ledger(id) -- Posted GL reference
);

-- ==========================================
-- SEED DATA: SUPERADMIN & INITIAL TENANT
-- ==========================================

-- 1. Create Initial Tenant (Default)
INSERT INTO auth.tenants (name, scaling_mode, tax_id) 
VALUES ('AKAPRO HOLDING', 'IFRS', '00.000.000.0-000.000');

-- 2. Create Main Branch
INSERT INTO auth.branches (tenant_id, name, address)
SELECT id, 'KANTOR PUSAT', 'Jakarta, Indonesia' FROM auth.tenants LIMIT 1;

-- 3. Create Superadmin User
-- P@ssword: Jlamprang233!! (Hash is placeholder, need real bcrypt in prod)
INSERT INTO auth.users (tenant_id, email, password_hash, full_name, is_superadmin)
SELECT id, 'mukhsin9@gmail.com', '$2b$12$PLACEHOLDER_HASH', 'Mukhsin Superadmin', TRUE 
FROM auth.tenants LIMIT 1;

-- ==========================================
-- 5. ROW-LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting.general_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales.customers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY tenant_isolation_users ON auth.users USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
CREATE POLICY tenant_isolation_coa ON accounting.chart_of_accounts USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
CREATE POLICY tenant_isolation_gl ON accounting.general_ledger USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
CREATE POLICY tenant_isolation_products ON warehouse.products USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
CREATE POLICY tenant_isolation_customers ON sales.customers USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
