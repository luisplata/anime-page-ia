
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnimeDetail, type AnimeDetail as AnimeDetailType, type Episode } from '@/services/anime-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { PlaySquare, ListVideo, AlertTriangle, BookmarkCheck } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { AnimeFavoriteButton } from '@/components/anime-favorite-button';
import { useBookmarks } from '@/hooks/use-bookmarks';

export default function AnimeDetailPage() {
  const { animeId } = useParams<{ animeId: string }>();
  const { getBookmarkForAnime, isLoading: bookmarksLoading } = useBookmarks();

  const [anime, setAnime] = useState<AnimeDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarkedEpisodeNumber, setBookmarkedEpisodeNumber] = useState<number | null>(null);

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
        if (data && data.id) {
          setAnime(data);
        } else if (data && !data.id && data.title?.includes("Anime no encontrado")) {
          setError(`No se encontró el anime con ID: ${animeId} o hubo un error al procesarlo.`);
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
    fetchAnimeDetails();
  }, [animeId]);

  useEffect(() => {
    if (anime && anime.id && !bookmarksLoading) {
        setBookmarkedEpisodeNumber(getBookmarkForAnime(anime.id));
    }
  }, [anime, bookmarksLoading, getBookmarkForAnime]);


  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-1 space-y-4">
            <div className="aspect-[2/3] bg-muted animate-pulse rounded-lg"></div>
            <div className="h-10 bg-muted animate-pulse rounded-lg"></div>
          </div>
          <div className="md:col-span-2 space-y-6">
            <div className="h-12 bg-muted animate-pulse rounded-lg w-3/4"></div>
            <div className="h-10 bg-muted animate-pulse rounded-lg w-1/4"></div>
            <div className="space-y-2">
              <div className="h-6 bg-muted animate-pulse rounded-lg w-1/3"></div>
              <div className="h-20 bg-muted animate-pulse rounded-lg"></div>
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

  if (error || !anime || !anime.id) {
    return (
      <>
        <Helmet>
          <title>Error - AniView</title>
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
        <title>{`${anime.title || 'Anime Desconocido'} - AniView`}</title>
        <meta name="description" content={anime.description ? anime.description.substring(0, 160) : `Detalles sobre ${anime.title || 'este anime'}.`} />
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
             {bookmarkedEpisodeNumber && (
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
              <div className="mt-4">
                <AnimeFavoriteButton animeId={anime.id} animeTitle={anime.title} size="lg" />
              </div>
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
                    {anime.episodes.length > 0 ? anime.episodes.map((episode: Episode) => {
                      const isBookmarked = episode.episodeNumber === bookmarkedEpisodeNumber;
                      return (
                        <li key={episode.episodeNumber}>
                          <Button
                            variant={isBookmarked ? "secondary" : "ghost"}
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
                              {isBookmarked && <BookmarkCheck className="h-5 w-5 text-accent flex-shrink-0 ml-2" />}
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
