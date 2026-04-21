-- ============================================
-- SCRIPT PARA CORREGIR CONSTRAINT DE ROLES
-- ============================================
-- Fecha: 2026-04-21
-- Descripción: Eliminar constraint temporal y corregir roles existentes
-- ============================================

-- 1. ELIMINAR CONSTRAINT TEMPORAL QUE IMPIDE CREAR USUARIOS CON ROLES CORRECTOS
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- 2. ACTUALIZAR ROLES DE USUARIOS EXISTENTES (basado en emails del .env)
-- facudev4@gmail.com debe ser super_admin
UPDATE users 
SET role = 'super_admin' 
WHERE email = 'facudev4@gmail.com';

-- facucercuetti420@gmail.com debe ser admin_basico
UPDATE users 
SET role = 'admin_basico' 
WHERE email = 'facucercuetti420@gmail.com';

-- 3. VERIFICAR ACTUALIZACIÓN
SELECT 
    email, 
    role, 
    is_active, 
    created_at,
    updated_at
FROM users 
WHERE email IN ('facudev4@gmail.com', 'facucercuetti420@gmail.com')
ORDER BY email;

-- 4. MOSTRAR ESTADO ACTUAL DE LA TABLA USERS
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'super_admin' THEN 1 END) as super_admin_count,
    COUNT(CASE WHEN role = 'admin_basico' THEN 1 END) as admin_basico_count,
    COUNT(CASE WHEN role = 'customer' THEN 1 END) as customer_count
FROM users;

-- 5. VERIFICAR QUE NO EXISTAN ROLES INVÁLIDOS
SELECT DISTINCT role FROM users ORDER BY role;

-- 6. REGISTRAR CAMBIO EN LOG DE SEGURIDAD (si existe la tabla)
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'security_events'
    ) THEN
        INSERT INTO security_events (event_type, email, path, meta, created_at)
        VALUES (
            'role_correction',
            'system',
            '/scripts/fix_roles_constraint.sql',
            jsonb_build_object(
                'action', 'constraint_dropped_and_roles_fixed',
                'affected_users', ARRAY['facudev4@gmail.com', 'facucercuetti420@gmail.com'],
                'timestamp', NOW()
            ),
            NOW()
        );
    END IF;
END $$;

-- ============================================
-- RESULTADO ESPERADO:
-- - Constraint eliminado
-- - facudev4@gmail.com con role = 'super_admin'
-- - facucercuetti420@gmail.com con role = 'admin_basico'
-- - Sistema listo para crear usuarios con roles correctos
-- ============================================
