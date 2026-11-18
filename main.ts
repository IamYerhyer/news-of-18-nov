// "The World in One Day" — the news-image-20261118 entry program (Node 22,
// standard library only, no network). The entry image is the entry.png beside
// this file: a one-page front page summing up Wednesday 18 November 2026,
// drawn as SVG in image-source.html and rendered to PNG at 1024x1024.
//
// This program does more than copy. Before handing the image in it proves
// the file is what the gate expects: a complete PNG or JPEG (checked by
// magic bytes, not by name), at most 1024x1024 pixels (read from the PNG
// IHDR chunk or the JPEG SOF marker, not from any metadata), and at most
// 1 MiB on disk. Anything else is refused loudly, here, instead of silently
// failing after the deadline. Only a passing image is copied to
// /output/entry.png (or $MAKEFUN_OUTPUT_DIR/entry.png locally).

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

// Fingerprint the exact bytes being handed in. The gate, the judge and any
// later dispute all turn on this one file, so the run log carries its
// SHA-256: what was submitted can be re-proved from the log alone, and a
// swapped or corrupted entry.png can never pass unnoticed.
function fingerprint(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

const MAX_BYTES = 1048576; // 1 MiB, the gate's cap
const MAX_SIDE = 1024; // pixels, either dimension

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function hasPngMagic(buf) {
  return buf.length >= PNG_MAGIC.length && PNG_MAGIC.every((b, i) => buf[i] === b);
}

function hasJpegMagic(buf) {
  return buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
}

// PNG stores its pixel size big-endian in the IHDR chunk, which always
// starts at byte 16 (8 magic + 4 length + 4 "IHDR"), width first.
function pngSize(buf) {
  if (buf.length < 24 || buf.toString('ascii', 12, 16) !== 'IHDR') {
    throw new Error('PNG magic present but no IHDR chunk where it must be — file is truncated or corrupt');
  }
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

// JPEG keeps its size in a Start Of Frame segment. Walk the marker chain:
// each segment is FF <marker> <2-byte big-endian length incl. itself>.
// SOF markers are C0-CF except C4 (DHT), C8 (JPG) and CC (DAC).
function jpegSize(buf) {
  let pos = 2; // skip the FFD8 start-of-image marker
  while (pos + 4 <= buf.length) {
    if (buf[pos] !== 0xff) throw new Error(`JPEG marker expected at byte ${pos}, found 0x${buf[pos].toString(16)}`);
    const marker = buf[pos + 1];
    const segLen = buf.readUInt16BE(pos + 2);
    if (segLen < 2) throw new Error(`JPEG segment at byte ${pos} claims length ${segLen}`);
    const isSof = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSof) {
      if (pos + 9 > buf.length) throw new Error('JPEG ends inside its SOF segment');
      return { height: buf.readUInt16BE(pos + 5), width: buf.readUInt16BE(pos + 7) };
    }
    pos += 2 + segLen;
  }
  throw new Error('no SOF segment found — not a complete JPEG');
}

function inspectImage(buf) {
  if (buf.length === 0) throw new Error('entry.png is empty');
  if (buf.length > MAX_BYTES) {
    throw new Error(`entry.png is ${buf.length} bytes, over the ${MAX_BYTES}-byte (1 MiB) cap`);
  }
  let kind, size;
  if (hasPngMagic(buf)) {
    kind = 'PNG';
    size = pngSize(buf);
  } else if (hasJpegMagic(buf)) {
    kind = 'JPEG';
    size = jpegSize(buf);
  } else {
    throw new Error('entry.png is neither PNG nor JPEG by its magic bytes');
  }
  if (size.width > MAX_SIDE || size.height > MAX_SIDE) {
    throw new Error(`entry.png is ${size.width}x${size.height}, over the ${MAX_SIDE}x${MAX_SIDE} cap`);
  }
  if (size.width === 0 || size.height === 0) throw new Error('entry.png reports a zero dimension');
  return { kind, ...size };
}

const here = fileURLToPath(new URL('.', import.meta.url));
const source = join(here, 'entry.png');
const bytes = readFileSync(source);
const info = inspectImage(bytes);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
const dest = join(outDir, 'entry.png');
copyFileSync(source, dest);

// Prove the hand-in landed whole: re-read what is now at the destination
// and compare it with the inspected source, byte count and fingerprint
// alike. A short write, a full disk or a racing cleanup must turn into a
// loud failure here, not a silent invalid entry at the gate.
const landed = readFileSync(dest);
if (landed.length !== bytes.length || fingerprint(landed) !== fingerprint(bytes)) {
  throw new Error(
    `hand-in mismatch: ${dest} holds ${landed.length} bytes (sha256 ${fingerprint(landed)}), source is ${bytes.length} bytes (sha256 ${fingerprint(bytes)})`,
  );
}

console.log(
  `news-image-20261118: handed in ${info.kind} ${info.width}x${info.height}, ${bytes.length} bytes, sha256 ${fingerprint(bytes)} -> ${dest}`,
);
