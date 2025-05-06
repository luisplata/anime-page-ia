import { getAnimeDetail, type AnimeDetail as AnimeDetailType, type Episode } from '@/services/anime-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ListCollapse } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

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
        <h1 className="text-3xl font-bold text-destructive">Error</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          No se pudo cargar la información del episodio. Por favor, inténtalo de nuevo más tarde.
        </p>
        <Button asChild className="mt-6">
          <Link href={`/anime/${animeId}`}>Volver a la página del anime</Link>
        </Button>
      </div>
    );
  }

  if (!currentEpisode) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold">Episodio no encontrado</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          El episodio que estás buscando no existe para este anime.
        </p>
        <Button asChild className="mt-6">
          <Link href={`/anime/${animeId}`}>Volver a la página del anime</Link>
        </Button>
      </div>
    );
  }

  const episodeTitle = currentEpisode.title && currentEpisode.title !== `Episode ${currentEpisode.episodeNumber}` 
    ? `${anime.title} - Episodio ${currentEpisode.episodeNumber}: ${currentEpisode.title}`
    : `${anime.title} - Episodio ${currentEpisode.episodeNumber}`;

  const prevEpisode = anime.episodes.find(ep => ep.episodeNumber === episodeNumber - 1);
  const nextEpisode = anime.episodes.find(ep => ep.episodeNumber === episodeNumber + 1);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {episodeTitle}
        </h1>
        <Link href={`/anime/${animeId}`} className="text-sm text-accent hover:underline flex items-center gap-1 mt-1">
          <ListCollapse className="h-4 w-4" />
          Volver a {anime.title}
        </Link>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden shadow-xl rounded-lg">
            <AspectRatio ratio={16 / 9} className="bg-muted">
              {/* Placeholder for Video Player */}
              {/* In a real app, you'd use a video player component here, e.g., Plyr, ReactPlayer */}
              {/* <video controls src={currentEpisode.streamingUrl} className="w-full h-full" /> */}
              <div className="w-full h-full flex items-center justify-center bg-black text-primary-foreground">
                <p className="text-xl">Video Player Placeholder</p>
                {/* This is where you'd integrate a video player like react-player or a custom one */}
                {/* Example: <ReactPlayer url={currentEpisode.streamingUrl} width="100%" height="100%" controls /> */}
                {/* For now, showing the streaming URL as text */}
                <p className="text-xs mt-4 p-2 bg-background/10 rounded">Streaming URL: {currentEpisode.streamingUrl}</p>
              </div>
            </AspectRatio>
          </Card>
          
          <div className="mt-6 flex justify-between items-center">
            {prevEpisode ? (
              <Button asChild variant="outline">
                <Link href={`/ver/${animeId}/${prevEpisode.episodeNumber}`} className="flex items-center gap-2">
                  <ChevronLeft className="h-5 w-5" />
                  Anterior
                </Link>
              </Button>
            ) : <div />} {/* Placeholder for alignment */}
            
            {nextEpisode ? (
              <Button asChild variant="outline">
                <Link href={`/ver/${animeId}/${nextEpisode.episodeNumber}`} className="flex items-center gap-2">
                  Siguiente
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </Button>
            ) : <div />} {/* Placeholder for alignment */}
          </div>
        </div>

        <div className="lg:col-span-1">
            <Card className="shadow-lg rounded-lg">
                <CardHeader>
                    <CardTitle className="text-xl">Más episodios de {anime.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="max-h-[500px] overflow-y-auto space-y-2 pr-2">
                        {anime.episodes.map(ep => (
                            <li key={ep.episodeNumber}>
                                <Button 
                                  variant={ep.episodeNumber === currentEpisode?.episodeNumber ? "secondary" : "ghost"} 
                                  asChild 
                                  className={`w-full justify-start ${ep.episodeNumber === currentEpisode?.episodeNumber ? 'font-semibold' : ''}`}
                                >
                                    <Link href={`/ver/${animeId}/${ep.episodeNumber}`}>
                                        Episodio {ep.episodeNumber}{ep.title && ep.title !== `Episode ${ep.episodeNumber}` ? `: ${ep.title}` : ''}
                                    </Link>
                                </Button>
                                {ep.episodeNumber !== anime.episodes.length && <Separator className="mt-2"/> }
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: EpisodePlayerPageProps) {
  try {
    const anime = await getAnimeDetail(params.animeId);
    const episode = anime.episodes.find(ep => ep.episodeNumber === parseInt(params.episodeNumber, 10));
    const episodeTitle = episode?.title && episode.title !== `Episode ${episode.episodeNumber}` ? `: ${episode.title}` : '';

    return {
      title: `Ver ${anime.title} Episodio ${params.episodeNumber}${episodeTitle} - AniView`,
      description: `Mira el episodio ${params.episodeNumber} de ${anime.title}. ${anime.description.substring(0,100)}...`,
    };
  } catch (error) {
    return {
      title: "Episodio no encontrado - AniView",
      description: "La página de este episodio no pudo ser encontrada.",
    };
  }
}
