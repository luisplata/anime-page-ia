
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
            <CardTitle className="text-3xl font-bold text-center text-primary">Políticas de Privacidad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
            <p className="text-sm text-center">Última actualización: {new Date().toLocaleDateString()}</p>
            
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">1. Introducción</h2>
              <p>Bienvenido/a a AnimeBell. Nos tomamos muy en serio tu privacidad. Esta Política de Privacidad describe cómo recopilamos, usamos, procesamos y divulgamos tu información, incluida la información personal, en conjunto con tu acceso y uso de AnimeBell.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">2. Información que Recopilamos</h2>
              <p>Recopilamos un identificador único de cliente (Client UUID) que se genera y almacena en tu dispositivo. Este UUID se utiliza para:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Rastrear el comportamiento del usuario de forma anónima para mejorar la funcionalidad del sitio.</li>
                <li>Permitir funcionalidades como "Favoritos" y "Marcadores de Episodios" que se almacenan localmente en tu navegador.</li>
              </ul>
              <p>No recopilamos información personal identificable como tu nombre, dirección de correo electrónico, o dirección IP directamente a través de este UUID, a menos que decidas proporcionarla voluntariamente (por ejemplo, si implementamos funciones de cuenta de usuario en el futuro).</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">3. Cómo Usamos Tu Información</h2>
              <p>El Client UUID y los datos de favoritos/marcadores almacenados localmente se utilizan exclusivamente para:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Personalizar tu experiencia en AnimeBell.</li>
                <li>Analizar el uso del sitio para realizar mejoras.</li>
                <li>Proporcionar y mantener las funcionalidades de la aplicación.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">4. Intercambio y Divulgación de Información</h2>
              <p>No vendemos, intercambiamos ni transferimos de ningún otro modo tu Client UUID o datos de uso anónimos a terceros. Los datos de favoritos y marcadores se almacenan únicamente en tu navegador y no se envían a nuestros servidores a menos que se implemente una función de sincronización explícita y tú la actives.</p>
              <p>Este sitio no almacena ningún video en sus servidores. Todo el contenido es proporcionado por terceros no afiliados. No somos responsables de las prácticas de privacidad de estos sitios de terceros.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">5. Almacenamiento de Datos</h2>
              <p>Tu Client UUID, lista de favoritos y marcadores de episodios se almacenan localmente en tu navegador utilizando localStorage. Puedes borrar estos datos limpiando el almacenamiento de tu navegador para este sitio.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">6. Seguridad</h2>
              <p>Nos esforzamos por proteger tu información. Sin embargo, dado que el Client UUID y los datos asociados se almacenan localmente, la seguridad de esta información también depende de la seguridad de tu dispositivo y navegador.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">7. Cookies</h2>
              <p>Utilizamos una cookie para almacenar tu Client UUID y hacerlo accesible. También podemos utilizar cookies para la funcionalidad básica del sitio y para recordar tus preferencias (como el tema oscuro/claro).</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">8. Cambios a esta Política de Privacidad</h2>
              <p>Podemos actualizar nuestra Política de Privacidad de vez en cuando. Te notificaremos cualquier cambio publicando la nueva Política de Privacidad en esta página. Se te aconseja revisar esta Política de Privacidad periódicamente para cualquier cambio.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">9. Contáctanos</h2>
              <p>Si tienes alguna pregunta sobre esta Política de Privacidad, puedes contactarnos en: <a href="mailto:info@bellseboss.com" className="text-accent hover:underline">info@bellseboss.com</a>.</p>
            </section>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
