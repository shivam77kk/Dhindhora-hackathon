import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
const models = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_expression_model-weights_manifest.json',
  'face_expression_model-shard1'
];

const destDir = path.join(__dirname, 'public', 'models');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const downloadFile = (file) => {
  return new Promise((resolve, reject) => {
    const destPath = path.join(destDir, file);
    const fileStream = fs.createWriteStream(destPath);
    console.log(`Downloading ${file}...`);
    https.get(baseUrl + file, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${file}' (${response.statusCode})`));
        return;
      }
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Downloaded ${file}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      console.error(`Error downloading ${file}: ${err.message}`);
      reject(err);
    });
  });
};

const main = async () => {
  for (const file of models) {
    await downloadFile(file);
  }
  console.log('All models downloaded successfully!');
};

main();
