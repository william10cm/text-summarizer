const esbuild = require('esbuild');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

const functions = ['summarize-text', 'summarize-url', 'list-history'];
const zipDir = path.join(__dirname, '../zips');
const buildDir = path.join(__dirname, '../build');

if (!fs.existsSync(zipDir)) fs.mkdirSync(zipDir, { recursive: true });

function zipFile(srcFile, zipPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', resolve);
    archive.on('error', reject);

    archive.pipe(output);
    // Place the bundle as a flat index.js at the root of the zip so the
    // Lambda handler "index.handler" resolves correctly.
    archive.file(srcFile, { name: 'index.js' });
    archive.finalize();
  });
}

async function run() {
  for (const fn of functions) {
    const entry = path.join(__dirname, '..', 'functions', fn, 'index.ts');
    const outFile = path.join(buildDir, fn, 'index.js');

    await esbuild.build({
      entryPoints: [entry],
      bundle: true,
      platform: 'node',
      target: 'node22',
      format: 'cjs',
      outfile: outFile,
      external: ['@aws-sdk/*'],
    });

    const zipPath = path.join(zipDir, `${fn}.zip`);
    await zipFile(outFile, zipPath);

    console.log(`✓ Bundled + zipped ${fn} → zips/${fn}.zip`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
