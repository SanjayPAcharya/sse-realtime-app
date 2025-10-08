import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    define: {
      "import.meta.env.VITE_APP_API_URL": JSON.stringify(env.VITE_APP_API_URL),
    },
    server: {
      port: 5173,
    },
    build: {
      outDir: "dist",
      sourcemap: true,
    },
  };
});
