
'use client'; // Still useful for components within, though not strictly needed for page file itself

import { useState, useEffect } from 'react';
import { useFavorites } from '@/hooks/use-favorites';
import { getAnimeDetail, type AnimeDetail, type AnimeListing } from '@/services/anime-api';
import { AnimeCard } from '@/components/anime-card';
import { Button } from '@/components/ui/button';
import { Star, Loader2, Frown } from 'lucide-react';
import Link from 'next/link';
import Head from 'next/head';

// Helper function to transform AnimeDetail to AnimeListing for AnimeCard
function transformDetailToAnimeListing(detail: AnimeDetail): AnimeListing {
  return {
    id: detail.id,
    title: detail.title,
    thumbnailUrl: detail.coverUrl, // Use coverUrl as thumbnailUrl for consistency
  };
}

export default function FavoritesPage() {
  const { favoriteIds, isLoading: favoritesLoadingHook } = useFavorites();
  const [favoriteAnimes, setFavoriteAnimes] = useState<AnimeListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (favoritesLoadingHook) {
      setIsLoading(true);
      return;
    }

    if (favoriteIds.length === 0) {
      setFavoriteAnimes([]);
      setIsLoading(false);
      return;
    }

    const fetchFavoriteAnimes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const results = await Promise.allSettled(
          favoriteIds.map(id => getAnimeDetail(id))
        );
        
        const successfullyFetchedAnimes: AnimeListing[] = [];
        results.forEach(result => {
          if (result.status === 'fulfilled' && result.value && !result.value.id.startsWith('error-detail-')) {
            if (!result.value.title.startsWith('Anime no encontrado')) {
                successfullyFetchedAnimes.push(transformDetailToAnimeListing(result.value));
            } else {
                console.warn(`Anime with ID ${result.value.id} was not found or resulted in an error, skipping from favorites.`);
            }
          } else if (result.status === 'rejected') {
            console.error("Failed to fetch one of the favorite animes:", result.reason);
          }
        });
        setFavoriteAnimes(successfullyFetchedAnimes);
      } catch (e) {
        console.error("Error fetching favorite animes:", e);
        setError("Ocurrió un error al cargar tus animes favoritos.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavoriteAnimes();
  }, [favoriteIds, favoritesLoadingHook]);

  return (
    <>
      <Head>
        <title>Mis Favoritos - AniView</title>
        <meta name="description" content="Ve y gestiona tus animes favoritos." />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex items-center gap-3">
          <Star className="h-8 w-8 text-accent" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Mis Animes Favoritos
          </h1>
        </header>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-accent" />
            <p className="ml-4 text-lg text-muted-foreground">Cargando tus favoritos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <Frown className="h-16 w-16 text-destructive mx-auto mb-4" />
            <p className="text-xl text-destructive">{error}</p>
            <Button asChild className="mt-6">
              <Link href="/">Volver al inicio</Link>
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
              Explora el <Link href="/directorio" className="text-accent hover:underline">directorio</Link> y marca tus series preferidas.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
