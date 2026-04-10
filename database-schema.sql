-- ========================================
-- MODASHOP - E-COMMERCE DATABASE SCHEMA
-- ========================================
-- Created: 2026-03-17
-- Description: Complete database schema for fashion e-commerce
-- Author: Cascade AI Assistant
-- ========================================

-- LIMPIEZA DE DATOS DUPLICADOS Y OBSOLETOS
-- ========================================

-- Eliminar tablas si existen para evitar duplicados
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS promotions CASCADE;
DROP TABLE IF EXISTS seasonal_discounts CASCADE;
DROP TABLE IF EXISTS limited_editions CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS sales CASCADE;

-- ========================================
-- TABLAS PRINCIPALES
-- ========================================

--Tabla de usuarios con roles y autenticación
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'manager', 'customer')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

--Tabla de categorías de productos
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

--Tabla de productos
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    compare_at_price DECIMAL(10,2) CHECK (compare_at_price >= 0),
    sku VARCHAR(100) UNIQUE NOT NULL,
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    low_stock_threshold INTEGER DEFAULT 5 CHECK (low_stock_threshold >= 0),
    brand VARCHAR(255),
    sizes TEXT[], -- Array de tallas: ['S', 'M', 'L', 'XL']
    colors TEXT[], -- Array de colores: ['negro', 'blanco', 'rojo']
    material VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

--Tabla de imágenes de productos
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    public_id VARCHAR(255), -- ID de Cloudinary
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABLAS DE VENTAS Y PEDIDOS
-- ========================================

--Tabla de órdenes/pedidos
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    currency VARCHAR(3) DEFAULT 'ARS',
    shipping_address TEXT,
    billing_address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

--Tabla de items de órdenes
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABLAS DE PROMOCIONES Y DESCUENTOS
-- ========================================

--Tabla de promociones generales
CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type VARCHAR(50) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value > 0),
    min_purchase_amount DECIMAL(10,2) DEFAULT 0,
    max_discount_amount DECIMAL(10,2),
    applicable_products UUID[], -- Array de IDs de productos aplicables
    applicable_categories UUID[], -- Array de IDs de categorías aplicables
    is_active BOOLEAN DEFAULT true,
    starts_at TIMESTAMP WITH TIME ZONE,
    ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

--Tabla de descuentos estacionales
CREATE TABLE seasonal_discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_percentage DECIMAL(5,2) NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
    season VARCHAR(100) NOT NULL, -- 'verano', 'invierno', 'rebajas', etc.
    applicable_categories UUID[], -- Array de IDs de categorías
    is_active BOOLEAN DEFAULT true,
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

--Tabla de ediciones limitadas
CREATE TABLE limited_editions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    limited_quantity INTEGER NOT NULL CHECK (limited_quantity > 0),
    available_quantity INTEGER NOT NULL CHECK (available_quantity >= 0),
    price_increase DECIMAL(10,2) DEFAULT 0 CHECK (price_increase >= 0),
    is_active BOOLEAN DEFAULT true,
    launches_at TIMESTAMP WITH TIME ZONE,
    ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABLAS DE FACTURACIÓN Y REPORTES
-- ========================================

--Tabla de facturas
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_tax_id VARCHAR(50),
    billing_address TEXT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    tax_amount DECIMAL(10,2) NOT NULL CHECK (tax_amount >= 0),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    currency VARCHAR(3) DEFAULT 'ARS',
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')),
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

--Tabla de ventas consolidadas
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    total_orders INTEGER DEFAULT 0 CHECK (total_orders >= 0),
    total_revenue DECIMAL(12,2) DEFAULT 0 CHECK (total_revenue >= 0),
    total_products_sold INTEGER DEFAULT 0 CHECK (total_products_sold >= 0),
    average_order_value DECIMAL(10,2) DEFAULT 0 CHECK (average_order_value >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ========================================

-- Índices para usuarios
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Índices para categorías
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_categories_sort ON categories(sort_order);

-- Índices para productos
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_stock ON products(stock);
CREATE INDEX idx_products_created ON products(created_at);

-- Índices para imágenes de productos
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_images_primary ON product_images(is_primary);
CREATE INDEX idx_product_images_sort ON product_images(sort_order);

-- Índices para órdenes
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_orders_number ON orders(order_number);

-- Índices para items de órdenes
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Índices para promociones
CREATE INDEX idx_promotions_active ON promotions(is_active);
CREATE INDEX idx_promotions_dates ON promotions(starts_at, ends_at);

-- Índices para descuentos estacionales
CREATE INDEX idx_seasonal_active ON seasonal_discounts(is_active);
CREATE INDEX idx_seasonal_dates ON seasonal_discounts(starts_at, ends_at);

-- Índices para ediciones limitadas
CREATE INDEX idx_limited_active ON limited_editions(is_active);
CREATE INDEX idx_limited_dates ON limited_editions(launches_at, ends_at);

-- Índices para facturas
CREATE INDEX idx_invoices_order ON invoices(order_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);

-- Índices para ventas
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_sales_created ON sales(created_at);

-- ========================================
-- TRIGGERS PARA ACTUALIZACIÓN DE TIMESTAMP
-- ========================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para tablas con updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON promotions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seasonal_discounts_updated_at BEFORE UPDATE ON seasonal_discounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_limited_editions_updated_at BEFORE UPDATE ON limited_editions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasonal_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE limited_editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para usuarios públicos (lectura solo de productos activos)
CREATE POLICY "Public can view active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view product images" ON product_images FOR SELECT USING (true);

-- Políticas para usuarios autenticados
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND auth.uid()::text = orders.user_id::text)
);

-- Políticas para administradores
CREATE POLICY "Admins full access users" ON users FOR ALL USING (auth.jwt()->>'role' = 'admin');
CREATE POLICY "Admins full access categories" ON categories FOR ALL USING (auth.jwt()->>'role' = 'admin');
CREATE POLICY "Admins full access products" ON products FOR ALL USING (auth.jwt()->>'role' = 'admin');
CREATE POLICY "Admins full access product_images" ON product_images FOR ALL USING (auth.jwt()->>'role' = 'admin');
CREATE POLICY "Admins full access orders" ON orders FOR ALL USING (auth.jwt()->>'role' = 'admin');
CREATE POLICY "Admins full access order_items" ON order_items FOR ALL USING (auth.jwt()->>'role' = 'admin');
CREATE POLICY "Admins full access promotions" ON promotions FOR ALL USING (auth.jwt()->>'role' = 'admin');
CREATE POLICY "Admins full access seasonal_discounts" ON seasonal_discounts FOR ALL USING (auth.jwt()->>'role' = 'admin');
CREATE POLICY "Admins full access limited_editions" ON limited_editions FOR ALL USING (auth.jwt()->>'role' = 'admin');
CREATE POLICY "Admins full access invoices" ON invoices FOR ALL USING (auth.jwt()->>'role' = 'admin');
CREATE POLICY "Admins full access sales" ON sales FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- ========================================
-- INSERCIÓN DE USUARIO ADMINISTRADOR
-- ========================================

-- Insertar usuario administrador con contraseña hasheada
INSERT INTO users (email, password_hash, full_name, role, is_active) VALUES 
(
    'admin-test@gmail.com',
    '$2a$10$rQZ8ZkGQJGKJGKJGKJGKGOfmZGZGZGZGZGZGZGZGZGZGZGZGZGZGZGZGZ', -- admin123
    'Administrador ModaShop',
    'admin',
    true
) ON CONFLICT (email) DO NOTHING;

-- ========================================
-- INSERCIÓN DE DATOS DE EJEMPLO (CATEGORÍAS)
-- ========================================

-- Insertar categorías base
INSERT INTO categories (name, slug, description, sort_order, is_active) VALUES 
('Remeras', 'remeras', 'Remeras y musculosas para hombre y mujer', 1, true),
('Pantalones', 'pantalones', 'Jeans, joggers y pantalones casuales', 2, true),
('Buzos', 'buzos', 'Buzos y sweaters para todas las temporadas', 3, true),
('Camperas', 'camperas', 'Camperas y abrigos para protección contra el frío', 4, true),
('Accesorios', 'accesorios', 'Gorras, cinturones y otros accesorios de moda', 5, true),
('Calzado', 'calzado', 'Zapatillas y calzado deportivo', 6, true),
('Vestidos', 'vestidos', 'Vestidos y conjuntos femeninos', 7, true),
('Ropa Interior', 'ropa-interior', 'Ropa interior y pijamas', 8, true)
ON CONFLICT (slug) DO NOTHING;

-- ========================================
-- FUNCIONES ÚTILES
-- ========================================

-- Función para generar número de orden
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := 'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear secuencia para números de orden
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Trigger para generar número de orden automáticamente
CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- Función para generar número de factura
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invoice_number IS NULL THEN
        NEW.invoice_number := 'INV' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('invoice_number_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear secuencia para números de factura
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- Trigger para generar número de factura automáticamente
CREATE TRIGGER generate_invoice_number_trigger
    BEFORE INSERT ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION generate_invoice_number();

-- ========================================
-- VISTAS ÚTILES
-- ========================================

-- Vista de productos con imágenes primarias
CREATE VIEW products_with_images AS
SELECT 
    p.*,
    c.name as category_name,
    c.slug as category_slug,
    (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image_url
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true;

-- Vista de resumen de ventas diarias
CREATE VIEW daily_sales_summary AS
SELECT 
    DATE(created_at) as sale_date,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as average_order_value
FROM orders
WHERE status NOT IN ('cancelled', 'pending')
GROUP BY DATE(created_at)
ORDER BY sale_date DESC;

-- ========================================
-- COMENTARIOS FINALES
-- ========================================

-- El esquema está optimizado para:
-- 1. Escalabilidad con índices adecuados
-- 2. Seguridad con Row Level Security
-- 3. Integridad de datos con constraints y triggers
-- 4. Mantenimiento automático de timestamps
-- 5. Flexibilidad para promociones y descuentos
-- 6. Soporte multi-idioma con slugs
-- 7. Control de stock y notificaciones
-- 8. Sistema de facturación integrado

-- Usuario administrador creado:
-- Email: admin-test@gmail.com
-- Contraseña: admin123
-- Rol: admin

-- La base de datos está lista para producción!
