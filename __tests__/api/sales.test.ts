import { NextRequest } from 'next/server';
import { POST as createSale } from '@/app/api/sales/route';

// Mock the dependencies
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      }))
    }))
  }
}));

jest.mock('@/lib/api-auth', () => ({
  authorizeRoles: jest.fn(() => ({
    ok: true,
    payload: { sub: 'test-user-id' }
  }))
}));

jest.mock('@/lib/validators', () => ({
  validateSalePayload: jest.fn(() => ({
    isValid: true,
    errors: {}
  }))
}));

jest.mock('@/lib/transactions', () => ({
  createSaleWithItems: jest.fn()
}));

describe('Sales API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/sales', () => {
    it('should create a sale with items and update stock successfully', async () => {
      const { createSaleWithItems } = require('@/lib/transactions');
      createSaleWithItems.mockResolvedValue({
        success: true,
        sale_id: 'test-sale-id'
      });

      const mockSupabase = require('@/lib/supabase').supabaseAdmin;
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'test-sale-id', items: [] },
              error: null
            })
          })
        })
      });

      const saleData = {
        customer_name: 'Test Customer',
        payment_method: 'efectivo',
        total: 100,
        notes: 'Test notes',
        items: [
          {
            product_id: 'product-1',
            quantity: 2,
            unit_price: 50
          }
        ]
      };

      const request = new NextRequest('http://localhost:3000/api/sales', {
        method: 'POST',
        body: JSON.stringify(saleData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await createSale(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBe('test-sale-id');
      expect(createSaleWithItems).toHaveBeenCalledWith(
        expect.objectContaining({
          created_by: 'test-user-id',
          customer_name: 'Test Customer',
          total: 100
        }),
        expect.any(Array),
        undefined
      );
    });

    it('should create a sale linked to an order', async () => {
      const { createSaleWithItems } = require('@/lib/transactions');
      createSaleWithItems.mockResolvedValue({
        success: true,
        sale_id: 'test-sale-id'
      });

      const mockSupabase = require('@/lib/supabase').supabaseAdmin;
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'test-sale-id', items: [] },
              error: null
            })
          })
        })
      });

      const saleData = {
        order_id: 'test-order-id',
        customer_name: 'Test Customer',
        payment_method: 'tarjeta',
        total: 100,
        items: [
          {
            product_id: 'product-1',
            quantity: 1,
            unit_price: 100
          }
        ]
      };

      const request = new NextRequest('http://localhost:3000/api/sales', {
        method: 'POST',
        body: JSON.stringify(saleData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await createSale(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(createSaleWithItems).toHaveBeenCalledWith(
        expect.objectContaining({
          order_id: 'test-order-id'
        }),
        expect.any(Array),
        'test-order-id'
      );
    });

    it('should return 400 for invalid sale data', async () => {
      const { validateSalePayload } = require('@/lib/validators');
      validateSalePayload.mockReturnValue({
        isValid: false,
        errors: { customer_name: 'Required' }
      });

      const request = new NextRequest('http://localhost:3000/api/sales', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await createSale(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors).toBeDefined();
    });

    it('should return 403 for unauthorized access', async () => {
      const { authorizeRoles } = require('@/lib/api-auth');
      authorizeRoles.mockReturnValue({
        ok: false,
        response: new Response('Forbidden', { status: 403 })
      });

      const request = new NextRequest('http://localhost:3000/api/sales', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await createSale(request);
      expect(response.status).toBe(403);
    });

    it('should handle transaction errors gracefully', async () => {
      const { createSaleWithItems } = require('@/lib/transactions');
      createSaleWithItems.mockRejectedValue(new Error('Transaction failed'));

      const request = new NextRequest('http://localhost:3000/api/sales', {
        method: 'POST',
        body: JSON.stringify({
          customer_name: 'Test Customer',
          items: []
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await createSale(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Error interno');
    });

    it('should calculate total server-side if not provided', async () => {
      const { createSaleWithItems } = require('@/lib/transactions');
      createSaleWithItems.mockResolvedValue({
        success: true,
        sale_id: 'test-sale-id'
      });

      const mockSupabase = require('@/lib/supabase').supabaseAdmin;
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'test-sale-id', items: [] },
              error: null
            })
          })
        })
      });

      const saleData = {
        customer_name: 'Test Customer',
        items: [
          {
            product_id: 'product-1',
            quantity: 2,
            unit_price: 50
          }
        ]
      };

      const request = new NextRequest('http://localhost:3000/api/sales', {
        method: 'POST',
        body: JSON.stringify(saleData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await createSale(request);

      expect(createSaleWithItems).toHaveBeenCalledWith(
        expect.objectContaining({
          total: 100 // 2 * 50
        }),
        expect.any(Array),
        undefined
      );
    });
  });
});
