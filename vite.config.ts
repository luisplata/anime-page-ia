
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 9002, // Matches your previous Next.js dev port
  },
  build: {
    outDir: 'dist', // Output directory for build files
  },
  define: {
    // Vite uses import.meta.env for environment variables
    // 'process.env.NEXT_PUBLIC_ANIME_API_ENDPOINT': JSON.stringify(process.env.VITE_ANIME_API_ENDPOINT),
  }
});
