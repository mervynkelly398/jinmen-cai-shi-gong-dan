import assert from 'node:assert/strict';
import { readFile, access, stat } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = path.join(root, 'index.html');

test('provides a self-contained, mobile-ready NFC landing page', async () => {
  const html = await readFile(indexPath, 'utf8');

  assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
  assert.match(html, /津门蔡氏贡掸/);
  assert.match(html, /品牌传承/);
  assert.match(html, /十八道传统工序/);
  assert.match(html, /宁折不散/);
  assert.match(html, /天津市第二批市级非物质文化遗产名录/);
  assert.doesNotMatch(html, /据提供的品牌申报材料/);
  assert.match(html, /hero-background\.webp/);
  assert.match(html, /brand-logo\.webp/);
  assert.match(html, /@media\s*\(max-width:\s*640px\)/);
});

test('references optimized background and logo files', async () => {
  await access(path.join(root, 'hero-background.webp'));
  await access(path.join(root, 'brand-logo.webp'));
});

test('shows the complete logo without cover-cropping', async () => {
  const html = await readFile(indexPath, 'utf8');

  assert.match(html, /\.brand-mark img\s*\{[^}]*object-fit:\s*contain/s);
  assert.doesNotMatch(html, /\.brand-mark img\s*\{[^}]*object-fit:\s*cover/s);
});

test('includes the supplied feather-duster product images', async () => {
  const html = await readFile(indexPath, 'utf8');
  const productImages = [
    'product-brown.webp',
    'product-white.webp',
    'product-red.webp',
  ];

  for (const image of productImages) {
    assert.match(html, new RegExp(image));
    await access(path.join(root, image));
  }
});

test('uses lightweight WebP files for every displayed image', async () => {
  const html = await readFile(indexPath, 'utf8');
  const optimizedImages = [
    'hero-background.webp',
    'brand-logo.webp',
    'product-brown.webp',
    'product-red.webp',
    'product-white.webp',
    'heritage-certificate.webp',
  ];

  assert.doesNotMatch(html, /(?:src=|url\()[^>)]*\.(?:png|jpe?g)/i);
  for (const image of optimizedImages) {
    const file = await stat(path.join(root, image));
    assert.match(html, new RegExp(image));
    assert.ok(file.size < 350_000, `${image} should remain under 350 KB`);
  }
});

test('shows the supplied intangible cultural heritage certificate', async () => {
  const html = await readFile(indexPath, 'utf8');
  const certificate = 'heritage-certificate.webp';

  assert.match(html, new RegExp(`<img[^>]+src="${certificate}"[^>]+alt="天津市非物质文化遗产证书"`));
  assert.match(html, /非遗认证/);
  assert.match(html, /<section class="section value"[^>]*>[\s\S]*heritage-certificate\.webp[\s\S]*<\/section>/);
  await access(path.join(root, certificate));
});
