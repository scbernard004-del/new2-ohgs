import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Validate the files Vercel actually receives, not just their references in a local checkout.
export function verifyVideoMedia(root = process.cwd()) {
  root = path.resolve(root);
  const files = new Map();
  const pages = fs.readdirSync(root).filter(name => name.endsWith('.html'));
  for (const name of pages) {
    const html = fs.readFileSync(path.join(root, name), 'utf8');
    for (const tag of html.matchAll(/<video\b[^>]*>/gi)) {
      for (const attr of tag[0].matchAll(/\b(data-video-src|data-mobile-src|data-poster|poster)\s*=\s*(["'])(.*?)\2/gi)) {
        if (/^(https?:|data:)/i.test(attr[3])) continue;
        const asset = decodeURIComponent(attr[3].split(/[?#]/)[0]).replace(/^\//, '');
        const kind = /src$/.test(attr[1]) ? 'video' : 'poster';
        files.set(asset, kind);
      }
    }
  }
  if (!files.size) throw new Error('No video files were found in the website pages.');
  const errors = [];
  const assets = [];
  for (const [name, kind] of files) {
    const full = path.resolve(root, name);
    if (!full.startsWith(root + path.sep) || !fs.existsSync(full) || !fs.statSync(full).isFile()) {
      errors.push(`${name}: missing. Upload the media folder containing the actual videos and posters.`);
      continue;
    }
    const size = fs.statSync(full).size;
    const descriptor = fs.openSync(full, 'r');
    const first = Buffer.alloc(Math.min(160, size));
    fs.readSync(descriptor, first, 0, first.length, 0);
    fs.closeSync(descriptor);
    if (first.toString('utf8').startsWith('version https://git-lfs.github.com/spec/v1')) {
      errors.push(`${name}: Git LFS pointer found instead of the actual video. Upload the real MP4 file.`);
      continue;
    }
    const valid = kind === 'video'
      ? size > 1024 && first.toString('ascii', 4, 8) === 'ftyp'
      : size > 64 && (first.toString('ascii', 0, 4) === 'RIFF' && first.toString('ascii', 8, 12) === 'WEBP');
    if (!valid) errors.push(`${name}: not a valid ${kind === 'video' ? 'MP4 video' : 'WebP poster'} file.`);
    assets.push({ path: name, kind, bytes: size, type: kind === 'video' ? 'video/mp4' : 'image/webp' });
  }
  if (errors.length) throw new Error('OHGS media upload is incomplete:\n' + errors.map(error => '- ' + error).join('\n'));
  const release = fs.readFileSync(path.join(root, 'version-check.txt'), 'utf8').match(/^OHGS RELEASE (v\d+-[a-z0-9-]+)/)?.[1];
  if (!release) throw new Error('The website release marker is missing.');
  return { release, videoFiles: assets.filter(asset => asset.kind === 'video').length, posterFiles: assets.filter(asset => asset.kind === 'poster').length, assets: assets.sort((a, b) => a.path.localeCompare(b.path)) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const manifest = verifyVideoMedia();
  fs.writeFileSync('ohgs-video-manifest.json', JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Video upload check passed: ${manifest.videoFiles} MP4 files and ${manifest.posterFiles} posters are present and have valid file headers.`);
}
