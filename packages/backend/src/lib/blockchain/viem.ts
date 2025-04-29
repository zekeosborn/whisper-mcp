import { createPublicClient, http } from 'viem';
import { monadTestnet } from 'viem/chains';

const rpcUrl = process.env.RPC_URL;

export const publicClient = createPublicClient({
    chain: monadTestnet,
    transport: http(rpcUrl),
});