import { Metadata } from 'next';
import { Footer } from '@/components/public/Footer';
import { Navbar } from '@/components/public/Navbar';

export const metadata: Metadata = {
  title: 'Política de Privacidad | ModaShop Argentina',
  description: 'Política de privacidad para ModaShop Argentina. Recopilamos y procesamos datos personales de acuerdo con la Ley de Protección de Datos Personales N° 25.326.',
};

export default function PoliticaDePrivacidadPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="prose prose-lg max-w-none">
            <h1 className="text-3xl font-bold text-foreground mb-8">Política de Privacidad</h1>
            
            <div className="space-y-6 text-muted">
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">1. Información que Recopilamos</h2>
                <p>
                  En ModaShop recopilamos información personal que usted nos proporciona directamente, incluyendo:
                </p>
                <ul className="list-disc list-inside mt-3 space-y-2">
                  <li>Nombre completo y datos de contacto</li>
                  <li>Dirección de envío y facturación</li>
                  <li>Información de pago (procesada de forma segura)</li>
                  <li>Historial de compras y preferencias</li>
                  <li>Información de navegación y uso del sitio</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">2. Uso de la Información</h2>
                <p>
                  Utilizamos su información personal para:
                </p>
                <ul className="list-disc list-inside mt-3 space-y-2">
                  <li>Procesar y entregar sus pedidos</li>
                  <li>Comunicarnos sobre el estado de sus pedidos</li>
                  <li>Mejorar nuestros productos y servicios</li>
                  <li>Personalizar su experiencia de compra</li>
                  <li>Enviarle ofertas especiales (con su consentimiento)</li>
                  <li>Prevenir fraudes y proteger la seguridad</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">3. Compartir de Información</h2>
                <p>
                  No vendemos, alquilamos ni compartimos su información personal con terceros, excepto:
                </p>
                <ul className="list-disc list-inside mt-3 space-y-2">
                  <li>Con proveedores de servicios de pago para procesar transacciones</li>
                  <li>Con servicios de mensajería para realizar envíos</li>
                  <li>Cuando sea requerido por ley o autoridad judicial</li>
                  <li>Con su consentimiento explícito</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">4. Seguridad de los Datos</h2>
                <p>
                  Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger su información personal 
                  contra acceso no autorizado, alteración, divulgación o destrucción. Utilizamos encriptación SSL 
                  para todas las transacciones.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">5. Cookies y Tecnologías Similares</h2>
                <p>
                  Utilizamos cookies para mejorar su experiencia en nuestro sitio. Puede configurar su navegador 
                  para rechazar cookies, pero esto puede afectar la funcionalidad del sitio.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">6. Derechos del Titular de Datos</h2>
                <p>
                  De acuerdo con la Ley de Protección de Datos Personales N° 25.326, usted tiene derecho a:
                </p>
                <ul className="list-disc list-inside mt-3 space-y-2">
                  <li>Acceder a sus datos personales</li>
                  <li>Rectificar datos inexactos</li>
                  <li>Solicitar la eliminación de sus datos</li>
                  <li>Oponerse al tratamiento de sus datos</li>
                  <li>Portabilidad de sus datos</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">7. Conservación de Datos</h2>
                <p>
                  Conservamos su información personal solo durante el tiempo necesario para cumplir los fines para los cuales fue recopilada, 
                  excepto cuando la ley requiera un período de conservación más largo.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">8. Cambios a esta Política</h2>
                <p>
                  Podemos actualizar esta política de privacidad ocasionalmente. Le notificaremos cualquier cambio significativo 
                  publicando la nueva política en nuestro sitio web.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">9. Contacto para Privacidad de Datos</h2>
                <p>
                  Para ejercer sus derechos de protección de datos o tener preguntas sobre esta política, contacte a nuestro 
                  Oficial de Protección de Datos Personales:
                </p>
                <div className="mt-3 space-y-2">
                  <p><strong>Email:</strong> <a href="mailto:facucercuetti420@gmail.com" className="text-accent">facucercuetti420@gmail.com</a></p>
                  <p><strong>Asunto:</strong> &quot;Protección de Datos Personales&quot;</p>
                  <p><strong>Dirección:</strong> Salta Capital, Argentina</p>
                </div>
              </section>
            </div>

            <div className="mt-8 p-4 bg-surface border border-border rounded-lg">
              <p className="text-sm text-muted-2">
                <strong>Fecha de última actualización:</strong> 18 de marzo de 2024
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
