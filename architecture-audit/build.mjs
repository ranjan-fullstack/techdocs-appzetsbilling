// Builds standalone part pages (parts/NN-*.html) and, with --combine, one combined document.
// Bodies live in src/NN-*.body.html, one per top-level section of the source audit doc.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(dir, 'src');
// Output goes into the docs site's public/ folder so it ships with the site (Vite copies public/ to dist/).
const outRoot = path.join(dir, '..', 'public', 'reports', 'architecture-audit');
const out = path.join(outRoot, 'parts');
const css = fs.readFileSync(path.join(src, 'style.css'), 'utf8');

const MERMAID = `<script src="https://cdnjs.cloudflare.com/ajax/libs/mermaid/11.4.1/mermaid.min.js"></script><script>if(window.mermaid){mermaid.initialize({startOnLoad:true,theme:'base',securityLevel:'loose',themeVariables:{fontFamily:'IBM Plex Mono, monospace'}})}</script>`;

const files = fs.readdirSync(src).filter((f) => /^\d\d-.*\.body\.html$/.test(f)).sort();
const meta = files.map((f) => {
  const html = fs.readFileSync(path.join(src, f), 'utf8');
  const m = html.match(/<!--TITLE:(.*?)-->/);
  return { id: f.replace('.body.html', ''), title: (m ? m[1] : f).trim(), html: html.replace(/<!--TITLE:.*?-->/, '') };
});
const nav = (cur) => `<nav class="parts">${meta.map((m) => `<a class="${m.id === cur ? 'cur' : ''}" href="${m.id}.html">${m.title}</a>`).join('')}</nav>`;
const shell = (title, inner, mermaid) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><script>if(window.self!==window.top)document.documentElement.classList.add("embedded")</script><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${css}</style></head><body><div class="wrap">${inner}<footer>AppZetBilling Web + Mobile Architecture Audit - generated ${new Date().toISOString().slice(0, 10)} - read-only research; nothing on the server was changed.</footer></div>${mermaid ? MERMAID : ''}</body></html>`;

fs.mkdirSync(out, { recursive: true });
for (const m of meta) {
  const mermaid = m.html.includes('class="mermaid"');
  fs.writeFileSync(path.join(out, m.id + '.html'), shell(m.title, `<header class="top"><div class="k">AppZetBilling architecture audit - part ${m.id.slice(0, 2)} of ${meta.length}</div><h1>${m.title}</h1>${nav(m.id)}</header>${m.html}`, mermaid));
}
console.log('parts:', meta.length);

if (process.argv.includes('--combine')) {
  const toc = `<nav class="parts">${meta.map((m) => `<a href="#${m.id}">${m.title}</a>`).join('')}</nav>`;
  const secs = meta.map((m, i) => `<section id="${m.id}" class="${i ? 'part-sep' : ''}"><div class="k">PART ${m.id.slice(0, 2)}</div><h1>${m.title}</h1>${m.html}</section>`).join('\n');
  const anyMermaid = meta.some((m) => m.html.includes('class="mermaid"'));
  fs.writeFileSync(path.join(outRoot, 'AppZetBilling-Architecture-Audit-Combined.html'), shell('AppZetBilling - Web + Mobile Architecture Audit',
    `<header class="top"><div class="k">AppZetBilling</div><h1>Web + Mobile Architecture Audit</h1><p class="sub">Combined report - ${meta.length} parts</p>${toc}</header>${secs}`, anyMermaid));
  console.log('combined written');
}
