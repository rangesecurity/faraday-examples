import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { Keypair, VersionedTransaction, Transaction } from "@solana/web3.js";
import {
  Configuration,
  GetQuoteRequest,
  SubmitTransactionRequest,
  TransactionsApi,
} from "@rangesecurity/faraday-sdk";

const BASE_URL = process.env.FARADAY_BASE_URL || "https://api.faraday.range.org";
const FARADAY_API_KEY = process.env.FARADAY_API_KEY || "";

const EXPLORER = (sig: string) => `https://explorer.solana.com/tx/${sig}?cluster=devnet`;

const USDC_DEVNET = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

// Key file locations
const KEY_DIR = path.resolve(process.cwd(), "keys/solana-devnet");
const ALICE_FILE = path.join(KEY_DIR, "alice.json");
const BOB_FILE = path.join(KEY_DIR, "bob.json");

// Transfer parameters
const AMOUNT = "1000000"; // 1 USDC (6 decimals)
const SLIPPAGE = 50; // 0.5%
const TRAVEL_RULE = false;

// ===== Helpers =====
async function loadKeypair(file: string): Promise<Keypair> {
  const arr: number[] = JSON.parse(await fs.readFile(file, "utf8"));
  return Keypair.fromSecretKey(Uint8Array.from(arr));
}

function signSolanaUnsignedBase64(unsignedB64: string, signer: Keypair): string {
  const raw = Buffer.from(unsignedB64, "base64");
  try {
    const vtx = VersionedTransaction.deserialize(raw);
    vtx.sign([signer]);
    return Buffer.from(vtx.serialize()).toString("base64");
  } catch {
    const tx = Transaction.from(raw);
    tx.partialSign(signer);
    return Buffer.from(tx.serialize()).toString("base64");
  }
}

// ===== Main =====
(async () => {
  try {
    // Load Alice & Bob
    const alice = await loadKeypair(ALICE_FILE);
    const bob = await loadKeypair(BOB_FILE);
    const fromAddress = alice.publicKey.toBase58();
    console.log(`Alice: ${fromAddress}`);
    const toAddress = bob.publicKey.toBase58();
    console.log(`Bob: ${toAddress}`);

    // Quote params
    const params: GetQuoteRequest = {
      fromChain: "solana-devnet",
      toChain: "solana-devnet",
      fromAsset: USDC_DEVNET,
      toAsset: USDC_DEVNET,
      fromAddress,
      toAddress,
      amount: AMOUNT,
      slippageBps: SLIPPAGE,
      travelRuleCompliant: TRAVEL_RULE,
    };
    console.log("GetQuoteRequest parameters");
    console.dir(params, { depth: null });

    // Faraday API client
    const cfg = new Configuration({
      basePath: BASE_URL,
      accessToken: FARADAY_API_KEY,
      headers: { accept: "application/json" },
    });
    const api = new TransactionsApi(cfg);

    console.log("Requesting USDC transfer quote (Solana Devnet)...");
    const res = await api.getQuote(params);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quote = (res as any).quote ?? res;
    console.log("Quote response");
    console.dir(quote, { depth: null });
    const { quote_id, transaction: unsignedTx } = quote;

    if (!unsignedTx) throw new Error("Quote missing unsigned transaction payload");

    console.log("Signing unsigned transaction...");
    const signedB64 = signSolanaUnsignedBase64(unsignedTx as string, alice);

    const submitTransactionRequest: SubmitTransactionRequest = {
      network: "solana-devnet",
      quote_id,
      signed_payload: signedB64,
      travel_rule_compliant: false,
    };
    console.log("SubmitTransactionRequest parameters");
    console.dir(submitTransactionRequest, { depth: null });

    console.log("Submitting signed transaction...");
    const submit = await api.postTransaction({
      submitTransactionRequest,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { tx_hash, signature } = submit as any;
    const txSig = signature || tx_hash;
    console.log("Submit transaction response");
    console.dir(submit, { depth: null });

    if (txSig) {
      console.log(`View on Explorer: ${EXPLORER(txSig)}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    const body = e?.response?.text ? await e.response.text() : e?.message;
    console.error("Failed:", body ?? e);
  }
})();
