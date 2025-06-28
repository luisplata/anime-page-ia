
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const devlogEntries = [
  {
    date: '28 de Junio, 2024',
    title: '¡Lanzamiento de AnimeBell!',
    version: 'v1.0.0',
    content: [
      '¡Hola a todos! Hoy marca el lanzamiento oficial de AnimeBell. Ha sido un viaje emocionante desarrollar esta plataforma desde cero. El objetivo es simple: proporcionar un lugar rápido, limpio y fácil de usar para ver tus animes favoritos.',
      'En esta primera versión, hemos incluido las funcionalidades básicas: un directorio completo de animes, un reproductor de video funcional con selección de fuentes, y una página de inicio con los últimos episodios.',
    ],
  },
  {
    date: '30 de Junio, 2024',
    title: '¡Llegan los Favoritos y Marcadores!',
    version: 'v1.1.0',
    content: [
      '¡Gracias por el increíble apoyo inicial! Basado en los primeros comentarios, hemos añadido varias funcionalidades clave:',
      '- **Sistema de Favoritos:** Ahora puedes guardar tus animes preferidos para acceder a ellos fácilmente. ¡Toda la información se guarda en tu dispositivo!',
      '- **Marcadores de Episodios:** ¿No recuerdas por dónde te quedaste? Ahora puedes marcar el último episodio que viste. Al igual que los favoritos, esto se guarda localmente.',
      '- **Importar/Exportar Favoritos:** Para que no pierdas tu lista, hemos añadido la opción de exportar e importar tus favoritos en un archivo CSV.',
      '- **Mejoras de SEO y Redes Sociales:** Hemos optimizado las etiquetas meta y Open Graph para que la página se vea genial al compartirla y sea más fácil de encontrar en los buscadores.',
    ],
  },
  {
    date: '2 de Julio, 2024',
    title: 'Filtros, Devlog y Descubrimiento Aleatorio',
    version: 'v1.2.0',
    content: [
      '¡Seguimos mejorando la experiencia de descubrimiento y la transparencia del proyecto!',
      '- **Filtro por Géneros:** ¡Ahora puedes explorar el directorio filtrando por género! Simplemente haz clic en una etiqueta de género en la página de un anime para ver más series similares.',
      '- **Botón de Anime Aleatorio (v1):** Se ha añadido un botón de sugerencia de anime al azar. La primera versión abría un pequeño popover al lado de la barra de búsqueda.',
      '- **Página de Devlog:** Se ha creado esta misma página para que podáis seguir el desarrollo y las últimas actualizaciones de la aplicación.',
      '- **Versión de la App Visible:** Ahora puedes ver la versión actual de la aplicación en el pie de página. Esto nos ayudará a todos a saber en qué versión estamos.',
      '- **Corrección de API:** Se solucionó un error que impedía que los "Capítulos del Día" se mostraran correctamente en la página de inicio.',
    ],
  },
  {
    date: '6 de Julio, 2024',
    title: 'Gran Actualización de UI: Menú Móvil y Mejoras',
    version: 'v1.2.2',
    content: [
      'Esta actualización se centra en pulir la experiencia de usuario, especialmente en dispositivos móviles.',
      '- **Menú Móvil Rediseñado:** Para mejorar la navegación en móviles, se ha añadido un menú lateral deslizable ("hamburguesa") que contiene los enlaces principales y la opción de sugerencia aleatoria.',
      '- **Cabecera Optimizada:** La barra de búsqueda ahora es siempre visible en la cabecera móvil para un acceso rápido y directo.',
      '- **Modal de Sugerencia Mejorado:** El popover de anime aleatorio se ha transformado en un modal más grande y centrado. Ahora también muestra los géneros del anime sugerido y se ha solucionado un problema que causaba que la imagen se desbordara del contenedor.',
      '- **Actualización Automática de PWA:** Se ha mejorado la configuración del Service Worker para que la aplicación se actualice automáticamente a la última versión al abrirla, asegurando que todos los usuarios disfruten de las últimas funcionalidades sin demoras.',
    ],
  },
];

export default function DevlogPage() {
  const location = useLocation();
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(window.location.origin + location.pathname + location.search);
  }, [location]);

  const pageTitle = "Devlog - AnimeBell";
  const pageDesc = "Sigue el desarrollo y las últimas actualizaciones de AnimeBell.";
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
        <meta property="og:image" content={defaultSocialImage} data-ai-hint="development log" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={currentUrl} />
        <meta property="twitter:title" content={pageTitle} />
        <meta property="twitter:description" content={pageDesc} />
        <meta property="twitter:image" content={defaultSocialImage} data-ai-hint="development log" />
      </Helmet>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-primary">Registro de Desarrollo (Devlog)</CardTitle>
             <p className="text-sm text-center text-muted-foreground pt-2">Aquí puedes ver el progreso y las nuevas características añadidas a AnimeBell.</p>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full" defaultValue={devlogEntries.slice().reverse()[0].title}>
              {devlogEntries.slice().reverse().map((entry) => (
                <AccordionItem value={entry.title} key={entry.title}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-4 text-left">
                       <span className="text-lg font-semibold text-foreground">{entry.title}</span>
                       <Badge variant="outline">{entry.version}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 text-muted-foreground leading-relaxed pl-2">
                     <p className="text-xs font-mono text-foreground">{entry.date}</p>
                     {entry.content.map((paragraph, index) => {
                      if (paragraph.startsWith('- ')) {
                        const boldPart = paragraph.substring(2, paragraph.indexOf(':', 2) + 1);
                        const restOfPart = paragraph.substring(paragraph.indexOf(':', 2) + 1);
                        return (
                          <p key={index}>
                            - <strong>{boldPart}</strong>{restOfPart}
                          </p>
                        )
                      }
                      return <p key={index}>{paragraph}</p>
                    })}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
