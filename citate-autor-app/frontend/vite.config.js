import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // Acest proxy trimite cererile de la portul 5174 către portul 5000 (Express)
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});