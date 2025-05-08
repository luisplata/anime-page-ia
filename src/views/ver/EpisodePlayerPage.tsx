
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnimeDetail, type AnimeDetail as AnimeDetailType, type Episode } from '@/services/anime-api';
import EpisodePlayerClient from '@/components/episode-player-client';
import { AnimeFavoriteButton } from '@/components/anime-favorite-button';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';
import { AlertTriangle, ArrowLeft, ListVideo, Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBookmarks } from '@/hooks/use-bookmarks';
import { useLoading } from '@/contexts/loading-context'; // Re-added

export default function EpisodePlayerPage() {
  const { animeId, episodeNumber: episodeNumberStr } = useParams<{ animeId: string; episodeNumber: string }>();
  const { setBookmark, removeBookmark, isEpisodeBookmarked, isLoading: bookmarksLoading } = useBookmarks();
  const { showLoader, hideLoader } = useLoading(); // Re-added

  const [anime, setAnime] = useState<AnimeDetailType | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [localIsLoading, setLocalIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const episodeNumber = parseInt(episodeNumberStr || '', 10);

  useEffect(() => {
    if (!animeId || !episodeNumberStr) {
      setError("ID de anime o número de episodio no proporcionado.");
      setLocalIsLoading(false);
      return;
    }

    if (isNaN(episodeNumber)) {
      setError("Número de episodio inválido.");
      setLocalIsLoading(false);
      return;
    }

    const fetchEpisodeData = async () => {
      showLoader();
      setLocalIsLoading(true);
      setError(null);
      setAnime(null);
      setCurrentEpisode(null);
      try {
        const animeData = await getAnimeDetail(animeId);
        if (!animeData || !animeData.id) {
          setError(`No se encontró el anime con ID: ${animeId} o hubo un error al procesarlo.`);
          setLocalIsLoading(false);
          hideLoader();
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
        setError(err instanceof Error ? err.message : `Error al cargar la información del episodio.`);
      } finally {
        setLocalIsLoading(false);
        hideLoader();
      }
    };

    fetchEpisodeData();
  }, [animeId, episodeNumberStr, episodeNumber, showLoader, hideLoader]);

  const handleBookmarkToggle = () => {
    if (!animeId || isNaN(episodeNumber) || bookmarksLoading || !anime || !anime.id) return;

    if (isEpisodeBookmarked(anime.id, episodeNumber)) {
      removeBookmark(anime.id);
    } else {
      setBookmark(anime.id, episodeNumber);
    }
  };

  if (localIsLoading) { // Global spinner is active
    return (
      <div className="min-h-screen">
        {/* Minimal placeholder, global spinner is visible */}
      </div>
    );
  }
  
  const effectiveAnimeTitle = anime?.title || "Anime Desconocido";
  const effectiveEpisodeNumber = currentEpisode?.episodeNumber || episodeNumber || 0;

  if (error || !anime || !currentEpisode) {
    const pageTitle = error ? 'Error al Cargar Episodio' : `Episodio ${effectiveEpisodeNumber} de ${effectiveAnimeTitle} No Encontrado`;
    return (
      <>
        <Helmet>
          <title>{pageTitle} - AniView</title>
        </Helmet>
        <div className="container mx-auto px-4 py-8 text-center min-h-screen flex flex-col items-center justify-center max-w-md">
          <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
          <h1 className="mt-4 text-3xl font-bold text-destructive">{pageTitle}</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {error || `No se pudo encontrar el episodio ${effectiveEpisodeNumber} de ${effectiveAnimeTitle}. Puede que no exista o haya ocurrido un error.`}
          </p>
          <div className="mt-8 space-x-4">
            {anime && anime.id && (
              <Button asChild variant="outline">
                <Link to={`/anime/${encodeURIComponent(anime.id)}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Volver a {anime.title}
                </Link>
              </Button>
            )}
             {!anime && animeId && (
              <Button asChild variant="outline">
                <Link to={`/anime/${encodeURIComponent(animeId)}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Volver al anime
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
  const isCurrentBookmarked = isEpisodeBookmarked(anime.id, currentEpisode.episodeNumber);

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

        <header className="mb-4 text-center md:text-left">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">{fullEpisodeTitle}</h1>
        </header>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-center md:justify-start">
            <AnimeFavoriteButton animeId={anime.id} animeTitle={anime.title} size="default" />
            <Button
              variant={isCurrentBookmarked ? "default" : "outline"}
              onClick={handleBookmarkToggle}
              disabled={bookmarksLoading}
              className="w-full sm:w-auto"
            >
              {bookmarksLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :
               isCurrentBookmarked ? <BookmarkCheck className="mr-2 h-4 w-4" /> : <Bookmark className="mr-2 h-4 w-4" />}
              {isCurrentBookmarked ? 'Marcado como actual' : 'Marcar como actual'}
            </Button>
          </div>


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
                      {otherEpisodes.map((episode) => {
                        const isOtherBookmarked = isEpisodeBookmarked(anime.id, episode.episodeNumber);
                        return (
                          <li key={episode.episodeNumber}>
                            <Button variant="ghost" asChild className="w-full justify-start text-left h-auto py-2.5 px-4 hover:bg-accent/10 rounded-none text-xs sm:text-sm">
                              <Link to={`/ver/${encodedAnimeId}/${episode.episodeNumber}`} className="flex items-center justify-between w-full truncate">
                                <span className="truncate">
                                  Episodio {episode.episodeNumber}
                                  {episode.title && episode.title.toLowerCase() !== `episodio ${episode.episodeNumber}` && episode.title.toLowerCase() !== `episode ${episode.episodeNumber}` ? `: ${episode.title}` : ''}
                                </span>
                                {isOtherBookmarked && <BookmarkCheck className="h-4 w-4 text-accent ml-2 flex-shrink-0" />}
                              </Link>
                            </Button>
                          </li>
                        );
                      })}
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
