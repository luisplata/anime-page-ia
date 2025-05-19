
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function TermsAndConditionsPage() {
  const location = useLocation();
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(window.location.origin + location.pathname + location.search);
  }, [location]);
  
  const pageTitle = "Términos y Condiciones - AnimeBell";
  const pageDesc = "Lee nuestros términos y condiciones de uso para AnimeBell.";
  const defaultSocialImage = 'https://picsum.photos/seed/animebell-social/1200/630';

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={currentUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:image" content={defaultSocialImage} data-ai-hint="legal document" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={currentUrl} />
        <meta property="twitter:title" content={pageTitle} />
        <meta property="twitter:description" content={pageDesc} />
        <meta property="twitter:image" content={defaultSocialImage} data-ai-hint="legal document" />
      </Helmet>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-primary">Términos y Condiciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
            <p className="text-sm text-center">Última actualización: {new Date().toLocaleDateString()}</p>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">1. Aceptación de los Términos</h2>
              <p>Al acceder y utilizar AnimeBell (en adelante, "el Sitio"), aceptas cumplir y estar sujeto a los siguientes términos y condiciones de uso. Si no estás de acuerdo con estos términos, por favor, no utilices el Sitio.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">2. Descripción del Servicio</h2>
              <p>AnimeBell es un portal que proporciona enlaces a contenido de anime alojado por terceros. El Sitio no almacena ningún archivo de video en sus servidores. Todo el contenido es proporcionado por servicios de streaming externos no afiliados a AnimeBell.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">3. Uso del Sitio</h2>
              <p>Te comprometes a utilizar el Sitio únicamente con fines legales y de manera que no infrinja los derechos de, restrinja o inhiba el uso y disfrute del Sitio por parte de terceros. El comportamiento prohibido incluye acosar o causar angustia o inconvenientes a cualquier persona, transmitir contenido obsceno u ofensivo, o interrumpir el flujo normal de diálogo dentro del Sitio.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">4. Contenido de Terceros y Derechos de Autor</h2>
              <p>AnimeBell actúa como un motor de búsqueda y un directorio de contenido de anime disponible públicamente en Internet. No tenemos control sobre el contenido proporcionado por terceros y no asumimos ninguna responsabilidad por dicho contenido.</p>
              <p>Respetamos los derechos de propiedad intelectual de otros. Si crees que algún contenido disponible a través del Sitio infringe tus derechos de autor, por favor contáctanos con la información pertinente para que podamos investigar y, si es necesario, tomar las medidas adecuadas.</p>
              <p>Es responsabilidad del usuario asegurarse de que tiene los derechos para acceder al contenido enlazado.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">5. Funcionalidades del Usuario</h2>
              <p>El Sitio ofrece funcionalidades como "Favoritos" y "Marcadores de Episodios". Estos datos se almacenan localmente en tu navegador. Eres responsable de la gestión y seguridad de estos datos en tu dispositivo. AnimeBell no se hace responsable de la pérdida de estos datos locales.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">6. Exclusión de Garantías</h2>
              <p>El Sitio y su contenido se proporcionan "tal cual" y "según disponibilidad" sin ninguna representación o respaldo hecho y sin garantía de ningún tipo, ya sea expresa o implícita, incluidas, entre otras, las garantías implícitas de calidad satisfactoria, idoneidad para un propósito particular, no infracción, compatibilidad, seguridad y precisión.</p>
              <p>No garantizamos que las funciones contenidas en el material disponible en este Sitio sean ininterrumpidas o libres de errores, que los defectos sean corregidos, o que este Sitio o el servidor que lo hace disponible estén libres de virus o representen la funcionalidad completa, precisión y fiabilidad de los materiales.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">7. Limitación de Responsabilidad</h2>
              <p>En ningún caso AnimeBell o sus desarrolladores serán responsables de ninguna pérdida o daño, incluidos, entre otros, pérdidas o daños indirectos o consecuentes, o cualquier pérdida o daño que surja del uso o la pérdida de uso de datos o ganancias, que surjan de o en conexión con el uso del Sitio.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">8. Modificaciones a los Términos</h2>
              <p>Nos reservamos el derecho de cambiar estos términos y condiciones en cualquier momento publicando los cambios en línea. Es tu responsabilidad revisar regularmente la información publicada en línea para obtener un aviso oportuno de dichos cambios. El uso continuado del Sitio después de que se publiquen los cambios constituye tu aceptación de este acuerdo modificado.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">9. Ley Aplicable</h2>
              <p>Estos términos y condiciones se regirán e interpretarán de acuerdo con las leyes del país de residencia del propietario del sitio. Cualquier disputa que surja bajo estos términos y condiciones estará sujeta a la jurisdicción exclusiva de los tribunales de dicho país.</p>
            </section>

             <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">10. Contacto</h2>
              <p>Si tienes alguna pregunta sobre estos Términos y Condiciones, puedes contactarnos en: <a href="mailto:info@bellseboss.com" className="text-accent hover:underline">info@bellseboss.com</a>.</p>
            </section>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
