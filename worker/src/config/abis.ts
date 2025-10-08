/**
 * Smart Contract ABIs
 */

export const PAYMENT_CONTRACT_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: 'auctionId', type: 'uint256' }],
    name: 'finalizeAuction',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
