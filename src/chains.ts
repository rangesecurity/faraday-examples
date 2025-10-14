import "dotenv/config";
import { faradayClient } from "faraday-sdk";
import { ChainsApi } from "faraday-sdk"; // generated class

const baseUrl = process.env.FARADAY_BASE_URL || "https://api.faraday.range.org";
const apiKey = process.env.FARADAY_API_KEY;

/**
 * Create a client for the Chains API
 */
const chainsApi = faradayClient(ChainsApi, { baseUrl, apiKey });

/**
 * Example: Fetch all supported chains
 */
const main = async (): Promise<void> => {
  try {
    const res = await chainsApi.listNetworks();

    console.log("✅ Chains:");
    console.dir(res, { depth: null });
  } catch (err) {
    console.error("❌ Error fetching chains:");
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  }
};

main().catch((err) => {
  console.error("Unhandled exception:", err);
  process.exit(1);
});

