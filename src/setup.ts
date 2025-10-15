import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { Keypair } from "@solana/web3.js";
import { Wallet, HDNodeWallet, Mnemonic } from "ethers";
import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";

/** Secure JSON writer */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function writeSecureJson(filePath: string, data: any) {
  await fs.outputJson(filePath, data, { spaces: 2, mode: 0o600 });
  console.log(`Wrote ${filePath}`);
}

/** Secure text writer */
async function writeSecureText(filePath: string, content: string) {
  await fs.outputFile(filePath, content.trim() + "\n", { mode: 0o600 });
  console.log(`Wrote ${filePath}`);
}

/* ---------- Solana ---------- */

function keypairFromMnemonic(mnemonic: string, account = 0): Keypair {
  if (!bip39.validateMnemonic(mnemonic)) throw new Error("Invalid mnemonic");
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const pathStr = `m/44'/501'/${account}'/0'`;
  const derived = derivePath(pathStr, seed.toString("hex"));
  return Keypair.fromSeed(derived.key);
}

function createMnemonic(strength = 256): string {
  return bip39.generateMnemonic(strength);
}

async function generateSolanaWallets(baseDir: string) {
  const mnemonic = createMnemonic();
  console.log("\n🔑 Solana mnemonic (store securely):", mnemonic);

  const alice = keypairFromMnemonic(mnemonic, 0);
  const bob = keypairFromMnemonic(mnemonic, 1);

  const solanaDir = path.join(baseDir, "solana-devnet");
  await fs.ensureDir(solanaDir);

  await writeSecureText(path.join(solanaDir, "mnemonic.txt"), mnemonic);
  await writeSecureJson(path.join(solanaDir, "alice.json"), Array.from(alice.secretKey));
  await writeSecureJson(path.join(solanaDir, "bob.json"), Array.from(bob.secretKey));

  console.log("✅ Solana (Devnet)");
  console.log("  Alice pubkey:", alice.publicKey.toBase58());
  console.log("  Bob   pubkey:", bob.publicKey.toBase58());
}

/* ---------- Ethereum (Sepolia) ---------- */

async function generateEthereumWallets(baseDir: string) {
  const mnemonic = createMnemonic();
  console.log("\n🔑 Ethereum mnemonic (store securely):", mnemonic);

  const ethDir = path.join(baseDir, "sepolia");
  await fs.ensureDir(ethDir);

  // ethers v6 way — derive from HDNodeWallet + Mnemonic
  const ethMnemonic = Mnemonic.fromPhrase(mnemonic);

  const aliceNode = HDNodeWallet.fromMnemonic(ethMnemonic, "m/44'/60'/0'/0/0");
  const bobNode = HDNodeWallet.fromMnemonic(ethMnemonic, "m/44'/60'/0'/0/1");

  const alice = new Wallet(aliceNode.privateKey);
  const bob = new Wallet(bobNode.privateKey);

  await writeSecureText(path.join(ethDir, "mnemonic.txt"), mnemonic);
  await writeSecureJson(path.join(ethDir, "alice.json"), { privateKey: alice.privateKey });
  await writeSecureJson(path.join(ethDir, "bob.json"), { privateKey: bob.privateKey });

  console.log("✅ Ethereum (Sepolia)");
  console.log("  Alice address:", alice.address);
  console.log("  Bob   address:", bob.address);
}

/* ---------- Main ---------- */

async function main() {
  const baseDir = path.resolve(process.cwd(), "keys");
  await generateSolanaWallets(baseDir);
  await generateEthereumWallets(baseDir);
}

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
