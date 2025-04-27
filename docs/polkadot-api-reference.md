# Polkadot.js API Reference

## Introduction

The Polkadot.js API uses JavaScript/TypeScript to interact with Polkadot SDK-based chains. It provides a dynamic, auto-generated interface for querying nodes, reading chain state, and submitting transactions, which is essential for our Polkadot Attendance NFT System.

### Dynamic API Generation

The Polkadot.js API generates its interfaces automatically when connecting to a node:

1. The API connects to your node
2. It retrieves the chain's metadata
3. Based on this metadata, it creates specific endpoints in this format: `api.<type>.<module>.<section>`

### Available API Categories

Three main categories of chain interactions are available:

* **Runtime constants** (`api.consts`)
  * Access runtime constants directly
  * Returns values immediately without function calls
  * Example - `api.consts.balances.existentialDeposit`

* **State queries** (`api.query`)
  * Read chain state
  * Example - `api.query.system.account(accountId)`

* **Transactions** (`api.tx`)
  * Submit extrinsics (transactions)
  * Example - `api.tx.balances.transfer(accountId, value)`

## Installation

To add the Polkadot.js API to our project, we'll use the recommended version 15.9.1:

```bash
# Using npm
npm i @polkadot/api@15.9.1

# Using yarn
yarn add @polkadot/api@15.9.1

# Using pnpm
pnpm add @polkadot/api@15.9.1
```

## Basic Usage

### Creating an API Instance

To interact with a Polkadot SDK-based chain, we must establish a connection through an API instance:

```javascript
import { ApiPromise, WsProvider } from '@polkadot/api';

// Create a WebSocket provider
const wsProvider = new WsProvider('wss://rpc.polkadot.io');

// Initialize the API
const api = await ApiPromise.create({ provider: wsProvider });

// Verify the connection by getting the chain's genesis hash
console.log('Genesis Hash:', api.genesisHash.toHex());
```

> **Note**: All `await` operations must be wrapped in an async function or block since the API uses promises for asynchronous operations.

### Reading Chain Data

The API provides several ways to read data from the chain:

#### Constants

Values that are fixed in the runtime and don't change without a runtime upgrade:

```javascript
// Get the minimum balance required for a new account
const minBalance = api.consts.balances.existentialDeposit.toNumber();
console.log(`Minimum Balance: ${minBalance}`);
```

#### State Queries

Current chain state that updates with each block:

```javascript
// Example address
const address = '5DTestUPts3kjeXSTMyerHihn1uwMfLj8vU8sqF7qYrFabHE';

// Get current timestamp
const timestamp = await api.query.timestamp.now();

// Get account information
const { nonce, data: balance } = await api.query.system.account(address);

console.log(`
  Timestamp: ${timestamp}
  Free Balance: ${balance.free}
  Nonce: ${nonce}
`);
```

### Sending Transactions

Transactions (also called extrinsics) modify the chain state. Before sending a transaction, you need:

* A funded account with sufficient balance to pay transaction fees
* The account's keypair for signing

Example of making a transfer:

```javascript
import { Keyring } from '@polkadot/keyring';

// Create a keyring instance
const keyring = new Keyring({ type: 'sr25519' });

// Add an account, replacing the seed with your own. The seed was derived using subkey
const alice = keyring.addFromUri('//Alice');

const recipient = 'INSERT_RECIPIENT_ADDRESS';
const amount = 'INSERT_VALUE'; // Amount in the smallest unit (e.g., Planck for DOT)

// Sign and send a transfer
const txHash = await api.tx.balances
  .transfer(recipient, amount)
  .signAndSend(alice);

console.log('Transaction Hash:', txHash);
```

## NFT-Related Operations

For our Attendance NFT System, we may need to interact with NFT-related functionality:

### Checking NFT Ownership

```javascript
// Assuming RMRK or similar NFT standard is used
const nftId = 'NFT_ID';
const ownerAddress = 'OWNER_ADDRESS';

// This is a conceptual example; actual implementation will depend on the specific NFT standard used
const nftData = await api.query.nfts.owner(nftId);
console.log(`NFT Owner: ${nftData.toString()}`);
```

### Minting an NFT

```javascript
// Conceptual example for minting an NFT
// Actual parameters will depend on the specific NFT implementation
const mintNFT = async (recipient, eventData) => {
  // Create NFT metadata
  const metadata = {
    name: `Attendance: ${eventData.name}`,
    description: `Proof of attendance for ${eventData.name} on ${eventData.date}`,
    image: eventData.imageUrl
  };
  
  // The actual call will depend on the NFT standard implementation
  const tx = api.tx.nfts.mint(
    recipient,
    eventData.collectionId,
    metadata,
    1 // Quantity
  );
  
  return await tx.signAndSend(adminAccount);
};
```

## Event Subscriptions

To listen for blockchain events, which is crucial for tracking NFT minting and transfers:

```javascript
// Subscribe to new blocks
const unsubscribe = await api.rpc.chain.subscribeNewHeads((header) => {
  console.log(`Chain is at block: #${header.number}`);
});

// Later: unsubscribe when done
unsubscribe();

// Subscribe to balance changes for an address
const address = 'ADDRESS';
const unsub = await api.query.system.account(address, ({ data: balance }) => {
  console.log(`Balance: ${balance.free}`);
});

// Later: unsubscribe when done
unsub();
```

## Best Practices

1. **Connection Management**: Properly initialize and dispose of API connections to prevent memory leaks.
2. **Error Handling**: Implement robust error handling for all API calls, especially for transactions.
3. **Transaction Monitoring**: Monitor the status of submitted transactions to confirm success or handle failures.
4. **Batch Transactions**: Use batch transactions when performing multiple operations to optimize fees.

```javascript
// Example of a batch transaction
const txBatch = api.tx.utility.batch([
  api.tx.balances.transfer(recipient1, amount1),
  api.tx.balances.transfer(recipient2, amount2)
]);

// Sign and send the batch
const txHash = await txBatch.signAndSend(alice);
```

## Resources

- [Official Polkadot.js API Documentation](https://polkadot.js.org/docs/api)
- [Polkadot Developer Documentation](https://docs.polkadot.com/develop/toolkit/api-libraries/polkadot-js-api/)

---

*Note: The examples in this document are conceptual and may need adaptation based on the specific NFT standard and implementation used in our Polkadot Attendance NFT System.* 