import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: false, // Don't wipe the main build
    rollupOptions: {
      input: {
        content: resolve(__dirname, "src/content/index.ts"),
      },
      output: {
        entryFileNames: "[name].js",
        format: "iife", // output as a self-contained IIFE
      },
    },
    target: "esnext",
    minify: false,
    sourcemap: true,
  },
});
