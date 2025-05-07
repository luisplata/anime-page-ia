
'use client'; 

import { Link } from 'react-router-dom'; 
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { AnimeListing, NewEpisode } from '@/services/anime-api';
import { PlayCircle, Heart, BookmarkCheck } from 'lucide-react'; // Added BookmarkCheck
import { useFavorites } from '@/hooks/use-favorites';
import { useBookmarks } from '@/hooks/use-bookmarks'; // Import useBookmarks
import type React from 'react';

interface AnimeCardProps {
  anime: AnimeListing | NewEpisode;
  type: 'listing' | 'episode';
}

export function AnimeCard({ anime, type }: AnimeCardProps) {
  const { addFavorite, removeFavorite, isFavorite, isLoading: favoritesLoading } = useFavorites();
  const { getBookmarkForAnime, isLoading: bookmarksLoading } = useBookmarks(); // Use bookmarks hook

  const isEpisode = (anime: AnimeListing | NewEpisode): anime is NewEpisode => type === 'episode' && !!anime;
  const animeIdForFavAndBookmark = isEpisode(anime) ? anime.animeId : anime.id;
  const isCurrentlyFavorite = isFavorite(animeIdForFavAndBookmark);
  const bookmarkedEpisodeNumber = getBookmarkForAnime(animeIdForFavAndBookmark);

  const handleFavoriteToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (isCurrentlyFavorite) {
      removeFavorite(animeIdForFavAndBookmark);
    } else {
      addFavorite(animeIdForFavAndBookmark);
    }
  };
  
  const idForLinksAndSeed = isEpisode(anime) ? anime.animeId : anime.id;
  const encodedAnimeId = encodeURIComponent(idForLinksAndSeed);
  
  let href: string;
  let actionText: string;

  if (isEpisode(anime)) {
    href = `/ver/${encodedAnimeId}/${anime.episodeNumber}`;
    actionText = 'Ver Episodio';
  } else if (bookmarkedEpisodeNumber) {
    href = `/ver/${encodedAnimeId}/${bookmarkedEpisodeNumber}`;
    actionText = `Continuar Ep. ${bookmarkedEpisodeNumber}`;
  } else {
    href = `/anime/${encodedAnimeId}`;
    actionText = 'Ver Detalles';
  }
  
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
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          className="bg-background/70 hover:bg-background text-foreground rounded-full p-1.5 opacity-0 group-hover/card:opacity-100 transition-opacity"
          onClick={handleFavoriteToggle}
          aria-label={isCurrentlyFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          disabled={favoritesLoading}
        >
          <Heart className={`h-5 w-5 ${isCurrentlyFavorite ? 'text-red-500 fill-red-500' : 'text-muted-foreground'}`} />
        </Button>
        {/* Display bookmark icon if the anime (not an episode card itself) is bookmarked */}
        {!isEpisode(anime) && bookmarkedEpisodeNumber && !bookmarksLoading && (
           <div className="bg-accent/80 hover:bg-accent text-accent-foreground rounded-full p-1.5 flex items-center justify-center transition-opacity"
                title={`Continuar viendo Ep. ${bookmarkedEpisodeNumber}`}>
            <BookmarkCheck className="h-5 w-5" />
          </div>
        )}
      </div>
      <Link to={href} className="block group">
        <CardHeader className="p-0">
          <div className="aspect-square relative">
            <img
              src={finalThumbnailUrl}
              alt={imageAlt}
              className="object-cover w-full h-full"
              data-ai-hint={dataAiHint}
              loading={isEpisode(anime) && typeof anime.episodeNumber === 'number' && anime.episodeNumber < 5 ? "eager" : "lazy"}
            />
             {/* Overlay for bookmarked series on listing cards */}
            {!isEpisode(anime) && bookmarkedEpisodeNumber && (
              <div className="absolute inset-x-0 bottom-0 bg-black/70 text-white p-1.5 text-xs text-center font-medium">
                <BookmarkCheck className="inline h-3 w-3 mr-1" />
                Viendo Ep. {bookmarkedEpisodeNumber}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-3"> 
          <CardTitle className="text-base font-semibold leading-tight truncate group-hover:text-accent transition-colors"> 
            {title || "Título no disponible"}
          </CardTitle>
        </CardContent>
      </Link>
      <CardFooter className="p-3 pt-0"> 
        <Button asChild variant={!isEpisode(anime) && bookmarkedEpisodeNumber ? "default" : "outline"} className="w-full group text-sm h-9"> 
          <Link to={href} className="flex items-center justify-center gap-2">
            { !isEpisode(anime) && bookmarkedEpisodeNumber ? <BookmarkCheck className="h-4 w-4" /> : <PlayCircle className="h-4 w-4 text-accent group-hover:text-accent-foreground transition-colors" />}
            <span>{actionText}</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
