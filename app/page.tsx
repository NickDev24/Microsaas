'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/public/Navbar';
import { ProductCard } from '@/components/public/ProductCard';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Category, Product } from '@/types';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getCategoryIcon = (name: string) => {
    const n = (name || '').toLowerCase();
    if (n.includes('remera') || n.includes('camis')) return '👕';
    if (n.includes('pantal')) return '👖';
    if (n.includes('buzo') || n.includes('sweater')) return '🧥';
    if (n.includes('campera') || n.includes('abrigo')) return '🧥';
    if (n.includes('acces')) return '🧢';
    if (n.includes('calzado') || n.includes('zapa')) return '👟';
    if (n.includes('vestid')) return '👗';
    return '🛍️';
  };

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories')
        ]);
        
        const allProducts = await pRes.json();
        const cats = await cRes.json();
        
        // Validar que allProducts sea un array antes de usar filter
        const productsArray = Array.isArray(allProducts) ? allProducts : [];
        
        setFeaturedProducts(productsArray.filter((p: Product) => p.is_featured).slice(0, 4));
        setLatestProducts(productsArray.slice(0, 8));
        setCategories(Array.isArray(cats) ? cats : []);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading home data:', err);
        // Set empty arrays as fallback
        setFeaturedProducts([]);
        setLatestProducts([]);
        setCategories([]);
        setIsLoading(false);
      }
    };
    loadHomeData();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
        {/* Banner principal (Temu Style) */}
        <AnimatedSection direction="up" className="relative h-[300px] md:h-[500px] bg-zinc-900 rounded-3xl overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10" />
          <div className="relative z-20 h-full flex flex-col justify-center px-8 md:px-20 max-w-2xl space-y-4 md:space-y-6">
            <div className="bg-orange-600 text-white text-xs font-black px-3 py-1 rounded-full w-fit uppercase tracking-widest animate-bounce">
              Nueva Colección 2026
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-tight italic animate-slide-up">
              VISTE <span className="text-orange-500">EL FUTURO</span> HOY
            </h1>
            <p className="text-white/70 text-base md:text-lg max-w-md animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Descuentos de hasta el 50% en toda la tienda por tiempo limitado. Calidad premium al mejor precio.
            </p>
            <div className="flex gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <AnimatedButton variant="primary" size="lg">
                Comprar Ahora
              </AnimatedButton>
              <AnimatedButton variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black">
                Ver Ofertas
              </AnimatedButton>
            </div>
          </div>
          {/* Background circles effect */}
          <div className="absolute top-0 right-0 w-1/2 h-full z-0 opacity-20">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-600 rounded-full blur-[100px] animate-float" />
          </div>
        </AnimatedSection>

        {/* Categorías Circulares (Alibaba/Temu Style) */}
        <AnimatedSection direction="up" delay={0.2} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tighter uppercase italic">Categorías <span className="text-muted-2">Popular</span></h2>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {isLoading ? Array(8).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="aspect-square bg-surface-2 rounded-full" />
                <div className="h-3 bg-surface-2 rounded w-3/4 mx-auto" />
              </div>
            )) : categories.map((cat, index) => (
              <AnimatedSection key={cat.id} direction="up" delay={0.1 * index} className="group cursor-pointer">
                <div className="aspect-square relative rounded-full overflow-hidden border-2 border-transparent group-hover:border-orange-500 transition-all mb-3 group-hover:scale-110 group-hover:shadow-lg">
                  {cat.image_url ? (
                    <Image src={cat.image_url} alt={cat.name} fill className="object-cover transition-transform duration-300" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent/20 via-background to-surface-2">
                      <div className="absolute inset-0 opacity-60 animate-pulse bg-[radial-gradient(circle_at_30%_30%,rgba(234,88,12,0.35),transparent_50%),radial-gradient(circle_at_70%_70%,rgba(24,24,27,0.20),transparent_55%)]" />
                      <span className="relative text-2xl md:text-3xl drop-shadow-sm">{getCategoryIcon(cat.name)}</span>
                    </div>
                  )}
                </div>
                <p className="text-[10px] md:text-xs font-bold text-center uppercase tracking-tighter truncate group-hover:text-orange-600 transition-colors">{cat.name}</p>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>

        {/* Destacados Grid */}
        <AnimatedSection direction="up" delay={0.4} className="space-y-8">
          <div className="flex items-baseline justify-between border-b border-border pb-4">
            <h2 className="text-3xl font-black tracking-tighter uppercase italic">
              Para <span className="text-orange-600 underline">Ti</span>
            </h2>
            <Link href="/catalogo" className="text-sm font-bold text-muted-2 hover:text-accent transition-colors transform hover:scale-105 inline-block">Ver Todo →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {isLoading ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="aspect-[3/4] bg-surface-2 rounded-2xl" />
                <div className="h-4 bg-surface-2 rounded w-3/4" />
                <div className="h-4 bg-surface-2 rounded w-1/4" />
              </div>
            )) : featuredProducts.map((p, index) => (
              <AnimatedSection key={p.id} direction="up" delay={0.1 * index}>
                <ProductCard product={p} />
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>

        {/* Sección de Confianza (Trust signal bar) */}
        <AnimatedSection direction="up" delay={0.6} className="grid grid-cols-2 lg:grid-cols-4 gap-8 py-12 border-y border-border text-center">
            <div className="space-y-1 group">
              <span className="text-2xl group-hover:scale-110 transition-transform inline-block">🇦🇷</span>
              <p className="text-sm font-bold group-hover:text-orange-600 transition-colors">Envíos a todo el país</p>
              <p className="text-[10px] text-muted-2">Entrega rápida y segura</p>
            </div>
            <div className="space-y-1 group">
              <span className="text-2xl group-hover:scale-110 transition-transform inline-block">💳</span>
              <p className="text-sm font-bold group-hover:text-orange-600 transition-colors">Cuotas sin interés</p>
              <p className="text-[10px] text-muted-2">Aceptamos todas las tarjetas</p>
            </div>
            <div className="space-y-1 group">
              <span className="text-2xl group-hover:scale-110 transition-transform inline-block">🔄</span>
              <p className="text-sm font-bold group-hover:text-orange-600 transition-colors">Cambios gratis</p>
              <p className="text-[10px] text-muted-2">30 días para devoluciones</p>
            </div>
            <div className="space-y-1 group">
              <span className="text-2xl group-hover:scale-110 transition-transform inline-block">🔒</span>
              <p className="text-sm font-bold group-hover:text-orange-600 transition-colors">Pago 100% seguro</p>
              <p className="text-[10px] text-muted-2">Protección de datos SSL</p>
            </div>
        </AnimatedSection>

        {/* Más Productos (Vidriera infinita style) */}
        <AnimatedSection direction="up" delay={0.8} className="space-y-8 pb-20">
          <h2 className="text-2xl font-black tracking-tighter uppercase">Novedades <span className="text-muted-2">Recientes</span></h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {latestProducts.map((p, index) => (
              <AnimatedSection key={p.id} direction="up" delay={0.05 * index}>
                <ProductCard product={p} />
              </AnimatedSection>
            ))}
          </div>
          <div className="flex justify-center pt-8">
            <AnimatedButton variant="outline" size="lg" className="animate-pulse-slow">
              Cargar Más Productos
            </AnimatedButton>
          </div>
        </AnimatedSection>
      </main>
      
      {/* Mini CTA Footer */}
      <footer className="bg-surface py-20 px-4 border-t border-border mt-20">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-4 col-span-1 md:col-span-2">
               <span className="text-2xl font-black italic tracking-tighter">MODASHOP</span>
               <p className="text-sm text-muted max-w-sm leading-relaxed">
                  Líderes en indumentaria con estilo único. Diseños pensados para potenciar tu personalidad con la mejor calidad del mercado.
               </p>
               <div className="flex gap-4">
                 <span className="text-2xl cursor-pointer hover:opacity-70">📸</span>
                 <span className="text-2xl cursor-pointer hover:opacity-70">🐦</span>
                 <span className="text-2xl cursor-pointer hover:opacity-70">🛍️</span>
               </div>
            </div>
            <div className="space-y-4">
               <h4 className="font-bold text-sm uppercase tracking-widest">Tienda</h4>
               <ul className="text-muted text-sm space-y-2">
                 <li><Link href="/catalogo">Colecciones</Link></li>
                 <li><Link href="/catalogo">Hombres</Link></li>
                 <li><Link href="/catalogo">Mujeres</Link></li>
                 <li><Link href="/catalogo">Accesorios</Link></li>
               </ul>
            </div>
            <div className="space-y-4">
               <h4 className="font-bold text-sm uppercase tracking-widest">Ayuda</h4>
               <ul className="text-muted text-sm space-y-2">
                 <li><Link href="#">Seguimiento</Link></li>
                 <li><Link href="#">Envíos</Link></li>
                 <li><Link href="#">Cambios</Link></li>
                 <li><Link href="#">Contacto</Link></li>
               </ul>
            </div>
         </div>
         <div className="max-w-7xl mx-auto pt-20 mt-20 border-t border-border text-center text-[10px] text-muted-2 font-medium tracking-tighter uppercase">
            © 2026 MicroSaaS Ropa - Todos los derechos reservados - Diseñado para conversión
         </div>
      </footer>
    </div>
  );
}
