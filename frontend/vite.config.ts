import { defineConfig } from "vite"; // Hapus loadEnv
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Variabel 'env' dihapus karena tidak digunakan di bawah ini

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@features": path.resolve(__dirname, "./src/features"),
        "@hooks": path.resolve(__dirname, "./src/hooks"),
        "@stores": path.resolve(__dirname, "./src/stores"),
        "@utils": path.resolve(__dirname, "./src/utils"),
        "@types": path.resolve(__dirname, "./src/types"),
        "@services": path.resolve(__dirname, "./src/services"),
        "@test": path.resolve(__dirname, "./src/test"),
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/test/vitest.setup.ts"],
      include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}"],
      exclude: ["node_modules", "dist"],
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html"],
        exclude: ["node_modules/", "src/test/", "**/*.d.ts", "**/*.config.*", "**/types/**"],
      },
    },
    server: {
      port: 5173,
      host: true,
      strictPort: false,
      open: false,
      cors: true,
      proxy: {
        // Proxy for relative /api calls (not used when API_URL is absolute)
        "/api": {
          target: "http://localhost:3001",
          changeOrigin: true,
          secure: false,
          // Don't rewrite - backend already expects /api prefix
        },
      },
      hmr: {
        overlay: true,
      },
    },
    preview: {
      port: 4173,
      host: true,
    },
    build: {
      outDir: "dist",
      sourcemap: mode === "development",
      chunkSizeWarningLimit: 600,
      target: "esnext",
      minify: "esbuild",
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Core React
            if (id.includes("node_modules/react-dom")) {
              return "vendor-react";
            }
            if (id.includes("node_modules/react") && !id.includes("react-icons")) {
              return "vendor-react";
            }
            // State management
            if (id.includes("node_modules/zustand")) {
              return "vendor-state";
            }
            // UI Libraries
            if (
              id.includes("node_modules/@headlessui") ||
              id.includes("node_modules/framer-motion")
            ) {
              return "vendor-ui";
            }
            // Utilities
            if (
              id.includes("node_modules/clsx") ||
              id.includes("node_modules/tailwind-merge") ||
              id.includes("node_modules/date-fns")
            ) {
              return "vendor-utils";
            }
            // Icons - separate chunk due to size
            if (id.includes("node_modules/react-icons")) {
              return "vendor-icons";
            }
          },
        },
      },
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "zustand",
        "@headlessui/react",
        "framer-motion",
        "clsx",
        "tailwind-merge",
        "date-fns",
        "react-icons",
      ],
    },
    esbuild: {
      legalComments: "none",
      drop: mode === "production" ? ["console", "debugger"] : [],
    },
  };
});
