
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '@/hooks/use-favorites';
import { getAnimeDetail, type AnimeDetail, type AnimeListing } from '@/services/anime-api';
import { AnimeCard } from '@/components/anime-card';
import { Button } from '@/components/ui/button';
import { Star, Frown, Upload, Download, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/hooks/use-toast'; // Import useToast

function transformDetailToAnimeListing(detail: AnimeDetail): AnimeListing {
  return {
    id: detail.id,
    title: detail.title,
    thumbnailUrl: detail.coverUrl,
  };
}

export default function FavoritesPage() {
  const { favoriteIds, addFavorite, isLoading: favoritesLoadingHook, removeFavorite: removeFavoriteFromHook } = useFavorites();
  const { toast } = useToast(); // Initialize toast
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [favoriteAnimes, setFavoriteAnimes] = useState<AnimeListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (favoritesLoadingHook) {
      setIsLoading(true);
      return;
    }

    if (favoriteIds.length === 0) {
      setFavoriteAnimes([]);
      setIsLoading(false);
      return;
    }

    const fetchFavoriteAnimes = async () => {
      setIsLoading(true);
      setError(null);
      setFavoriteAnimes([]);
      try {
        const animeDetailsPromises = favoriteIds.map(id => getAnimeDetail(id).catch(err => {
            console.error(`Failed to fetch details for favorite ID ${id}:`, err);
            return null;
        }));

        const results = await Promise.allSettled(animeDetailsPromises);

        const successfullyFetchedAnimes: AnimeListing[] = [];
        let fetchErrorOccurred = false;
        results.forEach(result => {
          if (result.status === 'fulfilled' && result.value) {
            const animeDetail = result.value;
             if (animeDetail && animeDetail.id && !animeDetail.title?.includes("Anime no encontrado")) {
                successfullyFetchedAnimes.push(transformDetailToAnimeListing(animeDetail));
             } else {
                console.warn(`Skipping favorite: Anime details not found or invalid for an ID. Detail:`, animeDetail);
                fetchErrorOccurred = true;
             }
          } else if (result.status === 'rejected') {
            console.error("A promise for fetching favorite anime details was rejected:", result.reason);
            fetchErrorOccurred = true;
          }
        });
        
        setFavoriteAnimes(successfullyFetchedAnimes);
        if (fetchErrorOccurred && successfullyFetchedAnimes.length < favoriteIds.length) {
             setError("Algunos animes favoritos no pudieron ser cargados. Por favor, revisa la consola para más detalles o intenta más tarde.");
        }

      } catch (e) {
        console.error("Error fetching favorite animes:", e);
        setError("Ocurrió un error al cargar tus animes favoritos.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavoriteAnimes();
  }, [favoriteIds, favoritesLoadingHook]);

  const handleExportFavorites = async () => {
    if (favoriteAnimes.length === 0) {
      toast({
        title: "Sin Favoritos",
        description: "No tienes animes favoritos para exportar.",
        variant: "default",
      });
      return;
    }
    setIsExporting(true);
    try {
      // Fetch details for all favorites to include title
      const detailedFavoritesPromises = favoriteIds.map(id => getAnimeDetail(id));
      const detailedResults = await Promise.allSettled(detailedFavoritesPromises);
      
      const csvData: string[] = ["id,title"]; // CSV Header
      detailedResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value && result.value.id && !result.value.title?.includes("Anime no encontrado")) {
          const anime = result.value;
          // Sanitize title for CSV (remove commas, quotes)
          const sanitizedTitle = anime.title.replace(/"/g, '""').replace(/,/g, '');
          csvData.push(`${anime.id},"${sanitizedTitle}"`);
        }
      });

      if (csvData.length <= 1 && favoriteIds.length > 0) {
          // Fallback to only slugs if details fail for all
          csvData.splice(1); // Remove existing data if any
          favoriteIds.forEach(id => csvData.push(`${id},""`)); // Add slug with empty title
          toast({
            title: "Exportación Parcial",
            description: "No se pudieron obtener los títulos de los animes. Exportando solo IDs.",
            variant: "default",
          });
      } else if (csvData.length <=1 && favoriteIds.length === 0) {
         toast({
            title: "Sin Favoritos",
            description: "No hay favoritos para exportar.",
            variant: "default",
          });
        setIsExporting(false);
        return;
      }


      const csvString = csvData.join("\n");
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "animebell_favorites.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Exportación Exitosa",
        description: "Tus favoritos han sido exportados.",
      });
    } catch (exportError) {
      console.error("Error exporting favorites:", exportError);
      toast({
        title: "Error de Exportación",
        description: "No se pudieron exportar tus favoritos.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFavorites = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      if (!text) {
        toast({ title: "Error de Importación", description: "El archivo está vacío.", variant: "destructive" });
        setIsImporting(false);
        return;
      }
      try {
        const lines = text.split(/\r\n|\n/);
        if (lines.length === 0) {
          toast({ title: "Error de Importación", description: "El archivo CSV está vacío o malformado.", variant: "destructive"});
          setIsImporting(false);
          return;
        }
        
        const header = lines[0].toLowerCase().split(',');
        const idIndex = header.indexOf('id');

        if (idIndex === -1) {
             toast({ title: "Error de Importación", description: "El archivo CSV debe tener una columna 'id'.", variant: "destructive"});
             setIsImporting(false);
             return;
        }

        let importedCount = 0;
        let alreadyFavoriteCount = 0;

        // Start from the second line (skip header)
        for (let i = 1; i < lines.length; i++) {          
          const line = lines[i];
          if (!line.trim()) continue; // Skip empty lines

          // Basic CSV parsing: split by comma, handle quoted fields
          const values = [];
          let currentVal = '';
          let inQuotes = false;
          for (const char of line) {
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(currentVal.trim());
              currentVal = '';
            } else {
              currentVal += char;
            }
          }
          values.push(currentVal.trim()); // Add the last value

          const animeId = values[idIndex];
          if (animeId) {
            if (!favoriteIds.includes(animeId)) {
              addFavorite(animeId);
              importedCount++;
            } else {
              alreadyFavoriteCount++;
            }
          }
        }

        if (importedCount > 0) {
          toast({
            title: "Importación Exitosa",
            description: `${importedCount} anime(s) agregado(s) a favoritos. ${alreadyFavoriteCount > 0 ? `${alreadyFavoriteCount} ya estaban.` : ''}`,
          });
        } else if (alreadyFavoriteCount > 0 && importedCount === 0) {
            toast({
            title: "Sin cambios",
            description: `Todos los animes del archivo ya estaban en tus favoritos (${alreadyFavoriteCount}).`,
            variant: "default",
          });
        } else {
          toast({
            title: "Nada que importar",
            description: "No se encontraron nuevos animes para importar en el archivo o el archivo estaba vacío.",
            variant: "default",
          });
        }
      } catch (importError) {
        console.error("Error importing favorites:", importError);
        toast({ title: "Error de Importación", description: "No se pudo procesar el archivo CSV.", variant: "destructive" });
      } finally {
        setIsImporting(false);
        // Reset file input to allow re-uploading the same file if needed
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.onerror = () => {
        toast({ title: "Error de Lectura", description: "No se pudo leer el archivo.", variant: "destructive" });
        setIsImporting(false);
    };
    reader.readAsText(file);
  };


  return (
    <>
      <Helmet>
        <title>Mis Favoritos - AniView</title>
        <meta name="description" content="Ve y gestiona tus animes favoritos." />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Star className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Mis Animes Favoritos
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button onClick={handleExportFavorites} variant="outline" className="w-full sm:w-auto" disabled={isExporting || isLoading || favoriteAnimes.length === 0}>
              {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Exportar Favoritos
            </Button>
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full sm:w-auto" disabled={isImporting || isLoading}>
              {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Importar Favoritos
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFavorites}
              accept=".csv"
              className="hidden"
              disabled={isImporting}
            />
          </div>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: favoriteIds.length || 5 }).map((_, index) => (
               <div key={index} className="w-full max-w-sm overflow-hidden shadow-lg rounded-lg">
                <div className="aspect-square bg-muted animate-pulse"></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                  <div className="h-8 bg-muted animate-pulse rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error && favoriteAnimes.length === 0 ? (
          <div className="text-center py-12 min-h-[300px]">
            <Frown className="h-16 w-16 text-destructive mx-auto mb-4" />
            <p className="text-xl text-destructive">{error}</p>
            <Button asChild className="mt-6">
              <Link to="/">Volver al inicio</Link>
            </Button>
          </div>
        ) : favoriteAnimes.length > 0 ? (
          <>
            {error && (
              <div className="mb-4 p-4 bg-destructive/10 border border-destructive text-destructive rounded-md">
                <p>{error}</p>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {favoriteAnimes.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} type="listing" />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 min-h-[300px]">
            <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-xl font-medium text-muted-foreground">
              Aún no has agregado animes a tus favoritos.
            </p>
            <p className="mt-2 text-muted-foreground">
              Explora el <Link to="/directorio" className="text-accent hover:underline">directorio</Link> y marca tus series preferidas.
            </p>
             <p className="mt-1 text-sm text-muted-foreground">
              O importa un archivo CSV con tus favoritos.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
