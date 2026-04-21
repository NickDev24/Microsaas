import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('=== VERIFICANDO ESTADO DE USUARIOS ===');

    // 1. Verificar usuarios existentes
    const { data: users, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .in('email', ['facudev4@gmail.com', 'facucercuetti420@gmail.com']);

    if (fetchError) {
      console.error('Error fetching users:', fetchError);
      return NextResponse.json({ error: 'Error fetching users', details: fetchError.message }, { status: 500 });
    }

    console.log('Usuarios encontrados:', users);

    // 2. Verificar estructura de la tabla
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .from('users')
      .select('*')
      .limit(1);

    // 3. Intentar login directo para debugging
    const loginTest = await fetch('http://localhost:9000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'facudev4@gmail.com',
        password: 'admin123'
      })
    });

    const loginResult = await loginTest.json();
    console.log('Resultado del login test:', loginResult);

    return NextResponse.json({
      users: users || [],
      tableStructure: tableInfo ? {
        columns: Object.keys(tableInfo[0] || {}),
        sample: tableInfo[0]
      } : null,
      loginTest: {
        status: loginTest.status,
        result: loginResult
      },
      databaseInfo: {
        hasUsers: users && users.length > 0,
        userCount: users?.length || 0,
        emails: users?.map(u => u.email) || []
      },
      recommendations: []
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
