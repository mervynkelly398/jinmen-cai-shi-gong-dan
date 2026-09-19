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
  assert.match(html, /0353e3190be4eedc358080fff542733b\.jpg/);
  assert.match(html, /744629eb1e0bfd93828b131a7dc852b1\.jpg/);
  assert.match(html, /@media\s*\(max-width:\s*640px\)/);
});

test('references the supplied background and logo files', async () => {
  await access(path.join(root, '0353e3190be4eedc358080fff542733b.jpg'));
  await access(path.join(root, '744629eb1e0bfd93828b131a7dc852b1.jpg'));
});

test('shows the complete logo without cover-cropping', async () => {
  const html = await readFile(indexPath, 'utf8');

  assert.match(html, /\.brand-mark img\s*\{[^}]*object-fit:\s*contain/s);
  assert.doesNotMatch(html, /\.brand-mark img\s*\{[^}]*object-fit:\s*cover/s);
});

test('includes the supplied feather-duster product images', async () => {
  const html = await readFile(indexPath, 'utf8');
  const productImages = [
    'product-brown-optimized.jpg',
    '271789ec439ed42d5f75ce207170bb2b.jpg',
    'product-red-optimized.jpg',
  ];

  for (const image of productImages) {
    assert.match(html, new RegExp(image));
    await access(path.join(root, image));
  }
});

test('uses lightweight versions of the two large product photos', async () => {
  const html = await readFile(indexPath, 'utf8');
  const optimizedImages = ['product-brown-optimized.jpg', 'product-red-optimized.jpg'];

  assert.doesNotMatch(html, /00990c52c9fe9298dff5c937b4ea132f\.png/);
  assert.doesNotMatch(html, /89b0ecba6ed15aa7d9d1f64fcad9e56a\.png/);
  for (const image of optimizedImages) {
    const file = await stat(path.join(root, image));
    assert.ok(file.size < 500_000, `${image} should remain under 500 KB`);
  }
});

test('shows the supplied intangible cultural heritage certificate', async () => {
  const html = await readFile(indexPath, 'utf8');
  const certificate = 'd1d5d651ad455d471a2f7c15258f4a35.jpg';

  assert.match(html, new RegExp(`<img[^>]+src="${certificate}"[^>]+alt="天津市非物质文化遗产证书"`));
  assert.match(html, /非遗认证/);
  assert.match(html, /<section class="section value"[^>]*>[\s\S]*d1d5d651ad455d471a2f7c15258f4a35\.jpg[\s\S]*<\/section>/);
  await access(path.join(root, certificate));
});
