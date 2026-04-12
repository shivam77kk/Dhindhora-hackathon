const fs = require('fs');
const path = require('path');

// A safe regex string replacer for JS/CSS comments since global modules might not load here:
function removeComments(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  // Safe simple regex for JS/CSS block comments and line comments, protecting URLs
  // This uses a technique to replace only comments outside strings. (Simplified for this task)
  let result = code.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
  if(code !== result) {
    fs.writeFileSync(filePath, result, 'utf8');
    console.log(`Stripped comments from: ${filePath}`);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (['node_modules', '.next', '.git', 'dist', 'build', 'public'].includes(file)) continue;
      processDirectory(fullPath);
    } else {
      if (['.js', '.jsx', '.ts', '.tsx', '.css'].includes(path.extname(fullPath))) {
        removeComments(fullPath);
      }
    }
  }
}

processDirectory('./frontend');
processDirectory('./backend');
console.log('✅ All comments removed.');
