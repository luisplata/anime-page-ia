import { getAnimeDirectory, searchAnime, type AnimeListing } from '@/services/anime-api';
import { AnimeCard } from '@/components/anime-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter, Search, ListX } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface DirectoryPageProps {
  searchParams?: {
    q?: string;
    // other filter params can be added here
  };
}

export default async function DirectoryPage({ searchParams }: DirectoryPageProps) {
  const searchQuery = searchParams?.q || "";
  let animes: AnimeListing[];
  let pageTitle = "Directorio de Anime";
  let pageDescription = "Explora nuestra vasta colección de series de anime.";

  if (searchQuery) {
    animes = await searchAnime(searchQuery);
    pageTitle = `Resultados para "${searchQuery}"`;
    pageDescription = `Mostrando resultados de búsqueda para "${searchQuery}".`;
  } else {
    animes = await getAnimeDirectory();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {pageTitle}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {pageDescription}
        </p>
      </header>

      <form method="GET" action="/directorio" className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            name="q"
            placeholder="Buscar en el directorio..."
            className="pl-10 w-full"
            defaultValue={searchQuery}
          />
        </div>
        <Button type="submit" className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          <span>Buscar</span>
        </Button>
        <Button variant="outline" className="flex items-center gap-2" type="button" disabled>
          <Filter className="h-5 w-5" />
          <span>Filtrar</span>
        </Button>
      </form>
      <Separator className="my-6" />

      {animes.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {animes.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} type="listing" />
          ))}
        </div>
      ) : (
         <div className="flex flex-col items-center justify-center py-12 text-center">
          <ListX className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl font-medium text-muted-foreground">
            {searchQuery ? `No se encontraron resultados para "${searchQuery}"` : "El directorio de anime está vacío."}
          </p>
          <p className="mt-2 text-muted-foreground">
            {searchQuery ? "Intenta con otra búsqueda o explora el directorio completo." : "Parece que no hemos encontrado ningún anime. Inténtalo de nuevo más tarde."}
          </p>
        </div>
      )}
    </div>
  );
}
