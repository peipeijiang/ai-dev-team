import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        works: resolve(__dirname, 'works.html'),
        workDetail: resolve(__dirname, 'work-detail.html'),
        episodes: resolve(__dirname, 'episodes.html'),
        episodeEdit: resolve(__dirname, 'episode-edit.html'),
        episodeDetail: resolve(__dirname, 'episode-detail.html'),
        materials: resolve(__dirname, 'materials.html'),
        styles: resolve(__dirname, 'styles.html'),
        tools: resolve(__dirname, 'tools.html'),
        testApi: resolve(__dirname, 'test-api.html'),
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000', // 假设后端运行在这个端口
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
