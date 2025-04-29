import { decodeEventLog, type Address } from 'viem';
import abi from './abi';
import { account, publicClient, walletClient } from './viem';

const nftContractAddress = process.env.NFT_CONTRACT_ADDRESS as Address | undefined;

export default async function mintNft(address: Address) {
    if (!nftContractAddress) {
        throw new Error('Missing NFT_CONTRACT_ADDRESS environment variable.');
    }

    // Simulate contract interaction
    const { request } = await publicClient.simulateContract({
        address: nftContractAddress,
        abi,
        functionName: 'publicMint',
        args: [address],
        account,
    });

    // Send transaction hash
    const hash = await walletClient.writeContract(request);

    // Get tokenId
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    const transferLog = receipt.logs.map(({ data, topics }) => {
        try {
            return decodeEventLog({ abi, data, topics });
        } catch {
            return null
        }
    })
    .find(log => log && log.eventName === 'Transfer');

    if (!transferLog) {
        throw new Error('No Transfer event found.');
    }

    const tokenId = Number((transferLog.args as any).tokenId);

    return tokenId;
}