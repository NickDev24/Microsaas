import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authorizeRoles } from '@/lib/api-auth';
import { validateCustomerPayload } from '@/lib/validators';

export async function GET(request: NextRequest) {
  try {
    const auth = await authorizeRoles(['super_admin', 'admin_basico']);
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    // Build query
    let query = supabaseAdmin
      .from('customers')
      .select('*', { count: 'exact' });

    // Apply search filter
    if (search) {
      query = query.or(`
        name.ilike.%${search}%,
        email.ilike.%${search}%,
        phone.ilike.%${search}%,
        dni.ilike.%${search}%
      `);
    }

    // Apply pagination and ordering
    const { data: customers, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    // Get customer statistics
    const { data: statsData } = await supabaseAdmin
      .from('customers')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const { data: ordersData } = await supabaseAdmin
      .from('orders')
      .select('customer_id, total')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const newCustomers = statsData?.length || 0;
    const activeCustomers = new Set(ordersData?.map(o => o.customer_id)).size;
    const totalRevenue = ordersData?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

    return NextResponse.json({
      customers: customers || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      stats: {
        total: count || 0,
        newCustomers,
        activeCustomers,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('Customers API Error:', error);
    return NextResponse.json(
      { error: 'Error fetching customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authorizeRoles(['super_admin', 'admin_basico']);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const { isValid, errors } = validateCustomerPayload(body);
    if (!isValid) return NextResponse.json({ errors }, { status: 400 });

    const allowedFields = ['name', 'email', 'phone', 'dni'] as const;
    const payload = Object.fromEntries(
      Object.entries(body).filter(([key]) => allowedFields.includes(key as (typeof allowedFields)[number]))
    );
    
    const { data: customer, error } = await supabaseAdmin
      .from('customers')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('Create Customer Error:', error);
    return NextResponse.json(
      { error: 'Error creating customer' },
      { status: 500 }
    );
  }
}
