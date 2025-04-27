import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { ApiPromise, WsProvider } from '@polkadot/api';

// Polkadot RPC endpoint
const RPC_ENDPOINT = process.env.REACT_APP_POLKADOT_RPC || 'wss://rpc.polkadot.io';
const APP_NAME = 'Polkadot Attendance NFT';

// Initialize Polkadot API and extension
export const initPolkadot = async () => {
  try {
    // Enable the extension
    const extensions = await web3Enable(APP_NAME);

    if (extensions.length === 0) {
      throw new Error('No extension found. Please install the Polkadot.js extension.');
    }

    // Connect to Polkadot node
    const provider = new WsProvider(RPC_ENDPOINT);
    const api = await ApiPromise.create({ provider });

    return { api, extensions };
  } catch (error) {
    console.error('Failed to initialize Polkadot connection:', error);
    throw error;
  }
};

// Get accounts from extension
export const getAccounts = async () => {
  try {
    await web3Enable(APP_NAME);
    const accounts = await web3Accounts();

    return accounts.map(account => ({
      address: account.address,
      name: account.meta.name || '',
    }));
  } catch (error) {
    console.error('Failed to get accounts:', error);
    throw error;
  }
};

// Check if the Polkadot.js extension is installed
export const checkExtension = async () => {
  try {
    const extensions = await web3Enable(APP_NAME);
    return extensions.length > 0;
  } catch (error) {
    return false;
  }
};

// Format address for display
export const formatAddress = (address) => {
  if (!address) return '';

  if (address.length > 13) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  return address;
};