-- ==========================================
-- FENSTERMEISTER - SUPABASE DATABASE SCHEMA
-- Execute inside Supabase SQL Editor
-- ==========================================

DO $$
BEGIN

    -- 1. CLIENTS TABLE
    CREATE TABLE IF NOT EXISTS public.clients (
        id text PRIMARY KEY,
        name text NOT NULL,
        company_name text,
        email text NOT NULL,
        phone text,
        address text,
        city text,
        country text,
        vat_number text,
        business_number text,
        notes text,
        type text DEFAULT 'individual',
        avatar_url text,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
    );

    -- 2. PRODUCTS & SERVICES TABLE
    CREATE TABLE IF NOT EXISTS public.products (
        id text PRIMARY KEY,
        name text NOT NULL,
        sku text,
        description text,
        image text,
        gallery jsonb DEFAULT '[]'::jsonb,
        purchase_price numeric DEFAULT 0,
        selling_price numeric DEFAULT 0,
        wholesale_price numeric DEFAULT 0,
        vat_rate numeric DEFAULT 19,
        discount numeric DEFAULT 0,
        unit text DEFAULT 'pcs',
        stock integer DEFAULT 0,
        min_stock_alert integer DEFAULT 5,
        category text DEFAULT 'Windows',
        type text DEFAULT 'product',
        status text DEFAULT 'active',
        notes text,
        svg_key text,
        custom_specs jsonb DEFAULT '{}'::jsonb,
        created_at timestamptz DEFAULT now()
    );

    -- 3. INVOICES TABLE
    CREATE TABLE IF NOT EXISTS public.invoices (
        id text PRIMARY KEY,
        number text NOT NULL UNIQUE,
        prefix text DEFAULT 'INV-',
        client_id text REFERENCES public.clients(id) ON DELETE SET NULL,
        client_snapshot jsonb NOT NULL,
        date date NOT NULL,
        due_date date NOT NULL,
        items jsonb NOT NULL DEFAULT '[]'::jsonb,
        currency text DEFAULT 'EUR',
        payment_terms text DEFAULT 'Net 14',
        subtotal numeric DEFAULT 0,
        global_discount numeric DEFAULT 0,
        global_discount_type text DEFAULT 'percentage',
        discount_amount numeric DEFAULT 0,
        vat_total numeric DEFAULT 0,
        shipping_fee numeric DEFAULT 0,
        additional_charges numeric DEFAULT 0,
        additional_charges_label text,
        total numeric DEFAULT 0,
        amount_paid numeric DEFAULT 0,
        amount_due numeric DEFAULT 0,
        status text DEFAULT 'draft',
        notes text,
        payment_instructions text,
        terms_and_conditions text,
        custom_footer text,
        customer_message text,
        template text DEFAULT 'modern',
        primary_color text DEFAULT '#2563eb',
        font text DEFAULT 'Inter',
        logo_position text DEFAULT 'left',
        table_style text DEFAULT 'clean',
        show_signature boolean DEFAULT true,
        signature_image text,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        sent_at timestamptz,
        paid_at timestamptz,
        payments jsonb DEFAULT '[]'::jsonb,
        history jsonb DEFAULT '[]'::jsonb
    );

    -- 4. OFFERS / QUOTATIONS TABLE
    CREATE TABLE IF NOT EXISTS public.offers (
        id text PRIMARY KEY,
        number text NOT NULL UNIQUE,
        client_id text REFERENCES public.clients(id) ON DELETE SET NULL,
        client_snapshot jsonb NOT NULL,
        date date NOT NULL,
        expiry_date date NOT NULL,
        items jsonb NOT NULL DEFAULT '[]'::jsonb,
        currency text DEFAULT 'EUR',
        subtotal numeric DEFAULT 0,
        discount numeric DEFAULT 0,
        discount_type text DEFAULT 'percentage',
        discount_amount numeric DEFAULT 0,
        vat_total numeric DEFAULT 0,
        shipping_fee numeric DEFAULT 0,
        total numeric DEFAULT 0,
        status text DEFAULT 'draft',
        notes text,
        terms text,
        converted_invoice_id text,
        converted_at timestamptz,
        template text DEFAULT 'modern',
        primary_color text DEFAULT '#2563eb',
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
    );

    -- 5. PAYMENTS TABLE
    CREATE TABLE IF NOT EXISTS public.payments (
        id text PRIMARY KEY,
        invoice_id text REFERENCES public.invoices(id) ON DELETE CASCADE,
        invoice_number text NOT NULL,
        client_id text,
        client_name text NOT NULL,
        amount numeric DEFAULT 0,
        date date NOT NULL,
        method text DEFAULT 'bank_transfer',
        reference text,
        notes text,
        created_at timestamptz DEFAULT now()
    );

    -- 6. ACTIVITY LOGS TABLE
    CREATE TABLE IF NOT EXISTS public.activity_logs (
        id text PRIMARY KEY,
        type text NOT NULL,
        title text NOT NULL,
        description text,
        timestamp timestamptz DEFAULT now(),
        entity_id text,
        entity_type text,
        amount numeric
    );

    -- 7. BUSINESS PROFILE TABLE
    CREATE TABLE IF NOT EXISTS public.business_profile (
        id text PRIMARY KEY DEFAULT 'default',
        data jsonb NOT NULL,
        updated_at timestamptz DEFAULT now()
    );

    -- RLS POLICIES
    ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.business_profile ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Allow public read/write on clients" ON public.clients;
    DROP POLICY IF EXISTS "Allow public read/write on products" ON public.products;
    DROP POLICY IF EXISTS "Allow public read/write on invoices" ON public.invoices;
    DROP POLICY IF EXISTS "Allow public read/write on offers" ON public.offers;
    DROP POLICY IF EXISTS "Allow public read/write on payments" ON public.payments;
    DROP POLICY IF EXISTS "Allow public read/write on activity_logs" ON public.activity_logs;
    DROP POLICY IF EXISTS "Allow public read/write on business_profile" ON public.business_profile;

    CREATE POLICY "Allow public read/write on clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Allow public read/write on products" ON public.products FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Allow public read/write on invoices" ON public.invoices FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Allow public read/write on offers" ON public.offers FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Allow public read/write on payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Allow public read/write on activity_logs" ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Allow public read/write on business_profile" ON public.business_profile FOR ALL USING (true) WITH CHECK (true);

END $$;
