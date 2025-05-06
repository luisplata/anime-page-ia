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
  const title = isEpisode(anime) ? `${anime.animeTitle} - Episodio ${anime.episodeNumber}` : anime.title;
  const thumbnailUrl = anime.thumbnailUrl.includes('https://example.com') ? `https://picsum.photos/seed/${anime.id}/200/300` : anime.thumbnailUrl;
  const imageAlt = isEpisode(anime) ? `Thumbnail for ${anime.animeTitle} Episode ${anime.episodeNumber}` : `Thumbnail for ${anime.title}`;
  const dataAiHint = isEpisode(anime) ? "anime episode" : "anime cover";


  return (
    <Card className="w-full max-w-sm overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
      <Link href={href} className="block">
        <CardHeader className="p-0">
          <div className="aspect-[2/3] relative">
            <Image
              src={thumbnailUrl}
              alt={imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              data-ai-hint={dataAiHint}
              priority={isEpisode(anime) && anime.episodeNumber < 5} // Prioritize loading images for first few new episodes
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="text-lg font-semibold leading-tight truncate group-hover:text-accent transition-colors">
            {title}
          </CardTitle>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0">
        <Button asChild variant="outline" className="w-full group">
          <Link href={href} className="flex items-center justify-center gap-2">
            <PlayCircle className="h-5 w-5 text-accent group-hover:text-accent-foreground transition-colors" />
            <span>{isEpisode(anime) ? 'Ver Episodio' : 'Ver Detalles'}</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
