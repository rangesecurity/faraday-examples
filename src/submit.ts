import "dotenv/config";
import { Configuration, GetQuoteRequest, TransactionsApi } from "faraday-sdk";
import { signUnsignedType2 } from "./evm";

// Set API URL and key (read from .env file)
const BASE_URL = process.env.FARADAY_BASE_URL || "https://api.faraday.range.org";
const FARADAY_API_KEY = process.env.FARADAY_API_KEY || "";

// Alice’s private key (signer) (read from .env file)
// Not for production use
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

// Network and explorer link
const NETWORK = "sepolia";
const EXPLORER_TX = (txHash: string) => `https://sepolia.etherscan.io/tx/${txHash}`;

// Asset
// USDC on Sepolia
const TOKEN = "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238";

// Alice and Bob public address
const ALICE = "0xAE6cc600dd04C26f32b44a55C6E206D52e2d12ee";
const BOB = "0x4616F3Cc321588d910C704c8d26393feb2A78984";

// The amount Alice is paying Bob
const AMOUNT = "1000000";

// Whether the transaction is using the travel rule
const TRAVEL_RULE = false;

// Slippage in bps
const SLIPPAGE = 50;

// Quote parameters
const params: GetQuoteRequest = {
  fromChain: NETWORK,
  toChain: NETWORK,
  fromAsset: TOKEN,
  toAsset: TOKEN,
  fromAddress: ALICE,
  toAddress: BOB,
  amount: AMOUNT,
  slippageBps: SLIPPAGE,
  travelRuleCompliant: TRAVEL_RULE,
};

/**
 * Setup Faraday SDK
 */
const cfg = new Configuration({
  basePath: BASE_URL,
  accessToken: FARADAY_API_KEY,
  headers: { accept: "application/json" },
});

const api = new TransactionsApi(cfg);

(async () => {
  try {
    // Get a quote from the Faraday API
    const res = await api.getQuote(params);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quote = (res as any).quote ?? res;
    const { quote_id, transaction: unsignedTx } = quote;

    if (!unsignedTx) throw new Error("Quote missing unsigned transaction payload.");

    // In production you may wish to perform some checks on `unsignedTx`
    // e.g. verify sender, recipient, amount

    // Sign the unsigned EIP1559 payload
    const signedHex = signUnsignedType2(unsignedTx as `0x${string}`, PRIVATE_KEY as `0x${string}`);
    console.log("Signed tx:", signedHex);

    // Submit transaction via Faraday API
    const submit = await api.postTransaction({
      submitTransactionRequest: {
        network: "sepolia",
        quote_id,
        signed_payload: signedHex,
        travel_rule_compliant: params.travelRuleCompliant ?? false,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { tx_hash } = submit as any;
    console.dir(submit, { depth: null });
    if (tx_hash) {
      console.log(`View on Block explorer: ${EXPLORER_TX(tx_hash)}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    const body = e?.response?.text ? await e.response.text() : e?.message;
    console.error("Failed:", body ?? e);
  }
})();
