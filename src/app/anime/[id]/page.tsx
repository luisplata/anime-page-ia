import { getAnimeDetail, type AnimeDetail as AnimeDetailType, type Episode } from '@/services/anime-api';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { PlaySquare, ListVideo, AlertTriangle } from 'lucide-react';

interface AnimeDetailPageProps {
  params: { id: string };
}

export default async function AnimeDetailPage({ params }: AnimeDetailPageProps) {
  const animeId = params.id;
  let anime: AnimeDetailType;

  try {
    anime = await getAnimeDetail(animeId);
  } catch (error) {
    console.error("Failed to fetch anime details:", error);
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="mt-4 text-3xl font-bold text-destructive">Error al cargar el Anime</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          No se pudo cargar la información del anime. Por favor, inténtalo de nuevo más tarde o verifica que el ID sea correcto.
        </p>
        <Button asChild className="mt-6">
          <Link href="/directorio">Volver al Directorio</Link>
        </Button>
      </div>
    );
  }
  
  // The API provides full URLs, so no need for picsum fallback unless explicitly desired for missing images
  // const coverUrl = anime.coverUrl.includes('https://example.com') ? `https://picsum.photos/seed/${anime.id}/400/600` : anime.coverUrl;
  const coverUrl = anime.coverUrl || `https://picsum.photos/seed/${anime.id}/400/600`;


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1">
          <Card className="overflow-hidden shadow-xl rounded-lg">
            <div className="aspect-[2/3] relative">
              <Image
                src={coverUrl}
                alt={`Portada de ${anime.title}`}
                fill
                className="object-cover"
                data-ai-hint="anime cover art"
                priority
                unoptimized={coverUrl.startsWith('http://')} // Necessary if API serves HTTP images
              />
            </div>
          </Card>
        </div>

        <div className="md:col-span-2">
          <header className="mb-6">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{anime.title}</h1>
          </header>
          
          <Card className="mb-6 shadow-lg rounded-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{anime.description || "Descripción no disponible."}</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-2"><ListVideo className="h-6 w-6 text-accent" /> Lista de Episodios</CardTitle>
              <span className="text-sm text-muted-foreground">{anime.episodes.length} episodios</span>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <ul className="space-y-3">
                  {anime.episodes.length > 0 ? anime.episodes.map((episode: Episode) => (
                    <li key={episode.episodeNumber}>
                      <Button variant="ghost" asChild className="w-full justify-start text-left h-auto py-3 px-4 hover:bg-accent/10 rounded-md transition-colors">
                        <Link href={`/ver/${anime.id}/${episode.episodeNumber}`} className="flex items-center gap-3">
                          <PlaySquare className="h-5 w-5 text-accent flex-shrink-0" />
                          <div className="flex-grow">
                            <span className="font-medium text-foreground block">
                              Episodio {episode.episodeNumber}
                              {episode.title && episode.title.toLowerCase() !== `episode ${episode.episodeNumber}` && episode.title.toLowerCase() !== `episodio ${episode.episodeNumber}` ? `: ${episode.title}` : ''}
                            </span>
                          </div>
                        </Link>
                      </Button>
                      <Separator className="mt-3" />
                    </li>
                  )) : (
                    <p className="text-muted-foreground text-center py-4">No hay episodios disponibles para este anime.</p>
                  )}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


export async function generateMetadata({ params }: AnimeDetailPageProps) {
  try {
    // Fetch only necessary data for metadata if possible, or reuse if full fetch is quick
    const anime = await getAnimeDetail(params.id);
    return {
      title: `${anime.title || 'Anime Desconocido'} - AniView`,
      description: anime.description ? anime.description.substring(0, 160) : `Detalles sobre ${anime.title || 'este anime'}.`,
    };
  } catch (error) {
    return {
      title: "Anime no encontrado - AniView",
      description: "La página de este anime no pudo ser encontrada o no está disponible.",
    };
  }
}
