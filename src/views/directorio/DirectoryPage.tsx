import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getAnimeDirectory,
  getAnimesByGenre,
  searchAnimes
} from '@/services/anime-api';
import { AnimeCard } from '@/components/anime-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter, Search, ListX, ChevronLeft, ChevronRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Helmet } from 'react-helmet-async';
import type { PaginatedAnimeResponse } from '@/services/anime-api';

export default function DirectoryPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const searchQueryFromUrl = queryParams.get('q') || "";
  const genreQueryFromUrl = queryParams.get('g') || "";
  const pageFromUrl = parseInt(queryParams.get('page') || '1', 10);

  const [animeData, setAnimeData] = useState<PaginatedAnimeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pageTitle, setPageTitle] = useState("Directorio de Anime - AnimeBell");
  const [pageDescription, setPageDescription] = useState("Explora nuestra vasta colección de series de anime.");
  const [currentUrl, setCurrentUrl] = useState('');
  
  const [searchInput, setSearchInput] = useState(searchQueryFromUrl);

  useEffect(() => {
    setCurrentUrl(window.location.origin + location.pathname + location.search);
  }, [location]);
  
  useEffect(() => {
    if (genreQueryFromUrl) {
      setSearchInput('');
    } else {
      setSearchInput(searchQueryFromUrl);
    }
  }, [searchQueryFromUrl, genreQueryFromUrl]);


  useEffect(() => {
    const fetchAnimes = async () => {
      setIsLoading(true);
      setError(null);
      setAnimeData(null);
      try {
        let response: PaginatedAnimeResponse;
        if (genreQueryFromUrl.trim()) {
          response = await getAnimesByGenre(genreQueryFromUrl.trim(), pageFromUrl);
          setPageTitle(`Animes de Género: "${genreQueryFromUrl}" (Pág. ${pageFromUrl}) - AnimeBell`);
          setPageDescription(`Mostrando animes del género "${genreQueryFromUrl}", página ${pageFromUrl}.`);
        } else if (searchQueryFromUrl.trim()) {
          response = await searchAnimes(searchQueryFromUrl.trim(), pageFromUrl);
          setPageTitle(`Resultados para "${searchQueryFromUrl}" (Pág. ${pageFromUrl}) - AnimeBell`);
          setPageDescription(`Mostrando resultados de búsqueda para "${searchQueryFromUrl}", página ${pageFromUrl}.`);
        } else {
          response = await getAnimeDirectory(pageFromUrl);
          setPageTitle(`Directorio de Anime (Pág. ${pageFromUrl}) - AnimeBell`);
          setPageDescription(`Explora nuestra vasta colección de series de anime, página ${pageFromUrl}.`);
        }
        setAnimeData(response);
      } catch (err) {
        console.error("Error fetching animes:", err);
        setError("No se pudo cargar la información de los animes.");
        setAnimeData(null);
        setPageTitle("Error - AnimeBell");
        setPageDescription("Ocurrió un error al cargar los animes.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnimes();
  }, [searchQueryFromUrl, genreQueryFromUrl, pageFromUrl]);

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
    if (!animeData || newPage < 1 || newPage > animeData.lastPage || newPage === animeData.currentPage || isLoading) {
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
  const defaultSocialImage = 'https://picsum.photos/seed/animebell-social/1200/630';

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={currentUrl} />
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={defaultSocialImage} data-ai-hint="social media banner" />
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={currentUrl} />
        <meta property="twitter:title" content={pageTitle} />
        <meta property="twitter:description" content={pageDescription} />
        <meta property="twitter:image" content={defaultSocialImage} data-ai-hint="social media banner" />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {genreQueryFromUrl.trim() ? `Género: "${genreQueryFromUrl}"` : searchQueryFromUrl.trim() ? `Buscando: "${searchQueryFromUrl}"` : "Directorio de Anime"}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {genreQueryFromUrl.trim() ? `Explora los animes del género ${genreQueryFromUrl}.` : searchQueryFromUrl.trim() ? `Explora los resultados para tu búsqueda.` : "Explora nuestra vasta colección de series de anime."}
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
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="flex items-center gap-2" disabled={isLoading}>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="w-full max-w-sm overflow-hidden shadow-lg rounded-lg">
                <div className="aspect-square bg-muted animate-pulse"></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                  <div className="h-8 bg-muted animate-pulse rounded w-full"></div>
                </div>
              </div>
            ))}
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
                  let isDisabled = !link.url || isLoading || link.active;
                  let targetPage: number | null = null;

                  if (link.url) {
                    try {
                      // Use window.location.origin for robustness if API returns full URLs
                      const urlObj = new URL(link.url, window.location.origin);
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
                            const urlObj = new URL(animeData.prevPageUrl, window.location.origin);
                            const pageStr = urlObj.searchParams.get('page');
                            if (pageStr) targetPage = parseInt(pageStr, 10);
                        } catch (e) { /* ignore */ }
                    }
                  } else if (isNext) {
                    label = "";
                    if (!animeData?.nextPageUrl) isDisabled = true;
                    else if (animeData?.nextPageUrl) {
                        try {
                            const urlObj = new URL(animeData.nextPageUrl, window.location.origin);
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
              {genreQueryFromUrl ? `No se encontraron animes para el género "${genreQueryFromUrl}"` : searchQueryFromUrl ? `No se encontraron resultados para "${searchQueryFromUrl}"` : "El directorio de anime está vacío."}
            </p>
            <p className="mt-2 text-muted-foreground">
              {genreQueryFromUrl ? "Intenta con otro género o explora el directorio completo." : searchQueryFromUrl ? "Intenta con otra búsqueda o explora el directorio completo." : "Parece que no hemos encontrado ningún anime. Inténtalo de nuevo más tarde."}
            </p>
            {(searchQueryFromUrl || genreQueryFromUrl) && (
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
