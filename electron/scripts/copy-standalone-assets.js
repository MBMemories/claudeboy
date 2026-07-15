// Next.js "standalone" output doesn't include public/ or .next/static — copy
// them in manually so the packaged server can serve assets. Run after `next build`.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const standalone = path.join(root, ".next", "standalone");

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (!fs.existsSync(standalone)) {
  console.error('.next/standalone not found — did "next build" run with output: "standalone"?');
  process.exit(1);
}

copyDir(path.join(root, ".next", "static"), path.join(standalone, ".next", "static"));

const publicDir = path.join(root, "public");
if (fs.existsSync(publicDir)) {
  copyDir(publicDir, path.join(standalone, "public"));
}

console.log("Copied static assets into .next/standalone for Electron packaging.");
