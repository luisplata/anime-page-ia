import { getLatestEpisodes, type NewEpisode } from '@/services/anime-api';
import { AnimeCard } from '@/components/anime-card';
import { Separator } from '@/components/ui/separator';

export default async function HomePage() {
  const latestEpisodes: NewEpisode[] = await getLatestEpisodes();

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Nuevos Capítulos del Día
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Los últimos episodios de tus animes favoritos, recién salidos del horno.
        </p>
      </header>
      <Separator className="my-6" />
      {latestEpisodes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {latestEpisodes.map((episode) => (
            <AnimeCard key={`${episode.animeId}-${episode.episodeNumber}`} anime={episode} type="episode" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-xl font-medium text-muted-foreground">
            No hay nuevos capítulos disponibles en este momento.
          </p>
          <p className="mt-2 text-muted-foreground">
            Por favor, vuelve a intentarlo más tarde.
          </p>
        </div>
      )}
    </div>
  );
}
