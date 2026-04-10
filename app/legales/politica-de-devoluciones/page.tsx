import { Metadata } from 'next';
import { Footer } from '@/components/public/Footer';
import { Navbar } from '@/components/public/Navbar';

export const metadata: Metadata = {
  title: 'Política de Devoluciones | ModaShop Argentina',
  description: 'Política de devoluciones de ModaShop Argentina. Aceptamos devoluciones dentro de los 30 días posteriores a la compra.',
};

export default function PoliticaDeDevolucionesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="prose prose-lg max-w-none">
            <h1 className="text-3xl font-bold text-foreground mb-8">Política de Devoluciones</h1>
            
            <div className="space-y-6 text-muted">
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">1. Plazo de Devolución</h2>
                <p>
                  Aceptamos devoluciones dentro de los <strong>30 días calendario</strong> posteriores a la fecha de recepción 
                  del producto. Pasado este período, no se aceptarán devoluciones.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">2. Condiciones para Devolución</h2>
                <p>
                  Los productos deben cumplir con las siguientes condiciones:
                </p>
                <ul className="list-disc list-inside mt-3 space-y-2">
                  <li>No haber sido utilizados, lavados o alterados</li>
                  <li>Conservar todas las etiquetas originales</li>
                  <li>Venir en su embalaje original</li>
                  <li>Incluir la factura o comprobante de compra</li>
                  <li>No estar dañados por mal uso</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">3. Productos No Devolvibles</h2>
                <p>
                  Por razones de higiene y seguridad, los siguientes productos no pueden ser devueltos:
                </p>
                <ul className="list-disc list-inside mt-3 space-y-2">
                  <li>Ropa interior y pijamas</li>
                  <li>Trajes de baño</li>
                  <li>Calcetines y medias</li>
                  <li>Productos con defectos causados por mal uso</li>
                  <li>Productos personalizados o con modificaciones</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">4. Proceso de Devolución</h2>
                <div className="space-y-3">
                  <p><strong>Paso 1:</strong> Contacte nuestro servicio de atención al cliente para solicitar la devolución.</p>
                  <p><strong>Paso 2:</strong> Proporcione su número de pedido y motivo de la devolución.</p>
                  <p><strong>Paso 3:</strong> Espere la confirmación y las instrucciones de envío.</p>
                  <p><strong>Paso 4:</strong> Empaquete el producto adecuadamente y envíelo según las instrucciones.</p>
                  <p><strong>Paso 5:</strong> Recibirá su reembolso una vez recibida y verificada la devolución.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">5. Costos de Envío</h2>
                <p>
                  <strong>Devoluciones por defecto del producto:</strong> El envío de devolución y reenvío son gratuitos.
                </p>
                <p>
                  <strong>Devoluciones por cambio de opinión o arrepentimiento:</strong> Los costos de envío de devolución 
                  corren por cuenta del cliente. El reenvío de un producto diferente también correrá por cuenta del cliente.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">6. Métodos de Reembolso</h2>
                <p>
                  Los reembolsos se procesarán utilizando el mismo método de pago original:
                </p>
                <ul className="list-disc list-inside mt-3 space-y-2">
                  <li><strong>Tarjeta de crédito/débito:</strong> 5-10 días hábiles</li>
                  <li><strong>Mercado Pago:</strong> 3-5 días hábiles</li>
                  <li><strong>Transferencia bancaria:</strong> 2-3 días hábiles</li>
                  <li><strong>Efectivo:</strong> No disponible para reembolsos</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">7. Cambios de Talle</h2>
                <p>
                  Aceptamos cambios de talle dentro de los 30 días posteriores a la compra, sujeto a disponibilidad de stock. 
                  Los costos de envío del producto original y del nuevo talle corren por cuenta del cliente.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">8. Productos Defectuosos</h2>
                <p>
                  Si recibe un producto con defecto de fabricación, comuníquese con nosotros dentro de los 7 días 
                  posteriores a la recepción. Ofrecemos:
                </p>
                <ul className="list-disc list-inside mt-3 space-y-2">
                  <li>Reemplazo gratuito del producto</li>
                  <li>Reparación gratuita del producto</li>
                  <li>Reembolso completo del importe abonado</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">9. Contacto para Devoluciones</h2>
                <div className="mt-3 space-y-2">
                  <p><strong>Email:</strong> <a href="mailto:facucercuetti420@gmail.com" className="text-accent">facucercuetti420@gmail.com</a></p>
                  <p><strong>Asunto:</strong> &quot;Solicitud de Devolución - [Número de Pedido]&quot;</p>
                  <p><strong>WhatsApp:</strong> <a href="https://wa.me/5493875798949" className="text-accent">+54 9 3875-798949</a></p>
                  <p><strong>Horario de atención:</strong> Lunes a Viernes de 9:00 a 18:00 hs</p>
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
