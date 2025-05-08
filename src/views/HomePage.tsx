
import { useState, useEffect } from 'react';
import { getLatestEpisodes, getLatestAddedAnime, type NewEpisode, type AnimeListing } from '@/services/anime-api';
import { AnimeCard } from '@/components/anime-card';
import { Separator } from '@/components/ui/separator';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

export default function HomePage() {
  const [latestEpisodes, setLatestEpisodes] = useState<NewEpisode[]>([]);
  const [latestAddedAnime, setLatestAddedAnime] = useState<AnimeListing[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(true);
  const [loadingAddedAnime, setLoadingAddedAnime] = useState(true);
  const [errorEpisodes, setErrorEpisodes] = useState<string | null>(null);
  const [errorAddedAnime, setErrorAddedAnime] = useState<string | null>(null);
  const location = useLocation();
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(window.location.origin + location.pathname + location.search);
  }, [location]);

  useEffect(() => {
    const fetchLatestEpisodes = async () => {
      setLoadingEpisodes(true);
      setErrorEpisodes(null);
      try {
        const episodes = await getLatestEpisodes();
        setLatestEpisodes(episodes);
      } catch (err) {
        console.error("Error fetching latest episodes:", err);
        setErrorEpisodes(err instanceof Error ? err.message : "Failed to load latest episodes.");
      } finally {
        setLoadingEpisodes(false);
      }
    };

    const fetchLatestAddedAnime = async () => {
      setLoadingAddedAnime(true);
      setErrorAddedAnime(null);
      try {
        const addedAnime = await getLatestAddedAnime();
        setLatestAddedAnime(addedAnime);
      } catch (err) {
        console.error("Error fetching latest added anime:", err);
        setErrorAddedAnime(err instanceof Error ? err.message : "Failed to load latest added anime.");
      } finally {
        setLoadingAddedAnime(false);
      }
    };

    fetchLatestEpisodes();
    fetchLatestAddedAnime();
  }, []);

  const renderSection = <T extends AnimeListing | NewEpisode>(
    title: string,
    description: string,
    data: T[],
    isLoading: boolean,
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
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="w-full max-w-sm overflow-hidden shadow-lg rounded-lg">
              <div className="aspect-square bg-muted animate-pulse"></div>
              <div className="p-3 space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                <div className="h-8 bg-muted animate-pulse rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
         <div className="text-center py-12 text-destructive min-h-[200px]">
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
        <div className="flex flex-col items-center justify-center py-12 text-center min-h-[200px]">
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

  const pageTitle = "AnimeBell - Inicio - Ver Anime Online";
  const pageDesc = "Descubre los últimos episodios de anime y series populares en AnimeBell. Tu portal para ver anime online gratis.";
  const defaultSocialImage = 'https://picsum.photos/seed/animebell-social/1200/630';

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
        <meta property="og:image" content={defaultSocialImage} data-ai-hint="social media banner" />
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={currentUrl} />
        <meta property="twitter:title" content={pageTitle} />
        <meta property="twitter:description" content={pageDesc} />
        <meta property="twitter:image" content={defaultSocialImage} data-ai-hint="social media banner" />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        {renderSection(
          "Capítulos del Día",
          "Los últimos episodios de tus animes favoritos, recién salidos del horno.",
          latestEpisodes,
          loadingEpisodes,
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
          loadingAddedAnime,
          errorAddedAnime,
          "listing",
          "No hay animes recién agregados en este momento.",
          "Vuelve pronto para más novedades."
        )}
      </div>
    </>
  );
}
