import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Raster compatibility icons are derived from the supplied, unchanged SVG.
const source = new URL('../public/favicon.svg', import.meta.url);
const publicDir = new URL('../public/', import.meta.url);
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(size => sharp(fileURLToPath(source))
  .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png().toBuffer()));
const directory = Buffer.alloc(6 + 16 * images.length);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(images.length, 4);
let offset = directory.length;
images.forEach((image, i) => {
  const entry = 6 + 16 * i;
  directory[entry] = sizes[i];
  directory[entry + 1] = sizes[i];
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(image.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += image.length;
});
await fs.writeFile(new URL('favicon.ico', publicDir), Buffer.concat([directory, ...images]));
const mark = await sharp(await fs.readFile(source))
  .resize(140, 140, { fit: 'contain', background: { r: 250, g: 249, b: 246, alpha: 1 } })
  .png().toBuffer();
await sharp({ create: { width: 180, height: 180, channels: 4, background: '#faf9f6' } })
  .composite([{ input: mark, gravity: 'centre' }]).png()
  .toFile(fileURLToPath(new URL('apple-touch-icon.png', publicDir)));
console.log('Generated favicon.ico (16/32/48px) and apple-touch-icon.png (180px).');
