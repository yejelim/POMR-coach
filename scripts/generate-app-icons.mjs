import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import sharp from "sharp";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const source = path.join(root, "public", "POMR_coach_logo.png");
const buildDir = path.join(root, "build");
const iconsetDir = path.join(buildDir, "icon.iconset");
const pngOutput = path.join(buildDir, "icon.png");
const icnsOutput = path.join(buildDir, "icon.icns");
const icoOutput = path.join(buildDir, "icon.ico");
const publicAppIcon = path.join(root, "public", "app-icon.png");
const appRouterIcon = path.join(root, "src", "app", "icon.png");

await fs.mkdir(buildDir, { recursive: true });

const icon = await createPOnlyIcon();
await sharp(icon).png().toFile(pngOutput);
await fs.copyFile(pngOutput, publicAppIcon);
await fs.copyFile(pngOutput, appRouterIcon);

await createIcns(icon);
await createIco(icon);

async function createPOnlyIcon() {
  const crop = await sharp(source)
    .extract({ left: 190, top: 355, width: 390, height: 500 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = crop;
  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    if (red > 236 && green > 236 && blue > 236) {
      data[index + 3] = 0;
    }
  }

  const pSymbol = await sharp(data, { raw: info })
    .trim({ background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .resize(720, 720, {
      fit: "contain",
      background: { r: 248, g: 250, b: 252, alpha: 0 },
    })
    .png()
    .toBuffer();

  const background = Buffer.from(
    `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#FFFFFF"/>
          <stop offset="1" stop-color="#CCFBF1"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="26" stdDeviation="24" flood-color="#0F172A" flood-opacity="0.14"/>
        </filter>
      </defs>
      <rect x="72" y="72" width="880" height="880" rx="204" fill="url(#bg)" filter="url(#shadow)"/>
      <rect x="100" y="100" width="824" height="824" rx="178" fill="#F8FAFC" fill-opacity="0.82"/>
    </svg>`,
  );

  return sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: background, left: 0, top: 0 },
      { input: pSymbol, left: 152, top: 148 },
    ])
    .png()
    .toBuffer();
}

async function createIcns(iconBuffer) {
  if (process.platform !== "darwin") {
    return;
  }

  await fs.rm(iconsetDir, { recursive: true, force: true });
  await fs.mkdir(iconsetDir, { recursive: true });

  const entries = [
    ["icon_16x16.png", 16],
    ["icon_16x16@2x.png", 32],
    ["icon_32x32.png", 32],
    ["icon_32x32@2x.png", 64],
    ["icon_128x128.png", 128],
    ["icon_128x128@2x.png", 256],
    ["icon_256x256.png", 256],
    ["icon_256x256@2x.png", 512],
    ["icon_512x512.png", 512],
    ["icon_512x512@2x.png", 1024],
  ];

  await Promise.all(
    entries.map(([fileName, size]) =>
      sharp(iconBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(iconsetDir, fileName)),
    ),
  );

  await fs.rm(icnsOutput, { force: true });
  await execFileAsync("iconutil", ["-c", "icns", iconsetDir, "-o", icnsOutput]);
}

async function createIco(iconBuffer) {
  const sizes = [16, 24, 32, 48, 64, 128, 256];
  const pngs = await Promise.all(
    sizes.map((size) =>
      sharp(iconBuffer)
        .resize(size, size)
        .png()
        .toBuffer(),
    ),
  );

  const headerSize = 6 + sizes.length * 16;
  let offset = headerSize;
  const buffers = [Buffer.alloc(headerSize)];
  buffers[0].writeUInt16LE(0, 0);
  buffers[0].writeUInt16LE(1, 2);
  buffers[0].writeUInt16LE(sizes.length, 4);

  pngs.forEach((png, index) => {
    const size = sizes[index];
    const entryOffset = 6 + index * 16;
    buffers[0].writeUInt8(size === 256 ? 0 : size, entryOffset);
    buffers[0].writeUInt8(size === 256 ? 0 : size, entryOffset + 1);
    buffers[0].writeUInt8(0, entryOffset + 2);
    buffers[0].writeUInt8(0, entryOffset + 3);
    buffers[0].writeUInt16LE(1, entryOffset + 4);
    buffers[0].writeUInt16LE(32, entryOffset + 6);
    buffers[0].writeUInt32LE(png.length, entryOffset + 8);
    buffers[0].writeUInt32LE(offset, entryOffset + 12);
    offset += png.length;
    buffers.push(png);
  });

  await fs.writeFile(icoOutput, Buffer.concat(buffers));
}
