import "dotenv/config";
import { Configuration, GetQuoteRequest, TransactionsApi } from "@rangesecurity/faraday-sdk";

const baseUrl = process.env.FARADAY_BASE_URL;
const token = process.env.FARADAY_API_KEY;

const cfg = new Configuration({
  basePath: baseUrl,
  accessToken: token,
  headers: { accept: "application/json" },
});

const api = new TransactionsApi(cfg);

const params: GetQuoteRequest = {
  fromChain: "sepolia",
  fromAddress: "0xAE6cc600dd04C26f32b44a55C6E206D52e2d12ee",
  fromAsset: "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238",
  toChain: "sepolia",
  toAsset: "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238",
  amount: "1000000",
  slippageBps: 50,
  toAddress: "0x4616F3Cc321588d910C704c8d26393feb2A78984",
  travelRuleCompliant: false,
};

(async () => {
  try {
    const res = await api.getQuote(params);
    console.dir(res, { depth: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    const body = e?.response?.text ? await e.response.text() : e?.message;
    console.error("Quote failed:", body ?? e);
  }
})();
