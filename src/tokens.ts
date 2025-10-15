import "dotenv/config";
import { TokensApi, Configuration } from "@rangesecurity/faraday-sdk";
const baseUrl = process.env.FARADAY_BASE_URL || "https://api.faraday.range.org";
const token = process.env.FARADAY_API_KEY;

const cfg = new Configuration({
  basePath: baseUrl,
  accessToken: token,
  headers: { accept: "application/json" },
});

const tokensApi = new TokensApi(cfg);

/**
 * Example: Fetch all supported tokens
 */
const main = async (): Promise<void> => {
  try {
    const res = await tokensApi.listTokens();

    console.log("✅ Tokens:");
    console.dir(res, { depth: null });
  } catch (err) {
    console.error("❌ Error fetching tokens:");
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  }
};

main().catch((err) => {
  console.error("Unhandled exception:", err);
  process.exit(1);
});
