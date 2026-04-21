'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/store';
import Image from 'next/image';

export function Cart() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { items, removeItem, updateQuantity, getTotalPrice, getWhatsAppMessage, clearCart } = useCartStore();
  const totalPrice = getTotalPrice();

  const handleWhatsAppCheckout = async () => {
    if (items.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      // Create order in backend first
      const orderData = {
        customer_name: 'Cliente Web', // Could be enhanced with a form
        customer_email: '', // Optional
        customer_phone: '', // Optional
        customer_address: '', // Optional
        notes: 'Pedido desde tienda online',
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          size: item.size,
          color: item.color
        }))
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Error al crear el pedido');
      }

      const order = await response.json();
      
      // Generate WhatsApp message with order number
      const message = getWhatsAppMessage(order.order_number || `#${order.id.slice(0, 8)}`);
      const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '5493875828874';
      const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      
      // Open WhatsApp
      window.open(url, '_blank');
      
      // Clear cart and close
      clearCart();
      setIsOpen(false);
      
    } catch (error) {
      console.error('Error processing order:', error);
      alert('Error al procesar el pedido. Por favor intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Cart Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="relative hover:scale-110 transition-transform duration-200"
      >
        <span className="text-xl">🛒</span>
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
            {items.reduce((total, item) => total + item.quantity, 0)}
          </span>
        )}
      </button>

      {/* Cart Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-surface shadow-[var(--shadow-deep)] transform transition-transform duration-300 ease-in-out border-l border-border">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-bold">Tu Carrito ({items.length} productos)</h2>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-muted hover:text-foreground text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-4xl">🛒</span>
                    <p className="mt-4 text-zinc-500">Tu carrito está vacío</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex gap-4 bg-surface-2 rounded-lg p-4 border border-border">
                      <div className="relative w-20 h-20 bg-surface rounded-lg overflow-hidden border border-border">
                        <Image 
                          src={item.image || '/placeholder.png'} 
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{item.name}</h3>
                        <p className="text-muted text-xs">{item.category}</p>
                        <p className="font-bold text-accent">${item.price.toLocaleString()}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-full bg-surface hover:bg-surface-2 border border-border transition-colors text-xs"
                          >
                            -
                          </button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-full bg-surface hover:bg-surface-2 border border-border transition-colors text-xs"
                          >
                            +
                          </button>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="ml-auto text-red-500 hover:text-red-700 text-xs"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t border-border p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Total:</span>
                    <span className="text-2xl font-bold text-accent">${totalPrice.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={handleWhatsAppCheckout}
                    disabled={isProcessing}
                    className={`w-full py-3 rounded-full font-bold transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 ${
                      isProcessing 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    <span>📱</span>
                    {isProcessing ? 'Procesando...' : 'Pedir por WhatsApp'}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full border border-border py-3 rounded-full font-bold hover:bg-surface-2 transition-colors"
                  >
                    Seguir Comprando
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
