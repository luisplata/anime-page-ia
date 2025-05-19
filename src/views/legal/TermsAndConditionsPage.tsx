
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
            <CardTitle className="text-3xl font-bold text-center text-primary">Términos y Condiciones de Uso de AnimeBell</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
            <p className="text-sm text-center">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">1. Aceptación de los Términos</h2>
              <p>Al acceder, navegar o utilizar el sitio web AnimeBell (en adelante, "el Sitio"), usted acepta sin reservas estos términos y condiciones de uso. Si no está de acuerdo con alguna parte de estos términos, por favor, absténgase de utilizar el Sitio.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">2. Descripción del Servicio</h2>
              <p>AnimeBell es un portal que organiza y presenta enlaces a contenido de anime (videos) que se encuentra alojado en servidores de terceros. El Sitio actúa como un índice o directorio y no almacena ningún archivo de video en sus propios servidores. Todo el contenido audiovisual es proporcionado por servicios de streaming externos no afiliados a AnimeBell.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">3. Uso del Sitio y Responsabilidad del Usuario</h2>
              <p>Usted se compromete a utilizar el Sitio únicamente con fines legales y de manera que no infrinja los derechos de terceros, ni restrinja o inhiba el uso y disfrute del Sitio por parte de otros. El comportamiento prohibido incluye, entre otros, la transmisión de contenido ilegal, acosar o causar angustia o inconvenientes a cualquier persona.</p>
              <p>El usuario es el único responsable del uso que haga de la plataforma, incluyendo el acceso al contenido enlazado. Al utilizar este Sitio, usted declara ser mayor de edad en su jurisdicción o contar con el consentimiento parental adecuado, y acepta asumir toda responsabilidad legal derivada de sus acciones, incluyendo el cumplimiento de las leyes locales respecto a la visualización de contenido protegido por derechos de autor.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">4. Contenido de Terceros y Derechos de Autor</h2>
              <p>AnimeBell respeta la propiedad intelectual de otros. El Sitio simplemente enlaza a contenido disponible públicamente en Internet. No tenemos control sobre la legalidad, calidad o exactitud del contenido proporcionado por terceros y no asumimos ninguna responsabilidad por dicho contenido.</p>
              <p>Si usted es titular de derechos de autor y considera que algún contenido accesible a través de AnimeBell infringe sus derechos, por favor, póngase en contacto con nosotros a través de <a href="mailto:info@bellseboss.com" className="text-accent hover:underline">info@bellseboss.com</a> con la información pertinente para que podamos investigar y, si corresponde, tomar las medidas adecuadas, como la eliminación del enlace infractor de nuestro índice.</p>
              <p>Es responsabilidad del usuario asegurarse de que tiene los derechos o permisos necesarios para acceder al contenido enlazado desde AnimeBell.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">5. Funcionalidades del Usuario (Favoritos y Marcadores)</h2>
              <p>El Sitio ofrece funcionalidades como "Favoritos" y "Marcadores de Episodios". Esta información (identificadores de animes y números de episodios) se almacena localmente en su navegador utilizando la tecnología `localStorage`. AnimeBell no transmite esta información a sus servidores. Usted es responsable de la gestión y seguridad de estos datos en su propio dispositivo. AnimeBell no se hace responsable de la pérdida o corrupción de estos datos locales.</p>
              <p>El Sitio también utiliza un identificador único de cliente (Client UUID) almacenado localmente para permitir el funcionamiento de estas características y para análisis anónimos del uso del sitio, como se describe en nuestra Política de Privacidad.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">6. Exclusión de Garantías</h2>
              <p>El Sitio y su contenido se proporcionan "tal cual" y "según disponibilidad". AnimeBell no ofrece garantías de ningún tipo, ya sean expresas o implícitas, sobre la operatividad del Sitio, la información, el contenido, los materiales o los productos incluidos o enlazados desde el Sitio. No garantizamos que el Sitio sea ininterrumpido, libre de errores, seguro o libre de virus u otros componentes dañinos.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">7. Limitación de Responsabilidad</h2>
              <p>En la máxima medida permitida por la ley aplicable, AnimeBell, sus propietarios o desarrolladores no serán responsables de ningún daño directo, indirecto, incidental, especial, consecuente o punitivo, incluyendo, entre otros, pérdida de datos, pérdida de beneficios, o interrupción del negocio, que surja del uso o la incapacidad de usar el Sitio o el contenido enlazado, incluso si AnimeBell ha sido advertido de la posibilidad de tales daños.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">8. Publicidad y Servicios de Terceros</h2>
              <p>Este Sitio puede mostrar publicidad proporcionada por redes publicitarias de terceros (por ejemplo, Google AdSense). AnimeBell no controla el contenido de estos anuncios ni las prácticas de recopilación de datos de estos servicios. Le recomendamos revisar las políticas de privacidad de dichos terceros.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">9. Modificaciones a los Términos</h2>
              <p>AnimeBell se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento y sin previo aviso. Es su responsabilidad revisar este documento periódicamente. El uso continuado del Sitio después de la publicación de los cambios constituirá su aceptación de dichos cambios.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">10. Ley Aplicable y Jurisdicción</h2>
              <p>Estos Términos y Condiciones se regirán e interpretarán de acuerdo con las leyes del país de residencia del propietario del sitio. Cualquier disputa que surja en relación con estos términos estará sujeta a la jurisdicción exclusiva de los tribunales de dicho país.</p>
            </section>

             <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">11. Contacto</h2>
              <p>Si tiene alguna pregunta sobre estos Términos y Condiciones, puede contactarnos en: <a href="mailto:info@bellseboss.com" className="text-accent hover:underline">info@bellseboss.com</a>.</p>
            </section>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

    