import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Config cho cả Dev và Production
export default defineConfig(({ mode }) => ({
  plugins: [react()],


  define: {
    global: 'window',
    'process.env': {},
    // Thêm __API_URL__ vào khối này
    __API_URL__: JSON.stringify(
      mode === 'production'
        ? 'https://simple-webrtc-4drq.onrender.com'
        : 'http://localhost:8080'
    ),
  },


  //Tối ưu build cho production
  build: {
    outDir: 'dist',
    sourcemap: false, // tắt map để giảm dung lượng build
    chunkSizeWarningLimit: 1000, // cảnh báo khi file JS quá lớn
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          ui: ['lucide-react', 'framer-motion'],
        },
      },
    },
  },

  //Thêm header cache cho file tĩnh
  server: {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },

    //Proxy chỉ hoạt động trong DEV mode
    proxy:
      mode === 'development'
        ? {
            '/api': {
              target: 'http://localhost:8080',
              changeOrigin: true,
              secure: false,
            },
            '/ws': {
              target: 'http://localhost:8080',
              changeOrigin: true,
              secure: false,
              ws: true,
            },
          }
        : undefined,
  },

}));