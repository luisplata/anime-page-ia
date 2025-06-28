
import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { getAnimeDetail, type AnimeDetail as AnimeDetailType, type Episode } from '@/services/anime-api';
import EpisodePlayerClient from '@/components/episode-player-client';
import { AnimeFavoriteButton } from '@/components/anime-favorite-button';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';
import { AlertTriangle, ArrowLeft, ListVideo, Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBookmarks } from '@/hooks/use-bookmarks';
import { ShareButton } from '@/components/share-button';

export default function EpisodePlayerPage() {
  const { animeId, episodeNumber: episodeNumberStr } = useParams<{ animeId: string; episodeNumber: string }>();
  const { setBookmark, removeBookmark, isEpisodeBookmarked, isLoading: bookmarksLoading } = useBookmarks();
  const location = useLocation();

  const [anime, setAnime] = useState<AnimeDetailType | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState('');

  const episodeNumber = parseInt(episodeNumberStr || '', 10);

  useEffect(() => {
    setCurrentUrl(window.location.origin + location.pathname + location.search);
  }, [location]);

  useEffect(() => {
    if (!animeId || !episodeNumberStr) {
      setError("ID de anime o número de episodio no proporcionado.");
      setIsLoading(false);
      return;
    }

    if (isNaN(episodeNumber)) {
      setError("Número de episodio inválido.");
      setIsLoading(false);
      return;
    }

    const fetchEpisodeData = async () => {
      setIsLoading(true);
      setError(null);
      setAnime(null);
      setCurrentEpisode(null);
      try {
        const animeData = await getAnimeDetail(animeId);
        if (!animeData || !animeData.id || animeData.title?.includes("Anime no encontrado")) {
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
        setError(err instanceof Error ? err.message : `Error al cargar la información del episodio.`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEpisodeData();
  }, [animeId, episodeNumberStr, episodeNumber]);

  const handleBookmarkToggle = () => {
    if (!animeId || isNaN(episodeNumber) || bookmarksLoading || !anime || !anime.id) return;

    if (isEpisodeBookmarked(anime.id, episodeNumber)) {
      removeBookmark(anime.id);
    } else {
      setBookmark(anime.id, episodeNumber);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <Helmet>
          <title>Cargando Episodio... - AnimeBell</title>
        </Helmet>
        <div className="mb-6 h-10 bg-muted animate-pulse rounded w-1/4"></div>
        <div className="mb-4 h-12 bg-muted animate-pulse rounded w-1/2"></div>
        <div className="mb-6 flex flex-wrap gap-2">
            <div className="h-10 bg-muted animate-pulse rounded w-36"></div>
            <div className="h-10 bg-muted animate-pulse rounded w-44"></div>
            <div className="h-10 bg-muted animate-pulse rounded w-32"></div>
        </div>
        <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 xl:col-span-9">
                <div className="aspect-video bg-muted animate-pulse rounded-lg"></div>
                <div className="mt-6 h-24 bg-muted animate-pulse rounded-lg"></div>
            </div>
            <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
                <div className="h-64 bg-muted animate-pulse rounded-lg"></div>
                <div className="h-80 bg-muted animate-pulse rounded-lg"></div>
            </aside>
        </div>
      </div>
    );
  }
  
  const effectiveAnimeTitle = anime?.title || "Anime Desconocido";
  const effectiveEpisodeNumber = currentEpisode?.episodeNumber || episodeNumber || 0;
  const effectiveEpisodeTitle = currentEpisode?.title || `Episodio ${effectiveEpisodeNumber}`;

  const pageTitle = error || !anime || !currentEpisode 
    ? (error ? 'Error al Cargar Episodio - AnimeBell' : `Episodio ${effectiveEpisodeNumber} de ${effectiveAnimeTitle} No Encontrado - AnimeBell`)
    : `Ver ${effectiveAnimeTitle} Episodio ${effectiveEpisodeNumber}${effectiveEpisodeTitle && effectiveEpisodeTitle.toLowerCase() !== `episodio ${effectiveEpisodeNumber}` ? `: ${effectiveEpisodeTitle}` : ''} Online - AnimeBell`;
  
  const pageDesc = error || !anime || !currentEpisode
    ? (error || `No se pudo encontrar el episodio ${effectiveEpisodeNumber} de ${effectiveAnimeTitle}.`)
    : `Disfruta del episodio ${effectiveEpisodeNumber} de ${effectiveAnimeTitle}${effectiveEpisodeTitle && effectiveEpisodeTitle.toLowerCase() !== `episodio ${effectiveEpisodeNumber}` ? `: ${effectiveEpisodeTitle}` : ''} en AnimeBell. Streaming de anime online.`;
    
  const socialImage = anime?.coverUrl || 'https://picsum.photos/seed/animebell-social/1200/630';


  if (error || !anime || !currentEpisode) {
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
          <meta property="og:image" content={socialImage} data-ai-hint="social media banner error" />
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content={currentUrl} />
          <meta property="twitter:title" content={pageTitle} />
          <meta property="twitter:description" content={pageDesc} />
          <meta property="twitter:image" content={socialImage} data-ai-hint="social media banner error" />
        </Helmet>
        <div className="container mx-auto px-4 py-8 text-center min-h-screen flex flex-col items-center justify-center max-w-md">
          <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
          <h1 className="mt-4 text-3xl font-bold text-destructive">{error ? "Error al Cargar Episodio" : `Episodio No Encontrado`}</h1>
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

  const fullEpisodeTitleForDisplay = `${anime.title} - Episodio ${currentEpisode.episodeNumber}${currentEpisode.title && currentEpisode.title.toLowerCase() !== `episodio ${currentEpisode.episodeNumber}` && currentEpisode.title.toLowerCase() !== `episode ${currentEpisode.episodeNumber}` ? `: ${currentEpisode.title}` : ''}`;
  const coverUrl = anime.coverUrl || `https://picsum.photos/seed/${anime.id}/300/450`;
  const otherEpisodes = anime.episodes.filter(ep => ep.episodeNumber !== currentEpisode.episodeNumber);
  const encodedAnimeId = encodeURIComponent(anime.id);
  const isCurrentBookmarked = isEpisodeBookmarked(anime.id, currentEpisode.episodeNumber);

  const currentIndex = anime.episodes.findIndex(ep => ep.episodeNumber === currentEpisode.episodeNumber);
  const prevEpisode = currentIndex > 0 ? anime.episodes[currentIndex - 1] : null;
  const nextEpisode = currentIndex < anime.episodes.length - 1 ? anime.episodes[currentIndex + 1] : null;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={currentUrl} />
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="video.episode" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:image" content={socialImage} data-ai-hint="anime cover art social" />
        <meta property="og:site_name" content="AnimeBell" />
        {anime.title && <meta property="og:video:series" content={anime.title} />}
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={currentUrl} />
        <meta property="twitter:title" content={pageTitle} />
        <meta property="twitter:description" content={pageDesc} />
        <meta property="twitter:image" content={socialImage} data-ai-hint="anime cover art social" />
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">{fullEpisodeTitleForDisplay}</h1>
        </header>

        <div className="mb-6 flex flex-col sm:flex-row gap-2 items-center justify-center md:justify-start flex-wrap">
            <AnimeFavoriteButton animeId={anime.id} animeTitle={anime.title} size="default" />
            <Button
              variant={isCurrentBookmarked ? "default" : "outline"}
              onClick={handleBookmarkToggle}
              disabled={bookmarksLoading}
              className="w-full xs:w-auto"
            >
              {bookmarksLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :
               isCurrentBookmarked ? <BookmarkCheck className="mr-2 h-4 w-4" /> : <Bookmark className="mr-2 h-4 w-4" />}
              {isCurrentBookmarked ? 'Marcado como actual' : 'Marcar como actual'}
            </Button>
            <ShareButton
              shareTitle={fullEpisodeTitleForDisplay}
              shareText={`Estoy viendo ${fullEpisodeTitleForDisplay}. ¡Deberías verlo también!`}
              shareUrl={currentUrl}
              size="default"
              buttonText="Compartir Episodio"
              className="w-full xs:w-auto"
            />
          </div>


        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 xl:col-span-9">
          <EpisodePlayerClient
            episode={currentEpisode}
            fullEpisodeTitle={fullEpisodeTitleForDisplay}
            animeId={encodedAnimeId}
            prevEpisodeNumber={prevEpisode?.episodeNumber || null}
            nextEpisodeNumber={nextEpisode?.episodeNumber || null}
          />
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
