// admin-ui/src/components/NFTMintList.js
import React from 'react';
import { formatDate, formatRelativeTime, truncateAddress } from '../utils/formatters';

function NFTMintList({ mints }) {
  if (!mints || mints.length === 0) {
    return (
      <div className="empty-state">
        <p>No NFTs have been minted yet.</p>
      </div>
    );
  }

  return (
    <div className="nft-mint-list">
      <table className="table">
        <thead>
          <tr>
            <th>Token ID</th>
            <th>Attendee</th>
            <th>Wallet Address</th>
            <th>Minted At</th>
          </tr>
        </thead>
        <tbody>
          {mints.map(mint => (
            <tr key={mint.id || mint.tokenId}>
              <td>{mint.tokenId}</td>
              <td>{mint.attendeeEmail}</td>
              <td className="address">{truncateAddress(mint.walletAddress)}</td>
              <td>{formatRelativeTime(mint.mintedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default NFTMintList;
