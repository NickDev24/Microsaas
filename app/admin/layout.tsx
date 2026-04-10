'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { usePathname } from 'next/navigation';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No mostrar el layout admin en la página de login
  const pathname = usePathname();
  
  if (pathname === '/admin/login') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {children}
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}
