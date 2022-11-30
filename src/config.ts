type Environment = { name: string; apiBaseUrl: string; clientHubUrl: string; isSweatbox: boolean };
type Config = {
  artccBoundariesUrl: string;
  artccAoisUrl: string;
  environments: Environment[];
};
async function loadConfig(): Promise<Config> {
  return fetch(import.meta.env.VITE_VNAS_CONFIG_URL).then((response) => response.json());
}
const config = await loadConfig();
export const env = config.environments.find((e) => e.name === import.meta.env.VITE_VNAS_ENV_NAME);
if (!env) {
  throw new Error("Could not find environment in config");
}
export const clientHubUrl = env.clientHubUrl;
export const apiBaseUrl = env.apiBaseUrl;
export const artccBoundariesUrl = config.artccBoundariesUrl;
