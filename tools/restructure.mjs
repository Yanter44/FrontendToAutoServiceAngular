/**
 * Mechanical restructure: move components into folders, split admin modal HTML, rewrite imports.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = path.join(root, 'src', 'app');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function moveFile(from, to) {
  ensureDir(path.dirname(to));
  if (!fs.existsSync(from)) {
    console.warn('missing', from);
    return;
  }
  fs.renameSync(from, to);
}

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

function rewriteImports(file) {
  if (!file.endsWith('.ts') && !file.endsWith('.html')) return;
  let text = fs.readFileSync(file, 'utf8');
  const original = text;
  text = text.replace(/from '(\.\.\/)*core\/models'/g, (m, dots) => m.replace('core/models', 'core/model'));
  text = text.replace(/from "(\.\.\/)*core\/models"/g, (m) => m.replace('core/models', 'core/model'));
  text = text.replace(/from '\.\.\/models'/g, "from '../model'");
  text = text.replace(/from '\.\.\/\.\.\/core\/models'/g, "from '../../core/model'");
  text = text.replace(/from '\.\.\/\.\.\/\.\.\/core\/models'/g, "from '../../../core/model'");
  text = text.replace(/core\/services\/admin-state\.service/g, 'features/admin/data/admin-state.service');
  text = text.replace(/core\/services\/agent-state\.service/g, 'features/agent/data/agent-state.service');
  if (text !== original) fs.writeFileSync(file, text);
}

// --- move screens into folders ---
const adminScreens = [
  'applications-screen',
  'users-screen',
  'ptos-screen',
  'prompts-screen',
  'photo-gallery-screen',
  'requirements-screen',
  'neuron-networks-screen',
  'accruals-screen'
];
for (const name of adminScreens) {
  const dir = path.join(src, 'features/admin/screens', name);
  ensureDir(dir);
  moveFile(path.join(src, 'features/admin/screens', `${name}.component.ts`), path.join(dir, `${name}.component.ts`));
  moveFile(path.join(src, 'features/admin/screens', `${name}.component.html`), path.join(dir, `${name}.component.html`));
}

const agentScreens = ['applications-screen', 'finances-screen', 'branches-screen'];
for (const name of agentScreens) {
  const dir = path.join(src, 'features/agent/screens', name);
  ensureDir(dir);
  moveFile(path.join(src, 'features/agent/screens', `${name}.component.ts`), path.join(dir, `${name}.component.ts`));
  moveFile(path.join(src, 'features/agent/screens', `${name}.component.html`), path.join(dir, `${name}.component.html`));
}

// --- layout folders ---
ensureDir(path.join(src, 'features/admin/layout'));
moveFile(path.join(src, 'features/admin/admin-layout.component.ts'), path.join(src, 'features/admin/layout/admin-layout.component.ts'));
moveFile(path.join(src, 'features/admin/admin-layout.component.html'), path.join(src, 'features/admin/layout/admin-layout.component.html'));
moveFile(path.join(src, 'features/admin/admin-styles.ts'), path.join(src, 'features/admin/layout/admin-styles.ts'));

ensureDir(path.join(src, 'features/agent/layout'));
moveFile(path.join(src, 'features/agent/agent-layout.component.ts'), path.join(src, 'features/agent/layout/agent-layout.component.ts'));
moveFile(path.join(src, 'features/agent/agent-layout.component.html'), path.join(src, 'features/agent/layout/agent-layout.component.html'));

ensureDir(path.join(src, 'features/auth/authorize-page'));
moveFile(path.join(src, 'features/auth/authorize-page.component.ts'), path.join(src, 'features/auth/authorize-page/authorize-page.component.ts'));
moveFile(path.join(src, 'features/auth/authorize-page.component.html'), path.join(src, 'features/auth/authorize-page/authorize-page.component.html'));
moveFile(path.join(src, 'features/auth/authorize-page.component.css'), path.join(src, 'features/auth/authorize-page/authorize-page.component.css'));
moveFile(path.join(src, 'features/auth/role-redirect.component.ts'), path.join(src, 'features/auth/role-redirect/role-redirect.component.ts'));

ensureDir(path.join(src, 'features/invite/accept-invite-page'));
moveFile(path.join(src, 'features/invite/accept-invite-page.component.ts'), path.join(src, 'features/invite/accept-invite-page/accept-invite-page.component.ts'));
moveFile(path.join(src, 'features/invite/accept-invite-page.component.html'), path.join(src, 'features/invite/accept-invite-page/accept-invite-page.component.html'));

ensureDir(path.join(src, 'features/agent/modals/agent-modals-host'));
moveFile(path.join(src, 'features/agent/agent-modals.component.ts'), path.join(src, 'features/agent/modals/agent-modals-host/agent-modals.component.ts'));
moveFile(path.join(src, 'features/agent/agent-modals.component.html'), path.join(src, 'features/agent/modals/agent-modals-host/agent-modals.component.html'));

// --- split admin modal HTML ---
const htmlPath = path.join(src, 'features/admin/admin-modals.component.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const sections = html.split(/(?=<section\s)/).filter(s => s.trim().startsWith('<section'));
const idToFolder = {
  RedactPtoModal: 'redact-pto-modal',
  DeletePtoModal: 'delete-pto-modal',
  DeleteUserModal: 'delete-user-modal',
  RedactUserModal: 'redact-user-modal',
  RedactPromptModal: 'redact-prompt-modal',
  RedactNeuronNetworkModal: 'redact-neuron-network-modal',
  DeleteNeuronNetworkModal: 'delete-neuron-network-modal',
  DeletePromptModal: 'delete-prompt-modal',
  EditApplicationPhotoModal: 'edit-application-photo-modal',
  SelectGalleryPhotoModal: 'select-gallery-photo-modal',
  DeductBalanceModal: 'deduct-balance-modal',
  AccrualBalanceModal: 'accrual-balance-modal',
  AddNewNeuronNetworkModal: 'add-new-neuron-network-modal',
  AddNewPhotoToGalleryModal: 'add-new-photo-to-gallery-modal',
  AddNewPtoModal: 'add-new-pto-modal',
  InviteNewUserModal: 'invite-new-user-modal',
  AddNewPromptModal: 'add-new-prompt-modal',
  AddNewPhotoRequirementModal: 'add-new-photo-requirement-modal',
  AddNewDocumentRequirementModal: 'add-new-document-requirement-modal',
  EditPhotoRequirementModal: 'edit-photo-requirement-modal',
  DeletePhotoRequirementModal: 'delete-photo-requirement-modal',
  EditDocumentRequirementModal: 'edit-document-requirement-modal',
  DeleteDocumentRequirementModal: 'delete-document-requirement-modal'
};

for (const section of sections) {
  const match = section.match(/id="([^"]+)"/);
  if (!match) continue;
  const folder = idToFolder[match[1]];
  if (!folder) {
    console.warn('unmapped section', match[1]);
    continue;
  }
  const dir = path.join(src, 'features/admin/modals', folder);
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, `${folder}.component.html`), section.trim() + '\n');
}

// rewrite all ts/html imports
for (const file of walk(src)) rewriteImports(file);

console.log('restructure pass 1 done, sections', sections.length);
