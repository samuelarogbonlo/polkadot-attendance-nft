#!/usr/bin/env node

/**
 * Script to create a Polkadot account and save it to a JSON file
 *
 * Usage:
 *   node create_account.js [outputPath]
 *
 * Arguments:
 *   outputPath - The path to save the account JSON file (default: account.json)
 */

const { Keyring } = require('@polkadot/api');
const { mnemonicGenerate, mnemonicToMiniSecret, mnemonicValidate } = require('@polkadot/util-crypto');
const fs = require('fs');
const path = require('path');

async function main() {
  // Parse command line arguments
  const outputPath = process.argv[2] || 'account.json';

  // Create keyring
  const keyring = new Keyring({ type: 'sr25519' });

  // Generate mnemonic
  const mnemonic = mnemonicGenerate();
  console.log(`\n🔑 Generated mnemonic: ${mnemonic}`);
  console.log('⚠️  IMPORTANT: Save this mnemonic phrase securely! Anyone with this phrase can access your funds.');

  // Validate mnemonic
  const isValidMnemonic = mnemonicValidate(mnemonic);
  if (!isValidMnemonic) {
    console.error('Invalid mnemonic generated. Please try again.');
    process.exit(1);
  }

  // Create account from mnemonic
  const account = keyring.addFromMnemonic(mnemonic);
  console.log(`\n🔒 Account address: ${account.address}`);

  // Ask for a password
  const { prompt } = require('enquirer');
  const response = await prompt({
    type: 'password',
    name: 'password',
    message: 'Enter a password to encrypt your account (leave empty for no encryption):',
  });

  // Export account to JSON
  const json = account.toJson(response.password || undefined);
  fs.writeFileSync(outputPath, JSON.stringify(json, null, 2));
  console.log(`\n💾 Account saved to ${outputPath}`);

  // Instructions for getting testnet tokens
  console.log('\n🔍 To get Westend testnet tokens:');
  console.log(`1. Visit the Westend faucet: https://matrix.to/#/#westend_faucet:matrix.org`);
  console.log(`2. Send message: !drip ${account.address}`);
  console.log('\n⚡ Once you have received the tokens, run the deploy_contract.js script:');
  console.log(`node deploy_contract.js testnet default ${outputPath}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
}); 