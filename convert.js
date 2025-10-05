const fs = require('fs');
const marked = require('marked');
const path = require('path');

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function convertToHtml(mdPath, targetPath) {
  const md = fs.readFileSync(mdPath, 'utf-8');
  const html = marked.parse(md);
  const template = fs.readFileSync('src/template.html', 'utf-8');
  
  ensureDirectoryExists(path.dirname(targetPath));
  fs.writeFileSync(targetPath, template.replace('{{content}}', html));
}

const guidelines = [
  '01-component-guidelines.md',
  '02-scss-guidelines.md',
  '03-template-guidelines.md',
  '04-store-ngrx-guidelines.md',
  '05-services-guidelines.md',
  '06-directives-pipes-guidelines.md'
];

guidelines.forEach(file => {
  const sourcePath = path.join('src/guidelines', file);
  const targetPath = path.join('docs/guidelines', file.replace('.md', '.html'));
  if (fs.existsSync(sourcePath)) {
    convertToHtml(sourcePath, targetPath);
    console.log(`Converted ${sourcePath} to ${targetPath}`);
  }
});

const processFiles = ['pr-submission-process.md'];
processFiles.forEach(file => {
  const sourcePath = path.join('src/process', file);
  const targetPath = path.join('docs/process', file.replace('.md', '.html'));
  if (fs.existsSync(sourcePath)) {
    convertToHtml(sourcePath, targetPath);
    console.log(`Converted ${sourcePath} to ${targetPath}`);
  }
});