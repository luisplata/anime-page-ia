
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { AnimeListing, NewEpisode } from '@/services/anime-api';
import { PlayCircle } from 'lucide-react';

interface AnimeCardProps {
  anime: AnimeListing | NewEpisode;
  type: 'listing' | 'episode';
}

export function AnimeCard({ anime, type }: AnimeCardProps) {
  const isEpisode = (item: AnimeListing | NewEpisode): item is NewEpisode => type === 'episode';
  
  const href = isEpisode(anime) ? `/ver/${anime.animeId}/${anime.episodeNumber}` : `/anime/${anime.id}`;
  
  let title: string;
  if (isEpisode(anime)) {
    title = `${anime.animeTitle} - Episodio ${anime.episodeNumber}`;
  } else {
    title = anime.title;
  }
  
  const idForSeed = isEpisode(anime) ? anime.animeId : anime.id;
  // Use actual thumbnail URL from API. Fallback to picsum only if thumbnailUrl is missing or a known placeholder.
  const thumbnailUrl = anime.thumbnailUrl && !anime.thumbnailUrl.includes('https://example.com/missing.jpg') 
    ? anime.thumbnailUrl 
    : `https://picsum.photos/seed/${idForSeed}/300/300`;

  const imageAlt = isEpisode(anime) ? `Thumbnail for ${anime.animeTitle} Episode ${anime.episodeNumber}` : `Thumbnail for ${anime.title}`;
  const dataAiHint = isEpisode(anime) ? "anime episode" : "anime cover";


  return (
    <Card className="w-full max-w-sm overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
      <Link href={href} className="block group">
        <CardHeader className="p-0">
          <div className="aspect-square relative"> {/* Ensures square aspect ratio */}
            <Image
              src={thumbnailUrl}
              alt={imageAlt}
              fill
              sizes="(max-width: 639px) 50vw, (max-width: 767px) 33vw, (max-width: 1023px) 25vw, 20vw" // Adjusted for more breakpoints
              className="object-cover"
              data-ai-hint={dataAiHint}
              priority={isEpisode(anime) && typeof anime.episodeNumber === 'number' && anime.episodeNumber < 5} // Prioritize loading images for first few new episodes
              unoptimized={thumbnailUrl.startsWith('http://')} // Add unoptimized for HTTP images
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
