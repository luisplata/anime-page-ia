'use client';

import type { Episode, EpisodeSource } from '@/services/anime-api';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PlayCircle, AlertTriangle, Film, ArrowLeft, ArrowRight, ListVideo } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EpisodePlayerClientProps {
  episode: Episode | null | undefined;
  fullEpisodeTitle: string;
  animeId: string;
  prevEpisodeNumber: number | null;
  nextEpisodeNumber: number | null;
}

export default function EpisodePlayerClient({
  episode,
  fullEpisodeTitle,
  animeId,
  prevEpisodeNumber,
  nextEpisodeNumber,
}: EpisodePlayerClientProps) {
  const [selectedSource, setSelectedSource] = useState<EpisodeSource | null>(null);
  const [iframeKey, setIframeKey] = useState<string>(Date.now().toString());

  useEffect(() => {
    if (episode?.streamingSources && episode.streamingSources.length > 0) {
      const initialSource = episode.streamingSources.find(s => s.name.toLowerCase() === 'sw' || s.name.toLowerCase() === 'streamwish') || episode.streamingSources[0];
      setSelectedSource(initialSource);
      setIframeKey(initialSource.url); // Set iframe key to reload if src changes
    } else {
      setSelectedSource(null);
    }
  }, [episode]);

  const handleSourceChange = (source: EpisodeSource) => {
    setSelectedSource(source);
    setIframeKey(source.url + Date.now()); // Change key to force iframe reload
  };

  if (!episode) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center text-primary-foreground bg-muted p-8 rounded-lg shadow-xl">
            <AlertTriangle className="h-16 w-16 mb-4 text-destructive" />
            <p className="text-xl text-foreground">Episodio no encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">Los datos del episodio no están disponibles.</p>
        </div>
    );
  }

  const showControlCard = (episode.streamingSources && episode.streamingSources.length > 0) || prevEpisodeNumber || nextEpisodeNumber;

  return (
    <>
      <Card className="overflow-hidden shadow-xl rounded-lg">
        <AspectRatio ratio={16 / 9} className="bg-black">
          {selectedSource && selectedSource.url && selectedSource.url !== 'https://example.com/placeholder-stream' ? (
            <iframe
              key={iframeKey} // Force re-render on src change
              src={selectedSource.url}
              title={`Reproductor de ${fullEpisodeTitle}`}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            ></iframe>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-primary-foreground">
              <PlayCircle className="h-16 w-16 mb-4 text-muted-foreground" />
              <p className="text-xl text-foreground">Video no disponible</p>
              <p className="text-sm text-muted-foreground mt-1">
                {episode.streamingSources && episode.streamingSources.length > 0 
                  ? "Selecciona una fuente para ver el video."
                  : "No se encontró una fuente de video para este episodio."}
              </p>
            </div>
          )}
        </AspectRatio>
      </Card>

      {showControlCard && (
        <Card className="mt-6 shadow-lg rounded-lg">
          {episode.streamingSources && episode.streamingSources.length > 0 && (
            <>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Film className="h-5 w-5 text-accent" />
                  Fuentes de Video
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[150px] pr-1">
                  <div className="flex flex-wrap gap-2">
                    {episode.streamingSources.map((source) => (
                      <Button
                        key={source.name + source.url}
                        variant={selectedSource?.url === source.url ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSourceChange(source)}
                        className="text-xs md:text-sm"
                      >
                        {source.name} {source.quality && `(${source.quality})`}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </>
          )}

          <CardFooter className="p-3 grid grid-cols-3 gap-2 border-t">
            <div className="text-left">
              {prevEpisodeNumber && (
                <Button asChild size="sm" className="w-full">
                  <Link to={`/ver/${animeId}/${prevEpisodeNumber}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
                  </Link>
                </Button>
              )}
            </div>
            <div className="text-center">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to={`/anime/${animeId}`}>
                  <ListVideo className="mr-2 h-4 w-4" /> Lista
                </Link>
              </Button>
            </div>
            <div className="text-right">
              {nextEpisodeNumber && (
                <Button asChild size="sm" className="w-full">
                  <Link to={`/ver/${animeId}/${nextEpisodeNumber}`}>
                    Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
