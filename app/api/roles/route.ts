import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authorizeRoles } from '@/lib/api-auth';
import { validateRolePayload } from '@/lib/validators';

export async function GET(request: NextRequest) {
  try {
    const auth = await authorizeRoles(['super_admin']);
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    // Build query
    let query = supabaseAdmin
      .from('roles')
      .select('*', { count: 'exact' });

    // Apply search filter
    if (search) {
      query = query.or(`
        name.ilike.%${search}%,
        description.ilike.%${search}%
      `);
    }

    // Apply pagination and ordering
    const { data: roles, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    // Get user count for each role
    const rolesWithUserCount = await Promise.all(
      (roles || []).map(async (role) => {
        const { count: userCount } = await supabaseAdmin
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', role.id);

        return {
          ...role,
          userCount: userCount || 0
        };
      })
    );

    // Get all users for the users tab
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    // Get statistics
    const stats = rolesWithUserCount?.reduce((acc, role) => {
      acc.total++;
      if (role.is_active) {
        acc.active++;
      } else {
        acc.inactive++;
      }
      acc.totalUsers += role.userCount;
      return acc;
    }, { total: 0, active: 0, inactive: 0, totalUsers: 0 });

    return NextResponse.json({
      roles: rolesWithUserCount,
      users: users || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      stats
    });
  } catch (error) {
    console.error('Roles API Error:', error);
    return NextResponse.json(
      { error: 'Error fetching roles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authorizeRoles(['super_admin']);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const { isValid, errors } = validateRolePayload(body);
    if (!isValid) return NextResponse.json({ errors }, { status: 400 });

    const allowedFields = ['name', 'description', 'permissions', 'is_system', 'is_active'] as const;
    const payload = Object.fromEntries(
      Object.entries(body).filter(([key]) => allowedFields.includes(key as (typeof allowedFields)[number]))
    );
    
    const { data: role, error } = await supabaseAdmin
      .from('roles')
      .insert([{
        name: payload.name,
        description: payload.description,
        permissions: payload.permissions || [],
        is_system: payload.is_system || false,
        is_active: payload.is_active ?? true
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    console.error('Create Role Error:', error);
    return NextResponse.json(
      { error: 'Error creating role' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await authorizeRoles(['super_admin']);
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get('id');
    const body = await request.json();

    const { isValid, errors } = validateRolePayload(body, { partial: true });
    if (!isValid) return NextResponse.json({ errors }, { status: 400 });

    const allowedFields = ['name', 'description', 'permissions', 'is_active'] as const;
    const updatePayload = Object.fromEntries(
      Object.entries(body).filter(([key]) => allowedFields.includes(key as (typeof allowedFields)[number]))
    );

    if (!roleId) {
      return NextResponse.json(
        { error: 'Role ID is required' },
        { status: 400 }
      );
    }

    const { data: role, error } = await supabaseAdmin
      .from('roles')
      .update(updatePayload)
      .eq('id', roleId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(role);
  } catch (error) {
    console.error('Update Role Error:', error);
    return NextResponse.json(
      { error: 'Error updating role' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await authorizeRoles(['super_admin']);
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get('id');

    if (!roleId) {
      return NextResponse.json(
        { error: 'Role ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('roles')
      .delete()
      .eq('id', roleId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete Role Error:', error);
    return NextResponse.json(
      { error: 'Error deleting role' },
      { status: 500 }
    );
  }
}
