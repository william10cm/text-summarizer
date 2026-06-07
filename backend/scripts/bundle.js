const { execSync } = require('child_process');
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const functions = ['summarize-text', 'summarize-url', 'list-history'];
const zipDir = path.join(__dirname, '../zips');
const buildDir = path.join(__dirname, '../build');

if (!fs.existsSync(zipDir)) fs.mkdirSync(zipDir);

async function run() {
  for (const fn of functions) {
    const outDir = path.join(buildDir, fn);
    const entry = path.join(__dirname, '..', 'functions', fn, 'index.ts');
    const outFile = path.join(outDir, 'index.js');

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
    execSync(
      `powershell Compress-Archive -Force -Path "${outDir}\\*" -DestinationPath "${zipPath}"`
    );

    console.log(`✓ Bundled + zipped ${fn} → zips/${fn}.zip`);
  }
}

run();