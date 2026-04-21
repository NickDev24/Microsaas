// Script para configurar roles usando fetch directo a la API REST de Supabase
// Ejecutar con: node setup_roles_direct.js

const fs = require('fs');
const path = require('path');

// Leer variables de entorno desde .env
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && !key.startsWith('#')) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  return envVars;
}

async function setupUserRoles() {
  try {
    const env = loadEnvFile();
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error('Error: Configuración de Supabase no encontrada en .env');
      console.log('Variables disponibles:', Object.keys(env));
      process.exit(1);
    }

    console.log('Configurando roles de usuarios de prueba...');
    console.log('Supabase URL:', supabaseUrl);

    // Headers para autenticación con service role key
    const headers = {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };

    // Actualizar admin_basico
    console.log('Actualizando facucercuetti420@gmail.com...');
    const adminBasicoResponse = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent('facucercuetti420@gmail.com')}`, {
      method: 'PATCH',
      headers: headers,
      body: JSON.stringify({
        role: 'admin_basico'
      })
    });

    if (!adminBasicoResponse.ok) {
      console.error('Error actualizando admin_basico:', await adminBasicoResponse.text());
    } else {
      const adminBasico = await adminBasicoResponse.json();
      console.log('Admin Básico actualizado:', adminBasico);
    }

    // Actualizar super_admin
    console.log('Actualizando facudev4@gmail.com...');
    const superAdminResponse = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent('facudev4@gmail.com')}`, {
      method: 'PATCH',
      headers: headers,
      body: JSON.stringify({
        role: 'super_admin'
      })
    });

    if (!superAdminResponse.ok) {
      console.error('Error actualizando super_admin:', await superAdminResponse.text());
    } else {
      const superAdmin = await superAdminResponse.json();
      console.log('Super Admin actualizado:', superAdmin);
    }

    // Verificar todos los usuarios
    console.log('Verificando usuarios configurados...');
    const usersResponse = await fetch(`${supabaseUrl}/rest/v1/users?email=in.(${encodeURIComponent('testcustomer@example.com')},${encodeURIComponent('facucercuetti420@gmail.com')},${encodeURIComponent('facudev4@gmail.com')})&order=role`, {
      method: 'GET',
      headers: headers
    });

    if (usersResponse.ok) {
      const users = await usersResponse.json();
      console.log('\nUsuarios configurados:');
      console.table(users);
    } else {
      console.error('Error obteniendo usuarios:', await usersResponse.text());
    }

    console.log('\nConfiguración de roles completada!');

  } catch (error) {
    console.error('Error en la configuración:', error);
    process.exit(1);
  }
}

setupUserRoles();
