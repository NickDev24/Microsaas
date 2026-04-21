# PLAN DE TESTING LOCAL - MICRO-SAAS ROPA

## OBJETIVO
Desplegar y testear completamente el sistema en entorno local para validar todas las funcionalidades antes de producción.

## FASE 1: SETUP LOCAL (Prioridad ALTA)

### 1.1 Configurar Entorno de Desarrollo
- [ ] Verificar Node.js 18+ instalado
- [ ] Instalar dependencias: `npm install`
- [ ] Verificar PostgreSQL disponible (local o Supabase)

### 1.2 Configurar Base de Datos
- [ ] Crear proyecto Supabase local o usar existente
- [ ] Ejecutar schema SQL completo: `database-schema.sql`
- [ ] Verificar todas las tablas creadas
- [ ] Verificar funciones RPC instaladas
- [ ] Verificar secuencias creadas

### 1.3 Configurar Variables de Entorno
- [ ] Copiar `.env.example` a `.env`
- [ ] Configurar credenciales Supabase
- [ ] Configurar JWT secrets
- [ ] Configurar Cloudinary (opcional para testing)
- [ ] Configurar URL local: `http://localhost:3000`

## FASE 2: TESTING AUTENTICACIÓN (Prioridad ALTA)

### 2.1 Registro de Usuarios
- [ ] **Test 1**: Registro de usuario customer normal
  - Endpoint: `POST /api/auth/register`
  - Payload: `{ email, password, full_name }`
  - Validar: role = 'customer' por defecto
  - Validar: password hasheado
  - Validar: respuesta 201 con datos del usuario

- [ ] **Test 2**: Intento de registro duplicado
  - Mismo email que Test 1
  - Validar: error 400 "Usuario ya existe"

### 2.2 Login y JWT Tokens
- [ ] **Test 3**: Login exitoso customer
  - Endpoint: `POST /api/auth/login`
  - Payload: `{ email, password }`
  - Validar: respuesta 200 con token
  - Validar: token contiene role, sub, exp
  - Validar: refresh token generado

- [ ] **Test 4**: Login con contraseña incorrecta
  - Payload: `{ email, password_incorrect }`
  - Validar: error 401 "Credenciales inválidas"

### 2.3 Refresh Token
- [ ] **Test 5**: Refresh token exitoso
  - Endpoint: `POST /api/auth/refresh`
  - Headers: Cookie con refresh token
  - Validar: nuevo access token generado

## FASE 3: TESTING RBAC (Prioridad ALTA)

### 3.1 Crear Usuarios de Prueba
- [ ] **Manual**: Crear usuario super_admin via SQL directo
- [ ] **Manual**: Crear usuario admin_basico via SQL directo
- [ ] **Manual**: Verificar usuarios creados en tabla `users`

### 3.2 Testing de Acceso por Rol
- [ ] **Test 6**: Acceso super_admin a endpoints propios
  - Login como super_admin
  - GET `/api/superadmin/system-status` -> 200 OK
  - GET `/api/superadmin/api-metrics` -> 200 OK
  - GET `/api/users` -> 200 OK
  - GET `/api/roles` -> 200 OK

- [ ] **Test 7**: Acceso admin_basico a endpoints propios
  - Login como admin_basico
  - GET `/api/orders` -> 200 OK
  - GET `/api/sales` -> 200 OK
  - GET `/api/products` -> 200 OK
  - GET `/api/invoices` -> 200 OK

- [ ] **Test 8**: Acceso denegado para roles incorrectos
  - Login como admin_basico
  - GET `/api/superadmin/system-status` -> 403 Forbidden
  - GET `/api/users` -> 403 Forbidden
  - GET `/api/roles` -> 403 Forbidden

## FASE 4: TESTING CRUD PRODUCTOS (Prioridad MEDIA)

### 4.1 Creación de Productos
- [ ] **Test 9**: Crear producto como admin
  - Login como admin_basico/super_admin
  - POST `/api/products`
  - Payload: `{ name, description, price, stock, category_id, low_stock_threshold }`
  - Validar: respuesta 201 con datos del producto
  - Validar: stock y low_stock_threshold configurados

### 4.2 Lectura y Actualización
- [ ] **Test 10**: Listar productos (público)
  - GET `/api/products` -> 200 OK
  - Validar: productos listados sin auth

- [ ] **Test 11**: Actualizar producto
  - PUT `/api/products/[id]` con auth
  - Payload: `{ price: 999, stock: 50 }`
  - Validar: respuesta 200 con datos actualizados

### 4.3 Eliminación
- [ ] **Test 12**: Eliminar producto
  - DELETE `/api/products/[id]` con auth
  - Validar: respuesta 200
  - Validar: producto eliminado de BD

## FASE 5: TESTING TRANSACCIONES ÓRDENES (Prioridad ALTA)

### 5.1 Creación de Órdenes
- [ ] **Test 13**: Crear orden con items (transacción atómica)
  - Login como admin
  - POST `/api/orders`
  - Payload: `{ customer_name, items: [{product_id, quantity, unit_price}] }`
  - Validar: respuesta 201 con order_id
  - Validar: order_items creados
  - Validar: rollback si falla (probar con product_id inválido)

### 5.2 Consistencia de Datos
- [ ] **Test 14**: Verificar integridad referencial
  - Consultar BD: `SELECT * FROM orders WHERE id = ?`
  - Consultar BD: `SELECT * FROM order_items WHERE order_id = ?`
  - Validar: todos los items presentes
  - Validar: total calculado correctamente

## FASE 6: TESTING TRANSACCIONES VENTAS (Prioridad ALTA)

### 6.1 Creación de Ventas
- [ ] **Test 15**: Crear venta con actualización de stock
  - Login como admin
  - POST `/api/sales`
  - Payload: `{ customer_name, items: [{product_id, quantity, unit_price}] }`
  - Validar: respuesta 201 con sale_id
  - Validar: sale_items creados
  - Validar: stock decrementado en productos

### 6.2 Actualización Automática de Órdenes
- [ ] **Test 16**: Venta con orden asociada
  - Crear orden primero (Test 13)
  - POST `/api/sales` con `order_id`
  - Validar: orden status actualizado a 'entregado'

### 6.3 Manejo de Stock Insuficiente
- [ ] **Test 17**: Intentar venta con stock insuficiente
  - Producto con stock = 1
  - Intentar vender quantity = 2
  - Validar: error 500 "Stock insuficiente"
  - Validar: no se crea venta ni se modifica stock

## FASE 7: TESTING STOCK MANAGEMENT (Prioridad MEDIA)

### 7.1 Stock Bajo
- [ ] **Test 18**: Productos con stock bajo
  - Crear productos con stock < low_stock_threshold
  - GET `/api/stock-bajo`
  - Validar: productos listados con status 'critical'/'warning'

### 7.2 Reordenamiento Batch
- [ ] **Test 19**: Reordenar stock en lote
  - POST `/api/stock-bajo`
  - Payload: `{ productIds: [...], reorderQuantity: 25 }`
  - Validar: stock incrementado para todos los productos
  - Validar: transacción atómica (rollback si falla)

## FASE 8: TESTING FACTURACIÓN (Prioridad MEDIA)

### 8.1 Numeración Robusta
- [ ] **Test 20**: Generar factura con secuencia
  - Crear venta primero
  - POST `/api/invoices` con `sale_id`
  - Validar: invoice_number formato FAC-YYYYMM-NNNNN
  - Validar: secuencia incremental

### 8.2 Cálculo de Impuestos
- [ ] **Test 21**: Verificar cálculo de impuestos
  - Total = 1000
  - Validar: subtotal = 1000 / 1.21 = 826.45
  - Validar: tax_amount = 173.55
  - Validar: total = subtotal + tax_amount

## FASE 9: TESTING STOREFRONT (Prioridad ALTA)

### 9.1 Carrito de Compras
- [ ] **Test 22**: Agregar productos al carrito
  - Navegar a tienda local
  - Agregar productos al carrito
  - Validar: carrito actualiza cantidad y total

### 9.2 Persistencia de Pedido
- [ ] **Test 23**: Checkout con WhatsApp
  - Carrito con productos
  - Click "Pedir por WhatsApp"
  - Validar: orden creada en BD (consultar `/api/orders`)
  - Validar: WhatsApp abre con mensaje y número de pedido

### 9.3 Manejo de Errores
- [ ] **Test 24**: Error en creación de pedido
  - Mock error en API
  - Validar: mensaje de error mostrado
  - Validar: carrito no se vacía si falla

## FASE 10: TESTING UI DINÁMICA (Prioridad MEDIA)

### 10.1 Navegación por Rol
- [ ] **Test 25**: Login como super_admin
  - Validar: sidebar muestra menú completo
  - Validar: sección "Usuarios" visible
  - Validar: sección "Superadmin" visible

- [ ] **Test 26**: Login como admin_basico
  - Validar: sidebar muestra menú limitado
  - Validar: sección "Usuarios" NO visible
  - Validar: sección "Superadmin" NO visible

### 10.2 Información de Usuario
- [ ] **Test 27**: Topbar muestra datos reales
  - Validar: nombre de usuario correcto
  - Validar: rol mostrado correctamente
  - Validar: logout funciona

## FASE 11: VALIDACIÓN FINAL (Prioridad ALTA)

### 11.1 Checklist de Funcionalidad
- [ ] **Auth**: Registro, login, refresh funcionando
- [ ] **RBAC**: Acceso denegado/permitido por rol
- [ ] **Products**: CRUD completo
- [ ] **Orders**: Transacciones atómicas funcionando
- [ ] **Sales**: Stock actualizado correctamente
- [ ] **Stock**: Alertas y reordenamiento funcionando
- [ ] **Invoices**: Numeración robusta funcionando
- [ ] **Storefront**: Carrito y WhatsApp funcionando
- [ ] **UI**: Navegación dinámica por rol funcionando

### 11.2 Performance y Errores
- [ ] **Test 28**: Tiempo de respuesta endpoints < 2s
- [ ] **Test 29**: Manejo de errores 500 correcto
- [ ] **Test 30**: Validación de payloads funciona

### 11.3 Calidad de Código
- [ ] **Test 31**: `npm run lint` -> 0 errores
- [ ] **Test 32**: `npm run type-check` -> 0 errores
- [ ] **Test 33**: `npm run build` -> exitoso

## CRITERIOS DE APROBACIÓN

### Aprobación Local Testing
- [ ] **Funcionalidad**: 100% de tests passing
- [ ] **Seguridad**: RBAC funcionando correctamente
- [ ] **Data Integrity**: Transacciones atómicas verificadas
- [ ] **UX**: Carrito y checkout funcionando
- [ ] **Code Quality**: Lint, type-check, build en verde

### Checklist Final - Ready for Production
- [ ] Todos los 33 tests ejecutados y pasando
- [ ] Sin errores en consola del navegador
- [ ] Sin errores en logs del servidor
- [ ] Base de datos consistente
- [ ] Sistema estable y funcional

## EJECUCIÓN

### Tiempo Estimado: 2-3 horas
### Requisitos: Entorno local configurado
### Responsable: Cascade

---

**ESTADO ACTUAL**: [ ] PENDIENTE DE EJECUCIÓN
**RESULTADO ESPERADO**: [ ] SISTEMA 100% VALIDADO LOCALMENTE
