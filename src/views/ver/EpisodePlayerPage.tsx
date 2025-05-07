
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnimeDetail, type AnimeDetail as AnimeDetailType, type Episode } from '@/services/anime-api';
import EpisodePlayerClient from '@/components/episode-player-client';
import { AnimeFavoriteButton } from '@/components/anime-favorite-button';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';
import { AlertTriangle, ArrowLeft, ListVideo, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function EpisodePlayerPage() {
  const { animeId, episodeNumber: episodeNumberStr } = useParams<{ animeId: string; episodeNumber: string }>();

  const [anime, setAnime] = useState<AnimeDetailType | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!animeId || !episodeNumberStr) {
      setError("ID de anime o número de episodio no proporcionado.");
      setIsLoading(false);
      return;
    }

    const episodeNumber = parseInt(episodeNumberStr, 10);
    if (isNaN(episodeNumber)) {
      setError("Número de episodio inválido.");
      setIsLoading(false);
      return;
    }

    const fetchEpisodeData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const animeData = await getAnimeDetail(animeId);
        if (!animeData) {
          setError(`No se encontró el anime con ID: ${animeId} o hubo un error al procesarlo.`);
          setIsLoading(false);
          return;
        }
        setAnime(animeData);

        const foundEpisode = animeData.episodes.find(ep => ep.episodeNumber === episodeNumber);
        if (!foundEpisode) {
          setError(`Episodio ${episodeNumber} no encontrado para ${animeData.title}.`);
        }
        setCurrentEpisode(foundEpisode || null);

      } catch (err) {
        console.error(`Failed to fetch episode details for ${animeId}/${episodeNumber}:`, err);
        setError(`Error al cargar la información del episodio.`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEpisodeData();
  }, [animeId, episodeNumberStr]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
        <p className="ml-4 text-xl text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (error || !anime || !currentEpisode) {
    const animeTitleFromError = anime?.title || 'Anime Desconocido';
    const episodeNumberForTitle = currentEpisode?.episodeNumber || (episodeNumberStr ? parseInt(episodeNumberStr, 10) : 'desconocido');
    const pageTitle = error ? 'Error al Cargar Episodio' : `Episodio ${episodeNumberForTitle} de ${animeTitleFromError} No Encontrado`;

    return (
      <>
        <Helmet>
          <title>{pageTitle} - AniView</title>
        </Helmet>
        <div className="container mx-auto px-4 py-8 text-center">
          <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
          <h1 className="mt-4 text-3xl font-bold text-destructive">{pageTitle}</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {error || `No se pudo encontrar el episodio ${episodeNumberForTitle} de ${animeTitleFromError}. Puede que no exista o haya ocurrido un error.`}
          </p>
          <div className="mt-8 space-x-4">
            {anime && (
              <Button asChild variant="outline">
                <Link to={`/anime/${encodeURIComponent(anime.id)}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Volver a {anime.title}
                </Link>
              </Button>
            )}
            <Button asChild>
              <Link to="/directorio">Explorar Directorio</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  const fullEpisodeTitle = `${anime.title} - Episodio ${currentEpisode.episodeNumber}${currentEpisode.title && currentEpisode.title.toLowerCase() !== `episodio ${currentEpisode.episodeNumber}` && currentEpisode.title.toLowerCase() !== `episode ${currentEpisode.episodeNumber}` ? `: ${currentEpisode.title}` : ''}`;
  const coverUrl = anime.coverUrl || `https://picsum.photos/seed/${anime.id}/300/450`;
  const otherEpisodes = anime.episodes.filter(ep => ep.episodeNumber !== currentEpisode.episodeNumber);
  const encodedAnimeId = encodeURIComponent(anime.id);

  return (
    <>
      <Helmet>
        <title>{`${fullEpisodeTitle} - AniView`}</title>
        <meta name="description" content={`Mira ${fullEpisodeTitle} en AniView. Streaming de anime online.`} />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" asChild className="text-sm">
            <Link to={`/anime/${encodedAnimeId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la lista de episodios de {anime.title}
            </Link>
          </Button>
        </div>

        <header className="mb-8 text-center md:text-left">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">{fullEpisodeTitle}</h1>
        </header>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 xl:col-span-9">
          <EpisodePlayerClient episode={currentEpisode} fullEpisodeTitle={fullEpisodeTitle} />
          </div>
          <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
            <Card className="shadow-lg rounded-lg overflow-hidden">
              <CardHeader className="p-4">
                <CardTitle className="text-lg font-semibold">Sobre {anime.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="aspect-[2/3] relative w-full max-w-[200px] mx-auto mb-3">
                  <img
                    src={coverUrl}
                    alt={`Portada de ${anime.title}`}
                    className="object-cover rounded-md shadow-md w-full h-full"
                    data-ai-hint="anime cover art"
                  />
                </div>
                <p className="text-sm text-muted-foreground line-clamp-4">{anime.description}</p>
                <AnimeFavoriteButton animeId={anime.id} animeTitle={anime.title} className="w-full" size="default" />
              </CardContent>
            </Card>
            
            {otherEpisodes.length > 0 && (
              <Card className="shadow-lg rounded-lg">
                <CardHeader className="p-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <ListVideo className="h-5 w-5 text-accent"/> Otros Episodios
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[300px] lg:h-[400px]">
                    <ul className="divide-y divide-border">
                      {otherEpisodes.map((episode) => (
                        <li key={episode.episodeNumber}>
                          <Button variant="ghost" asChild className="w-full justify-start text-left h-auto py-2.5 px-4 hover:bg-accent/10 rounded-none text-xs sm:text-sm">
                            <Link to={`/ver/${encodedAnimeId}/${episode.episodeNumber}`} className="block truncate">
                              Episodio {episode.episodeNumber}
                              {episode.title && episode.title.toLowerCase() !== `episode ${episode.episodeNumber}` && episode.title.toLowerCase() !== `episodio ${episode.episodeNumber}` ? `: ${episode.title}` : ''}
                            </Link>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
