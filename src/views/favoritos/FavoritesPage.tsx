
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '@/hooks/use-favorites';
import { getAnimeDetail, type AnimeDetail, type AnimeListing } from '@/services/anime-api';
import { AnimeCard } from '@/components/anime-card';
import { Button } from '@/components/ui/button';
import { Star, Loader2, Frown } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useLoading } from '@/contexts/loading-context'; // Import useLoading

function transformDetailToAnimeListing(detail: AnimeDetail): AnimeListing {
  return {
    id: detail.id,
    title: detail.title,
    thumbnailUrl: detail.coverUrl,
  };
}

export default function FavoritesPage() {
  const { favoriteIds, isLoading: favoritesLoadingHook } = useFavorites();
  const { showLoader, hideLoader } = useLoading(); // Use global loading context

  const [favoriteAnimes, setFavoriteAnimes] = useState<AnimeListing[]>([]);
  const [localIsLoading, setLocalIsLoading] = useState(true); // Renamed to avoid conflict
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (favoritesLoadingHook) {
      showLoader();
      setLocalIsLoading(true);
      return;
    } else if(favoriteIds.length > 0){ // Ensure loader is shown if there are favorites to fetch
      showLoader();
    }


    if (favoriteIds.length === 0) {
      setFavoriteAnimes([]);
      setLocalIsLoading(false);
      hideLoader(); // Hide if no favorites or hook is done loading them
      return;
    }

    const fetchFavoriteAnimes = async () => {
      setLocalIsLoading(true);
      setError(null);
      try {
        // Fetch all details concurrently
        const animeDetailsPromises = favoriteIds.map(id => getAnimeDetail(id).catch(err => {
            console.error(`Failed to fetch details for favorite ID ${id}:`, err);
            return null; // Return null on individual fetch error to not break Promise.allSettled
        }));

        const results = await Promise.allSettled(animeDetailsPromises);

        const successfullyFetchedAnimes: AnimeListing[] = [];
        results.forEach(result => {
          if (result.status === 'fulfilled' && result.value) {
            const animeDetail = result.value;
             if (animeDetail && animeDetail.id) { // Check if animeDetail and its ID are valid
                successfullyFetchedAnimes.push(transformDetailToAnimeListing(animeDetail));
             } else {
                console.warn(`Skipping favorite: Anime details not found or invalid for an ID in favorites list.`);
             }
          } else if (result.status === 'rejected') {
            console.error("A promise for fetching favorite anime details was rejected:", result.reason);
          }
        });
        setFavoriteAnimes(successfullyFetchedAnimes);
      } catch (e) { // This catch might be redundant if individual promises handle errors
        console.error("Error fetching favorite animes:", e);
        setError("Ocurrió un error al cargar tus animes favoritos.");
      } finally {
        setLocalIsLoading(false);
        hideLoader();
      }
    };

    fetchFavoriteAnimes();
  }, [favoriteIds, favoritesLoadingHook, showLoader, hideLoader]);

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

        {localIsLoading && favoriteAnimes.length === 0 ? ( // Show section loader only if no data and still loading
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-accent" />
            <p className="ml-4 text-lg text-muted-foreground">Cargando tus favoritos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <Frown className="h-16 w-16 text-destructive mx-auto mb-4" />
            <p className="text-xl text-destructive">{error}</p>
            <Button asChild className="mt-6">
              <Link to="/">Volver al inicio</Link>
            </Button>
          </div>
        ) : favoriteAnimes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {favoriteAnimes.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} type="listing" />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
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
