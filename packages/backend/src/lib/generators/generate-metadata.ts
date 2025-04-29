export default function generateMetadata(
    tokenId: number, 
    text: string,
    backgroundColor: string, 
    textColor: string
): Buffer {
    const metadata = {
        name: `Whisper #${tokenId}`,
        description: text,
        image: `https://cdn.zekeosborn.xyz/whisper/${tokenId}.png`,
        attributes: [
            {
                trait_type: 'Background',
                value: backgroundColor
            },
            {
                trait_type: 'Text',
                value: textColor
            }
        ]
    }

    const stringifiedMetadata = JSON.stringify(metadata, null, 4);
    const metadataBuffer = Buffer.from(stringifiedMetadata);

    return metadataBuffer;
}