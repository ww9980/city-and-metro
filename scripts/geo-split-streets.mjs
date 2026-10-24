// 修正 geo_<id>.js 的道路/街道分层：游戏约定 roads 只放 2/3/4 级道路，
// 1 级支路（residential 等）必须放在 streets（render.js 的 lay 只有 2/3/4 三个键）。
// 早期用 geo-import.mjs 生成的图把 1 级道路写进了 roads，会导致绘制时崩溃。
// 用法：node scripts/geo-split-streets.mjs js/geo_ld.js js/geo_jn.js ...
import { readFileSync, writeFileSync } from 'node:fs';

let bad = 0;
for (const file of process.argv.slice(2)) {
  const txt = readFileSync(file, 'utf8');
  const rStart = txt.indexOf('    roads: [');
  if (rStart < 0) { console.error(`${file}: 找不到 roads 块`); bad++; continue; }
  const rEnd = txt.indexOf('\n    ],', rStart);
  if (rEnd < 0) { console.error(`${file}: roads 块没有结束`); bad++; continue; }
  const block = txt.slice(rStart, rEnd + 7);
  const lines = block.split('\n');
  const roads = [], streets = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t.startsWith('[')) continue;
    let row;
    try { row = JSON.parse(t.replace(/,$/, '')); }
    catch (e) { console.error(`${file}: 无法解析行 ${t.slice(0, 40)}`); bad++; continue; }
    const cls = row[1], enc = row[3];
    if (typeof enc !== 'string') continue;
    if (cls >= 2) roads.push(row); else streets.push(enc);
  }
  if (!roads.length) { console.error(`${file}: 没有 2–4 级道路，跳过`); bad++; continue; }
  // streets 行：找 roads 块之后的第一处 streets: 行
  const sStart = txt.indexOf('    streets:', rEnd);
  if (sStart < 0) { console.error(`${file}: 找不到 streets 行`); bad++; continue; }
  const sEnd = txt.indexOf('\n', sStart);
  const oldStreets = txt.slice(sStart, sEnd);
  const merged = oldStreets.match(/streets: "((?:[^"\\]|\\.)*)"/);
  // 保留原有的 streets（若有），与新拆出的 1 级道路合并
  let existing = '';
  if (merged && merged[1]) { try { existing = JSON.parse('"' + merged[1] + '"'); } catch (e) { existing = ''; } }
  const allStreets = (existing ? existing.split('!') : []).concat(streets);
  const newStreets = '    streets: ' + JSON.stringify(allStreets.join('!')) + ',';
  const out = txt.slice(0, rStart) +
    '    roads: [\n' + roads.map(r => '      ' + JSON.stringify(r) + ',').join('\n') + '\n    ],' +
    txt.slice(rEnd + 7, sStart) + newStreets + txt.slice(sEnd);
  writeFileSync(file, out);
  console.log(`${file}: 道路 ${roads.length} 条（2–4 级），移入街道 ${streets.length} 段，街道总长 ${(allStreets.join('!').length / 1024).toFixed(0)} KB，文件 ${(out.length / 1024).toFixed(0)} KB`);
}
if (bad) process.exit(1);
