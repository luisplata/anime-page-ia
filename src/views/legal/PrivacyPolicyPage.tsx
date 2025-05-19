
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function PrivacyPolicyPage() {
  const location = useLocation();
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(window.location.origin + location.pathname + location.search);
  }, [location]);

  const pageTitle = "Políticas de Privacidad - AnimeBell";
  const pageDesc = "Conoce nuestras políticas de privacidad y cómo manejamos tu información en AnimeBell.";
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
            <CardTitle className="text-3xl font-bold text-center text-primary">Políticas de Privacidad de AnimeBell</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
            <p className="text-sm text-center">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">1. Introducción</h2>
              <p>Bienvenido/a a AnimeBell. Tu privacidad es importante para nosotros. Esta Política de Privacidad explica cómo recopilamos, usamos, almacenamos, procesamos y divulgamos tu información cuando accedes y utilizas nuestro sitio web AnimeBell (en adelante, "el Sitio").</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">2. Información que Recopilamos</h2>
              <p>En AnimeBell, la información que recopilamos está diseñada para mejorar tu experiencia en el sitio. Esto incluye:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>
                  <strong>Identificador Único de Cliente (Client UUID):</strong> Al visitar el Sitio por primera vez, generamos y almacenamos un identificador único anónimo (Client UUID) en tu navegador (a través de `localStorage` y una cookie). Este UUID nos ayuda a:
                  <ul className="list-circle list-inside ml-6 mt-1 space-y-1">
                    <li>Permitir el funcionamiento de características como "Favoritos" y "Marcadores de Episodios", que se guardan localmente en tu dispositivo.</li>
                    <li>Realizar análisis básicos sobre cómo los usuarios interactúan con el Sitio de forma agregada y anónima para mejorar su funcionalidad y contenido (por ejemplo, a través de herramientas de analítica web).</li>
                  </ul>
                </li>
                <li>
                  <strong>Datos de Favoritos y Marcadores:</strong> Cuando utilizas las funciones de "Favoritos" o "Marcar como actual" un episodio, esta información se guarda directamente en el almacenamiento local (`localStorage`) de tu navegador. Estos datos no se envían ni se almacenan en nuestros servidores.
                </li>
                <li>
                  <strong>Información de Uso y Cookies:</strong> Podemos recopilar automáticamente cierta información sobre tu interacción con el Sitio mediante cookies y tecnologías similares. Esto puede incluir tu dirección IP (anonimizada cuando sea posible), tipo de navegador, sistema operativo, páginas visitadas dentro de AnimeBell, y la duración de tu visita. Utilizamos esta información principalmente para análisis y para asegurar el correcto funcionamiento del Sitio (por ejemplo, para recordar tus preferencias de tema).
                </li>
              </ul>
              <p>No recopilamos directamente información personal identificable como tu nombre completo o dirección de correo electrónico a través de estas funciones, ya que el Sitio actualmente no requiere la creación de cuentas de usuario.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">3. Cómo Usamos Tu Información</h2>
              <p>La información recopilada se utiliza para los siguientes propósitos:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Proveer y mejorar el Sitio:</strong> Para operar el Sitio, mantener su seguridad y mejorar sus características y funcionalidades.</li>
                <li><strong>Personalizar tu experiencia:</strong> Para recordar tus animes favoritos, los episodios que has marcado, y tus preferencias de tema (claro/oscuro), todo almacenado localmente.</li>
                <li><strong>Análisis y estadísticas:</strong> Para entender cómo los usuarios utilizan el Sitio, qué contenido es popular, y cómo podemos mejorar la navegación y la oferta de contenido. Esto se hace de forma agregada y anónima.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">4. Contenido de Terceros y Enlaces Externos</h2>
              <p>AnimeBell proporciona enlaces a contenido de anime (videos) que está alojado en servidores de terceros. No almacenamos ningún video en nuestros propios servidores. Esta Política de Privacidad solo se aplica a AnimeBell y no cubre las prácticas de privacidad de estos sitios de terceros. Te recomendamos leer las políticas de privacidad de cualquier sitio externo que visites.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">5. Almacenamiento y Seguridad de Datos</h2>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>El Client UUID, tus animes favoritos y los marcadores de episodios se almacenan localmente en tu navegador utilizando `localStorage` y una cookie para el UUID. Puedes eliminar estos datos borrando las cookies y los datos de sitios web de tu navegador para AnimeBell.</li>
                <li>Tomamos medidas razonables para proteger la información recopilada y el funcionamiento del Sitio. Sin embargo, ningún sistema es 100% seguro. La seguridad de tus datos locales (favoritos, marcadores) también depende de la seguridad de tu propio dispositivo y navegador.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">6. Cookies y Tecnologías Similares</h2>
              <p>Utilizamos cookies para:</p>
               <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Almacenar tu Client UUID.</li>
                  <li>Recordar tus preferencias de tema (claro/oscuro/sistema).</li>
                  <li>Facilitar el funcionamiento de herramientas de análisis web (como Google Analytics, si se utiliza).</li>
               </ul>
              <p>Puedes configurar tu navegador para rechazar todas o algunas cookies, o para alertarte cuando los sitios web establezcan o accedan a cookies. Si deshabilitas o rechazas las cookies, ten en cuenta que algunas partes de este Sitio pueden volverse inaccesibles o no funcionar correctamente (por ejemplo, los favoritos y marcadores).</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">7. Servicios de Terceros (Analítica)</h2>
              <p>Podemos utilizar servicios de análisis de terceros (como Google Analytics) para ayudarnos a comprender el uso del Sitio. Estos servicios pueden recopilar información enviada por tu navegador como parte de una solicitud de página web, como cookies o tu dirección IP (generalmente anonimizada). Te recomendamos revisar las políticas de privacidad de estos servicios para más información sobre sus prácticas.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">8. Privacidad de Menores</h2>
              <p>AnimeBell no está dirigido a personas menores de 13 años (o la edad mínima aplicable en tu jurisdicción). No recopilamos intencionadamente información personal de menores. Si eres padre/madre o tutor y crees que tu hijo/a nos ha proporcionado información personal, por favor contáctanos.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">9. Cambios a esta Política de Privacidad</h2>
              <p>Podemos actualizar nuestra Política de Privacidad de vez en cuando. Te notificaremos cualquier cambio publicando la nueva Política de Privacidad en esta página y actualizando la fecha de "Última actualización" en la parte superior. Te recomendamos revisar esta Política de Privacidad periódicamente.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">10. Contacto</h2>
              <p>Si tienes alguna pregunta sobre esta Política de Privacidad, puedes contactarnos en: <a href="mailto:info@bellseboss.com" className="text-accent hover:underline">info@bellseboss.com</a>.</p>
            </section>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

    