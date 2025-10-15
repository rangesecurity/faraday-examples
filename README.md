# Faraday Examples

Small TypeScript examples that use the `faraday-sdk` to interact with the Faraday API.

## Prerequisites
- Node.js 18+

## Setup
```bash
git clone https://github.com/rangesecurity/faraday-examples
cd faraday-examples
cp .env.sample .env
# (edit .env to set FARADAY_BASE_URL and FARADAY_API_KEY if needed)
npm install
```

## Run the examples
- With tsx (no build step):
  ```bash
  npm run dev:chains
  npm run dev:tokens
  npm run dev:quote
  ```

- Or build+run:
  ```bash
  npm run build
  npm run start:chains
  npm run start:tokens
  npm run start:quote
  ```

## Faucet

Sepolia ETH
https://cloud.google.com/application/web3/faucet/ethereum/sepolia

Solana Devnet SOL
https://faucet.solana.com/

USDC Faucet
https://faucet.circle.com/
