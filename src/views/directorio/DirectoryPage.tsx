
import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getAnimeDirectory,
  searchAnimes
} from '@/services/anime-api';
import { AnimeCard } from '@/components/anime-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter, Search, ListX, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Helmet } from 'react-helmet-async';
import type { PaginatedAnimeResponse } from '@/services/anime-api';
// Removed: import { useLoading } from '@/contexts/loading-context';

export default function DirectoryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  // Removed: const { showLoader, hideLoader } = useLoading();

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const searchQueryFromUrl = queryParams.get('q') || "";
  const pageFromUrl = parseInt(queryParams.get('page') || '1', 10);

  const [animeData, setAnimeData] = useState<PaginatedAnimeResponse | null>(null);
  const [localIsLoading, setLocalIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pageTitle, setPageTitle] = useState("Directorio de Anime - AniView");
  const [pageDescription, setPageDescription] = useState("Explora nuestra vasta colección de series de anime.");

  const [searchInput, setSearchInput] = useState(searchQueryFromUrl);

  useEffect(() => {
    setSearchInput(searchQueryFromUrl);
  }, [searchQueryFromUrl]);


  useEffect(() => {
    const fetchAnimes = async () => {
      // Removed: showLoader();
      setLocalIsLoading(true);
      setError(null);
      setAnimeData(null); // Clear previous data
      try {
        let response: PaginatedAnimeResponse;
        if (searchQueryFromUrl.trim()) {
          response = await searchAnimes(searchQueryFromUrl.trim(), pageFromUrl);
          setPageTitle(`Resultados para "${searchQueryFromUrl}" (Pág. ${pageFromUrl}) - AniView`);
          setPageDescription(`Mostrando resultados de búsqueda para "${searchQueryFromUrl}", página ${pageFromUrl}.`);
        } else {
          response = await getAnimeDirectory(pageFromUrl);
          setPageTitle(`Directorio de Anime (Pág. ${pageFromUrl}) - AniView`);
          setPageDescription(`Explora nuestra vasta colección de series de anime, página ${pageFromUrl}.`);
        }
        setAnimeData(response);
      } catch (err) {
        console.error("Error fetching animes:", err);
        setError("No se pudo cargar la información de los animes.");
        setAnimeData(null);
      } finally {
        setLocalIsLoading(false);
        // Removed: hideLoader();
      }
    };
    fetchAnimes();
  }, [searchQueryFromUrl, pageFromUrl]); // Removed showLoader, hideLoader dependencies

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchInput.trim()) {
      params.set('q', searchInput.trim());
    }
    params.set('page', '1'); // Reset to page 1 on new search
    navigate(`/directorio?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    if (!animeData || newPage < 1 || newPage > animeData.lastPage || newPage === animeData.currentPage || localIsLoading) {
      return;
    }
    const params = new URLSearchParams(location.search);
    params.set('page', newPage.toString());
    navigate(`${location.pathname}?${params.toString()}`);
    window.scrollTo(0, 0);
  };

  const displayedAnimes = animeData?.animes || [];
  const currentPage = animeData?.currentPage || 1;
  const totalPages = animeData?.lastPage || 1;
  const paginationLinks = animeData?.links || [];

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {searchQueryFromUrl.trim() ? `Buscando: "${searchQueryFromUrl}"` : "Directorio de Anime"}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {searchQueryFromUrl.trim() ? `Explora los resultados para tu búsqueda.` : "Explora nuestra vasta colección de series de anime."}
            {animeData && animeData.totalAnimes > 0 && ` (${animeData.totalAnimes} resultados)`}
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
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              disabled={localIsLoading}
            />
          </div>
          <Button type="submit" className="flex items-center gap-2" disabled={localIsLoading}>
            <Search className="h-5 w-5" />
            <span>Buscar</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2" type="button" disabled>
            <Filter className="h-5 w-5" />
            <span>Filtrar</span>
          </Button>
        </form>
        <Separator className="my-6" />

        {localIsLoading ? (
          <div className="flex justify-center items-center py-12 min-h-[300px]">
            <Loader2 className="h-12 w-12 animate-spin text-accent" />
            <p className="ml-4 text-lg text-muted-foreground">Cargando animes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-destructive min-h-[300px]">{error}</div>
        ) : displayedAnimes.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {displayedAnimes.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} type="listing" />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-1 mt-8 flex-wrap gap-y-2">
                {paginationLinks.map((link, index) => {
                  let label = link.label;
                  let isDisabled = !link.url || localIsLoading || link.active;
                  let targetPage: number | null = null;

                  if (link.url) {
                    try {
                      // The URL might be absolute or relative, handle robustly
                      const urlObj = new URL(link.url);
                      const pageStr = urlObj.searchParams.get('page');
                      if (pageStr) targetPage = parseInt(pageStr, 10);
                    } catch (e) { /* ignore if URL is malformed */ }
                  }
                  
                  const isPrev = label === "&laquo; Previous";
                  const isNext = label === "Next &raquo;";

                  if (isPrev) {
                    label = ""; // Use icon only
                    if (!animeData?.prevPageUrl) isDisabled = true;
                    else if (animeData?.prevPageUrl) { // Ensure targetPage is correctly set from prevPageUrl
                        try {
                            const urlObj = new URL(animeData.prevPageUrl);
                            const pageStr = urlObj.searchParams.get('page');
                            if (pageStr) targetPage = parseInt(pageStr, 10);
                        } catch (e) { /* ignore */ }
                    }
                  } else if (isNext) {
                    label = ""; // Use icon only
                    if (!animeData?.nextPageUrl) isDisabled = true;
                    else if (animeData?.nextPageUrl) { // Ensure targetPage is correctly set from nextPageUrl
                        try {
                            const urlObj = new URL(animeData.nextPageUrl);
                            const pageStr = urlObj.searchParams.get('page');
                            if (pageStr) targetPage = parseInt(pageStr, 10);
                        } catch (e) { /* ignore */ }
                    }
                  } else if (label === "...") {
                     isDisabled = true;
                  }


                  return (
                    <Button
                      key={`${link.label}-${index}-${targetPage || 'no-target'}`}
                      onClick={() => targetPage && !isDisabled && handlePageChange(targetPage)}
                      disabled={isDisabled}
                      variant={link.active ? 'default' : 'outline'}
                      size="icon"
                      className={label === "..." ? "cursor-default" : ""}
                      aria-label={isPrev ? "Página anterior" : isNext ? "Página siguiente" : `Página ${link.label}`}
                    >
                      {isPrev ? <ChevronLeft className="h-4 w-4" /> :
                       isNext ? <ChevronRight className="h-4 w-4" /> :
                       label}
                    </Button>
                  );
                })}
              </div>
            )}
            <div className="text-center mt-4 text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center min-h-[300px]">
            <ListX className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl font-medium text-muted-foreground">
              {searchQueryFromUrl ? `No se encontraron resultados para "${searchQueryFromUrl}"` : "El directorio de anime está vacío."}
            </p>
            <p className="mt-2 text-muted-foreground">
              {searchQueryFromUrl ? "Intenta con otra búsqueda o explora el directorio completo." : "Parece que no hemos encontrado ningún anime. Inténtalo de nuevo más tarde."}
            </p>
            {searchQueryFromUrl && (
                <Button variant="link" onClick={() => navigate("/directorio?page=1")} className="mt-2">
                    Ver todos los animes
                </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
