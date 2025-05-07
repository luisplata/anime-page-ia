
import { getAnimeDetail, type AnimeDetail as AnimeDetailType, type Episode } from '@/services/anime-api';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { PlaySquare, ListVideo, AlertTriangle } from 'lucide-react';
import Head from 'next/head';
import { AnimeFavoriteButton } from '@/components/anime-favorite-button';
import type { GetStaticProps, GetStaticPaths } from 'next';

interface AnimeDetailPageProps {
  anime: AnimeDetailType | null; // Can be null if fetch fails
  error?: string;
}

export default function AnimeDetailPage({ anime, error }: AnimeDetailPageProps) {
  if (error || !anime) {
    return (
      <>
        <Head>
          <title>Error - AniView</title>
        </Head>
        <div className="container mx-auto px-4 py-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 text-3xl font-bold text-destructive">Error al cargar el Anime</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {error || "No se pudo cargar la información del anime. Por favor, inténtalo de nuevo más tarde o verifica que el ID sea correcto."}
          </p>
          <Button asChild className="mt-6">
            <Link href="/directorio">Volver al Directorio</Link>
          </Button>
        </div>
      </>
    );
  }
  
  const coverUrl = anime.coverUrl || `https://picsum.photos/seed/${anime.id}/400/600`;

  return (
    <>
      <Head>
        <title>{`${anime.title || 'Anime Desconocido'} - AniView`}</title>
        <meta name="description" content={anime.description ? anime.description.substring(0, 160) : `Detalles sobre ${anime.title || 'este anime'}.`} />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-1">
            <Card className="overflow-hidden shadow-xl rounded-lg">
              <div className="aspect-[2/3] relative">
                <Image
                  src={coverUrl}
                  alt={`Portada de ${anime.title}`}
                  fill
                  className="object-cover"
                  data-ai-hint="anime cover art"
                  priority
                  unoptimized={coverUrl.startsWith('http://')} 
                />
              </div>
            </Card>
          </div>

          <div className="md:col-span-2">
            <header className="mb-6">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{anime.title}</h1>
              <div className="mt-4">
                <AnimeFavoriteButton animeId={anime.id} animeTitle={anime.title} size="lg" />
              </div>
            </header>
            
            <Card className="mb-6 shadow-lg rounded-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{anime.description || "Descripción no disponible."}</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg rounded-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl flex items-center gap-2"><ListVideo className="h-6 w-6 text-accent" /> Lista de Episodios</CardTitle>
                <span className="text-sm text-muted-foreground">{anime.episodes.length} episodios</span>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <ul className="space-y-3">
                    {anime.episodes.length > 0 ? anime.episodes.map((episode: Episode) => (
                      <li key={episode.episodeNumber}>
                        <Button variant="ghost" asChild className="w-full justify-start text-left h-auto py-3 px-4 hover:bg-accent/10 rounded-md transition-colors">
                          <Link href={`/ver/${anime.id}/${episode.episodeNumber}`} className="flex items-center gap-3">
                            <PlaySquare className="h-5 w-5 text-accent flex-shrink-0" />
                            <div className="flex-grow">
                              <span className="font-medium text-foreground block">
                                Episodio {episode.episodeNumber}
                                {episode.title && episode.title.toLowerCase() !== `episode ${episode.episodeNumber}` && episode.title.toLowerCase() !== `episodio ${episode.episodeNumber}` ? `: ${episode.title}` : ''}
                              </span>
                            </div>
                          </Link>
                        </Button>
                        <Separator className="mt-3" />
                      </li>
                    )) : (
                      <p className="text-muted-foreground text-center py-4">No hay episodios disponibles para este anime.</p>
                    )}
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // TODO: Implement a function in src/services/anime-api.ts to fetch a list of all anime IDs.
  // For static export, all paths must be defined here, or fallback: 'blocking' or true must be used.
  // const allAnime = await getAllAnimeIds(); // Replace with your actual data fetching function
  // const paths = allAnime.map((id) => ({
  //   params: { id: id.toString() },
  // }));
  // return { paths, fallback: false }; 
  return {
    paths: [], // Placeholder: No paths pre-rendered.
    fallback: 'blocking', // Generates pages on demand then caches. Consider changing to 'true' or 'false' for full static export.
  };
};

export const getStaticProps: GetStaticProps<AnimeDetailPageProps> = async (context) => {
  const id = context.params?.id as string;

  if (!id) {
    return { props: { anime: null, error: "ID de anime no proporcionado." } }; // Removed revalidate
  }

  try {
    const anime = await getAnimeDetail(id);
     if (!anime || anime.id.startsWith('error-detail-')) { // Check for error placeholder from API service
      return { props: { anime: null, error: `No se encontró el anime con ID: ${id}` } }; // Removed revalidate
    }
    return {
      props: {
        anime,
      },
      // revalidate: 3600, // Removed for static export compatibility
    };
  } catch (error) {
    console.error("Failed to fetch anime details in getStaticProps:", error);
    return { props: { anime: null, error: "Error al cargar la información del anime." } }; // Removed revalidate
  }
};
