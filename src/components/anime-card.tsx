
'use client'; // This directive is less relevant for Vite, but kept if component is also used elsewhere.

import { Link } from 'react-router-dom'; // Changed from next/link
// import Image from 'next/image'; // Removed, use standard <img>
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { AnimeListing, NewEpisode } from '@/services/anime-api';
import { PlayCircle, Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/use-favorites';
import type React from 'react';

interface AnimeCardProps {
  anime: AnimeListing | NewEpisode;
  type: 'listing' | 'episode';
}

export function AnimeCard({ anime, type }: AnimeCardProps) {
  const { addFavorite, removeFavorite, isFavorite, isLoading: favoritesLoading } = useFavorites();

  const isEpisode = (anime: AnimeListing | NewEpisode): anime is NewEpisode => type === 'episode' && !!anime;
  const animeIdForFav = isEpisode(anime) ? anime.animeId : anime.id;
  const isCurrentlyFavorite = isFavorite(animeIdForFav);

  const handleFavoriteToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (isCurrentlyFavorite) {
      removeFavorite(animeIdForFav);
    } else {
      addFavorite(animeIdForFav);
    }
  };
  
  const idForLinksAndSeed = isEpisode(anime) ? anime.animeId : anime.id;
  const encodedAnimeId = encodeURIComponent(idForLinksAndSeed);
  const href = isEpisode(anime) ? `/ver/${encodedAnimeId}/${anime.episodeNumber}` : `/anime/${encodedAnimeId}`;
  
  let title: string;
  if (isEpisode(anime)) {
    title = `${anime.animeTitle} - Episodio ${anime.episodeNumber}`;
  } else {
    title = anime.title;
  }
  
  const finalThumbnailUrl = anime.thumbnailUrl && anime.thumbnailUrl.trim() !== ''
    ? anime.thumbnailUrl
    : `https://picsum.photos/seed/${idForLinksAndSeed || 'default'}/300/300`;

  const imageAlt = isEpisode(anime) ? `Thumbnail for ${anime.animeTitle} Episode ${anime.episodeNumber}` : `Thumbnail for ${anime.title}`;
  const dataAiHint = isEpisode(anime) ? "anime episode" : "anime cover";

  return (
    <Card className="w-full max-w-sm overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg relative group/card">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 bg-background/70 hover:bg-background text-foreground rounded-full p-1.5 opacity-0 group-hover/card:opacity-100 transition-opacity"
        onClick={handleFavoriteToggle}
        aria-label={isCurrentlyFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        disabled={favoritesLoading}
      >
        <Heart className={`h-5 w-5 ${isCurrentlyFavorite ? 'text-red-500 fill-red-500' : 'text-muted-foreground'}`} />
      </Button>
      <Link to={href} className="block group"> {/* Changed to react-router-dom Link */}
        <CardHeader className="p-0">
          <div className="aspect-square relative">
            {/* Replaced next/image with standard img */}
            <img
              src={finalThumbnailUrl}
              alt={imageAlt}
              className="object-cover w-full h-full"
              data-ai-hint={dataAiHint}
              loading={isEpisode(anime) && typeof anime.episodeNumber === 'number' && anime.episodeNumber < 5 ? "eager" : "lazy"}
            />
          </div>
        </CardHeader>
        <CardContent className="p-3"> 
          <CardTitle className="text-base font-semibold leading-tight truncate group-hover:text-accent transition-colors"> 
            {title || "Título no disponible"}
          </CardTitle>
        </CardContent>
      </Link>
      <CardFooter className="p-3 pt-0"> 
        <Button asChild variant="outline" className="w-full group text-sm h-9"> 
          <Link to={href} className="flex items-center justify-center gap-2"> {/* Changed to react-router-dom Link */}
            <PlayCircle className="h-4 w-4 text-accent group-hover:text-accent-foreground transition-colors" />
            <span>{isEpisode(anime) ? 'Ver Episodio' : 'Ver Detalles'}</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
