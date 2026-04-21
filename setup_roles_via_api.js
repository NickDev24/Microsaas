// Script para configurar roles usando la API REST de Supabase
// Ejecutar con: node setup_roles_via_api.js

const { createClient } = require('@supabase/supabase-js');

// Configuración desde el entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Error: Configuración de Supabase no encontrada en variables de entorno');
  process.exit(1);
}

// Crear cliente de Supabase con service role key (bypass RLS)
const supabase = createClient(supabaseUrl, serviceKey);

async function setupUserRoles() {
  try {
    console.log('Configurando roles de usuarios de prueba...');

    // Actualizar admin_basico
    const { data: adminBasico, error: adminBasicoError } = await supabase
      .from('users')
      .update({ role: 'admin_basico' })
      .eq('email', 'adminbasico@example.com')
      .select('id, email, full_name, role')
      .single();

    if (adminBasicoError) {
      console.error('Error actualizando admin_basico:', adminBasicoError);
    } else {
      console.log('Admin Básico actualizado:', adminBasico);
    }

    // Actualizar super_admin
    const { data: superAdmin, error: superAdminError } = await supabase
      .from('users')
      .update({ role: 'super_admin' })
      .eq('email', 'superadmin@example.com')
      .select('id, email, full_name, role')
      .single();

    if (superAdminError) {
      console.error('Error actualizando super_admin:', superAdminError);
    } else {
      console.log('Super Admin actualizado:', superAdmin);
    }

    // Verificar todos los usuarios
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, full_name, role, is_active')
      .in('email', [
        'testcustomer@example.com',
        'adminbasico@example.com',
        'superadmin@example.com'
      ])
      .order('role');

    if (usersError) {
      console.error('Error obteniendo usuarios:', usersError);
    } else {
      console.log('\nUsuarios configurados:');
      console.table(users);
    }

    console.log('\nConfiguración de roles completada exitosamente!');

  } catch (error) {
    console.error('Error en la configuración:', error);
    process.exit(1);
  }
}

setupUserRoles();
