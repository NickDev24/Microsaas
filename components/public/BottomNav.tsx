'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const items = [
  { href: '/', label: 'Inicio', icon: '🏠' },
  { href: '/catalogo', label: 'Catálogo', icon: '🛍️' },
  { href: '/ofertas', label: 'Ofertas', icon: '🔥' },
  { href: '/admin/login', label: 'Admin', icon: '🧩' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed bottom-0 inset-x-0 z-50 md:hidden"
    >
      <div className="mx-auto max-w-7xl px-4 pb-[max(12px,env(safe-area-inset-bottom))]">
        <div className="bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/80 border border-border shadow-[var(--shadow)] rounded-2xl px-3 py-2">
          <div className="grid grid-cols-4 gap-1">
            {items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 transition-all ${
                    isActive ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-surface-2 hover:text-foreground'
                  }`}
                >
                  <span className="text-lg leading-none">{item.icon}</span>
                  <span className="text-[10px] font-black tracking-tight uppercase">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
