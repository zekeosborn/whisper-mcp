import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import compression from 'compression';
import cors from 'cors';
import express, { type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'path';
import type { Address } from 'viem';
import abi from './lib/blockchain/abi';
import { publicClient } from './lib/blockchain/viem';
import generateImage from './lib/generators/generate-image';
import generateMetadata from './lib/generators/generate-metadata';
import uploadToR2 from './lib/upload-to-r2';
import { whisperSchema, type WhisperDto } from './lib/validation-schemas';

const app = express();
const port = process.env.PORT || 3000;
const prisma = new PrismaClient()
const nftContractAddress = process.env.NFT_CONTRACT_ADDRESS as Address | undefined;

if (!nftContractAddress) {
	throw new Error('Missing NFT_CONTRACT_ADDRESS environment variable.');
}

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,   // 15 minutes
    max: 25,
});

app.use(cors());
app.use(express.json({ limit: '1kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(compression());
app.use(rateLimiter);

// Render index page
app.get('/', async (_req: Request, res: Response) => {
    res.render('index');
});

// Generate NFT image and metadata
app.post('/', async (req: Request<{}, {}, WhisperDto>, res: Response) => {
    try {
        // Validate request body
        const validation = whisperSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json(validation.error.format());
            return;
        }

        const { 
            tokenId, 
            text, 
            backgroundColor = '#FFFFFF',
            textColor = '#000000'           
        } = validation.data;

        const uppercasedBackgroundColor = backgroundColor.toUpperCase();
        const uppercasedTextColor = textColor.toUpperCase();

        // Verify if the NFT exists
        await publicClient.readContract({
            address: nftContractAddress,
            abi,
            functionName: 'tokenURI',
            args: [BigInt(tokenId)],
        })

        // Verify if the NFT image and metadata have not been generated yet
        const nft = await prisma.nft.findUnique({ where: { tokenId }});

        if (nft) {
            res.status(409).json({ error: 'The NFT image and metadata already generated.' });
            return;
        }

        // Generate metadata
        const metadataBuffer = generateMetadata(
            tokenId, 
            text, 
            uppercasedBackgroundColor,
            uppercasedTextColor, 
        );

        // Generate image
        const imageBuffer = generateImage(
            text, 
            uppercasedBackgroundColor, 
            uppercasedTextColor
        );

        // Upload the NFT image and metadata and also mark as generated
        await Promise.all([
            uploadToR2(`whisper/${tokenId}`, metadataBuffer, 'application/json'),
            uploadToR2(`whisper/${tokenId}.png`, imageBuffer, 'image/png'),
            prisma.nft.create({ data: { tokenId }})
        ]);

        res.json({ message: 'Successfully generate the NFT image and metadata!' });
    } catch (error) {
        if (!(error instanceof Error)) {
            console.error('Error generating the NFT image and metadata:', error);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        // The NFT does not exist
        if (error.message.includes('ERC721NonexistentToken')) {
            res.status(404).json({ error: 'The NFT does not exist.' });
            return;
        }

        console.error('Error generating the NFT image and metadata:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});