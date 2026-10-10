import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, r, g, b, a = 255) {
  // Simple uncompressed/deflated raw RGBA PNG writer
  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      
      // Calculate distance to center
      const cx = width / 2;
      const cy = height / 2;
      const dx = (x - cx) / (width * 0.45);
      const dy = (y - cy) / (height * 0.45);
      const d = Math.sqrt(dx * dx + dy * dy);

      if (d <= 1.0) {
        // Inner badge color (teal-emerald #0d9488 or pin #ffffff)
        const dInner = Math.sqrt(Math.pow((x - cx) / (width * 0.25), 2) + Math.pow((y - cy * 0.9) / (height * 0.25), 2));
        if (dInner < 0.6) {
          rawData[pxOffset] = 255;
          rawData[pxOffset + 1] = 255;
          rawData[pxOffset + 2] = 255;
          rawData[pxOffset + 3] = 255;
        } else {
          rawData[pxOffset] = 13;   // #0d
          rawData[pxOffset + 1] = 148; // #94
          rawData[pxOffset + 2] = 136; // #88
          rawData[pxOffset + 3] = 255;
        }
      } else {
        // Background rounded border
        rawData[pxOffset] = 15;
        rawData[pxOffset + 1] = 23;
        rawData[pxOffset + 2] = 42;
        rawData[pxOffset + 3] = 255;
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 6; // Color type 6 (RGBA)
  ihdr[10] = 0; // Compression method
  ihdr[11] = 0; // Filter method
  ihdr[12] = 0; // Interlace method
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT chunk
  const idatChunk = makeChunk('IDAT', deflated);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let crc = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

const table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  table[i] = c;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4);
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

fs.mkdirSync('./public', { recursive: true });
fs.writeFileSync('./public/pwa-192x192.png', createPNG(192, 192, 13, 148, 136));
fs.writeFileSync('./public/pwa-512x512.png', createPNG(512, 512, 13, 148, 136));
fs.writeFileSync('./public/pwa-maskable-512x512.png', createPNG(512, 512, 13, 148, 136));
fs.writeFileSync('./public/apple-touch-icon.png', createPNG(180, 180, 13, 148, 136));

console.log('Generated PNG icons successfully!');
