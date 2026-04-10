import { Metadata } from 'next';
import { Footer } from '@/components/public/Footer';
import { Navbar } from '@/components/public/Navbar';

export const metadata: Metadata = {
  title: 'Términos y Condiciones | ModaShop Argentina',
  description: 'Términos y condiciones de uso para ModaShop Argentina. Al utilizar nuestro sitio web, usted acepta estos términos.',
};

export default function TerminosYCondicionesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="prose prose-lg max-w-none">
            <h1 className="text-3xl font-bold text-foreground mb-8">Términos y Condiciones</h1>
            
            <div className="space-y-6 text-muted">
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">1. Aceptación de los Términos</h2>
                <p>
                  Al acceder y utilizar el sitio web de ModaShop Argentina (&quot;el Sitio&quot;), usted acepta y se compromete a cumplir 
                  estos Términos y Condiciones (&quot;Términos&quot;). Si no está de acuerdo con estos términos, por favor no utilice nuestro Sitio.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">2. Descripción del Servicio</h2>
                <p>
                  ModaShop es una plataforma de comercio electrónico que vende ropa, calzado y accesorios en Argentina. 
                  Nos reservamos el derecho de modificar o discontinuar el Servicio en cualquier momento sin previo aviso.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">3. Registro y Cuenta de Usuario</h2>
                <p>
                  Para realizar compras, debe crear una cuenta proporcionando información veraz y completa. 
                  Usted es responsable de mantener la confidencialidad de su contraseña y de todas las actividades que ocurran en su cuenta.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">4. Productos y Precios</h2>
                <p>
                  Nos esforzamos por mostrar con precisión los colores y diseños de nuestros productos. 
                  Los precios están sujetos a cambios sin previo aviso. Todos los precios incluyen impuestos argentinos.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">5. Pedidos y Pagos</h2>
                <p>
                  Aceptamos diversos métodos de pago incluyendo tarjetas de crédito/débito, Mercado Pago y transferencias bancarias. 
                  Los pedidos se procesan una vez confirmado el pago.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">6. Envíos</h2>
                <p>
                  Realizamos envíos a todo el territorio argentino. Los tiempos de entrega estimados son de 3-5 días hábiles 
                  para Capital Federal y Gran Buenos Aires, y 5-10 días hábiles para el resto del país.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">7. Devoluciones y Reembolsos</h2>
                <p>
                  Aceptamos devoluciones dentro de los 30 días posteriores a la recepción del producto. 
                  Los productos deben estar en su estado original con etiquetas y embalaje intactos.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">8. Propiedad Intelectual</h2>
                <p>
                  Todo el contenido del Sitio, incluyendo marcas, logos, imágenes y textos, 
                  es propiedad de ModaShop o de sus licenciantes y está protegido por las leyes de propiedad intelectual.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">9. Limitación de Responsabilidad</h2>
                <p>
                  ModaShop no será responsable por daños indirectos, incidentales o consecuentes que surjan del uso de nuestro Sitio. 
                  Nuestra responsabilidad máxima no superará el monto total de su compra.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">10. Ley Aplicable</h2>
                <p>
                  Estos Términos se rigen por las leyes de la República Argentina. 
                  Cualquier disputa será resuelta en los tribunales de la Ciudad de Buenos Aires.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">11. Contacto</h2>
                <p>
                  Para cualquier pregunta sobre estos Términos, puede contactarnos en:
                </p>
                <div className="mt-3 space-y-2">
                  <p><strong>Email:</strong> <a href="mailto:facucercuetti420@gmail.com" className="text-accent">facucercuetti420@gmail.com</a></p>
                  <p><strong>WhatsApp:</strong> <a href="https://wa.me/5493875798949" className="text-accent">+54 9 3875-798949</a></p>
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
