import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  server: {
    port: 3000,
    allowedHosts: ['localhost', '127.0.0.1', '0.0.0.0', "frontend"],
    hmr: {
      clientPort: 8000,
    }
  },
}); 