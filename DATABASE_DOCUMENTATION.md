# 📊 Documentación de Base de Datos - ModaShop

## 🎯 **Resumen Ejecutivo**

Se ha creado un esquema de base de datos completo y optimizado para el e-commerce de moda **ModaShop**, utilizando PostgreSQL con Supabase. El esquema incluye todas las funcionalidades necesarias para una tienda online moderna y escalable.

---

## 🔧 **Instrucciones de Instalación**

### 1. **Ejecutar el Schema en Supabase**
```sql
-- Copiar y pegar todo el contenido del archivo database-schema.sql
-- en el editor SQL de Supabase Dashboard
```

### 2. **Verificar Usuario Administrador**
```sql
-- Confirmar que el usuario administrador fue creado
SELECT id, email, role, is_active, created_at
FROM users
WHERE email = '<tu-email-admin>';
```

---

## 📋 **Estructura de Tablas**

### 🏪 **Tablas Principales**

#### **1. users** - Gestión de Usuarios
```sql
- Autenticación con bcrypt
- Roles: admin_basico, super_admin, customer
- Timestamps automáticos
- Validación de email único
```

#### **2. categories** - Categorías de Productos
```sql
- Sistema de slugs amigables SEO
- Ordenamiento personalizado
- Imágenes por categoría
- Estados activos/inactivos
```

#### **3. products** - Catálogo de Productos
```sql
- Relación con categorías
- Control de stock con umbrales
- Sistema de tallas y colores (arrays)
- Precios comparativos para descuentos
- Productos destacados
- SKU único obligatorio
```

#### **4. product_images** - Galería de Imágenes
```sql
- Múltiples imágenes por producto
- Imagen primaria identificada
- Integración con Cloudinary
- Ordenamiento personalizado
```

---

## 🛒 **Sistema de Ventas**

### **5. orders** - Gestión de Pedidos
```sql
- Números de orden automáticos
- Estados del pedido (pending → delivered)
- Cálculo automático de totales
- Direcciones de envío y facturación
- Relación con usuarios
```

### **6. order_items** - Detalles de Pedidos
```sql
- Items múltiples por orden
- Precios unitarios congelados
- Cálculo automático de subtotales
- Protección de eliminación de productos
```

---

## 🎁 **Sistema de Promociones**

### **7. promotions** - Promociones Generales
```sql
- Descuentos porcentuales o fijos
- Aplicación por productos o categorías
- Fechas de vigencia
- Montos mínimos de compra
- Límites de descuento máximo
```

### **8. seasonal_discounts** - Descuentos Estacionales
```sql
- Descuentos por temporadas
- Aplicación por categorías
- Control de fechas automáticos
- Porcentajes de descuento
```

### **9. limited_editions** - Ediciones Limitadas
```sql
- Control de cantidad limitada
- Incrementos de precio premium
- Fechas de lanzamiento
- Seguimiento de disponibilidad
```

---

## 💰 **Sistema de Facturación**

### **10. invoices** - Facturación Electrónica
```sql
- Números de factura automáticos
- Cálculo de impuestos
- Múltiples monedas soportadas
- Estados de pago
- Integración con órdenes
```

### **11. sales** - Reportes Consolidados
```sql
- Ventas diarias consolidadas
- Métricas automáticas
- Valor promedio de orden
- Totales de productos vendidos
```

---

## 🔒 **Seguridad Implementada**

### **Row Level Security (RLS)**
```sql
✅ Usuarios públicos: Solo productos activos
✅ Usuarios autenticados: Sus propias órdenes
✅ Administradores: Acceso completo
✅ Validación de JWT tokens
```

### **Constraints y Validaciones**
```sql
✅ Emails únicos
✅ Slugs únicos y amigables
✅ SKUs únicos
✅ Precios no negativos
✅ Stock no negativo
✅ Enumeraciones de estados
```

---

## ⚡ **Optimizaciones de Rendimiento**

### **Índices Estratégicos**
```sql
🚀 Búsquedas por email (login)
🚀 Búsquedas por slug (SEO)
🚀 Filtros por categoría
🚀 Búsquedas por SKU
🚀 Consultas de productos activos
🚀 Reportes por fechas
🚀 Estados de órdenes
```

### **Triggers Automáticos**
```sql
⚡ Actualización de timestamps
⚡ Generación de números de orden
⚡ Generación de números de factura
⚡ Mantenimiento de estado
```

---

## 🔄 **Integraciones**

### **Cloudinary** - Gestión de Imágenes
```sql
- public_id para referencia directa
- URLs optimizadas
- Múltiples formatos soportados
```

### **JWT** - Autenticación
```sql
- Tokens de acceso (1 hora)
- Refresh tokens (7 días)
- Roles incluidos en payload
- Cookies HTTP-only seguras
```

### **Webhooks** - N8N Integration
```sql
- Eventos de creación de productos
- Estados de órdenes
- Notificaciones automáticas
```

---

## 📊 **Vistas Útiles**

### **products_with_images**
```sql
SELECT * FROM products_with_images;
-- Productos con imagen primaria y categoría
```

### **daily_sales_summary**
```sql
SELECT * FROM daily_sales_summary;
-- Resumen de ventas diarias automáticas
```

---

## 🎯 **Características Especiales**

### **Arrays PostgreSQL**
```sql
- Tallas: ['S', 'M', 'L', 'XL']
- Colores: ['negro', 'blanco', 'rojo']
- Promociones aplicables: [uuid1, uuid2]
```

### **UUID como Primary Keys**
```sql
- Seguridad mejorada
- IDs únicos globales
- Prevención de colisiones
```

### **Timezone Awareness**
```sql
- Timestamps con zona horaria
- Soporte multi-región
- Consistencia temporal
```

---

## 🚀 **Datos de Ejemplo Incluidos**

### **Categorías Precargadas**
```sql
✅ Remeras
✅ Pantalones  
✅ Buzos
✅ Camperas
✅ Accesorios
✅ Calzado
✅ Vestidos
✅ Ropa Interior
```

---

## 📈 **Escalabilidad Futura**

### **Preparado para:**
- 🌍 Multi-idioma
- 💳 Múltiples pasarelas de pago
- 📦 Integración con logística
- 📊 Analytics avanzados
- 🔄 Sincronización con ERPs
- 📱 App móvil

---

## 🎉 **Resultado Final**

✅ **Base de datos lista para producción**
✅ **Usuario administrador configurado**
✅ **Seguridad implementada**
✅ **Performance optimizada**
✅ **Documentación completa**
✅ **Datos de ejemplo incluidos**

---

## 📞 **Soporte**

Para cualquier consulta sobre la base de datos:
1. Revisar el archivo `database-schema.sql`
2. Consultar esta documentación
3. Verificar logs de Supabase
4. Validar permisos de RLS

**¡La base de datos está lista para usar! 🚀**
