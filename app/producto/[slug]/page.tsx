'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Navbar } from '@/components/public/Navbar';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Product, ProductImage } from '@/types';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // We'll need to fetch by slug, but for now we'll fetch all and filter or use ID if available
        // Ideally we have an API endpoint GET /api/products/slug/:slug
        const res = await fetch('/api/products');
        const all = await res.json();
        const products = Array.isArray(all) ? (all as Product[]) : [];
        const found = products.find((p) => p.slug === slug) || null;
        setProduct(found);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Spinner /></div>;
  if (!product) return <div className="text-center p-20">Producto no encontrado.</div>;

  const compareAtPrice = product.compare_at_price ?? 0;
  const hasDiscount = compareAtPrice > product.price;

  return (
    <div className="min-h-screen bg-white pb-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Gallery Section */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] bg-zinc-100 rounded-3xl overflow-hidden border border-zinc-100">
              <Image 
                src={product.product_images?.[selectedImage]?.url || '/placeholder.png'} 
                alt={product.name} 
                fill 
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.product_images?.map((img: ProductImage, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-orange-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <Image src={img.url} alt={product.name} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <div className="flex flex-col space-y-8">
            <div className="space-y-4">
              <div className="flex gap-2">
                 <Badge variant="info">{product.categories?.name || product.category?.name}</Badge>
                 {product.is_featured && <Badge variant="success">BEST SELLER</Badge>}
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-4xl font-black text-orange-600">${product.price.toLocaleString()}</span>
                {hasDiscount && (
                  <span className="text-xl text-zinc-300 line-through font-bold">${compareAtPrice.toLocaleString()}</span>
                )}
              </div>
            </div>

            <div className="prose prose-zinc prose-sm text-zinc-500 max-w-none">
              <p>{product.description || 'Este producto no tiene una descripción detallada todavía, pero garantizamos su calidad premium y durabilidad.'}</p>
            </div>

            {/* Options (Simulated) */}
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-sm font-black uppercase tracking-widest">Talle disponible</p>
                <div className="flex gap-3">
                  {['S', 'M', 'L', 'XL'].map((s) => (
                    <button key={s} className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-zinc-100 font-bold hover:border-black transition-all">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm font-black uppercase tracking-widest">Color</p>
                <div className="flex gap-3">
                  {['bg-black', 'bg-zinc-400', 'bg-red-500'].map((c, i) => (
                    <button key={i} className={`w-8 h-8 rounded-full border-2 border-white ring-1 ring-zinc-100 ${c}`} />
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-zinc-100">
              <button className="flex-1 bg-black text-white h-16 rounded-full font-black text-lg hover:bg-zinc-800 transition-all transform active:scale-95 shadow-xl shadow-black/10">
                Añadir al Carrito
              </button>
              <button className="flex-1 bg-orange-600 text-white h-16 rounded-full font-black text-lg hover:bg-orange-700 transition-all transform active:scale-95 shadow-xl shadow-orange-600/20">
                Comprar Ahora
              </button>
            </div>

            {/* Trust Signals */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex items-start gap-4">
               <span className="text-2xl">🚚</span>
               <div>
                 <p className="text-sm font-bold text-emerald-900">Envío Gratis & Garantía Total</p>
                 <p className="text-xs text-emerald-700">Llega en 24-48hs a tu domicilio si compras ahora.</p>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
