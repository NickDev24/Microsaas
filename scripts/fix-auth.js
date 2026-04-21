// Script para crear usuarios admin funcionales
// Ejecutar con: node scripts/fix-auth.js

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

async function fixAuth() {
  try {
    console.log('=== CREANDO USUARIOS ADMIN FUNCIONALES ===');

    // Crear Super Admin
    console.log('\n1. Creando Super Admin...');
    const superAdminResponse = await fetch(`${BASE_URL}/api/debug/fix-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'facudev4@gmail.com',
        password: 'admin123',
        role: 'super_admin'
      })
    });

    const superAdminData = await superAdminResponse.json();
    console.log('Super Admin:', superAdminData.success ? 'CREADO' : 'ERROR');
    if (!superAdminData.success) {
      console.log('Error:', superAdminData.error);
    }

    // Crear Admin Básico
    console.log('\n2. Creando Admin Básico...');
    const basicAdminResponse = await fetch(`${BASE_URL}/api/debug/fix-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'facucercuetti420@gmail.com',
        password: 'admin123',
        role: 'admin_basico'
      })
    });

    const basicAdminData = await basicAdminResponse.json();
    console.log('Admin Básico:', basicAdminData.success ? 'CREADO' : 'ERROR');
    if (!basicAdminData.success) {
      console.log('Error:', basicAdminData.error);
    }

    console.log('\n=== USUARIOS CREADOS ===');
    console.log('Super Admin: facudev4@gmail.com / admin123');
    console.log('Admin Básico: facucercuetti420@gmail.com / admin123');
    console.log('\n=== INSTRUCCIONES DE LOGIN ===');
    console.log('1. Ir a http://localhost:3001/admin/login');
    console.log('2. Usar las credenciales anteriores');
    console.log('3. Debería redirigir al dashboard correspondiente');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixAuth();
