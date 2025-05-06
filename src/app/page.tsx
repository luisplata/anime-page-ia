
import { getLatestEpisodes, getLatestAddedAnime, type NewEpisode, type AnimeListing } from '@/services/anime-api';
import { AnimeCard } from '@/components/anime-card';
import { Separator } from '@/components/ui/separator';

export default async function HomePage() {
  const latestEpisodes: NewEpisode[] = await getLatestEpisodes();
  const latestAddedAnime: AnimeListing[] = await getLatestAddedAnime();

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Capítulos del Día
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Los últimos episodios de tus animes favoritos, recién salidos del horno.
          </p>
        </header>
        {latestEpisodes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"> {/* Adjusted grid columns */}
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
      </section>

      <Separator className="my-8" />

      <section>
        <header className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Últimos Animes Agregados
          </h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Descubre las series más recientes añadidas a nuestro catálogo.
          </p>
        </header>
        {latestAddedAnime.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"> {/* Adjusted grid columns */}
            {latestAddedAnime.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} type="listing" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-xl font-medium text-muted-foreground">
              No hay animes recién agregados en este momento.
            </p>
            <p className="mt-2 text-muted-foreground">
              Vuelve pronto para más novedades.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

