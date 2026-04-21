import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export interface TenantContext {
  tenantId: string | null;
  tenantSlug: string | null;
  error?: string;
}

const PUBLIC_PATHS = ['/api/auth', '/api/products', '/api/categories', '/api/promotions', '/api/limited-editions', '/api/seasonal-discounts'];
const PLATFORM_ADMIN_PATHS = ['/admin'];

/**
 * Extract tenant context from request (path-based: /t/{tenantSlug}/...)
 * Returns null tenantId if not in tenant context (platform routes)
 */
export async function resolveTenantFromRequest(request: NextRequest): Promise<TenantContext> {
  const pathname = request.nextUrl.pathname;

  // Platform routes (no tenant context)
  if (PLATFORM_ADMIN_PATHS.some(p => pathname.startsWith(p)) || PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return { tenantId: null, tenantSlug: null };
  }

  // Extract /t/{tenantSlug} pattern
  const match = /^\/t\/([^\/]+)(\/.*)?$/.exec(pathname);
  if (!match) {
    return { tenantId: null, tenantSlug: null };
  }

  const [, tenantSlug] = match;

  // Resolve tenant from DB
  const { data: tenant, error } = await supabaseAdmin
    .from('tenants')
    .select('id, slug, is_active')
    .eq('slug', tenantSlug)
    .eq('is_active', true)
    .single();

  if (error || !tenant) {
    return { tenantId: null, tenantSlug, error: 'Tenant not found or inactive' };
  }

  return { tenantId: tenant.id, tenantSlug: tenant.slug };
}

/**
 * Get tenantId from authenticated user (for platform/superadmin routes)
 */
export async function getTenantForUser(userId: string, userRole: string): Promise<string | null> {
  if (userRole === 'super_admin') {
    return null; // Superadmin can see all
  }

  // For tenant users, fetch their tenant
  const { data: tenantUser } = await supabaseAdmin
    .from('tenant_users')
    .select('tenant_id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  return tenantUser?.tenant_id || null;
}
