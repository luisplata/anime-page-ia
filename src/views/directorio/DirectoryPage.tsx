
import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAnimeDirectory, type AnimeListing, searchAnimes } from '@/services/anime-api';
import { AnimeCard } from '@/components/anime-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter, Search, ListX, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Helmet } from 'react-helmet-async';
import type React from 'react';

export default function DirectoryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const searchQueryFromUrl = queryParams.get('q') || "";

  const [displayedAnimes, setDisplayedAnimes] = useState<AnimeListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [pageTitle, setPageTitle] = useState("Directorio de Anime");
  const [pageDescription, setPageDescription] = useState("Explora nuestra vasta colección de series de anime.");
  const [currentSearch, setCurrentSearch] = useState(searchQueryFromUrl);

  useEffect(() => {
    setCurrentSearch(searchQueryFromUrl);
  }, [searchQueryFromUrl]);

  useEffect(() => {
    const fetchAnimes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (currentSearch.trim()) {
          const results = await searchAnimes(currentSearch.trim());
          setDisplayedAnimes(results);
        } else {
          const animes = await getAnimeDirectory();
          setDisplayedAnimes(animes);
        }
      } catch (err) {
        console.error("Error fetching animes:", err);
        setError("No se pudo cargar la información de los animes.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnimes();
  }, [currentSearch]);

  useEffect(() => {
    if (currentSearch.trim()) {
      setPageTitle(`Resultados para "${currentSearch}"`);
      setPageDescription(`Mostrando resultados de búsqueda para "${currentSearch}".`);
    } else {
      setPageTitle("Directorio de Anime - AniView");
      setPageDescription("Explora nuestra vasta colección de series de anime.");
    }
  }, [currentSearch]);
  
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = (e.target as HTMLFormElement).q.value;
    navigate(`/directorio?q=${encodeURIComponent(query)}`);
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
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
              defaultValue={currentSearch}
              key={currentSearch} 
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

        {isLoading ? (
          <div className="flex justify-center items-center py-12"><Loader2 className="h-12 w-12 animate-spin text-accent" /></div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">{error}</div>
        ) : displayedAnimes.length > 0 ? (
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
