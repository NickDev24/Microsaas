'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/public/Navbar';
import { ProductCard } from '@/components/public/ProductCard';
import { Product } from '@/types';

type SeasonalDiscountListItem = {
  id: string;
  is_active: boolean;
  product: Product;
};

export default function SeasonalDiscountsPage() {
  const [items, setItems] = useState<SeasonalDiscountListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/seasonal-discounts')
      .then(r => r.json())
      .then((data) => {
        const seasonalData = Array.isArray(data) ? data : [];
        setItems(seasonalData.filter((p: SeasonalDiscountListItem) => p.is_active));
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-sky-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        <header className="bg-white border-2 border-sky-100 rounded-3xl p-10 md:p-20 text-center space-y-4">
           <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-sky-900 uppercase">Season <span className="text-sky-500">Sale</span></h1>
           <p className="text-sky-700 text-lg font-bold">Descuentos de temporada. Renueva tu placard ahora.</p>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {isLoading ? Array(4).fill(0).map((_, i) => <div key={i} className="animate-pulse h-80 bg-white rounded-2xl" />) :
           items.map((item) => (
             <ProductCard key={item.id} product={item.product} />
           ))}
        </section>
      </main>
    </div>
  );
}
