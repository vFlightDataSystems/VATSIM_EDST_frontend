import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import svgrPlugin from "vite-plugin-svgr";
import autoprefixer from "autoprefixer";
// import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
  },
  envPrefix: ["VITE_", "TAURI_"],
  css: {
    modules: {
      localsConvention: "camelCase",
    },
    postcss: {
      plugins: [autoprefixer({})],
    },
  },
  plugins: [react(), viteTsconfigPaths(), svgrPlugin()],
  // resolve: {
  //   alias: {
  //     "react-dom/client": path.resolve("./node_modules/react-dom/profiling"),
  //     "scheduler/tracing": path.resolve("./node_modules/scheduler/tracing-profiling"),
  //   },
  // },
});
