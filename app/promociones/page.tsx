'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/public/Navbar';
import { ProductCard } from '@/components/public/ProductCard';
import { Product } from '@/types';

type PromotionListItem = {
  id: string;
  is_active: boolean;
  product: Product;
};

export default function PromotionsPage() {
  const [promos, setPromos] = useState<PromotionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/promotions')
      .then(r => r.json())
      .then((data) => {
        const promosData = Array.isArray(data) ? data : [];
        setPromos(promosData.filter((p: PromotionListItem) => p.is_active));
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        <header className="bg-red-600 rounded-3xl p-10 md:p-20 text-white text-center space-y-4">
           <h1 className="text-4xl md:text-7xl font-black tracking-tighter italic">HOT DEALS 🔥</h1>
           <p className="text-red-100 text-lg md:text-xl font-bold">Aprovecha nuestras promociones exclusivas. Stock limitado.</p>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading ? Array(4).fill(0).map((_, i) => <div key={i} className="animate-pulse h-80 bg-zinc-100 rounded-2xl" />) :
           promos.map((promo) => (
             <ProductCard key={promo.id} product={promo.product} />
           ))}
        </section>
      </main>
    </div>
  );
}
