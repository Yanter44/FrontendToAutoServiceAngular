import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modalsDir = path.resolve(__dirname, '../src/app/features/admin/modals');

for (const folder of fs.readdirSync(modalsDir)) {
  const html = path.join(modalsDir, folder, `${folder}.component.html`);
  if (!fs.existsSync(html)) continue;
  let text = fs.readFileSync(html, 'utf8');
  text = text.replace(/isOpen\('[^']+'\)/g, 'isOpen()');
  text = text.replace(/closeFromOverlay\(\$event, '[^']+'\)/g, 'closeFromOverlay($event)');
  text = text.replace(/\bui\./g, 'modal.');
  fs.writeFileSync(html, text);
  console.log('patched', folder);
}
