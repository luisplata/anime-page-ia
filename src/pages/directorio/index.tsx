
import { getAnimeDirectory, type AnimeListing } from '@/services/anime-api';
import { AnimeCard } from '@/components/anime-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter, Search, ListX } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Head from 'next/head';
import type { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { useState, useEffect, useMemo } from 'react';

interface DirectoryPageProps {
  allAnimes: AnimeListing[];
}

export default function DirectoryPage({ allAnimes }: DirectoryPageProps) {
  const router = useRouter();
  const searchQueryFromUrl = (router.query.q as string) || "";

  const [pageTitle, setPageTitle] = useState("Directorio de Anime");
  const [pageDescription, setPageDescription] = useState("Explora nuestra vasta colección de series de anime.");
  const [currentSearch, setCurrentSearch] = useState(searchQueryFromUrl);

  // Update internal search state if URL query changes
  useEffect(() => {
    setCurrentSearch(searchQueryFromUrl);
  }, [searchQueryFromUrl]);

  const displayedAnimes = useMemo(() => {
    if (!currentSearch.trim()) {
      return allAnimes;
    }
    return allAnimes.filter(anime =>
      anime.title.toLowerCase().includes(currentSearch.toLowerCase())
    );
  }, [allAnimes, currentSearch]);

  useEffect(() => {
    if (currentSearch.trim()) {
      setPageTitle(`Resultados para "${currentSearch}"`);
      setPageDescription(`Mostrando resultados de búsqueda para "${currentSearch}".`);
    } else {
      setPageTitle("Directorio de Anime");
      setPageDescription("Explora nuestra vasta colección de series de anime.");
    }
  }, [currentSearch]);
  
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = (e.target as HTMLFormElement).q.value;
    router.push(`/directorio?q=${encodeURIComponent(query)}`);
  };

  return (
    <>
      <Head>
        <title>{pageTitle} - AniView Directorio</title>
        <meta name="description" content={pageDescription} />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {/* This h1 can also be dynamic based on search, or stay static */}
            {currentSearch.trim() ? `Buscando: "${currentSearch}"` : "Directorio de Anime"}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {currentSearch.trim() ? `Explora los resultados para tu búsqueda.` : "Explora nuestra vasta colección de series de anime."}
          </p>
        </header>

        <form 
          onSubmit={handleSearchSubmit}
          className="mb-6 flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              name="q"
              placeholder="Buscar en el directorio..."
              className="pl-10 w-full"
              defaultValue={currentSearch} // Controlled by router query effectively
              key={currentSearch} // Re-render input if query changes from external link
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

        {displayedAnimes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {displayedAnimes.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} type="listing" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ListX className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl font-medium text-muted-foreground">
              {currentSearch ? `No se encontraron resultados para "${currentSearch}"` : "El directorio de anime está vacío."}
            </p>
            <p className="mt-2 text-muted-foreground">
              {currentSearch ? "Intenta con otra búsqueda o explora el directorio completo." : "Parece que no hemos encontrado ningún anime. Inténtalo de nuevo más tarde."}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps<DirectoryPageProps> = async () => {
  const animes = await getAnimeDirectory(); // Fetches all animes for client-side filtering
  
  return {
    props: {
      allAnimes: animes,
    },
  };
};
