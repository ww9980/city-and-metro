const fs = require('fs'), vm = require('vm');
const CM = {}; const ctx = { window: { CM }, console };
vm.createContext(ctx); vm.runInContext(fs.readFileSync('js/geo_ta.js', 'utf8'), ctx);
const G = CM.GEOS.ta;
function dec(s, from = 0) { const out = []; let i = from, x = 0, y = 0; while (i < s.length) { let r = 0, sh = 0, b; do { b = s.charCodeAt(i++) - 63; r |= (b & 31) << sh; sh += 5; } while (b >= 32); x += (r & 1) ? ~(r >> 1) : (r >> 1); r = 0; sh = 0; do { b = s.charCodeAt(i++) - 63; r |= (b & 31) << sh; sh += 5; } while (b >= 32); y += (r & 1) ? ~(r >> 1) : (r >> 1); out.push(x / 64, y / 64); } return out; }
for (const row of G.reserves) {
  const name = G.names[row[0]];
  for (let k = 1; k < row.length; k++) {
    const p = dec(row[k], 1);
    const pts = [];
    for (let q = 0; q < p.length; q += 2) if (p[q + 1] > 20) pts.push([+p[q].toFixed(2), +p[q + 1].toFixed(2)]);
    if (pts.length) console.log(name, 'ring', k, 'minx/maxx', Math.min(...pts.map(p => p[0])), Math.max(...pts.map(p => p[0])), JSON.stringify(pts));
  }
}
console.log('\nRing 0 (outer) south boundary points, all x:');
for (const row of G.reserves) {
  const p = dec(row[1], 1);
  const pts = [];
  for (let q = 0; q < p.length; q += 2) if (p[q + 1] > 20) pts.push([+p[q].toFixed(2), +p[q + 1].toFixed(2)]);
  console.log(G.names[row[0]], pts.length, JSON.stringify(pts));
}
