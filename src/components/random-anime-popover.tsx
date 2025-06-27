'use client';

import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Dices, Loader2, ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getRandomAnime, type AnimeListing } from '@/services/anime-api';

export function RandomAnimePopover() {
  const [randomAnime, setRandomAnime] = useState<AnimeListing | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const fetchRandom = useCallback(async () => {
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
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Fetch only if it's opening and there's no data yet.
      if (!randomAnime && !isLoading) {
          fetchRandom();
      }
    } else {
      // Reset state when dialog is closed for a fresh start next time
      setRandomAnime(null);
      setError(null);
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="w-9 h-9" aria-label="Obtener anime aleatorio">
          <Dices className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sugerencia Aleatoria</DialogTitle>
          <DialogDescription>
            ¿No sabes qué ver? ¡Aquí tienes una sugerencia!
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-[350px] flex items-center justify-center py-4">
          {isLoading ? (
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          ) : error ? (
            <div className="text-center text-destructive space-y-2">
              <ServerCrash className="h-12 w-12 mx-auto" />
              <p className="text-lg font-semibold">{error}</p>
            </div>
          ) : randomAnime ? (
            <div className="w-full space-y-4 text-center">
              <Link to={`/anime/${randomAnime.id}`} onClick={() => setIsOpen(false)} className="block group w-4/5 mx-auto">
                <div className="aspect-[2/3] w-full rounded-md overflow-hidden relative shadow-lg transition-transform group-hover:scale-105">
                  <img
                    src={randomAnime.thumbnailUrl}
                    alt={`Portada de ${randomAnime.title}`}
                    className="object-cover w-full h-full"
                    data-ai-hint="anime cover"
                    loading="lazy"
                  />
                </div>
                <h3 className="mt-4 text-xl font-semibold truncate group-hover:text-accent transition-colors">
                  {randomAnime.title}
                </h3>
              </Link>
            </div>
          ) : (
             <div className="text-center text-muted-foreground space-y-2">
                <Dices className="h-12 w-12 mx-auto" />
                <p>Haz clic en el botón de abajo para obtener una sugerencia.</p>
           </div>
          )}
        </div>
        <DialogFooter className="sm:justify-between gap-2 flex-col sm:flex-row">
            <Button type="button" variant="secondary" onClick={fetchRandom} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Dices className="mr-2 h-4 w-4" />}
                Otra sugerencia
            </Button>
            {randomAnime ? (
             <DialogClose asChild>
                <Button asChild>
                    <Link to={`/anime/${randomAnime.id}`}>Ver Anime</Link>
                </Button>
            </DialogClose>
            ) : (
             <DialogClose asChild>
                <Button type="button" variant="outline">
                    Cerrar
                </Button>
            </DialogClose>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
