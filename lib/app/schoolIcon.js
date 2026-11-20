// A school's own app icon (round 23, BD317): drawn on the server from the school's logo, or, when it has none (or the logo cannot be read), from
// the letters of its name in its own colours. It never uses another product's picture. Pure code with no screen in it, so a test can run it:
//   monogramPng(letters, options) -> a PNG (Buffer) with nothing but this file and Node's zlib
//   logoPng(bytes, options)       -> a PNG with the logo centred on a tile, using sharp when this server has it; null when it cannot
//   iconKind('512-maskable')      -> { size: 512, kind: 'maskable' } | null  (what the address of an icon asks for)
//
// kind 'any'      a rounded tile with see-through corners (the install box, the Windows and Mac app)
//      'maskable' a full square with the mark well inside the middle 60 percent, so Android can cut it into a circle or a squircle
//      'apple'    a full square with no see-through part (iPhone and iPad round it themselves)
import { deflateSync } from 'node:zlib';

export const SIZES = Object.freeze([180, 192, 512]);

// '192', '512', '192-maskable', '512-maskable', '180' -> what to draw. Anything else is not an icon.
export function iconKind(spec) {
  const m = /^(180|192|512)(-maskable)?$/.exec(String(spec || ''));
  if (!m) return null;
  const size = Number(m[1]);
  if (m[2]) return size === 180 ? null : { size, kind: 'maskable' };
  return { size, kind: size === 180 ? 'apple' : 'any' };
}

const clamp01 = (n) => Math.max(0, Math.min(1, n));

// "#RRGGBB" -> [r, g, b]
export function rgb(hex, fallback = [30, 58, 95]) {
  const m = /^#([0-9a-f]{6})$/i.exec(String(hex || ''));
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// The better text colour on a background: white on dark colours, a deep navy on light ones (relative luminance, as the web's contrast rule has it).
export function readableOn(bg) {
  const lin = (c) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const L = 0.2126 * lin(bg[0]) + 0.7152 * lin(bg[1]) + 0.0722 * lin(bg[2]);
  return L > 0.45 ? [20, 33, 52] : [255, 255, 255];
}

// ------------------------------------------------------------------------------------------------------------------ a small stroke alphabet
// Each letter is a few lines on a grid 4 wide and 6 tall, written as "x,y x,y x,y|x,y x,y" (one line per group). It is drawn with round ends,
// so a monogram looks like a clean rounded sans-serif, with no font file on the server.
const GLYPHS = {
  A: '0,6 2,0 4,6|0.8,4 3.2,4', B: '0,0 0,6|0,0 2.6,0 3.6,0.8 3.6,2.2 2.6,3 0,3|2.6,3 3.8,3.8 3.8,5.2 2.8,6 0,6',
  C: '4,1 3,0 1,0 0,1 0,5 1,6 3,6 4,5', D: '0,0 0,6|0,0 2.4,0 4,1.6 4,4.4 2.4,6 0,6',
  E: '4,0 0,0 0,6 4,6|0,3 3,3', F: '4,0 0,0 0,6|0,3 3,3',
  G: '4,1 3,0 1,0 0,1 0,5 1,6 3,6 4,5 4,3 2.4,3', H: '0,0 0,6|4,0 4,6|0,3 4,3',
  I: '1,0 3,0|2,0 2,6|1,6 3,6', J: '4,0 4,5 3,6 1,6 0,5',
  K: '0,0 0,6|4,0 0,3.6|1.4,2.6 4,6', L: '0,0 0,6 4,6',
  M: '0,6 0,0 2,3.4 4,0 4,6', N: '0,6 0,0 4,6 4,0',
  O: '1,0 3,0 4,1 4,5 3,6 1,6 0,5 0,1 1,0', P: '0,6 0,0 2.8,0 4,1 4,2.4 2.8,3.4 0,3.4',
  Q: '1,0 3,0 4,1 4,5 3,6 1,6 0,5 0,1 1,0|2.4,4.2 4,6.4', R: '0,6 0,0 2.8,0 4,1 4,2.4 2.8,3.4 0,3.4|2,3.4 4,6',
  S: '4,1 3,0 1,0 0,1 0,2.2 1,3 3,3 4,3.8 4,5 3,6 1,6 0,5', T: '0,0 4,0|2,0 2,6',
  U: '0,0 0,5 1,6 3,6 4,5 4,0', V: '0,0 2,6 4,0', W: '0,0 1,6 2,2.6 3,6 4,0',
  X: '0,0 4,6|4,0 0,6', Y: '0,0 2,3 4,0|2,3 2,6', Z: '0,0 4,0 0,6 4,6',
  0: '1,0 3,0 4,1 4,5 3,6 1,6 0,5 0,1 1,0', 1: '0.8,1.4 2.2,0 2.2,6|1,6 3.4,6',
  2: '0,1 1,0 3,0 4,1 4,2.4 0,6 4,6', 3: '0,0.8 1,0 3,0 4,1 4,2.2 3,3 1.6,3|3,3 4,3.8 4,5 3,6 1,6 0,5.2',
  4: '3,6 3,0 0,4.2 4,4.2', 5: '4,0 0.4,0 0,2.8 2.6,2.6 4,3.5 4,5 3,6 1,6 0,5',
  6: '3.6,0.4 2,0 0.6,1 0,3 0,5 1,6 3,6 4,5 4,3.8 3,3 1,3 0,4', 7: '0,0 4,0 1.6,6',
  8: '1,3 0.2,2.2 0.2,1 1,0 3,0 3.8,1 3.8,2.2 3,3 1,3 0,3.8 0,5 1,6 3,6 4,5 4,3.8 3,3',
  9: '0.4,5.6 2,6 3.4,5 4,3 4,1 3,0 1,0 0,1 0,2.2 1,3 3,3 4,2',
};
const PARSED = {};
for (const [k, v] of Object.entries(GLYPHS)) PARSED[k] = v.split('|').map((line) => line.split(' ').map((pt) => pt.split(',').map(Number)));

// Letters the alphabet has. A letter with an accent is drawn as its plain letter; one it does not have (another alphabet) falls back to the first letter we can draw, else "S".
export function drawable(letters) {
  const plain = String(letters || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
  const out = [...plain].filter((c) => PARSED[c]).slice(0, 2).join('');
  return out || 'S';
}

// ------------------------------------------------------------------------------------------------------------------ the PNG file
const CRC = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) { let c = n; for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; table[n] = c >>> 0; }
  return table;
})();
const crc32 = (buf) => { let c = 0xffffffff; for (let i = 0; i < buf.length; i += 1) c = CRC[(c ^ buf[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'latin1');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

// RGBA pixels (width x height x 4 bytes) -> a PNG file.
export function encodePng(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (width * 4 + 1)] = 0; // filter "none"
    Buffer.from(rgba.buffer, rgba.byteOffset + y * width * 4, width * 4).copy(raw, y * (width * 4 + 1) + 1);
  }
  const head = Buffer.alloc(13);
  head.writeUInt32BE(width, 0); head.writeUInt32BE(height, 4); head[8] = 8; head[9] = 6; head[10] = 0; head[11] = 0; head[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', head), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

// ------------------------------------------------------------------------------------------------------------------ the tile and the letters
// How much of the tile's width the mark may take, and the corner radius (as a share of the width).
const LAYOUT = { any: { share: 0.62, radius: 0.22 }, maskable: { share: 0.5, radius: 0 }, apple: { share: 0.62, radius: 0 } };

// The distance from point p to the segment a-b.
function distance(px, py, ax, ay, bx, by) {
  const dx = bx - ax; const dy = by - ay;
  const len = dx * dx + dy * dy;
  const t = len ? clamp01(((px - ax) * dx + (py - ay) * dy) / len) : 0;
  const x = ax + t * dx - px; const y = ay + t * dy - py;
  return Math.sqrt(x * x + y * y);
}

// The segments of a monogram in the tile's own pixels, centred, plus the stroke radius.
function monogramSegments(letters, size, kind) {
  const chars = [...drawable(letters)];
  const { share } = LAYOUT[kind] || LAYOUT.any;
  const gap = 1.6; // grid units between two letters
  const gridWidth = chars.length * 4 + (chars.length - 1) * gap;
  const unit = Math.min((size * share) / gridWidth, (size * share) / 6);
  const left = (size - gridWidth * unit) / 2;
  const top = (size - 6 * unit) / 2;
  const segments = [];
  chars.forEach((ch, i) => {
    const dx = left + i * (4 + gap) * unit;
    for (const line of PARSED[ch]) {
      for (let k = 0; k + 1 < line.length; k += 1) segments.push([dx + line[k][0] * unit, top + line[k][1] * unit, dx + line[k + 1][0] * unit, top + line[k + 1][1] * unit]);
    }
  });
  return { segments, radius: unit * 0.36 };
}

// A tile with the letters of the school's name, drawn in a colour that can be read on it. `background` and `foreground` are [r, g, b].
export function monogramPng(letters, { size = 512, kind = 'any', background = [30, 58, 95], foreground } = {}) {
  const fg = foreground || readableOn(background);
  const { segments, radius } = monogramSegments(letters, size, kind);
  const cornerR = (LAYOUT[kind] || LAYOUT.any).radius * size;
  const px = new Uint8ClampedArray(size * size * 4);
  const soft = Math.max(0.75, size / 420); // the width of the soft edge, in pixels
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const cx = x + 0.5; const cy = y + 0.5;
      // the tile (a rounded square, or the whole square)
      let tile = 1;
      if (cornerR > 0) {
        const qx = Math.max(cornerR - cx, 0, cx - (size - cornerR));
        const qy = Math.max(cornerR - cy, 0, cy - (size - cornerR));
        tile = clamp01(0.5 - (Math.sqrt(qx * qx + qy * qy) - cornerR) / soft);
      }
      // the letters: the nearest line decides how much of this pixel is covered
      let near = Infinity;
      for (let s = 0; s < segments.length; s += 1) {
        const g = segments[s];
        const d = distance(cx, cy, g[0], g[1], g[2], g[3]);
        if (d < near) near = d;
      }
      const ink = clamp01(0.5 - (near - radius) / soft);
      const o = (y * size + x) * 4;
      px[o] = background[0] + (fg[0] - background[0]) * ink;
      px[o + 1] = background[1] + (fg[1] - background[1]) * ink;
      px[o + 2] = background[2] + (fg[2] - background[2]) * ink;
      px[o + 3] = Math.round(255 * tile);
    }
  }
  return encodePng(size, size, px);
}

// ------------------------------------------------------------------------------------------------------------------ the logo on a tile
// The picture library is looked for when it is needed, by a name the website's bundler does not follow: a school's website that was installed
// without it builds and runs exactly the same, and draws the monogram instead of the logo.
const PICTURE_LIBRARY = 'sharp';
const loadPictureLibrary = () => import(/* webpackIgnore: true */ /* turbopackIgnore: true */ PICTURE_LIBRARY);

const KNOWN_PICTURES = /^(?:image\/(?:png|jpe?g|webp|svg\+xml|gif))\b/i;
export const MAX_LOGO_BYTES = 2 * 1024 * 1024;

// The school's logo, centred on a plain light tile (a logo is made to sit on a light page). Returns a PNG Buffer, or null when this server has no
// picture library or the logo cannot be read (the caller then draws the monogram instead). `load` lets a test give its own picture library.
export async function logoPng(bytes, { size = 512, kind = 'any', background = [255, 255, 255], load = loadPictureLibrary } = {}) {
  try {
    if (!bytes || !bytes.length || bytes.length > MAX_LOGO_BYTES) return null;
    const lib = await load();
    const sharp = lib.default || lib;
    const { radius } = LAYOUT[kind] || LAYOUT.any;
    const inner = Math.round(size * (kind === 'maskable' ? 0.56 : 0.68));
    const mark = await sharp(bytes, { limitInputPixels: 24_000_000, density: 288 })
      .resize(inner, inner, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    const r = Math.round(radius * size);
    const mask = r > 0 ? Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="#fff"/></svg>`) : null;
    let tile = sharp({ create: { width: size, height: size, channels: 4, background: { r: background[0], g: background[1], b: background[2], alpha: 1 } } })
      .composite([{ input: mark, gravity: 'centre' }]);
    if (mask) tile = sharp(await tile.png().toBuffer()).composite([{ input: mask, blend: 'dest-in' }]);
    return await tile.png().toBuffer();
  } catch (error) {
    return null;
  }
}

// Is this answer a picture we are willing to draw from? (content type and size, checked before any library sees the bytes)
export const acceptablePicture = (contentType, length) => KNOWN_PICTURES.test(String(contentType || '')) && length > 0 && length <= MAX_LOGO_BYTES;
