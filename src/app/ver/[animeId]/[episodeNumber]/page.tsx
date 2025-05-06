
import { getAnimeDetail, type AnimeDetail as AnimeDetailType, type Episode } from '@/services/anime-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ListCollapse, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import EpisodePlayerClient from './episode-player-client'; 
import { AnimeFavoriteButton } from '@/components/anime-favorite-button';


interface EpisodePlayerPageProps {
  params: { animeId: string; episodeNumber: string };
}

export default async function EpisodePlayerPage({ params }: EpisodePlayerPageProps) {
  const { animeId, episodeNumber: episodeNumberStr } = params;
  const episodeNumber = parseInt(episodeNumberStr, 10);

  let anime: AnimeDetailType;
  let currentEpisode: Episode | undefined;

  try {
    anime = await getAnimeDetail(animeId);
    currentEpisode = anime.episodes.find(ep => ep.episodeNumber === episodeNumber);
  } catch (error) {
    console.error("Failed to fetch anime/episode details:", error);
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="mt-4 text-3xl font-bold text-destructive">Error al Cargar el Episodio</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          No se pudo cargar la información del episodio. Puede que el anime o el episodio no existan, o haya un problema con el servidor.
        </p>
        <Button asChild className="mt-6">
          <Link href={animeId ? `/anime/${animeId}` : "/directorio"}>
            {animeId ? "Volver a la página del anime" : "Volver al Directorio"}
          </Link>
        </Button>
      </div>
    );
  }

  if (!currentEpisode) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-3xl font-bold">Episodio no Encontrado</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          El episodio {episodeNumber} que estás buscando no existe para {anime?.title || 'este anime'}.
        </p>
        <Button asChild className="mt-6">
          <Link href={`/anime/${animeId}`}>Volver a la página del anime</Link>
        </Button>
      </div>
    );
  }
  
  const episodeBaseTitle = `${anime.title} - Episodio ${currentEpisode.episodeNumber}`;
  const fullEpisodeTitle = currentEpisode.title && currentEpisode.title.toLowerCase() !== `episode ${currentEpisode.episodeNumber}` && currentEpisode.title.toLowerCase() !== `episodio ${currentEpisode.episodeNumber}`
    ? `${episodeBaseTitle}: ${currentEpisode.title}`
    : episodeBaseTitle;


  const prevEpisode = anime.episodes.find(ep => ep.episodeNumber === episodeNumber - 1);
  const nextEpisode = anime.episodes.find(ep => ep.episodeNumber === episodeNumber + 1);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {fullEpisodeTitle}
            </h1>
            <Button variant="link" asChild className="text-sm text-accent hover:underline flex items-center gap-1 mt-1 px-0">
              <Link href={`/anime/${animeId}`}>
                <ListCollapse className="h-4 w-4" />
                Volver a {anime.title}
              </Link>
            </Button>
          </div>
          <div className="mt-2 sm:mt-0">
             <AnimeFavoriteButton animeId={anime.id} animeTitle={anime.title} className="w-full sm:w-auto" size="default" />
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <EpisodePlayerClient 
            episode={currentEpisode} 
            animeTitle={anime.title} 
            fullEpisodeTitle={fullEpisodeTitle} 
          />
          
          <div className="mt-6 flex justify-between items-center">
            <Button asChild variant="outline" disabled={!prevEpisode}>
              <Link href={prevEpisode ? `/ver/${animeId}/${prevEpisode.episodeNumber}` : '#'} className="flex items-center gap-2" aria-disabled={!prevEpisode}>
                <ChevronLeft className="h-5 w-5" />
                Anterior
              </Link>
            </Button>
            
            <Button asChild variant="outline" disabled={!nextEpisode}>
              <Link href={nextEpisode ? `/ver/${animeId}/${nextEpisode.episodeNumber}` : '#'} className="flex items-center gap-2" aria-disabled={!nextEpisode}>
                Siguiente
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="lg:col-span-1">
            <Card className="shadow-lg rounded-lg">
                <CardHeader>
                    <CardTitle className="text-xl">Más episodios de {anime.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="max-h-[calc(16/9*50vw-100px)] lg:max-h-[500px] pr-2"> 
                      <ul className="space-y-2">
                          {anime.episodes.map(ep => (
                              <li key={ep.episodeNumber}>
                                  <Button 
                                    variant={ep.episodeNumber === currentEpisode?.episodeNumber ? "secondary" : "ghost"} 
                                    asChild 
                                    className={`w-full justify-start text-left h-auto py-2 px-3 ${ep.episodeNumber === currentEpisode?.episodeNumber ? 'font-semibold' : ''}`}
                                  >
                                      <Link href={`/ver/${animeId}/${ep.episodeNumber}`} className="block truncate">
                                          Ep. {ep.episodeNumber}{ep.title && ep.title.toLowerCase() !== `episode ${ep.episodeNumber}`  && ep.title.toLowerCase() !== `episodio ${ep.episodeNumber}` ? `: ${ep.title}` : ''}
                                      </Link>
                                  </Button>
                                  {ep.episodeNumber !== anime.episodes[anime.episodes.length - 1].episodeNumber && <Separator className="mt-2"/> }
                              </li>
                          ))}
                      </ul>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: EpisodePlayerPageProps) {
  const { animeId, episodeNumber: episodeNumberStr } = params;
  const episodeNumber = parseInt(episodeNumberStr, 10);
  try {
    const anime = await getAnimeDetail(animeId);
    const currentEpisode = anime.episodes.find(ep => ep.episodeNumber === episodeNumber);
    
    const episodeBaseTitle = `${anime.title || 'Anime'} - Episodio ${episodeNumber}`;
    const fullEpisodeTitle = currentEpisode?.title && currentEpisode.title.toLowerCase() !== `episode ${currentEpisode.episodeNumber}` && currentEpisode.title.toLowerCase() !== `episodio ${currentEpisode.episodeNumber}`
      ? `${episodeBaseTitle}: ${currentEpisode.title}`
      : episodeBaseTitle;

    return {
      title: `Ver ${fullEpisodeTitle} - AniView`,
      description: `Mira el episodio ${episodeNumber} de ${anime.title || 'este anime'}. ${anime.description ? anime.description.substring(0,100) + '...' : ''}`,
    };
  } catch (error) {
    console.error(`Metadata generation error for ${animeId}/${episodeNumber}:`, error);
    return {
      title: `Episodio ${episodeNumber} no Encontrado - AniView`,
      description: "La página de este episodio no pudo ser encontrada o no está disponible.",
    };
  }
}
