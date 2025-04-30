import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import axios from 'axios';
import { type Address } from 'viem';
import { z } from 'zod';
import mintNft from './lib/mint-nft';

const nftContractAddress = process.env.NFT_CONTRACT_ADDRESS as Address | undefined;
const whisperApiUrl = process.env.WHISPER_API_URL;

if (!nftContractAddress) {
	throw new Error('Missing NFT_CONTRACT_ADDRESS environment variable.');
}

if (!whisperApiUrl) {
	throw new Error('Missing WHISPER_API_URL environment variable.');
}

// Initialize MCP server
const server = new McpServer({
    name: 'whisper-mcp',
    version: '0.0.1',
    capabilities: ['whisper']
});

// Whisper tool
server.tool(
    // Tool ID
    'whisper',
    // Description
    'Whisper (send message as NFT) to a Monad testnet address.',
    // Input schema
    {
        address: z
            .string()
            .describe('Monad testnet address where the whisper NFT is sent.'),
        text: z
            .string()
            .min(3)
            .max(100)
            .describe('The message to whisper (drawn into whisper NFT). Min 3 characters, max 100 characters.'),
        backgroundColor: z
            .string()
            .optional()
            .describe('Background color (hex) of the whisper NFT. Optional.'),
        textColor: z
            .string()
            .optional()
            .describe('Text color (hex) of the whisper NFT. Optional.'),
    },
    // Tool implementation
    async ({ address, text, backgroundColor, textColor }) => {
        try {
            // Mint the NFT
            const tokenId = await mintNft(address as Address);

            // Generate the NFT image and metadata
            await axios.post(whisperApiUrl, {
                tokenId,
                text,
                backgroundColor,
                textColor
            })

            return {
                content: [
                    {
                        type: 'text',
                        text: `View the whisper (NFT) on Magic Eden: https://magiceden.io/item-details/monad-testnet/${nftContractAddress}/${tokenId}`,
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Failed to whisper to ${address}. Error: ${error instanceof Error ? error.message : String(error)}`,
                    },
                ],
            };
        }
    }
);

/**
 * Main function to start the MCP server
 * Uses stdio for communication with LLM clients
 */
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Monad testnet MCP Server running on stdio');
}

// Start the server and handle any fatal errors
main().catch((error) => {
    console.error('Fatal error in main():', error);
    process.exit(1);
});
