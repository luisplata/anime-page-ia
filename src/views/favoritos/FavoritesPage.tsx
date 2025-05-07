
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '@/hooks/use-favorites';
import { getAnimeDetail, type AnimeDetail, type AnimeListing } from '@/services/anime-api';
import { AnimeCard } from '@/components/anime-card';
import { Button } from '@/components/ui/button';
import { Star, Loader2, Frown } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
// Removed: import { useLoading } from '@/contexts/loading-context';

function transformDetailToAnimeListing(detail: AnimeDetail): AnimeListing {
  return {
    id: detail.id,
    title: detail.title,
    thumbnailUrl: detail.coverUrl,
  };
}

export default function FavoritesPage() {
  const { favoriteIds, isLoading: favoritesLoadingHook } = useFavorites();
  // Removed: const { showLoader, hideLoader } = useLoading();

  const [favoriteAnimes, setFavoriteAnimes] = useState<AnimeListing[]>([]);
  const [localIsLoading, setLocalIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initial loading state based on favorites hook
    if (favoritesLoadingHook) {
      setLocalIsLoading(true);
      return;
    }

    if (favoriteIds.length === 0) {
      setFavoriteAnimes([]);
      setLocalIsLoading(false);
      return;
    }

    const fetchFavoriteAnimes = async () => {
      setLocalIsLoading(true); // Set loading true when starting to fetch details
      setError(null);
      setFavoriteAnimes([]); // Clear previous favorites before fetching new ones
      try {
        const animeDetailsPromises = favoriteIds.map(id => getAnimeDetail(id).catch(err => {
            console.error(`Failed to fetch details for favorite ID ${id}:`, err);
            return null;
        }));

        const results = await Promise.allSettled(animeDetailsPromises);

        const successfullyFetchedAnimes: AnimeListing[] = [];
        let fetchErrorOccurred = false;
        results.forEach(result => {
          if (result.status === 'fulfilled' && result.value) {
            const animeDetail = result.value;
             if (animeDetail && animeDetail.id && !animeDetail.title?.includes("Anime no encontrado")) {
                successfullyFetchedAnimes.push(transformDetailToAnimeListing(animeDetail));
             } else {
                console.warn(`Skipping favorite: Anime details not found or invalid for an ID. Detail:`, animeDetail);
                fetchErrorOccurred = true; // Mark if any favorite was not properly fetched
             }
          } else if (result.status === 'rejected') {
            console.error("A promise for fetching favorite anime details was rejected:", result.reason);
            fetchErrorOccurred = true;
          }
        });
        
        setFavoriteAnimes(successfullyFetchedAnimes);
        if (fetchErrorOccurred && successfullyFetchedAnimes.length < favoriteIds.length) {
             setError("Algunos animes favoritos no pudieron ser cargados. Por favor, revisa la consola para más detalles o intenta más tarde.");
        }

      } catch (e) {
        console.error("Error fetching favorite animes:", e);
        setError("Ocurrió un error al cargar tus animes favoritos.");
      } finally {
        setLocalIsLoading(false);
      }
    };

    fetchFavoriteAnimes();
  }, [favoriteIds, favoritesLoadingHook]); // Removed showLoader, hideLoader from dependencies

  return (
    <>
      <Helmet>
        <title>Mis Favoritos - AniView</title>
        <meta name="description" content="Ve y gestiona tus animes favoritos." />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex items-center gap-3">
          <Star className="h-8 w-8 text-accent" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Mis Animes Favoritos
          </h1>
        </header>

        {localIsLoading ? (
          <div className="flex justify-center items-center py-12 min-h-[300px]">
            <Loader2 className="h-12 w-12 animate-spin text-accent" />
            <p className="ml-4 text-lg text-muted-foreground">Cargando tus favoritos...</p>
          </div>
        ) : error && favoriteAnimes.length === 0 ? ( // Show general error only if no animes loaded
          <div className="text-center py-12 min-h-[300px]">
            <Frown className="h-16 w-16 text-destructive mx-auto mb-4" />
            <p className="text-xl text-destructive">{error}</p>
            <Button asChild className="mt-6">
              <Link to="/">Volver al inicio</Link>
            </Button>
          </div>
        ) : favoriteAnimes.length > 0 ? (
          <>
            {error && ( // Show partial error message if some animes loaded but others failed
              <div className="mb-4 p-4 bg-destructive/10 border border-destructive text-destructive rounded-md">
                <p>{error}</p>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {favoriteAnimes.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} type="listing" />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 min-h-[300px]">
            <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-xl font-medium text-muted-foreground">
              Aún no has agregado animes a tus favoritos.
            </p>
            <p className="mt-2 text-muted-foreground">
              Explora el <Link to="/directorio" className="text-accent hover:underline">directorio</Link> y marca tus series preferidas.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
