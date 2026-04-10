import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';
import { validateEmail, validateRequired } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name } = await request.json();
    const normalizedEmail = String(email || '').trim().toLowerCase();

    // 1. Basic validation
    if (!validateEmail(normalizedEmail)) return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    if (!validateRequired(password) || password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }
    if (!validateRequired(full_name)) return NextResponse.json({ error: 'El nombre completo es requerido' }, { status: 400 });

    // 2. Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'El usuario ya existe' }, { status: 400 });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 4. Create user
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({
        email: normalizedEmail,
        password_hash,
        full_name,
        role: 'customer',
      })
      .select('id, email, full_name, role')
      .single();

    if (error) {
      console.error('Register Error:', error);
      return NextResponse.json({ error: 'Error al crear el usuario' }, { status: 500 });
    }

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Register Route Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
