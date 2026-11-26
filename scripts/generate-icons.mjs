import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const outDir = path.resolve("public/icons");
await fs.mkdir(outDir, { recursive: true });

function kidSvg({ maskable = false } = {}) {
  const radius = maskable ? 0 : 112;
  const faceY = maskable ? 276 : 276;
  const faceR = maskable ? 132 : 140;

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <rect width="512" height="512" rx="${radius}" fill="#FFB84D"/>
    <circle cx="256" cy="${faceY}" r="${faceR}" fill="#FFF8EC"/>
    <path d="M256 92c24 26 18 46 0 58-18-12-24-32 0-58Z" fill="#F26B3A"/>
    <ellipse cx="207" cy="258" rx="16" ry="22" fill="#3D3229"/>
    <ellipse cx="305" cy="258" rx="16" ry="22" fill="#3D3229"/>
    <circle cx="201" cy="250" r="5" fill="#ffffff"/>
    <circle cx="299" cy="250" r="5" fill="#ffffff"/>
    <circle cx="180" cy="302" r="18" fill="#FF9EC2" opacity="0.72"/>
    <circle cx="332" cy="302" r="18" fill="#FF9EC2" opacity="0.72"/>
    <path d="M228 300q28 34 56 0" fill="none" stroke="#3D3229" stroke-width="12" stroke-linecap="round"/>
  </svg>`;
}

function parentSvg({ maskable = false } = {}) {
  const radius = maskable ? 0 : 112;

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <rect width="512" height="512" rx="${radius}" fill="#5B8DEF"/>
    <circle cx="256" cy="276" r="140" fill="#FFFFFF"/>
    <ellipse cx="207" cy="258" rx="16" ry="22" fill="#2F3B52"/>
    <ellipse cx="305" cy="258" rx="16" ry="22" fill="#2F3B52"/>
    <circle cx="201" cy="250" r="5" fill="#ffffff"/>
    <circle cx="299" cy="250" r="5" fill="#ffffff"/>
    <circle cx="180" cy="302" r="18" fill="#B9A7FF" opacity="0.65"/>
    <circle cx="332" cy="302" r="18" fill="#B9A7FF" opacity="0.65"/>
    <path d="M228 300q28 34 56 0" fill="none" stroke="#2F3B52" stroke-width="12" stroke-linecap="round"/>
    <path d="M256 120c-22-18-38-2-38 16 0 18 20 30 38 44 18-14 38-26 38-44 0-18-16-34-38-16Z" fill="#5B8DEF"/>
  </svg>`;
}

const jobs = [
  { name: "kid-192.png", size: 192, svg: kidSvg() },
  { name: "kid-512.png", size: 512, svg: kidSvg() },
  { name: "kid-maskable-512.png", size: 512, svg: kidSvg({ maskable: true }) },
  { name: "parent-192.png", size: 192, svg: parentSvg() },
  { name: "parent-512.png", size: 512, svg: parentSvg() },
  { name: "parent-maskable-512.png", size: 512, svg: parentSvg({ maskable: true }) },
];

for (const job of jobs) {
  await sharp(Buffer.from(job.svg))
    .resize(job.size, job.size)
    .png()
    .toFile(path.join(outDir, job.name));
  console.log(`created public/icons/${job.name}`);
}
