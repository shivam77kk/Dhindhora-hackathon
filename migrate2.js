const fs = require('fs');
const path = require('path');

const features = [
  'dashboard',
  'leaderboard',
  'explore',
  'community'
];

function copyFolderSync(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach(element => {
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);
    if (fs.lstatSync(fromPath).isFile()) {
      let content = fs.readFileSync(fromPath, 'utf8');
      content = processContent(content);
      fs.writeFileSync(toPath, content);
    } else {
      copyFolderSync(fromPath, toPath);
    }
  });
}

function processContent(content) {
  return content
    .replace(/'use client';\n/g, '')
    .replace(/"use client";\n/g, '')
    .replace(/@\/components\/layout\/Navbar/g, './components/Navbar')
    .replace(/@\/components\//g, './components/')
    .replace(/next\/dynamic/g, 'react') // naive
    .replace(/next\/link/g, 'react-router-dom')
    .replace(/next\/image/g, 'react')
    .replace(/import dynamic from 'react';/g, '')
    .replace(/dynamic\(\(\) => import\((.*?)\), .*?\)/g, 'require($1).default');
}

features.forEach(feature => {
  console.log(`Migrating ${feature}...`);
  const srcAppDir = path.join(__dirname, `dhindhora-${feature}`, 'src');
  
  if (!fs.existsSync(srcAppDir)) fs.mkdirSync(srcAppDir, { recursive: true });

  // Copy page.js to App.jsx
  const pagePath = path.join(__dirname, 'frontend', 'app', feature, 'page.js');
  if (fs.existsSync(pagePath)) {
    let content = fs.readFileSync(pagePath, 'utf8');
    content = processContent(content);
    
    // Add Link polyfill if it uses Next.js Link
    if (content.includes('import Link from')) {
      content = content.replace(/import Link from 'react-router-dom';/g, 'import { Link } from "react-router-dom";');
    }
    
    // Add a basic Navbar mock if it imports it
    if (content.includes('./components/Navbar')) {
       const navMock = `export default function Navbar() { return <nav style={{padding: 20, color: 'white'}}>Navbar</nav>; }\n`;
       fs.mkdirSync(path.join(srcAppDir, 'components'), {recursive: true});
       fs.writeFileSync(path.join(srcAppDir, 'components', 'Navbar.jsx'), navMock);
    }

    fs.writeFileSync(path.join(srcAppDir, 'App.jsx'), content);
  }

  // Create basic main.jsx
  const mainJsx = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
`;
  fs.writeFileSync(path.join(srcAppDir, 'main.jsx'), mainJsx);
  
  // Copy index.css and tailwind setup from frontend
  const globalCss = fs.readFileSync(path.join(__dirname, 'frontend', 'app', 'globals.css'), 'utf8');
  fs.writeFileSync(path.join(srcAppDir, 'index.css'), globalCss);
  
  const twConfig = fs.readFileSync(path.join(__dirname, 'frontend', 'tailwind.config.js'), 'utf8');
  fs.writeFileSync(path.join(__dirname, `dhindhora-${feature}`, 'tailwind.config.js'), twConfig);
  
  const pcConfig = fs.readFileSync(path.join(__dirname, 'frontend', 'postcss.config.js'), 'utf8');
  fs.writeFileSync(path.join(__dirname, `dhindhora-${feature}`, 'postcss.config.js'), pcConfig);
});

console.log('Migration complete!');
