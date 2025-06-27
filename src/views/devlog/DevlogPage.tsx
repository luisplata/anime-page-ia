
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
    title: 'Favoritos, Marcadores y Mejoras de SEO',
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
    title: 'Filtro por Géneros y Correcciones',
    version: 'v1.2.0',
    content: [
      'Seguimos mejorando la experiencia de descubrimiento:',
      '- **Filtro por Géneros:** ¡Ahora puedes explorar el directorio filtrando por género! Simplemente haz clic en una etiqueta de género en la página de un anime para ver más series similares.',
      '- **Corrección de Errores:** Se han solucionado varios errores menores relacionados con la carga de datos de la API y la visualización de imágenes.',
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
                     {entry.content.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                     ))}
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
