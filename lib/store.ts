import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getWhatsAppMessage: () => string;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getWhatsAppMessage: () => {
        const { items, getTotalPrice } = get();
        if (items.length === 0) return '';
        
        let message = '🛍️ *NUEVO PEDIDO - MODASHOP*\n\n';
        message += '📋 *DETALLE DE PRODUCTOS:*\n\n';
        
        items.forEach((item, index) => {
          message += `${index + 1}. *${item.name}*\n`;
          message += `   💰 $${item.price.toLocaleString()} x ${item.quantity} und\n`;
          message += `   💵 Subtotal: $${(item.price * item.quantity).toLocaleString()}\n\n`;
        });
        
        message += `💳 *TOTAL A PAGAR: $${getTotalPrice().toLocaleString()}*\n\n`;
        message += '📦 *DATOS DE ENVÍO:* (Completar)\n';
        message += '📍 Dirección:\n';
        message += '🏢 Ciudad:\n';
        message += '📞 Teléfono:\n\n';
        message += '✅ *Confirmar pedido y proceder con el pago*';
        
        return encodeURIComponent(message);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
