
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Star, Dices, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import HomePage from '@/views/HomePage';
import DirectoryPage from '@/views/directorio/DirectoryPage';
import AnimeDetailPage from '@/views/anime/AnimeDetailPage';
import EpisodePlayerPage from '@/views/ver/EpisodePlayerPage';
import FavoritesPage from '@/views/favoritos/FavoritesPage';
import PrivacyPolicyPage from '@/views/legal/PrivacyPolicyPage';
import TermsAndConditionsPage from '@/views/legal/TermsAndConditionsPage';
import DevlogPage from '@/views/devlog/DevlogPage';
import { Footer } from '@/components/Footer'; 
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { RandomAnimePopover } from '@/components/random-anime-popover';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from '@/components/ui/separator';

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
  const location = useLocation();
  const [homePageKey, setHomePageKey] = useState(Date.now());
  const [randomImage, setRandomImage] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * animeImages.length);
    setRandomImage(animeImages[randomIndex]);
  }, []);

  useEffect(() => {
    setCurrentUrl(window.location.href);
    window.scrollTo(0, 0);
  }, [location]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const query = formData.get('q') as string;
    if (query.trim()) {
      navigate(`/directorio?q=${encodeURIComponent(query)}`);
    }
    setIsMobileMenuOpen(false); // Close menu on search
  };

  const handleHomeNavigation = (event?: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname === '/') {
      event?.preventDefault();
      setHomePageKey(Date.now());
      window.scrollTo(0, 0);
    } else {
      // Allow default link behavior to navigate, just scroll to top
      window.scrollTo(0, 0);
    }
    setIsMobileMenuOpen(false);
  };
  

  const defaultSocialImage = 'https://picsum.photos/seed/animebell-social/1200/630';
  const siteName = "AnimeBell";

  return (
    <div className={`font-sans antialiased flex min-h-screen w-full flex-col bg-background text-foreground`}>
      <Helmet>
        <title>{siteName} - Ver Anime Online</title>
        <meta name="description" content="AnimeBell - Tu portal para ver anime online. Disfruta de los últimos episodios y descubre nuevas series." />
        <link rel="canonical" href={currentUrl} />
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:title" content={`${siteName} - Ver Anime Online`} />
        <meta property="og:description" content="AnimeBell - Tu portal para ver anime online. Disfruta de los últimos episodios y descubre nuevas series." />
        <meta property="og:image" content={defaultSocialImage} data-ai-hint="social media banner" />
        <meta property="og:site_name" content={siteName} />
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={currentUrl} />
        <meta property="twitter:title" content={`${siteName} - Ver Anime Online`} />
        <meta property="twitter:description" content="AnimeBell - Tu portal para ver anime online. Disfruta de los últimos episodios y descubre nuevas series." />
        <meta property="twitter:image" content={defaultSocialImage} data-ai-hint="social media banner" />
      </Helmet>
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 shadow-md">
        {/* Left Side: Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-semibold"
          onClick={handleHomeNavigation}
        >
          {randomImage && (
            <img src={randomImage} alt="AnimeBell Logo" className="h-8 w-8 object-cover rounded-full mr-2" data-ai-hint="logo avatar" />
          )}
          <h1 className="text-xl font-bold">{siteName}</h1>
        </Link>

        {/* Center: Desktop Navigation */}
        <nav className="hidden flex-row items-center gap-5 text-sm font-medium md:flex lg:gap-6">
          <Link
            to="/"
            className="text-foreground transition-colors hover:text-accent"
            onClick={handleHomeNavigation}
          >
            Nuevos Capítulos
          </Link>
          <Link
            to="/directorio"
            className="text-foreground transition-colors hover:text-accent"
          >
            Directorio
          </Link>
          <Link
            to="/favoritos"
            className="text-foreground transition-colors hover:text-accent flex items-center gap-1"
          >
            <Star className="h-4 w-4" />
            Favoritos
          </Link>
        </nav>

        {/* Right Side: Actions & Mobile Menu */}
        <div className="flex items-center gap-2">
          <form
            method="GET"
            action="/directorio"
            className="hidden sm:block"
            onSubmit={handleSearchSubmit}
          >
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                name="q"
                placeholder="Buscar anime..."
                className="pl-8 sm:w-[150px] md:w-[200px] lg:w-[250px] rounded-full h-9"
              />
            </div>
            <button type="submit" className="sr-only">Buscar</button>
          </form>
          <RandomAnimePopover />
          <ThemeToggle />
          
          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Abrir menú de navegación</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <nav className="grid gap-4 p-4 text-lg font-medium">
                  <Link
                    to="/"
                    className="flex items-center gap-2 font-semibold mb-2 pb-2 border-b"
                    onClick={handleHomeNavigation}
                  >
                    <img src={randomImage || '/assets/animebell_logo.png'} alt="AnimeBell Logo" className="h-8 w-8 object-cover rounded-full" data-ai-hint="logo avatar"/>
                    <span>{siteName}</span>
                  </Link>
                  <Link
                    to="/"
                    className="text-muted-foreground hover:text-foreground py-2"
                    onClick={handleHomeNavigation}
                  >
                    Nuevos Capítulos
                  </Link>
                  <Link
                    to="/directorio"
                    className="text-muted-foreground hover:text-foreground py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Directorio
                  </Link>
                  <Link
                    to="/favoritos"
                    className="text-muted-foreground hover:text-foreground flex items-center gap-2 py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Star className="h-5 w-5" />
                    Favoritos
                  </Link>
                  <Separator className="my-2" />
                  <form
                    className="sm:hidden"
                    onSubmit={handleSearchSubmit}
                  >
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        name="q"
                        placeholder="Buscar anime..."
                        className="pl-8 rounded-full h-9 w-full"
                      />
                    </div>
                    <button type="submit" className="sr-only">Buscar</button>
                  </form>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Routes>
          <Route path="/" element={<HomePage key={homePageKey} />} />
          <Route path="/directorio" element={<DirectoryPage />} />
          <Route path="/anime/:animeId" element={<AnimeDetailPage />} />
          <Route path="/ver/:animeId/:episodeNumber" element={<EpisodePlayerPage />} />
          <Route path="/favoritos" element={<FavoritesPage />} />
          <Route path="/politicas-de-privacidad" element={<PrivacyPolicyPage />} />
          <Route path="/terminos-y-condiciones" element={<TermsAndConditionsPage />} />
          <Route path="/devlog" element={<DevlogPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
