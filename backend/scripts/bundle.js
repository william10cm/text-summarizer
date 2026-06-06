const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const functions = ['summarize-text', 'summarize-url', 'list-history'];
const zipDir = path.join(__dirname, '../zips');

if (!fs.existsSync(zipDir)) fs.mkdirSync(zipDir);

functions.forEach(fn => {
  const zipPath = path.join(zipDir, `${fn}.zip`);

  // Zip from inside the dist folder so paths are preserved correctly
  const distPath = path.join(__dirname, '../dist');

  execSync(
    `powershell Compress-Archive -Force -Path "${distPath}\\*" -DestinationPath "${zipPath}"`
  );

  console.log(`✓ Zipped ${fn} → zips/${fn}.zip`);
});