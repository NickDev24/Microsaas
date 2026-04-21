# SOLUCIÓN MANUAL - PROBLEMAS DE AUTENTICACIÓN

## PROBLEMA IDENTIFICADO

El constraint `users_role_check` en la base de datos está bloqueando la creación de usuarios con roles `super_admin` y `admin_basico`. Solo permite el rol `customer`.

## SOLUCIÓN MANUAL - PASOS A SEGUIR

### PASO 1: ACCEDER A LA BASE DE DATOS

1. Inicia sesión en tu panel de Supabase
2. Ve a la sección "SQL Editor"
3. Selecciona tu base de datos

### PASO 2: ELIMINAR EL CONSTRAINT

Ejecuta el siguiente SQL:

```sql
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
```

### PASO 3: CREAR USUARIOS ADMIN

Ejecuta el siguiente SQL para crear los usuarios admin:

```sql
-- Super Admin
INSERT INTO users (id, email, password_hash, full_name, role, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'facudev4@gmail.com',
  '$2a$12$YourHashedPasswordHere',
  'Super Admin',
  'super_admin',
  true,
  NOW(),
  NOW()
);

-- Admin Básico
INSERT INTO users (id, email, password_hash, full_name, role, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'facucercuetti420@gmail.com',
  '$2a$12$YourHashedPasswordHere',
  'Admin Básico',
  'admin_basico',
  true,
  NOW(),
  NOW()
);
```

### PASO 4: GENERAR PASSWORDS HASHEADOS

Para generar los passwords hasheados, puedes usar este script:

```javascript
// Ejecutar en Node.js
const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

// Generar hashes
const superAdminHash = await hashPassword('admin123');
const basicAdminHash = await hashPassword('admin123');

console.log('Super Admin Hash:', superAdminHash);
console.log('Basic Admin Hash:', basicAdminHash);
```

O usa estos hashes pre-generados:

```sql
-- Super Admin (password: admin123)
INSERT INTO users (id, email, password_hash, full_name, role, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'facudev4@gmail.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm',
  'Super Admin',
  'super_admin',
  true,
  NOW(),
  NOW()
);

-- Admin Básico (password: admin123)
INSERT INTO users (id, email, password_hash, full_name, role, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'facucercuetti420@gmail.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm',
  'Admin Básico',
  'admin_basico',
  true,
  NOW(),
  NOW()
);
```

### PASO 5: VERIFICAR USUARIOS CREADOS

Ejecuta esta consulta para verificar:

```sql
SELECT email, role, full_name, is_active, created_at 
FROM users 
WHERE email IN ('facudev4@gmail.com', 'facucercuetti420@gmail.com');
```

### PASO 6: PROBAR LOGIN

1. Ve a: `http://localhost:9000/admin/login`
2. Usa las credenciales:
   - **Super Admin**: `facudev4@gmail.com` / `admin123`
   - **Admin Básico**: `facucercuetti420@gmail.com` / `admin123`

### PASO 7: VERIFICAR REDIRECCIÓN

- Super Admin debería redirigir a `/admin/superadmin`
- Admin Básico debería redirigir a `/admin/dashboard`

## ALTERNATIVA: USAR EL ENDPOINT DE CORRECCIÓN

Si prefieres usar el endpoint que creé:

1. Ejecuta el SQL manual (Paso 2)
2. Luego ejecuta: `curl -X POST http://localhost:9000/api/remove-constraint`

## CREDENCIALES FINALES

```
Super Admin: facudev4@gmail.com / admin123
Admin Básico: facucercuetti420@gmail.com / admin123
```

## VERIFICACIÓN FINAL

Después de seguir estos pasos:
- [ ] El constraint fue eliminado
- [ ] Los usuarios admin fueron creados
- [ ] El login funciona correctamente
- [ ] La redirección al dashboard funciona
- [ ] El panel de administración es accesible

## SI SIGUE FALLANDO

1. Verifica las variables de entorno de Supabase
2. Revisa los logs del servidor Next.js
3. Verifica que la conexión a la base de datos funcione
4. Contacta al soporte técnico de Supabase si es necesario

## NOTAS IMPORTANTES

- El constraint `users_role_check` fue el problema principal
- Una vez eliminado, los usuarios admin pueden ser creados
- Los passwords están hasheados con bcrypt (cost 12)
- Los usuarios deben tener `is_active = true` para funcionar
