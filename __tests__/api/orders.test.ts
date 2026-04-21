import { NextRequest } from 'next/server';
import { POST as createOrder } from '@/app/api/orders/route';

// Mock the dependencies
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          single: jest.fn()
        })
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
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
  validateOrderPayload: jest.fn(() => ({
    isValid: true,
    errors: {}
  }))
}));

jest.mock('@/lib/transactions', () => ({
  createOrderWithItems: jest.fn()
}));

describe('Orders API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/orders', () => {
    it('should create an order with items successfully', async () => {
      const { createOrderWithItems } = require('@/lib/transactions');
      createOrderWithItems.mockResolvedValue({
        success: true,
        order_id: 'test-order-id'
      });

      const mockSupabase = require('@/lib/supabase').supabaseAdmin;
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'test-order-id', items: [] },
              error: null
            })
          })
        })
      });

      const orderData = {
        customer_name: 'Test Customer',
        customer_email: 'test@example.com',
        customer_phone: '123456789',
        customer_address: 'Test Address',
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

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await createOrder(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBe('test-order-id');
      expect(createOrderWithItems).toHaveBeenCalledWith(
        expect.objectContaining({
          created_by: 'test-user-id',
          customer_name: 'Test Customer',
          total: 100
        }),
        expect.any(Array)
      );
    });

    it('should return 400 for invalid order data', async () => {
      const { validateOrderPayload } = require('@/lib/validators');
      validateOrderPayload.mockReturnValue({
        isValid: false,
        errors: { customer_name: 'Required' }
      });

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await createOrder(request);
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

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await createOrder(request);
      expect(response.status).toBe(403);
    });

    it('should handle transaction errors gracefully', async () => {
      const { createOrderWithItems } = require('@/lib/transactions');
      createOrderWithItems.mockRejectedValue(new Error('Transaction failed'));

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          customer_name: 'Test Customer',
          items: []
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await createOrder(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Error interno');
    });
  });
});
