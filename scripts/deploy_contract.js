#!/usr/bin/env node

/**
 * Script to deploy the Attendance NFT smart contract to a Polkadot network
 *
 * Usage:
 *   node deploy_contract.js [network] [account]
 *
 * Arguments:
 *   network - The network to deploy to (local, development, testnet, mainnet)
 *   account - The account to use for deployment (must be in keyring)
 */

const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { CodePromise } = require('@polkadot/api-contract');
const fs = require('fs');
const path = require('path');

// Network configurations
const NETWORKS = {
  local: 'ws://127.0.0.1:9944',
  development: 'wss://rpc.polkadot.io',
  testnet: 'wss://westend-rpc.polkadot.io',
  mainnet: 'wss://rpc.polkadot.io',
};

async function main() {
  // Parse command line arguments
  const network = process.argv[2] || 'local';
  const accountName = process.argv[3] || 'alice';

  if (!NETWORKS[network]) {
    console.error(`Unknown network: ${network}`);
    console.error(`Available networks: ${Object.keys(NETWORKS).join(', ')}`);
    process.exit(1);
  }

  console.log(`Deploying to network: ${network} (${NETWORKS[network]})`);
  console.log(`Using account: ${accountName}`);

  // Connect to the network
  const provider = new WsProvider(NETWORKS[network]);
  const api = await ApiPromise.create({ provider });

  console.log(`Connected to network: ${(await api.rpc.system.chain()).toString()}`);

  // Set up keyring
  const keyring = new Keyring({ type: 'sr25519' });

  let account;
  try {
    if (network === 'local') {
      account = keyring.addFromUri(`//${accountName}`);
    } else {
      // In a real scenario, you would load the account from a secure keystore
      throw new Error('For non-local networks, please use a secure key management method');
    }
  } catch (error) {
    console.error(`Failed to load account: ${error.message}`);
    process.exit(1);
  }

  console.log(`Using account: ${account.address}`);

  // Load contract WASM and metadata
  const contractPath = path.join(__dirname, '../contracts/target/ink/attendance_nft.wasm');
  const metadataPath = path.join(__dirname, '../contracts/target/ink/attendance_nft.json');

  if (!fs.existsSync(contractPath) || !fs.existsSync(metadataPath)) {
    console.error('Contract WASM or metadata not found.');
    console.error('Please build the contract first:');
    console.error('cd contracts && cargo +nightly contract build');
    process.exit(1);
  }

  const wasm = fs.readFileSync(contractPath);
  const metadata = JSON.parse(fs.readFileSync(metadataPath));

  // Deploy the contract
  console.log('Uploading contract code...');

  try {
    // Create contract
    const code = new CodePromise(api, metadata, wasm);

    // Gas estimation
    const MAX_CALL_WEIGHT = 5_000_000_000_000;
    const PROOFSIZE = 1_000_000;

    // Deploy
    const tx = code.tx.new({ gasLimit: MAX_CALL_WEIGHT, storageDepositLimit: null });

    console.log('Submitting transaction...');

    const contractAddress = await new Promise((resolve, reject) => {
      tx.signAndSend(account, ({ events = [], contract, status }) => {
        if (status.isInBlock || status.isFinalized) {
          if (contract) {
            resolve(contract.address.toString());
          } else {
            events.forEach(({ event: { method } }) => {
              if (method === 'ExtrinsicFailed') {
                reject(new Error('Transaction failed'));
              }
            });
          }
        }
      }).catch(reject);
    });

    console.log(`Contract deployed to: ${contractAddress}`);

    // Save contract address to config.json
    const configPath = path.join(__dirname, '../backend/config.json');
    const config = fs.existsSync(configPath)
      ? JSON.parse(fs.readFileSync(configPath))
      : {};

    config.contract_address = contractAddress;

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`Contract address saved to ${configPath}`);

    process.exit(0);
  } catch (error) {
    console.error(`Deployment failed: ${error.message}`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});