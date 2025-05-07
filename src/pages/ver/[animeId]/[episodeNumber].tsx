
import { getAnimeDetail, type AnimeDetail as AnimeDetailType, type Episode } from '@/services/anime-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ListCollapse, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import EpisodePlayerClient from '@/components/episode-player-client'; 
import { AnimeFavoriteButton } from '@/components/anime-favorite-button';
import Head from 'next/head';
import type { GetStaticProps, GetStaticPaths } from 'next';

interface EpisodePlayerPageProps {
  anime: AnimeDetailType | null;
  currentEpisode: Episode | null;
  episodeNumber: number;
  fullEpisodeTitle?: string;
  prevEpisode?: Episode | null;
  nextEpisode?: Episode | null;
  error?: string;
}

export default function EpisodePlayerPage({ 
  anime, 
  currentEpisode, 
  episodeNumber,
  fullEpisodeTitle,
  prevEpisode,
  nextEpisode,
  error 
}: EpisodePlayerPageProps) {

  if (error || !anime || !currentEpisode) {
    return (
      <>
        <Head>
          <title>Error de Episodio - AniView</title>
        </Head>
        <div className="container mx-auto px-4 py-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 text-3xl font-bold text-destructive">Error al Cargar el Episodio</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {error || "No se pudo cargar la información del episodio. Puede que el anime o el episodio no existan, o haya un problema con el servidor."}
          </p>
          <Button asChild className="mt-6">
            <Link href={anime?.id ? `/anime/${anime.id}` : "/directorio"}>
              {anime?.id ? "Volver a la página del anime" : "Volver al Directorio"}
            </Link>
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{`Ver ${fullEpisodeTitle} - AniView`}</title>
        <meta name="description" content={`Mira el episodio ${episodeNumber} de ${anime.title || 'este anime'}. ${anime.description ? anime.description.substring(0,100) + '...' : ''}`} />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {fullEpisodeTitle}
              </h1>
              <Button variant="link" asChild className="text-sm text-accent hover:underline flex items-center gap-1 mt-1 px-0">
                <Link href={`/anime/${anime.id}`}>
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
              fullEpisodeTitle={fullEpisodeTitle || ""} 
            />
            
            <div className="mt-6 flex justify-between items-center">
              <Button asChild variant="outline" disabled={!prevEpisode}>
                <Link href={prevEpisode ? `/ver/${anime.id}/${prevEpisode.episodeNumber}` : '#'} className="flex items-center gap-2" aria-disabled={!prevEpisode}>
                  <ChevronLeft className="h-5 w-5" />
                  Anterior
                </Link>
              </Button>
              
              <Button asChild variant="outline" disabled={!nextEpisode}>
                <Link href={nextEpisode ? `/ver/${anime.id}/${nextEpisode.episodeNumber}` : '#'} className="flex items-center gap-2" aria-disabled={!nextEpisode}>
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
                                        <Link href={`/ver/${anime.id}/${ep.episodeNumber}`} className="block truncate">
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
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // TODO: Improve this to fetch actual anime IDs and episode numbers
  // For now, we'll keep it empty and rely on fallback: 'blocking'
  return {
    paths: [],
    fallback: 'blocking', // Consider changing to 'true' or 'false' for full static export.
  };
};

export const getStaticProps: GetStaticProps<EpisodePlayerPageProps> = async (context) => {
  const animeId = context.params?.animeId as string;
  const episodeNumberStr = context.params?.episodeNumber as string;
  const episodeNumber = parseInt(episodeNumberStr, 10);

  if (!animeId || isNaN(episodeNumber)) {
    return { props: { anime: null, currentEpisode: null, episodeNumber: NaN, error: "ID de anime o número de episodio inválido." } }; // Removed revalidate
  }

  try {
    const anime = await getAnimeDetail(animeId);

    if (!anime || anime.id.startsWith('error-detail-')) {
      return { props: { anime: null, currentEpisode: null, episodeNumber, error: `Anime con ID ${animeId} no encontrado.` } }; // Removed revalidate
    }

    const currentEpisode = anime.episodes.find(ep => ep.episodeNumber === episodeNumber) || null;

    if (!currentEpisode) {
      return { props: { anime, currentEpisode: null, episodeNumber, error: `Episodio ${episodeNumber} no encontrado para ${anime.title}.` } }; // Removed revalidate
    }

    const episodeBaseTitle = `${anime.title} - Episodio ${currentEpisode.episodeNumber}`;
    const fullEpisodeTitle = currentEpisode.title && currentEpisode.title.toLowerCase() !== `episode ${currentEpisode.episodeNumber}` && currentEpisode.title.toLowerCase() !== `episodio ${currentEpisode.episodeNumber}`
      ? `${episodeBaseTitle}: ${currentEpisode.title}`
      : episodeBaseTitle;

    // Correctly find nextEpisode: it should be episodeNumber + 1
    const prevEpisode = anime.episodes.find(ep => ep.episodeNumber === episodeNumber - 1) || null;
    const nextEpisode = anime.episodes.find(ep => ep.episodeNumber === episodeNumber + 1) || null;


    return {
      props: {
        anime,
        currentEpisode,
        episodeNumber,
        fullEpisodeTitle,
        prevEpisode,
        nextEpisode,
      },
      // revalidate: 3600, // Removed for static export compatibility
    };
  } catch (error) {
    console.error(`Failed to fetch details for ${animeId}/${episodeNumber}:`, error);
    return { props: { anime: null, currentEpisode: null, episodeNumber, error: "Error al cargar la información del episodio." } }; // Removed revalidate
  }
};
