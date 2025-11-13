import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// import basicSsl from "@vitejs/plugin-basic-ssl"; // Commented out to avoid HTTPS/HTTP mixed content

export default defineConfig({
  plugins: [react(), tailwindcss()], // Removed basicSsl()
  server: {
    host: true,
  },
  worker: {
    format: "es",
  },
});
