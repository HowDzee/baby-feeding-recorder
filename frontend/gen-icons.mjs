// Generate PNG icons from SVG using sharp
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, 'public');
const distDir = join(__dirname, 'dist');
const svgPath = join(publicDir, 'icon.svg');

async function main() {
  await sharp(svgPath).resize(192).png().toFile(join(distDir, 'icon-192.png'));
  await sharp(svgPath).resize(512).png().toFile(join(distDir, 'icon-512.png'));
  console.log('OK: generated icon-192.png and icon-512.png');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
