import { constants } from 'node:fs';
import { access, cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const vendorDir = path.join(rootDir, 'assets', 'vendor');
const nodeModulesDir = path.join(rootDir, 'node_modules');

async function exists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function cleanDir(relativeDir) {
  const target = path.join(rootDir, relativeDir);
  await rm(target, { force: true, recursive: true });
  await mkdir(target, { recursive: true });
}

async function copyFile(relativeSource, relativeTarget) {
  const source = path.join(nodeModulesDir, relativeSource);
  if (!(await exists(source))) {
    throw new Error(`Missing source file: ${relativeSource}`);
  }

  const target = path.join(rootDir, relativeTarget);
  await mkdir(path.dirname(target), { recursive: true });
  await cp(source, target);
}

async function copyFileIfExists(relativeSource, relativeTarget) {
  const source = path.join(nodeModulesDir, relativeSource);
  if (!(await exists(source))) {
    return;
  }

  const target = path.join(rootDir, relativeTarget);
  await mkdir(path.dirname(target), { recursive: true });
  await cp(source, target);
}

async function copyDir(relativeSource, relativeTarget) {
  const source = path.join(nodeModulesDir, relativeSource);
  if (!(await exists(source))) {
    throw new Error(`Missing source directory: ${relativeSource}`);
  }

  const target = path.join(rootDir, relativeTarget);
  await cp(source, target, { recursive: true });
}

async function syncBootstrap() {
  await cleanDir('assets/vendor/bootstrap/css');
  await cleanDir('assets/vendor/bootstrap/js');
  await copyDir('bootstrap/dist/css', 'assets/vendor/bootstrap/css');
  await copyDir('bootstrap/dist/js', 'assets/vendor/bootstrap/js');
}

async function syncBootstrapIcons() {
  await cleanDir('assets/vendor/bootstrap-icons');
  await copyFile('bootstrap-icons/font/bootstrap-icons.css', 'assets/vendor/bootstrap-icons/bootstrap-icons.css');
  await copyFile('bootstrap-icons/font/bootstrap-icons.min.css', 'assets/vendor/bootstrap-icons/bootstrap-icons.min.css');
  await copyFileIfExists('bootstrap-icons/font/bootstrap-icons.scss', 'assets/vendor/bootstrap-icons/bootstrap-icons.scss');
  await copyFileIfExists('bootstrap-icons/font/bootstrap-icons.json', 'assets/vendor/bootstrap-icons/bootstrap-icons.json');
  await copyDir('bootstrap-icons/font/fonts', 'assets/vendor/bootstrap-icons/fonts');
}

async function syncAos() {
  await cleanDir('assets/vendor/aos');
  await copyDir('aos/dist', 'assets/vendor/aos');
}

async function syncWaypoints() {
  await cleanDir('assets/vendor/waypoints');
  await copyFile('waypoints/lib/noframework.waypoints.js', 'assets/vendor/waypoints/noframework.waypoints.js');
}

async function syncImagesLoaded() {
  await cleanDir('assets/vendor/imagesloaded');
  await copyFile('imagesloaded/imagesloaded.pkgd.min.js', 'assets/vendor/imagesloaded/imagesloaded.pkgd.min.js');
}

async function syncIsotope() {
  await cleanDir('assets/vendor/isotope-layout');
  await copyFile('isotope-layout/dist/isotope.pkgd.js', 'assets/vendor/isotope-layout/isotope.pkgd.js');
  await copyFile('isotope-layout/dist/isotope.pkgd.min.js', 'assets/vendor/isotope-layout/isotope.pkgd.min.js');
}

async function syncHtmx() {
  await cleanDir('assets/vendor/htmx');
  await copyFile('htmx.org/dist/htmx.min.js', 'assets/vendor/htmx/htmx.min.js');
  await copyFile('htmx.org/dist/ext/json-enc.js', 'assets/vendor/htmx/ext/json-enc.js');
}

async function syncAlpine() {
  await cleanDir('assets/vendor/alpinejs');
  await copyFile('alpinejs/dist/cdn.min.js', 'assets/vendor/alpinejs/cdn.min.js');
}

async function syncGlightbox() {
  await cleanDir('assets/vendor/glightbox');
  await copyFile('glightbox/dist/css/glightbox.min.css', 'assets/vendor/glightbox/css/glightbox.min.css');
  await copyFile('glightbox/dist/js/glightbox.min.js', 'assets/vendor/glightbox/js/glightbox.min.js');
}

async function syncSwiper() {
  await cleanDir('assets/vendor/swiper');
  await copyFile('swiper/swiper-bundle.min.css', 'assets/vendor/swiper/swiper-bundle.min.css');
  await copyFile('swiper/swiper-bundle.min.js', 'assets/vendor/swiper/swiper-bundle.min.js');
}

const syncTasks = [
  syncBootstrap,
  syncBootstrapIcons,
  syncAos,
  syncWaypoints,
  syncImagesLoaded,
  syncIsotope,
  syncHtmx,
  syncAlpine,
  syncGlightbox,
  syncSwiper
];

await mkdir(vendorDir, { recursive: true });

for (const syncTask of syncTasks) {
  await syncTask();
}

console.log('Vendor assets synced from node_modules.');
