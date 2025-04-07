const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const DEST_DIR = path.join(__dirname, '../dist');
const DEST_ZIP_DIR = path.join(__dirname, '../dist-zip');

const extractExtensionData = () => {
  const manifest = require('../dist/manifest.json');
  return {
    name: manifest.name.toLowerCase().replace(/\s/g, '-'),
    version: manifest.version
  };
};

const makeDestZipDirIfNotExists = () => {
  if (!fs.existsSync(DEST_ZIP_DIR)) {
    fs.mkdirSync(DEST_ZIP_DIR);
  }
};

const buildZip = (src, dist, zipFilename) => {
  console.log(`Building ${zipFilename}...`);

  const archive = archiver('zip', { zlib: { level: 9 }});
  const stream = fs.createWriteStream(path.join(dist, zipFilename));

  return new Promise((resolve, reject) => {
    archive
      .directory(src, false)
      .on('error', err => reject(err))
      .pipe(stream);

    stream.on('close', () => resolve());
    archive.finalize();
  });
};

const main = async () => {
  const { name, version } = extractExtensionData();
  const zipFilename = `${name}-v${version}.zip`;

  makeDestZipDirIfNotExists();

  try {
    await buildZip(DEST_DIR, DEST_ZIP_DIR, zipFilename);
    console.log('SUCCESS');
  } catch (err) {
    console.error('FAILED', err);
    process.exit(1);
  }
};

main(); 