
'use client';

import Link from 'next/link';
import Image from 'next/image';
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

  const isEpisode = (item: AnimeListing | NewEpisode): item is NewEpisode => type === 'episode';
  
  const animeIdForFav = isEpisode(anime) ? anime.animeId : anime.id;
  const isCurrentlyFavorite = isFavorite(animeIdForFav);

  const handleFavoriteToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent link navigation if button is inside a link
    e.stopPropagation();
    if (isCurrentlyFavorite) {
      removeFavorite(animeIdForFav);
    } else {
      addFavorite(animeIdForFav);
    }
  };
  
  const href = isEpisode(anime) ? `/ver/${anime.animeId}/${anime.episodeNumber}` : `/anime/${anime.id}`;
  
  let title: string;
  if (isEpisode(anime)) {
    title = `${anime.animeTitle} - Episodio ${anime.episodeNumber}`;
  } else {
    title = anime.title;
  }
  
  const idForSeed = isEpisode(anime) ? anime.animeId : anime.id;
  const thumbnailUrl = anime.thumbnailUrl && !anime.thumbnailUrl.includes('https://example.com/missing.jpg') 
    ? anime.thumbnailUrl 
    : `https://picsum.photos/seed/${idForSeed}/300/300`;

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
      <Link href={href} className="block group">
        <CardHeader className="p-0">
          <div className="aspect-square relative">
            <Image
              src={thumbnailUrl}
              alt={imageAlt}
              fill
              sizes="(max-width: 639px) 50vw, (max-width: 767px) 33vw, (max-width: 1023px) 25vw, 20vw"
              className="object-cover"
              data-ai-hint={dataAiHint}
              priority={isEpisode(anime) && typeof anime.episodeNumber === 'number' && anime.episodeNumber < 5}
              // Removed unoptimized prop here to rely on global next.config.ts setting
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
          <Link href={href} className="flex items-center justify-center gap-2">
            <PlayCircle className="h-4 w-4 text-accent group-hover:text-accent-foreground transition-colors" />
            <span>{isEpisode(anime) ? 'Ver Episodio' : 'Ver Detalles'}</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
