
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Search, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import HomePage from '@/views/HomePage';
import DirectoryPage from '@/views/directorio/DirectoryPage';
import AnimeDetailPage from '@/views/anime/AnimeDetailPage';
import EpisodePlayerPage from '@/views/ver/EpisodePlayerPage';
import FavoritesPage from '@/views/favoritos/FavoritesPage';
import { useState, useEffect } from 'react';

const animeImages = [
  '/assets/animebell_logo_name_prototype.png',
  '/assets/animebell_logo.png',
  '/assets/animebell_wifu_002.png',
  '/assets/animebell_wifu_003.png',
  '/assets/animebell_wifu_004.png',
  '/assets/animebell_wifu_005.png',
  '/assets/animebell_wifu_006.png',
  '/assets/animebell_wifu_007.png',
  '/assets/animebell_wifu_008.png',
  '/assets/animebell_wifu_009.png',
  '/assets/animebell_wifu_010.png',
  '/assets/animebell_wifu_011.png',
  '/assets/animebell_wifu_012.png',
  '/assets/animebell_wifu_013.png',
  '/assets/animebell_wifu_014.png',
  '/assets/animebell_wifu_015.png',
  '/assets/animebell_wifu_016.png',
  '/assets/animebell_wifu_017.png',
  '/assets/animebell_wifu_018.png',
];

export default function App() {
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const query = formData.get('q') as string;
    navigate(`/directorio?q=${encodeURIComponent(query)}`);
  };

  const [randomImage, setRandomImage] = useState('');

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * animeImages.length);
    setRandomImage(animeImages[randomIndex]);
  }, []);

  return (
    <div className={`font-sans antialiased flex min-h-screen w-full flex-col bg-background text-foreground`}>
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-md">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          {randomImage && (
            <img src={randomImage} alt="Random Anime Image" className="h-8 w-8 object-cover rounded-full mr-2" />
          )}
          <h1 className="text-xl font-bold">AnimeBell</h1>
        </Link>
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6 ml-auto">
          <Link to="/" className="text-foreground transition-colors hover:text-accent font-medium">
            Nuevos Capítulos
          </Link>
          <Link
            to="/directorio"
            className="text-foreground transition-colors hover:text-accent font-medium"
          >
            Directorio
          </Link>
          <Link
            to="/favoritos"
            className="text-foreground transition-colors hover:text-accent font-medium flex items-center gap-1"
          >
            <Star className="h-4 w-4" />
            Favoritos
          </Link>
        </nav>
        <div className="flex items-center gap-2 md:ml-auto md:gap-2 lg:gap-4">
          <form
            method="GET"
            action="/directorio"
            className="ml-auto flex-1 sm:flex-initial"
            onSubmit={handleSearchSubmit}
          >
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                name="q"
                placeholder="Buscar anime..."
                className="pl-8 sm:w-[200px] md:w-[200px] lg:w-[250px] rounded-full h-9"
              />
            </div>
            <button type="submit" className="sr-only">Buscar</button>
          </form>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/directorio" element={<DirectoryPage />} />
          <Route path="/anime/:animeId" element={<AnimeDetailPage />} />
          <Route path="/ver/:animeId/:episodeNumber" element={<EpisodePlayerPage />} />
          <Route path="/favoritos" element={<FavoritesPage />} />
        </Routes>
      </main>
    </div>
  );
}
