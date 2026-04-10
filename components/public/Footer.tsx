'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y Descripción */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-2xl font-black tracking-tighter text-accent">
                MODA<span className="text-foreground">SHOP</span>
              </h3>
            </div>
            <p className="text-sm text-muted-2 mb-4 max-w-md">
              Tu tienda de moda online en Argentina. Descubrí las últimas tendencias en ropa, calzado y accesorios con la mejor calidad y estilo.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://instagram.com/modashop_ar" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-2 hover:text-accent transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252 2.377 6.727 6.727 6.727 3.252-.058 3.646-.07 4.85-.07 0 0 0 1.585 0 4.85 0 3.204 0 3.584-.012 4.85-.07 3.252-2.377 6.727-6.727 6.727-3.252.058-3.646.07-4.85.07 0 0-1.585 0-4.85 0-3.204 0-3.584.012-4.85.07-3.252-2.377-6.727-6.727-6.727-3.252.058-3.646.07-4.85.07zm0 2.163c2.9 0 3.25.01 4.322.058 2.798.148 5.517 2.377 5.517 2.377.925 2.377 1.698 0 3.225-.598 3.225-2.377 0-2.9-.01-3.25-.058-4.322-.058-2.798-.148-5.517-2.377-5.517-2.377-.925 0-1.698.598-1.698 2.377 0 2.9.01 3.25.058 4.322.058 2.798.148 5.517 2.377 5.517 2.377.925 0 1.698-.598 1.698-2.377 0-2.9-.01-3.25-.058-4.322-.058-2.798-.148-5.517-2.377-5.517-2.377-.925 0-1.698.598-1.698 2.377 0 2.9.01 3.25.058 4.322.058 2.798.148 5.517 2.377 5.517 2.377.925 0 1.698-.598 1.698-2.377 0-2.9-.01-3.25-.058-4.322-.058-2.798-.148-5.517-2.377-5.517-2.377-.925 0-1.698.598-1.698 2.377 0 2.9.01 3.25.058 4.322.058 2.798.148 5.517 2.377 5.517 2.377.925 0 1.698-.598 1.698-2.377 0-2.9-.01-3.25-.058-4.322-.058-2.798-.148-5.517-2.377-5.517-2.377-.925 0-1.698.598-1.698 2.377 0 2.9.01 3.25.058 4.322.058 2.798.148 5.517 2.377 5.517 2.377.925 0 1.698-.598 1.698-2.377z"/>
                </svg>
              </a>
              <a 
                href="https://facebook.com/ModaShopArgentina" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-2 hover:text-accent transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12 5.373 12 12 12 12-5.373 12-12zm-6.508-1.904c0-1.162-.392-1.988-.938-2.477-.546-.489-1.162-.733-1.849-.733-.687 0-1.303.244-1.849.733-.546.489-.938 1.315-.938 2.477v1.904h-3.197v-1.904c0-1.162.392-1.988.938-2.477.546-.489 1.162-.733 1.849-.733.687 0 1.303.244 1.849.733.546.489.938 1.315.938 2.477z"/>
                </svg>
              </a>
              <a 
                href="https://wa.me/5493875798949" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-2 hover:text-accent transition-colors"
                aria-label="WhatsApp"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.149-.4.3-.6.447-.2.149-.474.149-.674.447-.2.3-.8 1.024-1.567 1.024-.2 0-.4-.1-.5-.2-.1-.1-.2-.3-.3-.5-.1-.2-.2-.4-.3-.6-.1-.2-.3-.4-.5-.6-.2-.2-.4-.4-.6-.6-.2-.3-.4-.6-.6-.9-.1-.2-.3-.4-.5-.6-.7-.2-.3-.4-.6-.6-.9-.1-.2-.3-.4-.5-.6-.7-.2-.3-.4-.6-.6-.9z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Tienda</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/catalogo" className="text-sm text-muted-2 hover:text-accent transition-colors">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/novedades" className="text-sm text-muted-2 hover:text-accent transition-colors">
                  Novedades
                </Link>
              </li>
              <li>
                <Link href="/ofertas" className="text-sm text-muted-2 hover:text-accent transition-colors">
                  Ofertas
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-sm text-muted-2 hover:text-accent transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Ayuda</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/envios" className="text-sm text-muted-2 hover:text-accent transition-colors">
                  Envíos
                </Link>
              </li>
              <li>
                <Link href="/devoluciones" className="text-sm text-muted-2 hover:text-accent transition-colors">
                  Devoluciones
                </Link>
              </li>
              <li>
                <Link href="/tallas" className="text-sm text-muted-2 hover:text-accent transition-colors">
                  Guía de Tallas
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-muted-2 hover:text-accent transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legales */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/legales/terminos-y-condiciones" className="text-sm text-muted-2 hover:text-accent transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/legales/politica-de-privacidad" className="text-sm text-muted-2 hover:text-accent transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/legales/politica-de-devoluciones" className="text-sm text-muted-2 hover:text-accent transition-colors">
                  Política de Devoluciones
                </Link>
              </li>
              <li>
                <Link href="/legales/politica-de-envios" className="text-sm text-muted-2 hover:text-accent transition-colors">
                  Política de Envíos
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Derechos de Autor */}
            <div className="text-sm text-muted-2">
              <p>&copy; 2026 ModaShop Argentina. Todos los derechos reservados.</p>
              <p className="mt-1">
                Desarrollado por <span className="font-medium text-foreground">Facundo M. Cercuetti</span>
              </p>
            </div>

            {/* Métodos de Pago */}
            <div className="flex items-center space-x-4">
              <span className="text-xs text-muted-2">Métodos de pago seguros:</span>
              <div className="flex space-x-2">
                <div className="w-8 h-5 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">
                  MP
                </div>
                <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                  VISA
                </div>
                <div className="w-8 h-5 bg-red-600 rounded flex items-center justify-center text-white text-xs font-bold">
                  MC
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
