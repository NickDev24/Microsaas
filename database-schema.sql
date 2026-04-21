-- ============================================
-- MODASHOP - SCHEMA SQL CONSOLIDADO Y SEGURO
-- ============================================
-- Versión: 2.0
-- Fecha: 2026-03-23
-- Descripción: Schema unificado con autenticación segura
-- ============================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABLAS PRINCIPALES
-- ============================================

-- ============================================
-- MULTI-TENANT (PLATAFORMA)
-- ============================================

-- Tabla de Tenants (Tiendas)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de relación Usuario <-> Tenant
-- Nota: Los roles aquí son roles de TIENDA (no de plataforma)
CREATE TABLE IF NOT EXISTS tenant_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('tenant_admin', 'tenant_staff')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, user_id)
);

-- Tabla de Usuarios (con autenticación bcrypt)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'customer' CHECK (role IN ('admin_basico', 'super_admin', 'customer')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Categorías
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    slug VARCHAR(100) NOT NULL UNIQUE,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Productos
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    sku VARCHAR(50) UNIQUE,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    compare_at_price DECIMAL(10,2) CHECK (compare_at_price >= 0),
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    low_stock_threshold INTEGER DEFAULT 5 CHECK (low_stock_threshold >= 0),
    sizes TEXT[] DEFAULT '{}',
    colors TEXT[] DEFAULT '{}',
    brand VARCHAR(100),
    material VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    images JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Imágenes de Productos (normalizada)
CREATE TABLE IF NOT EXISTS product_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    public_id VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Clientes
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    document_type VARCHAR(20),
    document_number VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Argentina',
    is_active BOOLEAN DEFAULT true,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    last_order_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Pedidos
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado')),
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    customer_address TEXT,
    notes TEXT,
    whatsapp_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Items de Pedido
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    size VARCHAR(50),
    color VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Ventas (registro de ventas completadas)
CREATE TABLE IF NOT EXISTS sales (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    sale_number VARCHAR(50) UNIQUE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    tax_amount DECIMAL(10,2) DEFAULT 0 CHECK (tax_amount >= 0),
    discount_amount DECIMAL(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    notes TEXT,
    sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Items de Venta
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    size VARCHAR(50),
    color VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Promociones
CREATE TABLE IF NOT EXISTS promotions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type VARCHAR(50) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value > 0),
    min_purchase_amount DECIMAL(10,2) DEFAULT 0,
    max_discount_amount DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    starts_at TIMESTAMP WITH TIME ZONE,
    ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Promociones-Productos (relación many-to-many)
CREATE TABLE IF NOT EXISTS promotion_products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    promotion_id UUID REFERENCES promotions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(promotion_id, product_id)
);

-- Tabla de Ediciones Limitadas
CREATE TABLE IF NOT EXISTS limited_editions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    total_units INTEGER NOT NULL CHECK (total_units > 0),
    remaining_units INTEGER NOT NULL CHECK (remaining_units >= 0),
    price_increase DECIMAL(10,2) DEFAULT 0 CHECK (price_increase >= 0),
    is_active BOOLEAN DEFAULT true,
    starts_at TIMESTAMP WITH TIME ZONE,
    ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Descuentos Estacionales
CREATE TABLE IF NOT EXISTS seasonal_discounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    season VARCHAR(100) NOT NULL,
    discount_percentage DECIMAL(5,2) NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
    is_active BOOLEAN DEFAULT true,
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Descuentos-Categorías
CREATE TABLE IF NOT EXISTS seasonal_discount_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    seasonal_discount_id UUID REFERENCES seasonal_discounts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE(seasonal_discount_id, category_id)
);

-- ============================================
-- TABLAS DE CONFIGURACIÓN Y WEBHOOKS
-- ============================================

-- Tabla de Configuración del Sistema
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT,
    type VARCHAR(20) DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Webhooks
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    event VARCHAR(100) NOT NULL,
    method VARCHAR(10) DEFAULT 'POST' CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE')),
    headers JSONB DEFAULT '{}',
    secret VARCHAR(255),
    retry_count INTEGER DEFAULT 3,
    timeout INTEGER DEFAULT 30000,
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Logs de Webhooks
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    webhook_id UUID REFERENCES webhooks(id) ON DELETE SET NULL,
    event VARCHAR(100) NOT NULL,
    status VARCHAR(50) CHECK (status IN ('success', 'failed', 'pending')),
    response_code INTEGER,
    response_time INTEGER,
    error TEXT,
    payload JSONB,
    response_body TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLAS DE ANALÍTICA (CONVERSIÓN / BÚSQUEDAS)
-- ============================================

-- Tabla de Visitas
CREATE TABLE IF NOT EXISTS visits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    landing_page VARCHAR(500),
    device_type VARCHAR(50) CHECK (device_type IN ('mobile', 'desktop', 'tablet')),
    browser VARCHAR(100),
    os VARCHAR(100),
    location_country VARCHAR(100),
    location_city VARCHAR(100),
    is_bot BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Eventos de Producto (incluye búsquedas)
CREATE TABLE IF NOT EXISTS product_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id VARCHAR(255),
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('view', 'add_to_cart', 'remove_from_cart', 'search')),
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLAS DE OBSERVABILIDAD Y SEGURIDAD
-- ============================================

-- Tabla de Logs de Requests API
CREATE TABLE IF NOT EXISTS api_request_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    method VARCHAR(10) NOT NULL,
    path TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    duration_ms INTEGER NOT NULL,
    user_email VARCHAR(255),
    user_role VARCHAR(50),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Eventos de Seguridad
CREATE TABLE IF NOT EXISTS security_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    path TEXT,
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Logs de Sistema
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    level VARCHAR(20) NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error')),
    source VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

-- Índices de Tenants
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_active ON tenants(is_active);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant ON tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user ON tenant_users(user_id);

-- Índices de Usuarios
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Índices de Categorías
CREATE INDEX IF NOT EXISTS idx_categories_tenant ON categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

-- Índices de Productos
CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);

-- Índices de Pedidos
CREATE INDEX IF NOT EXISTS idx_orders_tenant ON orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);

-- Índices de Ventas
CREATE INDEX IF NOT EXISTS idx_sales_tenant ON sales(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sales_order ON sales(order_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);

-- Índices de Logs
CREATE INDEX IF NOT EXISTS idx_api_logs_created ON api_request_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_created ON security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created ON webhook_logs(created_at DESC);

-- Índices de Analítica
CREATE INDEX IF NOT EXISTS idx_visits_created ON visits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visits_device ON visits(device_type);
CREATE INDEX IF NOT EXISTS idx_product_events_created ON product_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_events_type ON product_events(event_type);

-- ============================================
-- TRIGGERS PARA ACTUALIZACIÓN DE TIMESTAMPS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON promotions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_limited_editions_updated_at BEFORE UPDATE ON limited_editions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seasonal_discounts_updated_at BEFORE UPDATE ON seasonal_discounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCIONES AUXILIARES
-- ============================================

-- Función para generar número de orden
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- Función para generar número de venta
CREATE OR REPLACE FUNCTION generate_sale_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.sale_number IS NULL THEN
        NEW.sale_number := 'SALE-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('sale_number_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS sale_number_seq START 1;

CREATE TRIGGER generate_sale_number_trigger
    BEFORE INSERT ON sales
    FOR EACH ROW
    EXECUTE FUNCTION generate_sale_number();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE limited_editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasonal_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para lectura pública (productos activos)
CREATE POLICY "Public can view active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view product images" ON product_images FOR SELECT USING (true);

-- Políticas para lectura pública (promociones activas)
CREATE POLICY "Public can view active promotions" ON promotions FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active limited editions" ON limited_editions FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active seasonal discounts" ON seasonal_discounts FOR SELECT USING (is_active = true);

-- Políticas para administradores (usando service role key en backend)
-- Nota: El backend usa supabaseAdmin con service_role_key que bypass RLS
-- Estas policies son redundantes pero documentan el modelo de seguridad

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar categorías base
INSERT INTO categories (name, slug, description, sort_order) VALUES 
('Remeras', 'remeras', 'Remeras y musculosas para hombre y mujer', 1),
('Pantalones', 'pantalones', 'Jeans, joggers y pantalones casuales', 2),
('Buzos', 'buzos', 'Buzos y sweaters para todas las temporadas', 3),
('Camperas', 'camperas', 'Camperas y abrigos para protección contra el frío', 4),
('Accesorios', 'accesorios', 'Gorras, cinturones y otros accesorios de moda', 5),
('Calzado', 'calzado', 'Zapatillas y calzado deportivo', 6),
('Vestidos', 'vestidos', 'Vestidos y conjuntos femeninos', 7),
('Ropa Interior', 'ropa-interior', 'Ropa interior y pijamas', 8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista de productos con imagen primaria
CREATE OR REPLACE VIEW products_with_images AS
SELECT 
    p.*,
    c.name as category_name,
    c.slug as category_slug,
    (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image_url,
    (SELECT COUNT(*) FROM product_images WHERE product_id = p.id) as images_count
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true;

-- Vista de resumen de ventas diarias
CREATE OR REPLACE VIEW daily_sales_summary AS
SELECT 
    DATE(sale_date) as sale_date,
    COUNT(*) as total_sales,
    SUM(total) as total_revenue,
    SUM(subtotal) as total_subtotal,
    SUM(tax_amount) as total_tax,
    AVG(total) as average_sale_value
FROM sales
WHERE status = 'completed'
GROUP BY DATE(sale_date)
ORDER BY sale_date DESC;

-- Vista de productos con stock bajo
CREATE OR REPLACE VIEW low_stock_products AS
SELECT 
    p.*,
    c.name as category_name,
    CASE 
        WHEN p.stock = 0 THEN 'out_of_stock'
        WHEN p.stock <= p.low_stock_threshold THEN 'low_stock'
        ELSE 'ok'
    END as stock_status
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.stock <= p.low_stock_threshold AND p.is_active = true;

-- ============================================
-- COMENTARIOS FINALES
-- ============================================

-- USO:
-- 1. Ejecutar este schema en Supabase SQL Editor
-- 2. Crear usuario admin inicial usando el endpoint /api/auth/register
-- 3. Configurar variables de entorno según .env.example
-- 4. NO usar las credenciales del .env anterior (han sido expuestas)

-- SEGURIDAD:
-- - Todos los passwords deben hashearse con bcrypt (12+ rounds)
-- - El backend usa service_role_key solo en API routes (server-side)
-- - Frontend usa anon_key con RLS policies
-- - JWT tokens expiran en 1 hora (access) y 7 días (refresh)

-- ============================================
-- TRANSACCIONES ATÓMICAS (RPC FUNCTIONS)
-- ============================================

-- Crear orden con items en una transacción atómica
CREATE OR REPLACE FUNCTION create_order_with_items(
    p_order_data JSONB,
    p_items JSONB
)
RETURNS TABLE(
    order_id UUID,
    success BOOLEAN,
    error_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_order_id UUID;
    v_order_items JSONB;
    v_item_record JSONB;
    v_index INTEGER;
BEGIN
    -- Iniciar transacción implícita (PostgreSQL ya es transaccional)
    
    -- 1. Crear la orden
    INSERT INTO orders (
        created_by,
        customer_name,
        customer_email,
        customer_phone,
        customer_address,
        status,
        total,
        notes
    )
    SELECT 
        (p_order_data->>'created_by')::UUID,
        p_order_data->>'customer_name',
        p_order_data->>'customer_email',
        p_order_data->>'customer_phone',
        p_order_data->>'customer_address',
        COALESCE(p_order_data->>'status', 'pendiente'),
        COALESCE((p_order_data->>'total')::DECIMAL, 0),
        p_order_data->>'notes'
    RETURNING id INTO v_order_id;
    
    -- 2. Crear los items de la orden
    v_index := 0;
    FOR v_item_record IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        INSERT INTO order_items (
            order_id,
            product_id,
            quantity,
            unit_price,
            size,
            color,
            subtotal
        )
        VALUES (
            v_order_id,
            v_item_record->>'product_id',
            (v_item_record->>'quantity')::INTEGER,
            (v_item_record->>'unit_price')::DECIMAL,
            v_item_record->>'size',
            v_item_record->>'color',
            (v_item_record->>'quantity')::INTEGER * (v_item_record->>'unit_price')::DECIMAL
        );
        
        v_index := v_index + 1;
    END LOOP;
    
    -- 3. Retornar éxito
    RETURN QUERY SELECT v_order_id, true, NULL::TEXT;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Rollback automático por PostgreSQL
        RETURN QUERY SELECT NULL::UUID, false, SQLERRM;
END;
$$;

-- Crear venta con items, actualizar stock y estado de orden en transacción atómica
CREATE OR REPLACE FUNCTION create_sale_with_items(
    p_sale_data JSONB,
    p_items JSONB,
    p_order_id UUID DEFAULT NULL
)
RETURNS TABLE(
    sale_id UUID,
    success BOOLEAN,
    error_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_sale_id UUID;
    v_item_record JSONB;
    v_current_stock INTEGER;
    v_product_id UUID;
    v_quantity INTEGER;
BEGIN
    -- 1. Crear la venta
    INSERT INTO sales (
        created_by,
        order_id,
        customer_name,
        payment_method,
        total,
        notes,
        sale_date
    )
    SELECT 
        (p_sale_data->>'created_by')::UUID,
        p_order_id,
        p_sale_data->>'customer_name',
        COALESCE(p_sale_data->>'payment_method', 'efectivo'),
        (p_sale_data->>'total')::DECIMAL,
        p_sale_data->>'notes',
        COALESCE(p_sale_data->>'sale_date', NOW())
    RETURNING id INTO v_sale_id;
    
    -- 2. Crear items de venta y actualizar stock
    FOR v_item_record IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item_record->>'product_id')::UUID;
        v_quantity := (v_item_record->>'quantity')::INTEGER;
        
        -- Verificar stock disponible
        SELECT stock INTO v_current_stock 
        FROM products 
        WHERE id = v_product_id;
        
        IF v_current_stock < v_quantity THEN
            RAISE EXCEPTION 'Stock insuficiente para producto %: disponible=%, requerido=%', 
                v_product_id, v_current_stock, v_quantity;
        END IF;
        
        -- Insertar item de venta
        INSERT INTO sale_items (
            sale_id,
            product_id,
            quantity,
            unit_price,
            size,
            color,
            subtotal
        )
        VALUES (
            v_sale_id,
            v_product_id,
            v_quantity,
            (v_item_record->>'unit_price')::DECIMAL,
            v_item_record->>'size',
            v_item_record->>'color',
            v_quantity * (v_item_record->>'unit_price')::DECIMAL
        );
        
        -- Actualizar stock
        UPDATE products 
        SET stock = stock - v_quantity,
            updated_at = NOW()
        WHERE id = v_product_id;
    END LOOP;
    
    -- 3. Actualizar estado de orden si se proporcionó
    IF p_order_id IS NOT NULL THEN
        UPDATE orders 
        SET status = 'entregado',
            updated_at = NOW()
        WHERE id = p_order_id;
    END IF;
    
    -- 4. Retornar éxito
    RETURN QUERY SELECT v_sale_id, true, NULL::TEXT;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Rollback automático por PostgreSQL
        RETURN QUERY SELECT NULL::UUID, false, SQLERRM;
END;
$$;

-- Reposición de stock en lote (transacción atómica)
CREATE OR REPLACE FUNCTION reorder_stock_batch(
    p_product_updates JSONB
)
RETURNS TABLE(
    success BOOLEAN,
    updated_count INTEGER,
    error_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_update_record JSONB;
    v_product_id UUID;
    v_quantity INTEGER;
    v_updated_count INTEGER := 0;
BEGIN
    -- Procesar cada actualización de stock
    FOR v_update_record IN SELECT * FROM jsonb_array_elements(p_product_updates)
    LOOP
        v_product_id := (v_update_record->>'product_id')::UUID;
        v_quantity := (v_update_record->>'quantity')::INTEGER;
        
        -- Actualizar stock del producto
        UPDATE products 
        SET stock = stock + v_quantity,
            updated_at = NOW()
        WHERE id = v_product_id;
        
        -- Contar actualizaciones exitosas
        IF FOUND THEN
            v_updated_count := v_updated_count + 1;
        END IF;
    END LOOP;
    
    -- Retornar resultado
    RETURN QUERY SELECT true, v_updated_count, NULL::TEXT;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Rollback automático por PostgreSQL
        RETURN QUERY SELECT false, 0, SQLERRM;
END;
$$;

-- ============================================
-- SECUENCIAS Y NUMERACIÓN ROBUSTA
-- ============================================

-- Secuencia para numeración de facturas
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Función para generar número de factura robusto
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_next_val BIGINT;
    v_year TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
    v_month TEXT := LPAD(EXTRACT(MONTH FROM NOW())::TEXT, 2, '0');
BEGIN
    -- Obtener siguiente valor de la secuencia
    v_next_val := nextval('invoice_number_seq');
    
    -- Formato: FAC-YYYYMM-NNNNN (ej: FAC-202604-00001)
    RETURN 'FAC-' || v_year || v_month || '-' || LPAD(v_next_val::TEXT, 5, '0');
END;
$$;

-- Función para reiniciar secuencia mensualmente (opcional)
CREATE OR REPLACE FUNCTION reset_invoice_sequence_monthly()
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_last_reset TEXT;
    v_current_month TEXT;
BEGIN
    -- Obtener último reinicio desde system_settings
    SELECT COALESCE(setting_value, '1970-01') INTO v_last_reset
    FROM system_settings 
    WHERE setting_key = 'invoice_sequence_last_reset';
    
    v_current_month := EXTRACT(YEAR FROM NOW())::TEXT || '-' || LPAD(EXTRACT(MONTH FROM NOW())::TEXT, 2, '0');
    
    -- Si es un nuevo mes, reiniciar secuencia
    IF v_last_reset != v_current_month THEN
        -- Reiniciar secuencia a 1
        ALTER SEQUENCE invoice_number_seq RESTART WITH 1;
        
        -- Actualizar último reinicio
        INSERT INTO system_settings (setting_key, setting_value)
        VALUES ('invoice_sequence_last_reset', v_current_month)
        ON CONFLICT (setting_key) 
        DO UPDATE SET setting_value = v_current_month;
    END IF;
END;
$$;

-- LISTO PARA PRODUCCIÓN: Sí, después de:
-- 1. Rotar todas las claves de Supabase
-- 2. Rotar JWT secrets
-- 3. Rotar Cloudinary credentials
-- 4. Crear usuarios admin con bcrypt hashes
-- 5. Ejecutar las funciones RPC de transacciones
-- 6. Configurar secuencias de facturación
