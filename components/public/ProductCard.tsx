'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/store';
import { useState } from 'react';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCartStore();
  const primaryImage = product.product_images?.[0]?.url || '/placeholder.png';
  const compareAtPrice = product.compare_at_price ?? 0;
  const hasDiscount = compareAtPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((compareAtPrice - product.price) / compareAtPrice) * 100) 
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: primaryImage,
      category: product.categories?.name || product.category?.name,
    });
    
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <Link href={`/producto/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] bg-surface-2 rounded-2xl overflow-hidden mb-3 transition-all duration-300 border border-border shadow-sm group-hover:shadow-[var(--shadow-deep)] group-hover:-translate-y-2 group-hover:rotate-1">
        <Image 
          src={primaryImage} 
          alt={product.name} 
          fill 
          className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-black/0 group-hover:from-black/20 group-hover:via-transparent group-hover:to-black/10 transition-all duration-300" />
        
        {/* Badges (Temu style) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
          {hasDiscount && (
            <div className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-sm uppercase tracking-tighter animate-pulse shadow-lg">
              -{discountPercent}% OFF
            </div>
          )}
          {product.is_featured && (
            <div className="bg-black text-white text-[10px] font-black px-2 py-0.5 rounded-sm uppercase tracking-tighter shadow-lg">
              Destacado
            </div>
          )}
        </div>

        {/* Quick Actions overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          <button 
            onClick={handleAddToCart}
            className={`w-full py-2.5 rounded-full font-bold text-sm transition-all duration-300 transform hover:scale-105 ${
              isAdded 
                ? 'bg-green-600 text-white' 
                : 'bg-white text-black hover:bg-orange-600 hover:text-white'
            }`}
          >
            {isAdded ? '✓ Agregado' : '🛒 Agregar al Carrito'}
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted-2 font-medium uppercase tracking-wider group-hover:text-accent transition-colors">{product.categories?.name || product.category?.name}</p>
        <h3 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-accent transition-colors duration-200">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-foreground group-hover:text-accent transition-colors">${product.price.toLocaleString()}</span>
          {hasDiscount && (
            <span className="text-xs text-muted-2 line-through">${compareAtPrice.toLocaleString()}</span>
          )}
        </div>
        
        {/* Mini Trust Signals */}
        <div className="flex items-center gap-1 mt-1">
          <span className="text-[10px] text-emerald-600 font-bold">⚡ Envío rápido</span>
          <span className="text-[10px] text-muted-2">|</span>
          <span className="text-[10px] text-muted">+100 vendidos</span>
        </div>
      </div>
    </Link>
  );
}
