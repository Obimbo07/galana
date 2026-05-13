/**
 * Writes a minimal mono 16-bit PCM WAV (~0.75s soft notification tone).
 * Run: node scripts/generate-ai-chime-wav.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sampleRate = 22050;
const durationSec = 0.78;
const f1 = 523.25; // C5
const f2 = 659.25; // E5
const numSamples = Math.floor(sampleRate * durationSec);
const dataSize = numSamples * 2;
const buf = Buffer.alloc(44 + dataSize);

function writeString(off, s) {
  for (let i = 0; i < s.length; i++) buf.writeUInt8(s.charCodeAt(i), off + i);
}

writeString(0, "RIFF");
buf.writeUInt32LE(36 + dataSize, 4);
writeString(8, "WAVE");
writeString(12, "fmt ");
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(1, 22);
buf.writeUInt32LE(sampleRate, 24);
buf.writeUInt32LE(sampleRate * 2, 28);
buf.writeUInt16LE(2, 32);
buf.writeUInt16LE(16, 34);
writeString(36, "data");
buf.writeUInt32LE(dataSize, 40);

for (let i = 0; i < numSamples; i++) {
  const t = i / sampleRate;
  const attack = Math.min(1, t / 0.012);
  const decay = Math.exp(-2.85 * t);
  const mix =
    0.55 * Math.sin(2 * Math.PI * f1 * t) + 0.45 * Math.sin(2 * Math.PI * f2 * t);
  const sample = mix * decay * attack * 0.2;
  const clamped = Math.max(-1, Math.min(1, sample));
  buf.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
}

const out = path.join(__dirname, "..", "public", "sounds", "ai-chime.wav");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, buf);
console.log("Wrote", out, `(${buf.length} bytes)`);
