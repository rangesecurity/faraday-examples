import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { Configuration, GetQuoteRequest, TransactionsApi } from "@rangesecurity/faraday-sdk";
import { signUnsignedType2 } from "./evm";
import { Wallet } from "ethers";

// ===== Config =====
const BASE_URL = process.env.FARADAY_BASE_URL || "https://api.faraday.range.org";
const FARADAY_API_KEY = process.env.FARADAY_API_KEY || "";

// Network + explorer
const NETWORK = "sepolia" as const;
const EXPLORER_TX = (txHash: string) => `https://sepolia.etherscan.io/tx/${txHash}`;

// USDC on Sepolia (keep your address)
// const TOKEN = "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238";
// EURC on Sepolia
const TOKEN = "0x08210f9170f89ab7658f0b5e3ff39b0e03c594d4";

// Amount/slippage/travel rule
const AMOUNT = "1000000"; // 1 USDC (6dp)
const SLIPPAGE = 50;
const TRAVEL_RULE = false;

// Key file paths
const KEY_DIR = path.resolve(process.cwd(), "keys/sepolia");
const ALICE_FILE = path.join(KEY_DIR, "alice.json"); // { "privateKey": "0x..." }
const BOB_FILE = path.join(KEY_DIR, "bob.json"); // { "privateKey": "0x..." }

// ===== Helpers =====
async function loadEvmWalletFromFile(file: string): Promise<Wallet> {
  const { privateKey } = JSON.parse(await fs.readFile(file, "utf8"));
  if (!privateKey) throw new Error(`No privateKey in ${file}`);
  return new Wallet(privateKey);
}

(async () => {
  try {
    // Load wallets from files
    const alice = await loadEvmWalletFromFile(ALICE_FILE);
    const bob = await loadEvmWalletFromFile(BOB_FILE);

    const ALICE = alice.address;
    const BOB = bob.address;

    console.log("Alice (sepolia):", ALICE);
    console.log("Bob   (sepolia):", BOB);

    // Quote params
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
    console.log("Quote params:", params);

    // Faraday SDK
    const cfg = new Configuration({
      basePath: BASE_URL,
      accessToken: FARADAY_API_KEY,
      headers: { accept: "application/json" },
    });
    const api = new TransactionsApi(cfg);

    // 1) Get quote
    const res = await api.getQuote(params);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quote = (res as any).quote ?? res;
    const { quote_id, transaction: unsignedTx } = quote;

    if (!unsignedTx) throw new Error("Quote missing unsigned transaction payload.");

    // 2) Sign unsigned EIP-1559 payload with Alice's key from file
    const signedHex = signUnsignedType2(
      unsignedTx as `0x${string}`,
      alice.privateKey as `0x${string}`,
    );
    console.log("Signed tx hex len:", signedHex.length);

    // 3) Submit
    const submit = await api.postTransaction({
      submitTransactionRequest: {
        network: NETWORK,
        quote_id,
        signed_payload: signedHex,
        travel_rule_compliant: params.travelRuleCompliant ?? false,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { tx_hash } = submit as any;
    console.dir(submit, { depth: null });
    if (tx_hash) {
      console.log(`View on Etherscan: ${EXPLORER_TX(tx_hash)}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    const body = e?.response?.text ? await e.response.text() : e?.message;
    console.error("Failed:", body ?? e);
  }
})();
