'use client';

import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Dices, Loader2, ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getRandomAnime, type AnimeListing } from '@/services/anime-api';

export function RandomAnimePopover() {
  const [randomAnime, setRandomAnime] = useState<AnimeListing | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRandom = useCallback(async () => {
    // This check prevents multiple fetches if the popover is rapidly opened/closed
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    setRandomAnime(null); // Clear previous result
    try {
      const anime = await getRandomAnime();
      if (anime) {
        setRandomAnime(anime);
      } else {
        setError('No se pudo cargar un anime aleatorio.');
      }
    } catch (err) {
      setError('Error al conectar con el servidor.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Use onOpenChange to fetch data only when the popover opens.
  const handleOpenChange = (open: boolean) => {
    if (open) {
      fetchRandom();
    }
  };

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="w-9 h-9" aria-label="Obtener anime aleatorio">
          <Dices className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="grid gap-4">
          <div className="space-y-1">
            <h4 className="font-medium leading-none">Sugerencia Aleatoria</h4>
            <p className="text-sm text-muted-foreground">
              ¿No sabes qué ver? ¡Prueba suerte!
            </p>
          </div>
          <div className="min-h-[250px] flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : error ? (
              <div className="text-center text-destructive space-y-2">
                 <ServerCrash className="h-8 w-8 mx-auto" />
                 <p className="text-sm font-semibold">{error}</p>
              </div>
            ) : randomAnime ? (
              <div className="w-full space-y-2 text-center">
                <Link to={`/anime/${randomAnime.id}`} className="block group w-4/5 mx-auto">
                  <div className="aspect-[2/3] w-full rounded-md overflow-hidden relative shadow-lg">
                    <img
                      src={randomAnime.thumbnailUrl}
                      alt={`Portada de ${randomAnime.title}`}
                      className="object-cover w-full h-full"
                      data-ai-hint="anime cover"
                      loading="lazy"
                    />
                  </div>
                  <h5 className="mt-2 text-sm font-semibold truncate group-hover:text-accent transition-colors">
                    {randomAnime.title}
                  </h5>
                </Link>
                {/* This PopoverTrigger inside a PopoverContent allows closing the popover when clicking the link */}
                <PopoverTrigger asChild>
                   <Button asChild size="sm" className="w-full mt-2">
                    <Link to={`/anime/${randomAnime.id}`}>Ver Anime</Link>
                  </Button>
                </PopoverTrigger>
              </div>
            ) : (
                 <div className="text-center text-muted-foreground space-y-2">
                     <Dices className="h-8 w-8 mx-auto" />
                     <p className="text-sm">Haz clic para obtener una sugerencia.</p>
                </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
