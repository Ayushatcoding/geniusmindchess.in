// PUBLIC RUNTIME CONFIGURATION
// Edit /config.json after deployment to activate integrations without rebuilding.
// Browser API keys are visible to visitors: restrict Google keys by HTTP referrer and API.
export const RUNTIME_CONFIG_PATH = "/config.json";
export const PLACEHOLDER_PREFIX = "REPLACE_WITH_";

export interface RuntimeConfig {
  callMeBot: {
    enabled: boolean;
    phone: string;
    apiKey: string;
  };
  googleDrive: {
    apiKey: string;
    folderId: string;
  };
  googleSheets: {
    scheduleCsvUrl: string;
    tournamentsCsvUrl: string;
    testimonialsCsvUrl: string;
  };
  googleMaps: {
    embedApiKey: string;
    placeId: string;
    query: string;
  };
  googlePlaces: {
    apiKey: string;
    placeId: string;
  };
}

export const isConfigured = (value: string | undefined) =>
  Boolean(value && !value.startsWith(PLACEHOLDER_PREFIX));

export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  const response = await fetch(`${RUNTIME_CONFIG_PATH}?v=${Date.now()}`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Runtime configuration unavailable (${response.status})`);
  return (await response.json()) as RuntimeConfig;
}