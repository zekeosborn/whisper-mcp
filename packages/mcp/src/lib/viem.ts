import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { monadTestnet } from 'viem/chains';

const {
    RPC_URL: rpcUrl,
    PRIVATE_KEY: privateKey
} = process.env;

if (!privateKey) {
    throw new Error('Missing PRIVATE_KEY environment variable.');
}

export const account = privateKeyToAccount(privateKey as `0x${string}`);

export const publicClient = createPublicClient({
    chain: monadTestnet,
    transport: http(rpcUrl),
});

export const walletClient = createWalletClient({
    account,
    chain: monadTestnet,
    transport: http(rpcUrl),
});