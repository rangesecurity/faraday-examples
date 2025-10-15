import { keccak256, getBytes, SigningKey } from "ethers";
import { decode as rlpDecode, encode as rlpEncode } from "@ethersproject/rlp";

/**
 * Signs an **unsigned EIP-1559 (type-2)** transaction payload and returns a
 * broadcast-ready, canonical signed transaction.
 *
 * Expects the unsigned payload to start with `0x02` followed by an RLP-encoded
 * list of the nine EIP-1559 fields:
 *
 *   [chainId, nonce, maxPriorityFeePerGas, maxFeePerGas,
 *    gasLimit, to, value, data, accessList]
 *
 * The function:
 *  1. Computes the signing hash as keccak256(0x02 || RLP([...])).
 *  2. Signs the hash with secp256k1 using the provided private key.
 *  3. Appends canonical signature fields:
 *       • yParity → empty bytes for 0, single 0x01 byte for 1
 *       • r, s     → stripped of leading zeros (minimal encoding)
 *  4. Re-encodes the list and prefixes 0x02.
 *
 * @param unsignedTx  0x-prefixed type-2 unsigned transaction payload
 * @param privateKey  0x-prefixed secp256k1 private key
 * @returns           Fully signed 0x-prefixed EIP-1559 transaction
 */
export function signUnsignedType2(
  unsignedTx: `0x${string}`,
  privateKey: `0x${string}`,
): `0x${string}` {
  if (!unsignedTx.startsWith("0x02")) {
    throw new Error("Expected EIP-1559 type-2 unsigned tx (0x02 prefix).");
  }

  // 1. Compute digest for signing
  const digest = keccak256(getBytes(unsignedTx));

  // 2. Sign digest
  const sk = new SigningKey(privateKey);
  const sig = sk.sign(digest);
  const yParity = sig.yParity as 0 | 1;

  // 3. Decode the unsigned RLP list
  const list = rlpDecode(("0x" + unsignedTx.slice(4)) as `0x${string}`) as (string | Uint8Array)[];

  // 4. Canonical encoding rules
  const yRlp = yParity === 0 ? new Uint8Array([]) : new Uint8Array([1]);
  const minimalInt = (hex: `0x${string}`) => {
    const b = getBytes(hex);
    let i = 0;
    while (i < b.length - 1 && b[i] === 0) i++;
    return b.subarray(i);
  };

  list.push(yRlp, minimalInt(sig.r as `0x${string}`), minimalInt(sig.s as `0x${string}`));

  // 5. Re-encode and return signed tx
  const signedBody = rlpEncode(list) as string;
  return ("0x02" + signedBody.slice(2)) as `0x${string}`;
}
