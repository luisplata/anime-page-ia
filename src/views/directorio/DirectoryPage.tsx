
import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getAnimeDirectory,
  searchAnimes
} from '@/services/anime-api';
import { AnimeCard } from '@/components/anime-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter, Search, ListX, ChevronLeft, ChevronRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Helmet } from 'react-helmet-async';
import type { PaginatedAnimeResponse } from '@/services/anime-api';
import { useLoading } from '@/contexts/loading-context'; // Re-added

export default function DirectoryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoading(); // Re-added

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
      showLoader();
      setLocalIsLoading(true);
      setError(null);
      setAnimeData(null);
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
        hideLoader();
      }
    };
    fetchAnimes();
  }, [searchQueryFromUrl, pageFromUrl, showLoader, hideLoader]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchInput.trim()) {
      params.set('q', searchInput.trim());
    }
    params.set('page', '1');
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

        {localIsLoading ? ( // Global spinner is active
          <div className="py-12 min-h-[300px]">
            {/* Minimal placeholder, global spinner is visible */}
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
                      const urlObj = new URL(link.url);
                      const pageStr = urlObj.searchParams.get('page');
                      if (pageStr) targetPage = parseInt(pageStr, 10);
                    } catch (e) { /* ignore */ }
                  }
                  
                  const isPrev = label === "&laquo; Previous";
                  const isNext = label === "Next &raquo;";

                  if (isPrev) {
                    label = "";
                    if (!animeData?.prevPageUrl) isDisabled = true;
                    else if (animeData?.prevPageUrl) {
                        try {
                            const urlObj = new URL(animeData.prevPageUrl);
                            const pageStr = urlObj.searchParams.get('page');
                            if (pageStr) targetPage = parseInt(pageStr, 10);
                        } catch (e) { /* ignore */ }
                    }
                  } else if (isNext) {
                    label = "";
                    if (!animeData?.nextPageUrl) isDisabled = true;
                    else if (animeData?.nextPageUrl) {
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
