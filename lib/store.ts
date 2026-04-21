import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
  size?: string;
  color?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getWhatsAppMessage: (orderNumber?: string) => string;
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

      getWhatsAppMessage: (orderNumber?: string) => {
        const { items, getTotalPrice } = get();
        
        if (items.length === 0) return '';
        
        let message = '¡Hola! Quiero realizar el siguiente pedido:\n\n';
        
        if (orderNumber) {
          message += `ð *NÚMERO DE PEDIDO: ${orderNumber}*\n\n`;
        }
        
        message += 'ð *DETALLE DE PRODUCTOS:*\n\n';
        
        items.forEach((item, index) => {
          message += `${index + 1}. *${item.name}*\n`;
          if (item.size || item.color) {
            const variants = [];
            if (item.size) variants.push(`Talle: ${item.size}`);
            if (item.color) variants.push(`Color: ${item.color}`);
            message += `   ð Variante: ${variants.join(', ')}\n`;
          }
          message += `   ð° $${item.price.toLocaleString()} x ${item.quantity} und\n`;
          message += `   ðµ Subtotal: $${(item.price * item.quantity).toLocaleString()}\n\n`;
        });
        
        message += `ð³ *TOTAL A PAGAR: $${getTotalPrice().toLocaleString()}*\n\n`;
        message += 'ð¦ *DATOS DE ENVÍO:* (Completar)\n';
        message += 'ðª Dirección:\n';
        message += 'ð Ciudad:\n';
        message += 'ð Teléfono:\n\n';
        message += 'â *Confirmar pedido y proceder con el pago*';
        
        return message;
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
