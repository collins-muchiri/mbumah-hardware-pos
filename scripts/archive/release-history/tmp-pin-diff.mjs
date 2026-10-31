import fs from 'node:fs';
const map = fs.readFileSync('src/components/org/variance-map.tsx', 'utf8');
const test = fs.readFileSync('src/tests/teeth-v2236.test.ts', 'utf8');
const mapLine = map.split('\n').find(l => l.includes('Coverage: ${voice}')).trim();
const testLine = test.split('\n').find(l => l.includes('Coverage: ${voice}')).trim();
console.log('MAP :', JSON.stringify(mapLine));
console.log('TEST:', JSON.stringify(testLine));
// extract the literal between includes(' and ') manually
const start = testLine.indexOf("includes('") + "includes('".length;
const end = testLine.lastIndexOf("')")
const raw = testLine.slice(start, end);
// simulate JS single-quote unescape
const un = raw.replace(/\\'/g, "'");
console.log('UNESC:', JSON.stringify(un));
console.log('MATCH:', mapLine.includes(un));
