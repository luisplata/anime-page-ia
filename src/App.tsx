
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Star } from 'lucide-react';
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

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * animeImages.length);
    setRandomImage(animeImages[randomIndex]);
  }, []);

  useEffect(() => {
    setCurrentUrl(window.location.href);
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const query = formData.get('q') as string;
    navigate(`/directorio?q=${encodeURIComponent(query)}`);
  };

  const handleHomeNavigation = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname === '/') {
      event.preventDefault();
      setHomePageKey(Date.now()); // This will re-mount HomePage and trigger data fetching
      window.scrollTo(0, 0);
    } else {
      // For other cases, let the Link component handle navigation
      // but still scroll to top.
       window.scrollTo(0, 0);
    }
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
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-md">
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
          onClick={handleHomeNavigation}
        >
          {randomImage && (
            <img src={randomImage} alt="AnimeBell Logo" className="h-8 w-8 object-cover rounded-full mr-2" data-ai-hint="logo avatar" />
          )}
          <h1 className="text-xl font-bold">{siteName}</h1>
        </Link>
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6 ml-auto">
          <Link
            to="/"
            className="text-foreground transition-colors hover:text-accent font-medium"
            onClick={handleHomeNavigation}
          >
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
