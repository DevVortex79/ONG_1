// build.js
import fs from 'fs';
import path from 'path';
import { minify as minifyHtml } from 'html-minifier-terser';
import { minify as minifyJs } from 'terser';

// --- PASTAS ---
const distDir = path.join(process.cwd(), 'dist');
const jsDir = path.join(process.cwd(), 'Js');  
const cssDir = path.join(process.cwd(), 'Css'); 

// Cria dist se não existir
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// --- MINIFICA TODOS OS HTMLs ---
const htmlFiles = fs.readdirSync(process.cwd()).filter(f => f.endsWith('.html'));

for (const file of htmlFiles) {
  const htmlPath = path.join(process.cwd(), file);
  const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
  const minifiedHtml = await minifyHtml(htmlContent, {
    collapseWhitespace: true,
    removeComments: true,
    removeAttributeQuotes: true,
    minifyJS: true,
    minifyCSS: true,
  });
  fs.writeFileSync(path.join(distDir, file), minifiedHtml);
  console.log(`HTML minificado: ${file}`);
}
