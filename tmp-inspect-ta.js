const fs = require('fs'), vm = require('vm');
const CM = {}; const ctx = { window: { CM }, console };
vm.createContext(ctx); vm.runInContext(fs.readFileSync('js/geo_ta.js', 'utf8'), ctx);
const G = CM.GEOS.ta;
function dec(s, from = 0) { const out = []; let i = from, x = 0, y = 0; while (i < s.length) { let r = 0, sh = 0, b; do { b = s.charCodeAt(i++) - 63; r |= (b & 31) << sh; sh += 5; } while (b >= 32); x += (r & 1) ? ~(r >> 1) : (r >> 1); r = 0; sh = 0; do { b = s.charCodeAt(i++) - 63; r |= (b & 31) << sh; sh += 5; } while (b >= 32); y += (r & 1) ? ~(r >> 1) : (r >> 1); out.push(x / 64, y / 64); } return out; }
function bbox(p) { let b = [1e9, 1e9, -1e9, -1e9]; for (let k = 0; k < p.length; k += 2) { b[0] = Math.min(b[0], p[k]); b[1] = Math.min(b[1], p[k + 1]); b[2] = Math.max(b[2], p[k]); b[3] = Math.max(b[3], p[k + 1]); } return b; }
console.log('Reserves:');
for (const row of G.reserves) { const name = G.names[row[0]]; let bb = [1e9, 1e9, -1e9, -1e9]; for (let k = 1; k < row.length; k++) { const p = dec(row[k], 1); const b = bbox(p); bb = [Math.min(bb[0], b[0]), Math.min(bb[1], b[1]), Math.max(bb[2], b[2]), Math.max(bb[3], b[3])]; } console.log(JSON.stringify(name), bb.map(n => n.toFixed(2)).join(',')); }
console.log('\nRoads:');
for (const r of G.roads) { const name = G.names[r[0]]; if (/环山路|青年路|财源街|东岳大街|红门路|岱宗大街/.test(name)) { const p = dec(r[3]); const b = bbox(p); console.log(JSON.stringify(name), 'cls=' + r[1], 'flags=' + r[2], b.map(n => n.toFixed(2)).join(','), 'npts=' + (p.length / 2)); } }
console.log('\nPlaces relevant:');
for (const p of G.places) { if (/青年|财源|山东科技|泰山医学院|红门|天外村|岱庙|泰安/.test(p[0])) console.log(p); }
console.log('\nReserve vertices south (j>20):');
for (const row of G.reserves) { const name = G.names[row[0]]; if (name !== '泰山风景名胜区') continue; for (let k = 1; k < row.length; k++) { const p = dec(row[k], 1); const pts = []; for (let q = 0; q < p.length; q += 2) if (p[q + 1] > 20) pts.push([p[q], p[q + 1]]); if (pts.length) console.log(name, 'ring', k, JSON.stringify(pts)); } }
