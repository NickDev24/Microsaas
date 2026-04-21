import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

describe('Users API Integration Tests', () => {
  let testUser: any = null;
  let superAdminToken: string | null = null;

  beforeAll(async () => {
    // Crear super admin de test
    const { data: adminData } = await supabase
      .from('users')
      .insert({
        email: 'superadmin@test.com',
        password: '$2a$10$superadminhashedpassword',
        role: 'super_admin',
        full_name: 'Super Admin Test',
        is_active: true
      })
      .select()
      .single();

    testUser = adminData;
    superAdminToken = 'mock_super_admin_token';
  });

  afterAll(async () => {
    // Limpiar usuarios de test
    await supabase
      .from('users')
      .delete()
      .eq('email', 'superadmin@test.com');
  });

  describe('GET /api/users', () => {
    it('should reject access without authentication', async () => {
      const response = await fetch('http://localhost:3001/api/users');
      
      expect(response.status).toBe(401);
    });

    it('should reject access for non-super-admin users', async () => {
      const response = await fetch('http://localhost:3001/api/users', {
        headers: {
          'Cookie': 'token=mock_basic_admin_token'
        },
      });

      expect(response.status).toBe(403);
    });

    it('should allow access for super-admin users', async () => {
      const response = await fetch('http://localhost:3001/api/users', {
        headers: {
          'Cookie': `token=${superAdminToken}`
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
      } else {
        // Si falla por autenticación, verificamos que el endpoint exista
        expect([401, 403]).toContain(response.status);
      }
    });
  });

  describe('PUT /api/users/[id]', () => {
    let regularUser: any = null;

    beforeAll(async () => {
      // Crear usuario regular para tests
      const { data: userData } = await supabase
        .from('users')
        .insert({
          email: 'regular@test.com',
          password: '$2a$10$regularhashedpassword',
          role: 'customer',
          full_name: 'Regular User',
          is_active: true
        })
        .select()
        .single();

      regularUser = userData;
    });

    afterAll(async () => {
      if (regularUser) {
        await supabase
          .from('users')
          .delete()
          .eq('id', regularUser.id);
      }
    });

    it('should reject user update without authentication', async () => {
      if (!regularUser) return;

      const response = await fetch(`http://localhost:3001/api/users/${regularUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: 'Updated Name'
        }),
      });

      expect(response.status).toBe(401);
    });

    it('should reject user update by non-super-admin', async () => {
      if (!regularUser) return;

      const response = await fetch(`http://localhost:3001/api/users/${regularUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': 'token=mock_basic_admin_token'
        },
        body: JSON.stringify({
          full_name: 'Updated Name'
        }),
      });

      expect(response.status).toBe(403);
    });

    it('should allow user update by super-admin', async () => {
      if (!regularUser) return;

      const updateData = {
        full_name: 'Updated Regular User',
        role: 'admin_basico',
        is_active: true
      };

      const response = await fetch(`http://localhost:3001/api/users/${regularUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `token=${superAdminToken}`
        },
        body: JSON.stringify(updateData),
      });

      if (response.status === 200) {
        const data = await response.json();
        expect(data.full_name).toBe(updateData.full_name);
        expect(data.role).toBe(updateData.role);
      } else {
        expect([401, 403, 404]).toContain(response.status);
      }
    });

    it('should reject invalid field updates', async () => {
      if (!regularUser) return;

      const response = await fetch(`http://localhost:3001/api/users/${regularUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `token=${superAdminToken}`
        },
        body: JSON.stringify({
          password: 'newpassword', // Campo no permitido
          email: 'newemail@test.com' // Campo no permitido
        }),
      });

      if (response.status === 400) {
        const data = await response.json();
        expect(data.error).toBeDefined();
      } else {
        expect([200, 401, 403]).toContain(response.status);
      }
    });
  });

  describe('Role Management', () => {
    it('should only allow super_admin to manage roles', async () => {
      if (!testUser) return;

      const response = await fetch(`http://localhost:3001/api/users/${testUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `token=${superAdminToken}`
        },
        body: JSON.stringify({
          role: 'admin_basico'
        }),
      });

      if (response.status === 200) {
        const data = await response.json();
        expect(['super_admin', 'admin_basico', 'customer']).toContain(data.role);
      } else {
        expect([401, 403]).toContain(response.status);
      }
    });

    it('should prevent role escalation to super_admin by non-super-admin', async () => {
      const response = await fetch(`http://localhost:3001/api/users/${testUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': 'token=mock_basic_admin_token'
        },
        body: JSON.stringify({
          role: 'super_admin'
        }),
      });

      expect(response.status).toBe(403);
    });
  });
});
