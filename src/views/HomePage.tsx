
import { useState, useEffect } from 'react';
import { getLatestEpisodes, getLatestAddedAnime, type NewEpisode, type AnimeListing } from '@/services/anime-api';
import { AnimeCard } from '@/components/anime-card';
import { Separator } from '@/components/ui/separator';
import { Helmet } from 'react-helmet-async';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const [latestEpisodes, setLatestEpisodes] = useState<NewEpisode[]>([]);
  const [latestAddedAnime, setLatestAddedAnime] = useState<AnimeListing[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(true);
  const [loadingAddedAnime, setLoadingAddedAnime] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingEpisodes(true);
        const episodes = await getLatestEpisodes();
        setLatestEpisodes(episodes);
      } catch (err) {
        console.error("Error fetching latest episodes:", err);
        setError("Failed to load latest episodes.");
      } finally {
        setLoadingEpisodes(false);
      }

      try {
        setLoadingAddedAnime(true);
        const addedAnime = await getLatestAddedAnime();
        setLatestAddedAnime(addedAnime);
      } catch (err) {
        console.error("Error fetching latest added anime:", err);
        setError(prevError => prevError ? `${prevError} Also failed to load latest added anime.` : "Failed to load latest added anime.");
      } finally {
        setLoadingAddedAnime(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <Helmet>
        <title>AniView - Inicio</title>
        <meta name="description" content="Mira los últimos episodios de anime y descubre nuevas series." />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <section className="mb-12">
          <header className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Capítulos del Día
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Los últimos episodios de tus animes favoritos, recién salidos del horno.
            </p>
          </header>
          {loadingEpisodes ? (
            <div className="flex justify-center items-center py-12"><Loader2 className="h-12 w-12 animate-spin text-accent" /></div>
          ) : error && latestEpisodes.length === 0 ? (
             <div className="text-center py-12 text-destructive">{error.includes("episodes") || error.includes("Failed to load") ? error : "Error cargando episodios."}</div>
          ) : latestEpisodes.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {latestEpisodes.map((episode) => (
                <AnimeCard key={`${episode.animeId}-${episode.episodeNumber}`} anime={episode} type="episode" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-xl font-medium text-muted-foreground">
                No hay nuevos capítulos disponibles en este momento.
              </p>
              <p className="mt-2 text-muted-foreground">
                Por favor, vuelve a intentarlo más tarde.
              </p>
            </div>
          )}
        </section>

        <Separator className="my-8" />

        <section>
          <header className="mb-6">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Últimos Animes Agregados
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
              Descubre las series más recientes añadidas a nuestro catálogo.
            </p>
          </header>
          {loadingAddedAnime ? (
             <div className="flex justify-center items-center py-12"><Loader2 className="h-12 w-12 animate-spin text-accent" /></div>
          ) : error && latestAddedAnime.length === 0 ? (
             <div className="text-center py-12 text-destructive">{error.includes("added anime") || error.includes("Failed to load") ? error : "Error cargando últimos animes."}</div>
          ) : latestAddedAnime.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {latestAddedAnime.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} type="listing" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-xl font-medium text-muted-foreground">
                No hay animes recién agregados en este momento.
              </p>
              <p className="mt-2 text-muted-foreground">
                Vuelve pronto para más novedades.
              </p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
