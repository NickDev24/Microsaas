'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/public/Navbar';
import { ProductCard } from '@/components/public/ProductCard';
import { Product } from '@/types';

type LimitedEditionListItem = {
  id: string;
  is_active: boolean;
  remaining_units: number;
  total_units: number;
  product: Product;
};

export default function LimitedEditionPage() {
  const [items, setItems] = useState<LimitedEditionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/limited-editions')
      .then(r => r.json())
      .then((data) => {
        const limitedData = Array.isArray(data) ? data : [];
        setItems(limitedData.filter((p: LimitedEditionListItem) => p.is_active));
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        <header className="border-b border-zinc-800 pb-10 space-y-4">
           <div className="flex items-center gap-2 text-zinc-500 font-bold uppercase tracking-widest text-xs">
              <span className="w-2 h-2 bg-white rounded-full animate-ping" /> Ediciones Limitadas
           </div>
           <h1 className="text-5xl md:text-8xl font-black tracking-tighter italic uppercase">Drop <span className="text-zinc-600">Exclusivo</span></h1>
           <p className="text-zinc-400 text-lg max-w-xl">Colecciones numeradas. Una vez que se agotan, no vuelven.</p>
        </header>

        <section className="grid grid-cols-2 lg:grid-cols-3 gap-10">
          {isLoading ? Array(3).fill(0).map((_, i) => <div key={i} className="animate-pulse h-96 bg-zinc-900 rounded-2xl" />) :
           items.map((item) => (
             <div key={item.id} className="space-y-4">
                <ProductCard product={item.product} />
                <div className="bg-zinc-900 p-4 rounded-xl flex justify-between items-center">
                   <span className="text-xs font-bold text-zinc-400">STOCK DISPONIBLE</span>
                   <span className="text-sm font-black text-white">{item.remaining_units} / {item.total_units}</span>
                </div>
             </div>
           ))}
        </section>
      </main>
    </div>
  );
}
