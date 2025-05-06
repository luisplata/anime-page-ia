import { getAnimeDirectory, type AnimeListing } from '@/services/anime-api';
import { AnimeCard } from '@/components/anime-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter, Search } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default async function DirectoryPage() {
  const animeDirectory: AnimeListing[] = await getAnimeDirectory();

  // TODO: Implement search and filtering logic based on query parameters

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Directorio de Anime
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Explora nuestra vasta colección de series de anime.
        </p>
      </header>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar en el directorio..."
            className="pl-10 w-full"
            // TODO: Add onChange handler for search
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <span>Filtrar</span>
          {/* TODO: Add onClick for filter functionality */}
        </Button>
      </div>
      <Separator className="my-6" />

      {animeDirectory.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {animeDirectory.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} type="listing" />
          ))}
        </div>
      ) : (
         <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-xl font-medium text-muted-foreground">
            El directorio de anime está vacío.
          </p>
          <p className="mt-2 text-muted-foreground">
            Parece que no hemos encontrado ningún anime. Inténtalo de nuevo más tarde.
          </p>
        </div>
      )}
    </div>
  );
}
