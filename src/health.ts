import "dotenv/config";
import { faradayClient } from "faraday-sdk";
import { HealthApi } from "faraday-sdk"; // 👈 adjust if named differently

const baseUrl = process.env.FARADAY_BASE_URL || "https://api.faraday.range.org";
const apiKey = process.env.FARADAY_API_KEY;

/**
 * Create the Health API client
 */
const api = faradayClient(HealthApi, { baseUrl, apiKey });

/**
 * Example health-check call
 */
const main = async (): Promise<void> => {
  try {
    // Generated method is often named like `healthCheck()` or `getHealth()`
    const res = await api.healthCheck();

    console.log("✅ Health OK");
    console.dir(res, { depth: null });
  } catch (err) {
    console.error("❌ Error calling health endpoint:");
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  }
};

main().catch((err) => {
  console.error("Unhandled exception:", err);
  process.exit(1);
});
