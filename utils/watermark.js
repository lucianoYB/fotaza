const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function applyWatermark(inputPath, outputPath, text) {
    try {
        // Obtener dimensiones de la imagen original
        const metadata = await sharp(inputPath).metadata();
        const width = metadata.width;
        const height = metadata.height;
        
        // Crear un SVG con el texto (fuente simple, tamaño relativo al ancho)
        const fontSize = Math.floor(width / 15);
        const svgText = `
            <svg width="${width}" height="${height}">
                <rect width="100%" height="100%" fill="none" />
                <text x="50%" y="50%" 
                      font-size="${fontSize}" 
                      fill="rgba(255,255,255,0.6)" 
                      font-family="Arial" 
                      text-anchor="middle" 
                      dominant-baseline="middle"
                      transform="rotate(-30, ${width/2}, ${height/2})">
                    ${text}
                </text>
            </svg>
        `;
        
        const watermarkedBuffer = Buffer.from(svgText);
        
        await sharp(inputPath)
            .composite([{ input: watermarkedBuffer, blend: 'over' }])
            .toFile(outputPath);
            
        return outputPath;
    } catch (err) {
        console.error('Error al aplicar marca de agua:', err);
        throw err;
    }
}

module.exports = { applyWatermark };