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

// --- MINIFICA HTML ---
const htmlFile = path.join(process.cwd(), 'index.html'); 
const htmlContent = fs.readFileSync(htmlFile, 'utf-8');

const minifiedHtml = await minifyHtml(htmlContent, {
  collapseWhitespace: true,
  removeComments: true,
  removeAttributeQuotes: true,
  minifyJS: true,
  minifyCSS: true,
});

fs.writeFileSync(path.join(distDir, 'index.html'), minifiedHtml);
console.log('HTML minificado: index.html');

// --- MINIFICA JS ---
const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));

for (const file of jsFiles) {
  const filePath = path.join(jsDir, file);
  const jsContent = fs.readFileSync(filePath, 'utf-8');
  const minifiedJs = await minifyJs(jsContent, { compress: true, mangle: true });
  fs.writeFileSync(path.join(distDir, file), minifiedJs.code);
  console.log(`JS minificado: ${file}`);
}

// --- COPIA CSS ---
if (fs.existsSync(cssDir)) {
  const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
  for (const file of cssFiles) {
    fs.copyFileSync(path.join(cssDir, file), path.join(distDir, file));
    console.log(`CSS copiado: ${file}`);
  }
}

console.log('Build SPA concluído com sucesso!');
