
import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { getAnimeDetail, type AnimeDetail as AnimeDetailType, type Episode } from '@/services/anime-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { PlaySquare, ListVideo, AlertTriangle, BookmarkCheck, Clapperboard, Tag } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { AnimeFavoriteButton } from '@/components/anime-favorite-button';
import { useBookmarks } from '@/hooks/use-bookmarks';
import { ShareButton } from '@/components/share-button';
import { Badge } from '@/components/ui/badge';

export default function AnimeDetailPage() {
  const { animeId } = useParams<{ animeId: string }>();
  const { getBookmarkForAnime } = useBookmarks();
  const [bookmarkedEpisodeNumber, setBookmarkedEpisodeNumber] = useState<number | null>(null);
  const [anime, setAnime] = useState<AnimeDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(window.location.origin + location.pathname + location.search);
  }, [location]);

  useEffect(() => {
    if (!animeId) {
      setError("ID de anime no proporcionado.");
      setIsLoading(false);
      return;
    }

    const fetchAnimeDetails = async () => {
      setIsLoading(true);
      setError(null);
      setAnime(null);
      try {
        const data = await getAnimeDetail(animeId);
        if (data && data.id && !data.title?.includes("Anime no encontrado")) {
          setAnime(data);
        } else {
           setError(`No se encontró el anime con ID: ${animeId} o hubo un error al procesarlo.`);
        }
      } catch (err) {
        console.error("Error fetching anime details:", err);
        setError(err instanceof Error ? err.message : "Error al cargar la información del anime.");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchBookmark = async () => {
      // Ensure animeId is valid before fetching bookmark
      if(animeId) {
        const bookmark = await getBookmarkForAnime(animeId);
        if (bookmark) {
          setBookmarkedEpisodeNumber(bookmark);
        }
      }
    };

    fetchBookmark();
    fetchAnimeDetails();
  }, [animeId, getBookmarkForAnime]);


  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <Helmet>
          <title>Cargando Anime... - AnimeBell</title>
        </Helmet>
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-1 space-y-4">
            <div className="aspect-[2/3] bg-muted animate-pulse rounded-lg"></div>
            <div className="h-10 bg-muted animate-pulse rounded-lg w-full"></div>
            <div className="h-10 bg-muted animate-pulse rounded-lg w-full"></div>
          </div>
          <div className="md:col-span-2 space-y-6">
            <div className="h-12 bg-muted animate-pulse rounded-lg w-3/4"></div>
            <div className="h-6 bg-muted animate-pulse rounded-lg w-1/2"></div>
            <div className="h-10 bg-muted animate-pulse rounded-lg w-1/4"></div>
            <div className="space-y-2">
              <div className="h-6 bg-muted animate-pulse rounded-lg w-1/3"></div>
              <div className="h-20 bg-muted animate-pulse rounded-lg"></div>
              <div className="h-10 bg-muted animate-pulse rounded-lg w-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-6 bg-muted animate-pulse rounded-lg w-1/2"></div>
              <div className="h-64 bg-muted animate-pulse rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pageTitle = anime && anime.id ? `${anime.title} - Ver Online en AnimeBell` : (error ? "Error - AnimeBell" : "Anime no Encontrado - AnimeBell");
  const pageDesc = anime && anime.id ? `Mira todos los episodios de ${anime.title}. ${anime.description?.substring(0, 160) ?? ''}...` : (error || "No se pudo cargar la información del anime.");
  const socialImage = anime?.coverUrl || 'https://picsum.photos/seed/animebell-social/1200/630';

  if (error || !anime || !anime.id) {
    return (
      <>
        <Helmet>
          <title>{pageTitle}</title>
          <meta name="description" content={pageDesc} />
          <link rel="canonical" href={currentUrl} />
           {/* Open Graph / Facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:url" content={currentUrl} />
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={pageDesc} />
          <meta property="og:image" content={socialImage} data-ai-hint="social media banner error" />
          {/* Twitter */}
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content={currentUrl} />
          <meta property="twitter:title" content={pageTitle} />
          <meta property="twitter:description" content={pageDesc} />
          <meta property="twitter:image" content={socialImage} data-ai-hint="social media banner error" />
        </Helmet>
        <div className="container mx-auto px-4 py-8 text-center min-h-screen flex flex-col justify-center items-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 text-3xl font-bold text-destructive">Error al cargar el Anime</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {error || "No se pudo cargar la información del anime. Por favor, inténtalo de nuevo más tarde o verifica que el ID sea correcto."}
          </p>
          <Button asChild className="mt-6">
            <Link to="/directorio">Volver al Directorio</Link>
          </Button>
        </div>
      </>
    );
  }

  const coverUrl = anime.coverUrl || `https://picsum.photos/seed/${anime.id}/400/600`;
  const encodedAnimeId = encodeURIComponent(anime.id);

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={currentUrl} />
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="video.tv_show" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:image" content={socialImage} data-ai-hint="anime cover art social" />
        <meta property="og:site_name" content="AnimeBell" />
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={currentUrl} />
        <meta property="twitter:title" content={pageTitle} />
        <meta property="twitter:description" content={pageDesc} />
        <meta property="twitter:image" content={socialImage} data-ai-hint="anime cover art social" />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-1">
            <Card className="overflow-hidden shadow-xl rounded-lg">
              <div className="aspect-[2/3] relative">
                <img
                  src={coverUrl}
                  alt={`Portada de ${anime.title}`}
                  className="object-cover w-full h-full"
                  data-ai-hint="anime cover art"
                />
              </div>
            </Card>
             {getBookmarkForAnime(anime.id) && bookmarkedEpisodeNumber !== null && (
                <Card className="mt-4 bg-accent/10 border-accent shadow-md rounded-lg">
                  <CardContent className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2 text-accent-foreground">
                          <BookmarkCheck className="h-5 w-5" />
                          <p className="text-sm font-medium">
                              Continuar viendo: Episodio {bookmarkedEpisodeNumber}
                          </p>
                      </div>
                        <Button variant="link" size="sm" asChild className="mt-1 text-accent-foreground hover:text-accent-foreground/80">
                          <Link to={`/ver/${encodedAnimeId}/${bookmarkedEpisodeNumber}`}>
                              Ir al episodio
                          </Link>
                      </Button>
                  </CardContent>
                </Card>
              )}
          </div>

          <div className="md:col-span-2">
            <header className="mb-6">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{anime.title}</h1>
               {anime.alternativeNames && anime.alternativeNames.length > 0 && (
                <p className="mt-2 text-lg text-muted-foreground italic">
                  También conocido como: {anime.alternativeNames.join(', ')}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <AnimeFavoriteButton animeId={anime.id} animeTitle={anime.title} size="lg" />
                <ShareButton
                  shareTitle={anime.title}
                  shareText={`¡Echa un vistazo a ${anime.title} en AnimeBell! ${anime.description?.substring(0, 120) ?? ''}...`}
                  shareUrl={currentUrl}
                  size="lg"
                  buttonText="Compartir Anime"
                />
              </div>
            </header>

            <Card className="mb-6 shadow-lg rounded-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Clapperboard className="h-6 w-6 text-accent" />
                  Sinopsis y Detalles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{anime.description || "Descripción no disponible."}</p>
                {anime.genres && anime.genres.length > 0 && (
                  <div className="mt-4">
                     <h3 className="text-md font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        Géneros
                     </h3>
                     <div className="flex flex-wrap gap-2">
                       {anime.genres.map(genre => (
                         <Badge key={genre} variant="secondary" className="text-sm">{genre}</Badge>
                       ))}
                     </div>
                  </div>
                )}
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
                    {anime.episodes.length > 0 ? anime.episodes.map((episode: Episode) => {
                      const isBookmarkedCurrentEp = bookmarkedEpisodeNumber !== null && episode.episodeNumber === bookmarkedEpisodeNumber;
                      return (
                        <li key={episode.episodeNumber}>
                          <Button
                            variant={isBookmarkedCurrentEp ? "secondary" : "ghost"}
                            asChild
                            className="w-full justify-start text-left h-auto py-3 px-4 hover:bg-accent/10 rounded-md transition-colors"
                          >
                            <Link to={`/ver/${encodedAnimeId}/${episode.episodeNumber}`} className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 flex-grow min-w-0">
                                <PlaySquare className="h-5 w-5 text-accent flex-shrink-0" />
                                <span className="font-medium text-foreground block truncate">
                                  Episodio {episode.episodeNumber}
                                  {episode.title && episode.title.toLowerCase() !== `episode ${episode.episodeNumber}` && episode.title.toLowerCase() !== `episodio ${episode.episodeNumber}` ? `: ${episode.title}` : ''}
                                </span>
                              </div>
                              {isBookmarkedCurrentEp && <BookmarkCheck className="h-5 w-5 text-accent flex-shrink-0 ml-2" />}
                            </Link>
                          </Button>
                          <Separator className="mt-3" />
                        </li>
                      );
                    }) : (
                      <p className="text-muted-foreground text-center py-4">No hay episodios disponibles para este anime.</p>
                    )}
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
