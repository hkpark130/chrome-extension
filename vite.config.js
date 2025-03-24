import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // ✅ @/를 src 폴더로 매핑
    },
  },
  optimizeDeps: {
    include: ['lucide-react'],
  },
  server: {
    host: true,
  },
  build: { // Vite의 build 설정
    rollupOptions: {
      input: {
        main: "index.html",
        background: "src/background.js"
      },
      output: {
        dir: 'dist',
        entryFileNames: "assets/[name].js",
        manualChunks: {
          "lucide-react": ["lucide-react"],
        },
      },
    },
  },
})
