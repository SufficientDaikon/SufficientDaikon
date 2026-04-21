import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const canvas = createCanvas(1200, 630);
const ctx = canvas.getContext('2d');

// Background
ctx.fillStyle = '#0e0e0e';
ctx.fillRect(0, 0, 1200, 630);

// Grid overlay
ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
ctx.lineWidth = 1;
for (let x = 0; x <= 1200; x += 40) {
  ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 630); ctx.stroke();
}
for (let y = 0; y <= 630; y += 40) {
  ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1200, y); ctx.stroke();
}

// Corner brackets
ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
ctx.lineWidth = 2;
// TL
ctx.beginPath(); ctx.moveTo(40, 60); ctx.lineTo(40, 40); ctx.lineTo(60, 40); ctx.stroke();
// TR
ctx.beginPath(); ctx.moveTo(1160, 60); ctx.lineTo(1160, 40); ctx.lineTo(1140, 40); ctx.stroke();
// BL
ctx.beginPath(); ctx.moveTo(40, 570); ctx.lineTo(40, 590); ctx.lineTo(60, 590); ctx.stroke();
// BR
ctx.beginPath(); ctx.moveTo(1160, 570); ctx.lineTo(1160, 590); ctx.lineTo(1140, 590); ctx.stroke();

// Cyan accent bar
ctx.fillStyle = '#00F0FF';
ctx.fillRect(80, 200, 4, 120);

// Glow effect (simulate with radial gradient)
const glow = ctx.createRadialGradient(600, 315, 0, 600, 315, 400);
glow.addColorStop(0, 'rgba(0, 240, 255, 0.04)');
glow.addColorStop(1, 'rgba(0, 240, 255, 0)');
ctx.fillStyle = glow;
ctx.fillRect(0, 0, 1200, 630);

// Label
ctx.fillStyle = 'rgba(0, 240, 255, 0.5)';
ctx.font = '600 14px monospace';
ctx.fillText('SYSTEM_INITIATED // CAIRO, EGYPT', 100, 190);

// Name
ctx.fillStyle = '#E5E2E1';
ctx.font = 'bold 72px sans-serif';
ctx.fillText('Ahmed Taha', 100, 290);

// Tagline
ctx.fillStyle = '#849495';
ctx.font = '300 28px sans-serif';
ctx.fillText('I build autonomous systems that build software.', 100, 350);

// Divider
ctx.fillStyle = '#00F0FF';
ctx.fillRect(100, 390, 60, 2);

// Role
ctx.fillStyle = 'rgba(0, 240, 255, 0.7)';
ctx.font = '500 16px monospace';
ctx.fillText('AI AGENT ARCHITECT  //  FULL-STACK ENGINEER  //  SYSTEMS PROGRAMMER', 100, 430);

// Bottom label
ctx.fillStyle = 'rgba(132, 148, 149, 0.4)';
ctx.font = '400 12px monospace';
ctx.fillText('THE ARTIFACT // ahmedtaha.dev', 100, 580);

const buffer = canvas.toBuffer('image/png');
writeFileSync(join(__dirname, '../public/og-image.png'), buffer);
console.log('og-image.png generated successfully');
