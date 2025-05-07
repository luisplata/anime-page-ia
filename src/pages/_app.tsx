
import type { AppProps } from 'next/app';
import { GeistSans } from 'geist/font/sans';
import '../app/globals.css'; // Path remains the same as it's relative to src
import { Toaster } from '@/components/ui/toaster';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tv, Search, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import ClientUuidProvider from '@/components/client-uuid-provider';
import { FavoritesProvider } from '@/hooks/use-favorites';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>AniView</title>
        <meta name="description" content="Stream your favorite anime online." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" /> {/* You may want to add a favicon */}
      </Head>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <FavoritesProvider>
          <ClientUuidProvider />
          <div className={`${GeistSans.variable} font-sans antialiased flex min-h-screen w-full flex-col`}>
            <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-md">
              <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
                <Tv className="h-7 w-7 text-accent" />
                <h1 className="text-xl font-bold">AniView</h1>
              </Link>
              <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6 ml-auto">
                <Link href="/" className="text-foreground transition-colors hover:text-accent font-medium">
                  Nuevos Capítulos
                </Link>
                <Link
                  href="/directorio"
                  className="text-foreground transition-colors hover:text-accent font-medium"
                >
                  Directorio
                </Link>
                <Link
                  href="/favoritos"
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
                  onSubmit={(e) => {
                    e.preventDefault();
                    const query = (e.target as HTMLFormElement).q.value;
                    router.push(`/directorio?q=${encodeURIComponent(query)}`);
                  }}
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
              <Component {...pageProps} />
            </main>
            <Toaster />
          </div>
        </FavoritesProvider>
      </ThemeProvider>
    </>
  );
}
