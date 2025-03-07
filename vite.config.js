import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { // 백엔드 API 엔드포인트에 대한 프록시 설정
        target: 'http://your-backend-url.com',
        changeOrigin: true,
      },
    },
  },
  build: { // Vite의 build 설정
    rollupOptions: {
      input: {
        main: "index.html",
        background: "src/background.js"
      },
      output: {
        dir: 'dist',
        entryFileNames: "assets/[name].js"
      },
    },
  },
})
