import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        content: resolve(__dirname, "src/content/index.ts"),
        background: resolve(__dirname, "src/background/index.ts"),
        options: resolve(__dirname, "src/options/options.html"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
    target: "esnext",
    minify: false,
    sourcemap: true,
  },
  // Chrome extension HTML pages need relative paths
  // since they are loaded via chrome-extension:// protocol
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === "html") {
        // From src/options/options.html, go up two levels to dist root
        return "../../" + filename;
      }
      return { relative: true };
    },
  },
});
