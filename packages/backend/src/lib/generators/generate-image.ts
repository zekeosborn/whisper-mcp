import { createCanvas, registerFont } from "canvas";
import path from "path";

registerFont(path.resolve(__dirname, '../../fonts/Inter.ttf'), { family: 'Inter' });

export default function generateImage(
    text: string, 
    backgroundColor: string, 
    textColor: string
): Buffer {
    const width = 1000;
    const height = 1000;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Prepare text settings
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    let currentFontSize = 64;
    ctx.font = `bold ${currentFontSize}px Inter`;

    // Wrap text
    const maxLineWidth = width * 0.8;
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const testLine = `${currentLine} ${words[i]}`;
        const { width: testWidth } = ctx.measureText(testLine);

        if (testWidth < maxLineWidth) {
            currentLine = testLine;
        } else {
            lines.push(currentLine);
            currentLine = words[i];
        }
    }
    
    lines.push(currentLine);

    // Reduce font size if text is too long
    let lineHeight = currentFontSize * 1.2;
    while (lines.length * lineHeight > height * 0.8 && currentFontSize > 10) {
        currentFontSize -= 2;
        lineHeight = currentFontSize * 1.2;
        ctx.font = `bold ${currentFontSize}px Arial`;
    }

    // Draw text
    const textBlockHeight = lines.length * lineHeight;
    const startY = (height - textBlockHeight) / 2;
    
    lines.forEach((line, index) => {
        const y = startY + index * lineHeight;
        ctx.fillText(line, width / 2, y);
    });

    return canvas.toBuffer('image/png');
}