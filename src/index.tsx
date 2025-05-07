
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './app/globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { FavoritesProvider } from '@/hooks/use-favorites';
import ClientUuidProvider from '@/components/client-uuid-provider';
import { Toaster } from '@/components/ui/toaster';
import { HelmetProvider } from 'react-helmet-async';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FavoritesProvider>
            <ClientUuidProvider />
            <App />
            <Toaster />
          </FavoritesProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
