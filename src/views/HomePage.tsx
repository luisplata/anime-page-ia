
import { useState, useEffect } from 'react';
import { getLatestEpisodes, getLatestAddedAnime, type NewEpisode, type AnimeListing } from '@/services/anime-api';
import { AnimeCard } from '@/components/anime-card';
import { Separator } from '@/components/ui/separator';
import { Helmet } from 'react-helmet-async';
import { Loader2 } from 'lucide-react';
import { useLoading } from '@/contexts/loading-context'; // Import useLoading

export default function HomePage() {
  const [latestEpisodes, setLatestEpisodes] = useState<NewEpisode[]>([]);
  const [latestAddedAnime, setLatestAddedAnime] = useState<AnimeListing[]>([]);
  const [localLoadingEpisodes, setLocalLoadingEpisodes] = useState(true);
  const [localLoadingAddedAnime, setLocalLoadingAddedAnime] = useState(true);
  const [errorEpisodes, setErrorEpisodes] = useState<string | null>(null);
  const [errorAddedAnime, setErrorAddedAnime] = useState<string | null>(null);
  const { showLoader, hideLoader } = useLoading(); // Use global loading context

  useEffect(() => {
    const fetchData = async () => {
      showLoader(); // Show global loader
      setLocalLoadingEpisodes(true);
      setErrorEpisodes(null);
      try {
        const episodes = await getLatestEpisodes();
        setLatestEpisodes(episodes);
      } catch (err) {
        console.error("Error fetching latest episodes:", err);
        setErrorEpisodes(err instanceof Error ? err.message : "Failed to load latest episodes.");
      } finally {
        setLocalLoadingEpisodes(false);
      }

      setLocalLoadingAddedAnime(true);
      setErrorAddedAnime(null);
      try {
        const addedAnime = await getLatestAddedAnime();
        setLatestAddedAnime(addedAnime);
      } catch (err) {
        console.error("Error fetching latest added anime:", err);
        setErrorAddedAnime(err instanceof Error ? err.message : "Failed to load latest added anime.");
      } finally {
        setLocalLoadingAddedAnime(false);
        hideLoader(); // Hide global loader after all fetches are done
      }
    };
    fetchData();
  }, [showLoader, hideLoader]); // Add showLoader and hideLoader to dependencies

  const renderSection = <T extends AnimeListing | NewEpisode>(
    title: string,
    description: string,
    data: T[],
    isLoading: boolean, // Use local loading state for section
    error: string | null,
    type: 'episode' | 'listing',
    emptyMessage: string,
    emptySubMessage: string
  ) => (
    <section className="mb-12">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {description}
        </p>
      </header>
      {isLoading ? ( // Use local isLoading for section-specific loader
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-accent" />
          <p className="ml-4 text-lg">Cargando {title.toLowerCase()}...</p>
        </div>
      ) : error ? (
         <div className="text-center py-12 text-destructive">
            <p className="text-xl font-semibold">Error al cargar {title.toLowerCase()}</p>
            <p className="text-sm mt-1">{error}</p>
        </div>
      ) : data.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {data.map((item, index) => {
            const key = type === 'episode' ? `${(item as NewEpisode).animeId}-${(item as NewEpisode).episodeNumber}-${index}` : `${(item as AnimeListing).id}-${index}`;
            return <AnimeCard key={key} anime={item} type={type} />;
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-xl font-medium text-muted-foreground">
            {emptyMessage}
          </p>
          <p className="mt-2 text-muted-foreground">
            {emptySubMessage}
          </p>
        </div>
      )}
    </section>
  );

  return (
    <>
      <Helmet>
        <title>AniView - Inicio</title>
        <meta name="description" content="Mira los últimos episodios de anime y descubre nuevas series." />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        {renderSection(
          "Capítulos del Día",
          "Los últimos episodios de tus animes favoritos, recién salidos del horno.",
          latestEpisodes,
          localLoadingEpisodes, // Pass local loading state
          errorEpisodes,
          "episode",
          "No hay nuevos capítulos disponibles en este momento.",
          "Por favor, vuelve a intentarlo más tarde."
        )}

        <Separator className="my-8" />

        {renderSection(
          "Últimos Animes Agregados",
          "Descubre las series más recientes añadidas a nuestro catálogo.",
          latestAddedAnime,
          localLoadingAddedAnime, // Pass local loading state
          errorAddedAnime,
          "listing",
          "No hay animes recién agregados en este momento.",
          "Vuelve pronto para más novedades."
        )}
      </div>
    </>
  );
}
