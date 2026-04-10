import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authorizeRoles } from '@/lib/api-auth';
import { validateWebhookPayload } from '@/lib/validators';

export async function GET(request: NextRequest) {
  try {
    const auth = await authorizeRoles(['super_admin']);
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build query
    let query = supabaseAdmin
      .from('webhooks')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('is_active', status === 'active');
    }
    
    if (search) {
      query = query.or(`
        name.ilike.%${search}%,
        url.ilike.%${search}%,
        event.ilike.%${search}%
      `);
    }

    // Apply pagination and ordering
    const { data: webhooks, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    // Get webhook logs
    const { data: logs } = await supabaseAdmin
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    // Get statistics
    const stats = webhooks?.reduce((acc, webhook) => {
      acc.total++;
      if (webhook.is_active) {
        acc.active++;
      } else {
        acc.inactive++;
      }
      return acc;
    }, { total: 0, active: 0, inactive: 0 });

    return NextResponse.json({
      webhooks: webhooks || [],
      logs: logs || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      stats
    });
  } catch (error) {
    console.error('Webhooks API Error:', error);
    return NextResponse.json(
      { error: 'Error fetching webhooks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authorizeRoles(['super_admin']);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const { isValid, errors } = validateWebhookPayload(body);
    if (!isValid) return NextResponse.json({ errors }, { status: 400 });

    const allowedFields = [
      'name',
      'url',
      'event',
      'method',
      'headers',
      'secret',
      'retry_count',
      'timeout',
      'is_active',
      'description',
    ] as const;
    const payload = Object.fromEntries(
      Object.entries(body).filter(([key]) => allowedFields.includes(key as (typeof allowedFields)[number]))
    );
    
    const { data: webhook, error } = await supabaseAdmin
      .from('webhooks')
      .insert([{
        name: payload.name,
        url: payload.url,
        event: payload.event,
        method: payload.method || 'POST',
        headers: payload.headers || {},
        secret: payload.secret,
        retry_count: payload.retry_count || 3,
        timeout: payload.timeout || 30000,
        is_active: payload.is_active ?? true,
        description: payload.description
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(webhook, { status: 201 });
  } catch (error) {
    console.error('Create Webhook Error:', error);
    return NextResponse.json(
      { error: 'Error creating webhook' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await authorizeRoles(['super_admin']);
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(request.url);
    const webhookId = searchParams.get('id');
    const body = await request.json();

    const { isValid, errors } = validateWebhookPayload(body, { partial: true });
    if (!isValid) return NextResponse.json({ errors }, { status: 400 });

    const allowedFields = [
      'name',
      'url',
      'event',
      'method',
      'headers',
      'secret',
      'retry_count',
      'timeout',
      'is_active',
      'description',
    ] as const;
    const updatePayload = Object.fromEntries(
      Object.entries(body).filter(([key]) => allowedFields.includes(key as (typeof allowedFields)[number]))
    );

    if (!webhookId) {
      return NextResponse.json(
        { error: 'Webhook ID is required' },
        { status: 400 }
      );
    }

    const { data: webhook, error } = await supabaseAdmin
      .from('webhooks')
      .update(updatePayload)
      .eq('id', webhookId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(webhook);
  } catch (error) {
    console.error('Update Webhook Error:', error);
    return NextResponse.json(
      { error: 'Error updating webhook' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await authorizeRoles(['super_admin']);
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(request.url);
    const webhookId = searchParams.get('id');

    if (!webhookId) {
      return NextResponse.json(
        { error: 'Webhook ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('webhooks')
      .delete()
      .eq('id', webhookId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete Webhook Error:', error);
    return NextResponse.json(
      { error: 'Error deleting webhook' },
      { status: 500 }
    );
  }
}
