#!/usr/bin/env node
// Compute SRI hashes for the CDN scripts referenced in index.html.
// Usage: node scripts/compute-sri.mjs
// Output: a snippet you can paste into <script integrity="...">.

import crypto from 'node:crypto';

const urls = [
  'https://unpkg.com/react@18.3.1/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone@7.29.0/babel.min.js',
];

for (const url of urls) {
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  const hash = crypto.createHash('sha384').update(buf).digest('base64');
  console.log(`${url}\n  integrity="sha384-${hash}"\n`);
}
