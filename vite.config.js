import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { execSync } from 'child_process';

const getGitInfo = (cmd, fallback = 'unknown') => {
  try {
    return execSync(cmd).toString().trim();
  } catch {
    return fallback;
  }
};

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __GIT_HASH__: JSON.stringify(getGitInfo('git rev-parse --short HEAD')),
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'prod',
    emptyOutDir: true,
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});
