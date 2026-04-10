'use client';

import { useEffect, useMemo, useState } from 'react';
import { Navbar } from '@/components/public/Navbar';
import { ProductCard } from '@/components/public/ProductCard';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { Product } from '@/types';

export default function NovedadesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/products');
        const json = await res.json();
        const arr = Array.isArray(json) ? json : [];
        setProducts(arr);
      } catch {
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const latest = useMemo(() => {
    return products.slice(0, 12);
  }, [products]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <AnimatedSection direction="up" className="rounded-3xl border border-border bg-surface overflow-hidden shadow-sm">
          <div className="p-6 md:p-10 relative">
            <div className="absolute inset-0 bg-accent-gradient opacity-60" />
            <div className="relative">
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic">
                Novedades <span className="text-accent">Recientes</span>
              </h1>
              <p className="mt-3 text-sm md:text-base text-muted max-w-2xl">
                Lo último que entró a la tienda: estilo rápido, precios agresivos y drops que vuelan.
              </p>
            </div>
          </div>
        </AnimatedSection>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="animate-pulse space-y-4">
                  <div className="aspect-[3/4] bg-surface-2 rounded-2xl" />
                  <div className="h-4 bg-surface-2 rounded w-3/4" />
                  <div className="h-4 bg-surface-2 rounded w-1/4" />
                </div>
              ))}
          </div>
        ) : latest.length === 0 ? (
          <div className="py-20 text-center">
            <span className="text-4xl mb-4 block">🆕</span>
            <p className="text-muted font-medium">Todavía no hay novedades cargadas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {latest.map((p, index) => (
              <AnimatedSection key={p.id} direction="up" delay={0.05 * index}>
                <ProductCard product={p} />
              </AnimatedSection>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
