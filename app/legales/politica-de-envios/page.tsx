import { Metadata } from 'next';
import { Footer } from '@/components/public/Footer';
import { Navbar } from '@/components/public/Navbar';

export const metadata: Metadata = {
  title: 'Política de Envíos | ModaShop Argentina',
  description: 'Política de envíos de ModaShop Argentina. Tiempos de entrega, costos y cobertura en todo el territorio argentino.',
};

export default function PoliticaDeEnviosPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="prose prose-lg max-w-none">
            <h1 className="text-3xl font-bold text-foreground mb-8">Política de Envíos</h1>
            
            <div className="space-y-6 text-muted">
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">1. Cobertura de Envíos</h2>
                <p>
                  Realizamos envíos a todo el territorio argentino, incluyendo:
                </p>
                <ul className="list-disc list-inside mt-3 space-y-2">
                  <li>Capital Federal y Gran Buenos Aires</li>
                  <li>Provincias de Buenos Aires, Córdoba, Santa Fe</li>
                  <li>Resto del país (con tiempos de entrega extendidos)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">2. Tiempos de Entrega</h2>
                <ul className="list-disc list-inside mt-3 space-y-2">
                  <li><strong>Capital Federal y GBA:</strong> 3-5 días hábiles</li>
                  <li><strong>Provincias principales:</strong> 5-7 días hábiles</li>
                  <li><strong>Resto del país:</strong> 7-10 días hábiles</li>
                  <li><strong>Patagonia:</strong> 10-15 días hábiles</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">3. Costos de Envío</h2>
                <ul className="list-disc list-inside mt-3 space-y-2">
                  <li><strong>Envío Estándar:</strong> $500 en CABA/GBA, $800 resto del país</li>
                  <li><strong>Envío Express:</strong> $800 en CABA/GBA, $1200 resto del país</li>
                  <li><strong>Envío Gratuito:</strong> en compras superiores a $10.000</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">4. Métodos de Entrega</h2>
                <p>Trabajamos con las siguientes empresas de mensajería:</p>
                <ul className="list-disc list-inside mt-3 space-y-2">
                  <li>Correo Argentino (estándar)</li>
                  <li>Andreani (express)</li>
                  <li>OCA (economía)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">5. Seguimiento de Pedidos</h2>
                <p>
                  Una vez despachado su pedido, recibirá un código de seguimiento por email 
                  para monitorear el estado de su envío en tiempo real.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">6. Recepción del Producto</h2>
                <p>
                  Al recibir su pedido, verifique que el paquete esté en buen estado y que los productos 
                  correspondan a su orden. Firme el remito del transportista.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">7. Contacto para Envíos</h2>
                <div className="mt-3 space-y-2">
                  <p><strong>Email:</strong> <a href="mailto:facucercuetti420@gmail.com" className="text-accent">facucercuetti420@gmail.com</a></p>
                  <p><strong>WhatsApp:</strong> <a href="https://wa.me/5493875798949" className="text-accent">+54 9 3875-798949</a></p>
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
