
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './app/globals.css'; // Adjusted path
import { ThemeProvider } from '@/components/theme-provider';
import { FavoritesProvider } from '@/hooks/use-favorites';
import ClientUuidProvider from '@/components/client-uuid-provider';
import { Toaster } from '@/components/ui/toaster';
import { HelmetProvider } from 'react-helmet-async';

// Ensure GeistSans variable is available if needed globally, or apply font-family directly
// For Geist font variables to work as previously, ensure the variables are set on :root or body
// The `geist` package itself might provide CSS to import for this.
// import 'geist/dist/geist-sans.css'; // Example, if using direct CSS import

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
