import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("firebase")) return "firebase";
          if (id.includes("framer-motion")) return "framer";
          if (id.includes("react-router-dom")) return "router";
          if (id.includes("@hookform") || id.includes("react-hook-form") || id.includes("zod")) return "forms";
          if (id.includes("@tanstack")) return "query";
          if (id.includes("date-fns")) return "dates";
          if (id.includes("qrcode")) return "qrcode";
        },
      },
    },
  },
})
