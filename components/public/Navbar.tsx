'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Cart } from './Cart';
import { ThemeToggle } from '../ui/ThemeToggle';
import { BottomNav } from './BottomNav';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="bg-surface/80 backdrop-blur supports-[backdrop-filter]:bg-surface/70 border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center gap-3">
                <Link href="/" className="text-2xl font-black tracking-tighter text-accent">
                  MODA<span className="text-foreground">SHOP</span>
                </Link>
                <Link
                  href="/admin/login"
                  className="text-xs font-bold px-3 py-1.5 rounded-full bg-foreground text-background hover:opacity-90 transition-all"
                >
                  Login
                </Link>
              </div>
            </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/catalogo" className="text-sm font-medium text-muted hover:text-accent transition-colors">Catálogo</Link>
            <Link href="/novedades" className="text-sm font-medium text-muted hover:text-accent transition-colors">Novedades</Link>
            <Link href="/ofertas" className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors">Ofertas 🔥</Link>
          </div>

          {/* Search Bar (Temu style) */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input 
                type="text" 
                placeholder="Busca ropa, calzado y más..." 
                className="w-full bg-surface-2 text-foreground placeholder:text-muted-2 border border-border rounded-full py-2 px-10 text-sm focus:ring-2 focus:ring-accent/40 focus:border-accent/40 transition-all"
              />
              <span className="absolute left-3 top-2.5 text-zinc-400 text-sm">🔍</span>
            </div>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-5">
            <Cart />
            <ThemeToggle />
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
               {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-surface border-t border-border px-4 py-4 space-y-4 animate-in slide-in-from-top duration-300">
            <Link href="/catalogo" className="block text-base font-medium text-foreground">Catálogo</Link>
            <Link href="/novedades" className="block text-base font-medium text-foreground">Novedades</Link>
            <Link href="/ofertas" className="block text-base font-medium text-red-500">Ofertas</Link>
            <div className="relative">
              <input type="text" placeholder="Buscar..." className="w-full bg-surface-2 text-foreground placeholder:text-muted-2 border border-border rounded-lg py-2 px-10" />
              <span className="absolute left-3 top-2 text-zinc-400">🔍</span>
            </div>
          </div>
        )}
      </nav>
      <BottomNav />
    </>
  );
}
