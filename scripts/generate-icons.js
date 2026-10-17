const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let crc = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) {
    let byte = buf[i];
    for (let j = 0; j < 8; j++) {
      if ((crc ^ byte) & 1) {
        crc = (crc >>> 1) ^ 0xEDB88320;
      } else {
        crc = (crc >>> 1);
      }
      byte >>>= 1;
    }
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const typeAndData = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(typeAndData);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);
  return Buffer.concat([len, typeAndData, crcBuf]);
}

function createPng(width, height, getPixel) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Scanlines with filter byte 0
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // filter byte = None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate icon with smooth rounded corners, PRZ vibrant gradient (#fa243c to #7c3aed), and graduation cap symbol
function renderIcon(size) {
  const cornerRadius = size * 0.22;
  const cx = size / 2;
  const cy = size / 2;

  return createPng(size, size, (x, y, w, h) => {
    // Rounded rect distance
    const dx = Math.max(0, Math.abs(x - cx) - (cx - cornerRadius));
    const dy = Math.max(0, Math.abs(y - cy) - (cy - cornerRadius));
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > cornerRadius) {
      return [0, 0, 0, 0];
    }

    const t = (x + y) / (w + h);
    let r = Math.round(250 * (1 - t) + 99 * t);
    let g = Math.round(36 * (1 - t) + 102 * t);
    let b = Math.round(60 * (1 - t) + 241 * t);
    let a = 255;

    if (dist > cornerRadius - 1.5) {
      const edgeAlpha = Math.max(0, Math.min(1, cornerRadius - dist + 0.5));
      a = Math.round(255 * edgeAlpha);
    }

    const nx = (x - cx) / (size * 0.38);
    const ny = (y - cy) / (size * 0.38);

    const capRhombus = Math.abs(nx) + Math.abs(ny + 0.15) * 1.8 <= 0.85;
    // Cap headband underneath: nx in [-0.5, 0.5] and ny in [0.05, 0.4] and curved bottom
    const capBase = Math.abs(nx) <= 0.45 && ny >= 0.05 && ny <= 0.35 && (nx * nx * 0.6 + ny <= 0.4);
    // Tassel string & dot
    const tassel = (Math.abs(nx + 0.6) < 0.05 && ny >= -0.1 && ny <= 0.4) || (Math.sqrt((nx + 0.6) ** 2 + (ny - 0.4) ** 2) < 0.1);

    if (capRhombus || capBase || tassel) {
      // White emblem with slight drop shadow feel
      r = 255;
      g = 255;
      b = 255;
      a = 255;
    }

    return [r, g, b, a];
  });
}

const outDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'icon-192.png'), renderIcon(192));
fs.writeFileSync(path.join(outDir, 'icon-512.png'), renderIcon(512));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), renderIcon(180));

console.log('PWA icons successfully generated in public/icons!');
