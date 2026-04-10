'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/public/Navbar';
import { ProductCard } from '@/components/public/ProductCard';
import { Category, Product } from '@/types';

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          fetch(`/api/products${selectedCategory ? `?category_id=${selectedCategory}` : ''}`),
          fetch('/api/categories')
        ]);
        const pJson = await pRes.json();
        const cJson = await cRes.json();

        setProducts(Array.isArray(pJson) ? pJson : []);
        setCategories(Array.isArray(cJson) ? cJson : []);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setProducts([]);
        setCategories([]);
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Sidebar Filters */}
          <aside className="w-full md:w-64 shrink-0 space-y-8">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest mb-4">Filtrar por</h3>
              <div className="space-y-4">
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className={`block text-sm font-medium transition-colors ${!selectedCategory ? 'text-orange-600 font-bold' : 'text-muted hover:text-foreground'}`}
                >
                  Todos los productos
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`block text-sm font-medium transition-colors ${selectedCategory === cat.id ? 'text-orange-600 font-bold' : 'text-muted hover:text-foreground'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-border">
              <h3 className="text-sm font-black uppercase tracking-widest mb-4">Rango de precio</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-muted">
                  <input type="checkbox" className="rounded text-orange-600" /> $0 - $5.000
                </label>
                <label className="flex items-center gap-2 text-sm text-muted">
                  <input type="checkbox" className="rounded text-orange-600" /> $5.000 - $15.000
                </label>
                <label className="flex items-center gap-2 text-sm text-muted">
                  <input type="checkbox" className="rounded text-orange-600" /> +$15.000
                </label>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 space-y-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h1 className="text-2xl font-black tracking-tighter uppercase italic">
                {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : 'Catálogo Completo'}
                <span className="text-muted-2 ml-2">({products.length})</span>
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-2 font-bold uppercase">Ordenar por:</span>
                <select className="text-sm font-bold bg-transparent border-none focus:ring-0 text-foreground">
                  <option>Lo más nuevo</option>
                  <option>Menor precio</option>
                  <option>Mayor precio</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse space-y-4">
                    <div className="aspect-[3/4] bg-surface-2 rounded-2xl" />
                    <div className="h-4 bg-surface-2 rounded w-3/4" />
                    <div className="h-4 bg-surface-2 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 text-center">
                <span className="text-4xl mb-4 block">🏜️</span>
                <p className="text-muted font-medium">No encontramos productos en esta categoría.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
