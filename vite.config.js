import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // The Firestore SDK is most of the main bundle (~220 kB gzipped).
    chunkSizeWarningLimit: 800,
  },
});
