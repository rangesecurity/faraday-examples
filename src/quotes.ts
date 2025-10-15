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
  fromChain: "solana",
  fromAddress: "GvFbpZcqXNoZbAH8ETAA4DYBzaEHY4v2Vt7r71ZqJCTc", // Solana sender
  fromAsset: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC on Solana (SPL)
  toChain: "eth",
  toAsset: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC on Ethereum (ERC20)
  amount: "100000000", // 100.000000 USDC (6 decimals)
  slippageBps: 50, // 0.5% slippage tolerance
  toAddress: "0x10ADD26fb2D17dA265e0567B8F56cb4687979fbE", // Destination Ethereum address
  travelRuleCompliant: false,
};

(async () => {
  try {
    const res = await api.getQuotes(params);
    console.dir(res, { depth: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    const body = e?.response?.text ? await e.response.text() : e?.message;
    console.error("Quote failed:", body ?? e);
  }
})();
