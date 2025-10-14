import "dotenv/config";
import { faradayClient } from "faraday-sdk";
import { TokensApi } from "faraday-sdk"; // generated class

const baseUrl = process.env.FARADAY_BASE_URL || "https://api.faraday.range.org";
const apiKey = process.env.FARADAY_API_KEY;

/**
 * Create a client for the Tokens API
 */
const tokensApi = faradayClient(TokensApi, { baseUrl, apiKey });

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

