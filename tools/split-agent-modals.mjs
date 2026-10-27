import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(__dirname, '../src/app/features/agent/modals');
const html = fs.readFileSync(path.join(src, 'agent-modals-host/agent-modals.component.html'), 'utf8');
const sections = html.split(/(?=<section[\s>])/).filter(s => s.trim().startsWith('<section'));

const map = [
  { match: 'CreateApplication', folder: 'create-application-modal' },
  { match: 'AddTsPhotoModal', folder: 'add-ts-photo-modal' },
  { match: 'AddTsDocumentModal', folder: 'add-ts-document-modal' }
];

for (const section of sections) {
  const item = map.find(entry => section.includes(entry.match));
  if (!item) {
    console.warn('unmapped agent section');
    continue;
  }
  const dir = path.join(src, item.folder);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${item.folder}.component.html`), section.trim() + '\n');
  console.log('wrote', item.folder);
}
