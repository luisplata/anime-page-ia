
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './globals.css'; // Ensure global styles are imported
import { ThemeProvider } from '@/components/theme-provider';
import { FavoritesProvider } from '@/hooks/use-favorites';
import { BookmarksProvider } from '@/hooks/use-bookmarks';
import ClientUuidProvider from '@/components/client-uuid-provider';
import { Toaster } from '@/components/ui/toaster';
import { HelmetProvider } from 'react-helmet-async';
import { LoadingProvider } from '@/contexts/loading-context';

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <HelmetProvider>
        <BrowserRouter>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <LoadingProvider>
              <FavoritesProvider>
                <BookmarksProvider>
                  <ClientUuidProvider />
                  <App />
                  <Toaster />
                </BookmarksProvider>
              </FavoritesProvider>
            </LoadingProvider>
          </ThemeProvider>
        </BrowserRouter>
      </HelmetProvider>
    </React.StrictMode>
  );
} else {
  console.error("Failed to find the root element. The application cannot be mounted.");
}

// vite-plugin-pwa with registerType: 'autoUpdate' will handle SW registration.
// No manual registration code needed here unless more control is desired.
