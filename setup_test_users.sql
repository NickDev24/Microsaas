-- Script para configurar usuarios de prueba
-- Ejecutar este script en Supabase SQL Editor

-- Actualizar usuario admin_basico
UPDATE users 
SET role = 'admin_basico' 
WHERE email = 'adminbasico@example.com';

-- Actualizar usuario super_admin
UPDATE users 
SET role = 'super_admin' 
WHERE email = 'superadmin@example.com';

-- Verificar los usuarios actualizados
SELECT id, email, full_name, role, is_active, created_at 
FROM users 
WHERE email IN ('adminbasico@example.com', 'superadmin@example.com', 'testcustomer@example.com')
ORDER BY role;
