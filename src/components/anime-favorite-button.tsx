
'use client';

import type React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Loader2 } from 'lucide-react';
import { useFavorites } from '@/hooks/use-favorites';
import { cn } from '@/lib/utils';

interface AnimeFavoriteButtonProps {
  animeId: string;
  animeTitle: string; // For ARIA label and context
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive" | null | undefined;
  size?: "default" | "sm" | "lg" | "icon" | null | undefined;
}

export function AnimeFavoriteButton({ animeId, animeTitle, className, variant = "outline", size = "default" }: AnimeFavoriteButtonProps) {
  const { addFavorite, removeFavorite, isFavorite, isLoading: favoritesLoading } = useFavorites();
  const isCurrentlyFavorite = isFavorite(animeId);

  const handleFavoriteToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (isCurrentlyFavorite) {
      removeFavorite(animeId);
    } else {
      addFavorite(animeId);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={handleFavoriteToggle}
      aria-label={isCurrentlyFavorite ? `Quitar ${animeTitle} de favoritos` : `Agregar ${animeTitle} a favoritos`}
      disabled={favoritesLoading}
    >
      {favoritesLoading ? (
        <Loader2 className={cn("h-5 w-5 animate-spin", size !== "icon" && "mr-2")} />
      ) : (
        <Heart className={cn("h-5 w-5", isCurrentlyFavorite ? 'text-red-500 fill-red-500' : 'text-muted-foreground', size !== "icon" && "mr-2")} />
      )}
      {size !== "icon" && (isCurrentlyFavorite ? 'En Favoritos' : 'Agregar a Favoritos')}
    </Button>
  );
}
