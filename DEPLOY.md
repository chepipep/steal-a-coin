# Deploy Guide for Steal A ShitCoin

## Step 1: Deploy to GitHub Pages (Free hosting)

```bash
# 1. Create repo on GitHub (github.com/new)
#    Name: StealAShitCoin

# 2. Push code
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/StealAShitCoin.git
git branch -M main
git push -u origin main

# 3. Enable GitHub Pages
#    Go to: Settings > Pages > Source > main branch > Save
#    Your game will be at: https://YOUR_USERNAME.github.io/StealAShitCoin/
```

## Step 2: Deploy Smart Contract to Base Mainnet (~$1-3)

### Option A: Remix (Easiest)

1. Go to https://remix.ethereum.org
2. Create new file: `StealAShitCoin.sol`
3. Copy content from `contracts/StealAShitCoin.sol`
4. Compile: Solidity 0.8.19
5. Deploy:
   - Environment: "Injected Provider - MetaMask"
   - Make sure MetaMask is on Base Mainnet
   - Click Deploy
6. Copy contract address

### Option B: Foundry (Advanced)

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Deploy
forge create contracts/StealAShitCoin.sol:StealAShitCoin \
  --rpc-url https://mainnet.base.org \
  --private-key YOUR_PRIVATE_KEY
```

## Step 3: Update Contract Address

1. Open `web3integration.js`
2. Replace `0x_YOUR_CONTRACT_ADDRESS_HERE` with your deployed address
3. Push changes:
```bash
git add .
git commit -m "Add contract address"
git push
```

## Step 4: Update README

1. Replace `YOUR_USERNAME` with your GitHub username
2. Replace `0x_YOUR_CONTRACT_ADDRESS_HERE` with contract address
3. Push changes

## MetaMask Setup for Base

If Base not in MetaMask:
- Network: Base
- RPC: https://mainnet.base.org
- Chain ID: 8453
- Symbol: ETH
- Explorer: https://basescan.org

## Verify Contract on BaseScan (Optional but recommended)

1. Go to https://basescan.org/address/YOUR_CONTRACT_ADDRESS
2. Click "Verify and Publish"
3. Compiler: 0.8.19
4. Paste source code
5. Submit

## Cost Estimate

- Contract deploy: ~$1-3 (depends on gas)
- GitHub Pages: FREE
- Domain (optional): ~$10/year

## For Grant Application

Include:
- Live game URL: https://YOUR_USERNAME.github.io/StealAShitCoin/
- Contract: https://basescan.org/address/YOUR_CONTRACT_ADDRESS
- GitHub: https://github.com/YOUR_USERNAME/StealAShitCoin
