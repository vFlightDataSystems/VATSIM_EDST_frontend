import { defineConfig, loadEnv } from "vite";
import type { Plugin } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import svgrPlugin from "vite-plugin-svgr";
import autoprefixer from "autoprefixer";
// import * as path from "path";

// Environment variables api/auth/login.ts reads, and the .env.local key the dev server takes each from.
const DEV_LOGIN_FUNCTION_ENV: Record<string, string> = {
  VATSIM_CLIENT_ID: "VITE_VATSIM_CLIENT_ID",
  VATSIM_CLIENT_SECRET: "VATSIM_CLIENT_SECRET",
  VATSIM_AUTH_BASE_URL: "VITE_VATSIM_AUTH_BASE_URL",
  AUTH_DEV_API_ORIGINS: "VITE_SERVERLESS_LOGIN_DEV_ORIGINS",
};

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  const text = Buffer.concat(chunks).toString("utf8");
  return text.length > 0 ? JSON.parse(text) : undefined;
}

// The part of Vercel's response helpers api/auth/login.ts uses.
function vercelResponse(res: ServerResponse) {
  const response = {
    status(code: number) {
      res.statusCode = code;
      return response;
    },
    json(body: unknown) {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(body));
      return response;
    },
    setHeader(name: string, value: string) {
      res.setHeader(name, value);
      return response;
    },
  };
  return response;
}

// Serves the Vercel function api/auth/login.ts from the Vite dev server, so `npm start` can sign in without `vercel dev`.
function devLoginFunction(): Plugin {
  return {
    name: "dev-login-function",
    apply: "serve",
    configureServer(server) {
      const env = loadEnv(server.config.mode, server.config.root, "");
      Object.entries(DEV_LOGIN_FUNCTION_ENV).forEach(([target, source]) => {
        if (process.env[target] === undefined && env[source] !== undefined) {
          process.env[target] = env[source];
        }
      });
      server.middlewares.use("/api/auth/login", async (req, res) => {
        let body: unknown;
        try {
          body = req.method === "POST" ? await readJsonBody(req) : undefined;
        } catch {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: "Request body is not valid JSON" }));
          return;
        }
        try {
          const { default: handler } = await server.ssrLoadModule("/api/auth/login.ts");
          await handler(Object.assign(req, { body }), vercelResponse(res));
        } catch (err) {
          server.config.logger.error(`/api/auth/login failed: ${err}`);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "The development login function failed; see the Vite console" }));
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
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
  plugins: [react(), viteTsconfigPaths(), svgrPlugin(), devLoginFunction()],
  // resolve: {
  //   alias: {
  //     "react-dom/client": path.resolve("./node_modules/react-dom/profiling"),
  //     "scheduler/tracing": path.resolve("./node_modules/scheduler/tracing-profiling"),
  //   },
  // },
});
