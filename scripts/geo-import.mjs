// 把 OpenStreetMap（Overpass JSON）转换为游戏底图 js/geo_<name>.js。
// 用法：
//   node scripts/geo-import.mjs --name ld --W 120 --H 96 --lon0 -0.31645 --lat0 51.60780 --kx 277.2 --ky 445.28
// 输入：.tools/osm/<name>/*.json（由 scripts/fetch-osm.mjs 下载，或手工放入 Overpass 的 out geom 结果）
// 输出：js/geo_<name>.js，格式与 geo_tp.js 等一致：增量编码折线、1/64 格精度、格坐标。
// 数据 © OpenStreetMap 贡献者，ODbL。转换只做几何与分类，不改动原始语义。

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function arg(name, def) {
  const i = process.argv.indexOf('--' + name);
  return i > 0 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : def;
}
const name = arg('name') || 'ld';
const W = Number(arg('W') || 120);
const H = Number(arg('H') || 96);
const lon0 = Number(arg('lon0'));
const lat0 = Number(arg('lat0'));
const kx = Number(arg('kx') || 277.2);
const ky = Number(arg('ky') || 445.28);
if (!Number.isFinite(lon0) || !Number.isFinite(lat0)) {
  console.error('需要 --lon0 与 --lat0（地图左上角的经纬度）');
  process.exit(2);
}
// 大型水面（泰晤士河等）在 OSM 里多为关系，成员顺序不保证、环可能跨多个水体。
// 关系水面拼接不可靠时用 --no-relation-water 关闭，改用河流中心线（宽度见 waterWidth）。
const NO_REL_WATER = process.argv.includes('--no-relation-water');
// 简化容差（格）：约 6 m，肉眼不可见，能显著减小文件体积
const TOL_LINE = Number(arg('tol', '0.025'));
const TOL_POLY = Number(arg('tolpoly', '0.015'));
const TOL_ADMIN = Number(arg('toladmin', '0.05'));
const TOL_STREET = Number(arg('tolstreet', '0.06'));
// 公园/林地：无名且面积小于该格数（1 格 = 0.0625 km²）的绿地不写入，避免成千上万的街角花园撑大文件
const MIN_GREEN_CELLS = Number(arg('mingreen', '0'));
// 行政区等级映射：输出到游戏的哪个层级（游戏里 6/7 = 区，8 = 街道/里）。
// 伦敦的自治市在 OSM 是 8，需要改写为 6；中国的区是 6、街道是 8，保持原样。
const ADMIN_MAP = (function () {
  const s = arg('adminmap', '8:6,6:7,7:7');
  const m = {};
  for (const part of s.split(',')) { const kv = part.split(':'); if (kv.length === 2) m[Number(kv[0])] = Number(kv[1]); }
  return m;
})();
// 海岸线：给出一个确定在海里的探测点（纬度,经度），则把 natural=coastline 拼成海面多边形
const COAST = (function () {
  const s = arg('coast', '');
  if (!s) return null;
  const p = s.split(';')[0].split(',').map(Number);   // 第一个探测点（多点的完整列表见 COAST_PTS）
  return p.length === 2 && p.every(Number.isFinite) ? p : null;
})();
// 可以给多个「确定在海里」的探测点（分号分隔）：海面取各点泛洪结果的并集。
// 港湾被船闸、码头分成几块时，单点只能填到其中一块。
const COAST_PTS = (function () {
  const s = arg('coast', '');
  if (!s) return [];
  return s.split(';').map(function (t) { const p = t.split(',').map(Number); return p.length === 2 && p.every(Number.isFinite) ? p : null; }).filter(Boolean);
})();
const SEA_NAME = arg('seaname', '海');
// 海岸线闭合方式：sea = 用最长海岸链沿图边闭合（适合单侧海岸，如上海、东京）；
// land = 整幅地图减去陆地（每条海岸链向不含探测点的一侧闭合即得一块陆地，作为孔洞）。
// 半岛、多海湾的城市（利物浦、青岛、布里斯托尔）只有 land 模式能得到正确的海面。
const COAST_MODE = arg('coastmode', 'sea');

// ---------------- 投影 ----------------
const px = (lon) => (lon - lon0) * kx;
const py = (lat) => (lat0 - lat) * ky;

// ---------------- 增量编码（与 js/geo.js 的 Geo.enc 完全一致） ----------------
function enc(flat) {
  let s = '', pxs = 0, pys = 0;
  const put = (v) => { let u = v < 0 ? ~(v << 1) : (v << 1); while (u >= 32) { s += String.fromCharCode((32 | (u & 31)) + 63); u >>>= 5; } s += String.fromCharCode(u + 63); };
  for (let k = 0; k + 1 < flat.length; k += 2) {
    const x = Math.round(flat[k] * 64), y = Math.round(flat[k + 1] * 64);
    if (k > 0 && x === Math.round(flat[k - 2] * 64) && y === Math.round(flat[k - 1] * 64)) continue;
    put(x - pxs); put(y - pys); pxs = x; pys = y;
  }
  return s;
}

// ---------------- 折线简化（Douglas–Peucker，容差单位：格） ----------------
function rdp(pts, tol) {
  const n = pts.length / 2;
  if (n < 3) return pts;
  const keep = new Uint8Array(n); keep[0] = 1; keep[n - 1] = 1;
  const stack = [[0, n - 1]];
  const t2 = tol * tol;
  while (stack.length) {
    const [a, b] = stack.pop();
    const ax = pts[a * 2], ay = pts[a * 2 + 1], bx = pts[b * 2], by = pts[b * 2 + 1];
    const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
    let best = -1, bi = -1;
    for (let i = a + 1; i < b; i++) {
      const qx = pts[i * 2], qy = pts[i * 2 + 1];
      let d;
      if (L === 0) d = (qx - ax) * (qx - ax) + (qy - ay) * (qy - ay);
      else { let t = ((qx - ax) * dx + (qy - ay) * dy) / L; t = t < 0 ? 0 : t > 1 ? 1 : t; const ex = qx - ax - t * dx, ey = qy - ay - t * dy; d = ex * ex + ey * ey; }
      if (d > best) { best = d; bi = i; }
    }
    if (best > t2) { keep[bi] = 1; stack.push([a, bi], [bi, b]); }
  }
  const out = [];
  for (let i = 0; i < n; i++) if (keep[i]) out.push(pts[i * 2], pts[i * 2 + 1]);
  return out;
}

// 环的合理性：面积 / 周长 = 平均宽度。拼接失败（成员乱序、自相交）时面积趋近 0 而周长很大，
// 这类退化环会在水域掩膜里造成诡异的陆地/水面，直接丢弃。
function ringArea(flat) {
  const n = flat.length / 2;
  let a = 0;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = flat[i * 2], yi = flat[i * 2 + 1], xj = flat[j * 2], yj = flat[j * 2 + 1];
    a += xj * yi - xi * yj;
  }
  return Math.abs(a / 2);
}
function ringPlausible(flat) {
  const n = flat.length / 2;
  if (n < 3) return false;
  let a = 0, per = 0;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = flat[i * 2], yi = flat[i * 2 + 1], xj = flat[j * 2], yj = flat[j * 2 + 1];
    a += xj * yi - xi * yj;
    per += Math.hypot(xi - xj, yi - yj);
  }
  return Math.abs(a / 2) > per * 0.05;   // 平均宽度至少约 12 m
}

// ---------------- 命名表 ----------------
const names = ['']; const nameIdx = new Map();
function ni(s) {
  if (!s) return 0;
  const v = String(s).trim(); if (!v) return 0;
  let i = nameIdx.get(v); if (i == null) { i = names.length; names.push(v); nameIdx.set(v, i); }
  return i;
}

// ---------------- 载入 ----------------
const dir = path.join(root, '.tools', 'osm', name);
const files = (await readdir(dir)).filter(f => f.endsWith('.json') && !f.startsWith('_'));
const ways = new Map(), rels = new Map(), nodes = new Map();
for (const f of files) {
  const doc = JSON.parse(await readFile(path.join(dir, f), 'utf8'));
  for (const el of doc.elements || []) {
    if (el.type === 'way') ways.set(el.id, el);
    else if (el.type === 'relation') rels.set(el.id, el);
    else if (el.type === 'node') nodes.set(el.id, el);
  }
}
console.log(`载入 ${files.length} 个文件：${ways.size} way / ${rels.size} relation / ${nodes.size} node`);

const geomOf = (el) => (el.geometry || []).filter(p => p && Number.isFinite(p.lat) && Number.isFinite(p.lon));
const isClosed = (g) => g.length > 3 && Math.abs(g[0].lat - g[g.length - 1].lat) < 1e-7 && Math.abs(g[0].lon - g[g.length - 1].lon) < 1e-7;
const toFlat = (g) => { const a = new Float64Array(g.length * 2); for (let i = 0; i < g.length; i++) { a[i * 2] = px(g[i].lon); a[i * 2 + 1] = py(g[i].lat); } return Array.from(a); };

// 把越出地图较远的折线切成若干段（Overpass 会返回相交要素的完整几何）
const MARGIN = 2;
function runs(flat) {
  const out = []; let cur = null;
  for (let i = 0; i + 1 < flat.length; i += 2) {
    const x = flat[i], y = flat[i + 1];
    const ok = x > -MARGIN && x < W + MARGIN && y > -MARGIN && y < H + MARGIN;
    if (ok) { if (!cur) cur = []; cur.push(x, y); }
    else if (cur) { if (cur.length >= 4) out.push(cur); cur = null; }
  }
  if (cur && cur.length >= 4) out.push(cur);
  return out;
}

// ---------------- 分类 ----------------
const ROAD_CLS = {
  motorway: 4, trunk: 4, motorway_link: 4, trunk_link: 4,
  primary: 3, primary_link: 3,
  secondary: 2, tertiary: 2, secondary_link: 2, tertiary_link: 2,
  unclassified: 1, residential: 1, living_street: 1, service: 1, pedestrian: 1,
};
const water = [], roads = [], streets = [], rail = [], parks = [], reserves = [], woods = [], admin = [];
const roadSegs = [];   // 待合并的干道线段（2/3/4 级，同一街道被 OSM 切成很多短 way）
const streetSegs = []; // 待合并的支路线段（1 级，写入 streets）
const railSegs = [];   // 待合并的铁路线段
const waysPts = { water: 0, roads: 0, streets: 0, rail: 0, green: 0, admin: 0 };

// 把端点相接、名称/等级/结构相同、且连接点不是路口的线段合并成长折线。
// 用「端点 → 线段」索引查找候选，避免在大城市数据上退化成 O(n²)。
function mergeSegments(items) {
  const groups = new Map();
  for (const it of items) { if (!groups.has(it.key)) groups.set(it.key, []); groups.get(it.key).push(it); }
  const out = [];
  const revPts = (p) => { const r = []; for (let k = p.length - 2; k >= 0; k -= 2) r.push(p[k], p[k + 1]); return r; };
  const ek = (x, y) => Math.round(x * 64) + ',' + Math.round(y * 64);
  const sKey = (p) => ek(p[0], p[1]);
  const eKey = (p) => ek(p[p.length - 2], p[p.length - 1]);
  for (const list of groups.values()) {
    const n = list.length;
    const used = new Uint8Array(n);
    const byEnd = new Map();
    for (let i = 0; i < n; i++) for (const k of [sKey(list[i].pts), eKey(list[i].pts)]) {
      if (!byEnd.has(k)) byEnd.set(k, []);
      byEnd.get(k).push(i);
    }
    const pick = (k) => {
      const cand = byEnd.get(k);
      if (!cand || cand.length > 2) return -1;   // 路口：不合并
      for (const i of cand) if (!used[i]) return i;
      return -1;
    };
    for (let s = 0; s < n; s++) {
      if (used[s]) continue;
      used[s] = 1;
      let cur = { key: list[s].key, meta: list[s].meta, pts: list[s].pts.slice() };
      let changed = true;
      while (changed) {
        changed = false;
        const sk = sKey(cur.pts), ekk = eKey(cur.pts);
        // 先在终点处找可接的线段，再到起点处（起点处需要反向接上）
        let i = pick(ekk);
        if (i >= 0) {
          const p = list[i].pts;
          cur.pts = eKey(p) === ekk ? cur.pts.concat(revPts(p).slice(2)) : cur.pts.concat(p.slice(2));
          used[i] = 1; changed = true; continue;
        }
        i = pick(sk);
        if (i >= 0) {
          const p = list[i].pts;
          cur.pts = sKey(p) === sk ? revPts(p).slice(0, -2).concat(cur.pts) : p.slice(0, -2).concat(cur.pts);
          used[i] = 1; changed = true; continue;
        }
      }
      out.push(cur);
    }
  }
  return out;
}

const isWaterArea = (t) => t.natural === 'water' || t.waterway === 'riverbank' || t.waterway === 'dock' || t.waterway === 'boatyard' || t.landuse === 'reservoir' || t.landuse === 'basin';
const isWaterLine = (t) => ['river', 'canal', 'stream', 'drain', 'tidal_channel'].includes(t.waterway);
const greenKind = (t) => {
  if (t.leisure === 'nature_reserve' || t.boundary === 'protected_area' || t.boundary === 'national_park') return 'reserve';
  if (t.natural === 'wood' || t.natural === 'scrub' || t.natural === 'heath' || t.landuse === 'forest') return 'wood';
  if (['park', 'garden', 'common', 'recreation_ground'].includes(t.leisure)) return 'park';
  if (['cemetery', 'village_green'].includes(t.landuse)) return 'park';
  return null;
};
const waterWidth = (t) => {
  const w = Number(t.width);
  if (Number.isFinite(w) && w > 0) return Math.max(0.06, Math.min(3, w / 2 / 250));
  // 大型水面已由多边形表示，河流中心线只用于补充窄河道，默认宽度取得较小（半宽约 50 m）
  return { river: 0.4, tidal_channel: 0.5, canal: 0.35, stream: 0.14, drain: 0.1 }[t.waterway] || 0.2;
};

// 多边形 → [nameIdx, 'o'+enc, …]；rings 为 [[outer?bool, flat], …]
function polyRow(tagName, rings) {
  const row = [ni(tagName)];
  for (const [outer, flat] of rings) {
    if (flat.length < 8) continue;
    let pts = rdp(flat, TOL_POLY);
    if (pts.length < 8) pts = flat;
    row.push((outer ? 'o' : 'i') + enc(pts));
  }
  return row.length > 1 ? row : null;
}

// 把 relation 的成员 line 拼成闭合环（坐标为扁平数组 [x0,y0,x1,y1,…]）
function assemble(lines) {
  const pool = lines.map(l => l.slice());
  const out = [];
  const nPts = (f) => f.length / 2;
  const pt = (f, i) => [f[i * 2], f[i * 2 + 1]];
  const near = (a, b) => Math.abs(a[0] - b[0]) < 1e-3 && Math.abs(a[1] - b[1]) < 1e-3;   // 0.25 m
  const rev = (f) => { const r = []; for (let k = nPts(f) - 1; k >= 0; k--) r.push(f[k * 2], f[k * 2 + 1]); return r; };
  while (pool.length) {
    let cur = pool.shift();
    let changed = true, guard = 0;
    while (changed && guard++ < 100000) {
      changed = false;
      for (let i = 0; i < pool.length; i++) {
        const w = pool[i];
        const aEnd = pt(cur, nPts(cur) - 1), aStart = pt(cur, 0);
        if (near(aEnd, pt(w, 0))) { cur = cur.concat(w.slice(2)); pool.splice(i, 1); changed = true; break; }
        if (near(aEnd, pt(w, nPts(w) - 1))) { const rw = rev(w); cur = cur.concat(rw.slice(2)); pool.splice(i, 1); changed = true; break; }
        if (near(aStart, pt(w, nPts(w) - 1))) { cur = w.slice(0, -2).concat(cur); pool.splice(i, 1); changed = true; break; }
        if (near(aStart, pt(w, 0))) { const rw = rev(w); cur = rw.slice(0, -2).concat(cur); pool.splice(i, 1); changed = true; break; }
      }
    }
    // 闭合环去掉重复的末点
    if (nPts(cur) > 1 && near(pt(cur, 0), pt(cur, nPts(cur) - 1))) cur = cur.slice(0, -2);
    out.push(cur);
  }
  return out;
}

// ---- way ----
for (const w of ways.values()) {
  const t = w.tags || {}, g = geomOf(w);
  if (g.length < 2) continue;
  const closed = isClosed(g);
  if (closed && isWaterArea(t)) {
    const flat = toFlat(g);
    const row = polyRow(t.name, [[true, flat]]);
    if (row) { water.push(row); waysPts.water += flat.length / 2; }
    continue;
  }
  if (isWaterLine(t) && !closed) {
    // 地下河、涵洞（如伦敦的 River Fleet）在地表看不到，不写入水面
    if ((t.tunnel && t.tunnel !== 'no') || (t.culvert && t.culvert !== 'no') || t.waterway === 'drain') continue;
    for (const r of runs(toFlat(g))) {
      const pts = rdp(r, TOL_LINE);
      if (pts.length >= 4) { water.push([ni(t.name), +waterWidth(t).toFixed(3), enc(pts)]); waysPts.water += pts.length / 2; }
    }
    continue;
  }
  if (closed && greenKind(t)) {
    const kind = greenKind(t), flat = toFlat(g);
    if (MIN_GREEN_CELLS > 0 && !t.name && Math.abs(ringArea(flat)) < MIN_GREEN_CELLS) continue;
    const row = polyRow(t.name, [[true, flat]]);
    if (row) { (kind === 'park' ? parks : kind === 'wood' ? woods : reserves).push(row); waysPts.green += flat.length / 2; }
    continue;
  }
  if (ROAD_CLS[t.highway] != null) {
    const cls = ROAD_CLS[t.highway];
    // 游戏约定：roads 只放 2/3/4 级道路（render.js 的 lay 只有这三个键，放进 1 级会崩溃），
    // 1 级支路（residential 等）写进 streets，只画在已开发街区；service（停车场通道、后巷）不写入。
    const isService = t.highway === 'service';
    if (isService) continue;
    const toStreet = cls === 1;
    let flags = 0;
    if (t.bridge && t.bridge !== 'no') flags |= 1;
    if ((t.tunnel && t.tunnel !== 'no') || t.covered === 'yes') flags |= 2;
    if (/_link$/.test(t.highway)) flags |= 4;
    for (const r of runs(toFlat(g))) {
      const pts = rdp(r, TOL_LINE);
      if (pts.length < 4) continue;
      // 先收集线段，循环结束后按（名称|等级|结构）合并成长折线，减少 way 数量与文件体积
      (toStreet ? streetSegs : roadSegs).push({ key: (t.name || '') + '|' + cls + '|' + flags, meta: { name: t.name, cls, flags }, pts: pts });
      waysPts.roads += pts.length / 2;
    }
    continue;
  }
  if (['rail', 'light_rail', 'subway', 'narrow_gauge', 'monorail', 'tram'].includes(t.railway)) {
    let flags = 0;
    if (t.bridge && t.bridge !== 'no' || t.embankment) flags |= 1;
    if (t.tunnel && t.tunnel !== 'no') flags |= 2;
    const hs = /high speed|channel tunnel rail|^hs1$/i.test((t.name || '') + ' ' + (t.ref || ''));
    if (hs) flags |= 16;
    for (const r of runs(toFlat(g))) {
      const pts = rdp(r, TOL_LINE);
      if (pts.length >= 4) { railSegs.push({ key: (t.name || '') + '|' + flags + '|' + (hs ? 1 : 0), meta: { name: t.name, flags, hs }, pts: pts }); waysPts.rail += pts.length / 2; }
    }
  }
}

// ---- 海岸线 → 海面多边形 ----
// OSM 里海不是多边形，而是 natural=coastline 的线（约定：陆地在左、水在右）。
// 这里把主海岸链与图边界拼成闭合环，用"已知在海里的探测点"选出正确的一侧，岛屿作为孔洞。
if (COAST) {
  const closedCoast = [], openCoast = [];
  for (const w of ways.values()) {
    const t = w.tags || {};
    if (t.natural !== 'coastline') continue;
    const g = geomOf(w);
    if (g.length < 2) continue;
    if (isClosed(g)) closedCoast.push(toFlat(g)); else openCoast.push(toFlat(g));
  }
  const chains = assemble(openCoast).filter(c => c.length >= 8).sort((a, b) => b.length - a.length);
  if (!chains.length) { console.error('警告：--coast 已启用，但没有可用的海岸线数据（检查 fetch 的 coast 类别）'); }
  else {
    const PER = 2 * (W + H);
    const pointAt = (s) => {
      s = ((s % PER) + PER) % PER;
      if (s <= W) return [s, 0];
      if (s <= W + H) return [W, s - W];
      if (s <= 2 * W + H) return [2 * W + H - s, H];
      return [0, PER - s];
    };
    const sAt = (x, y) => {
      x = Math.max(0, Math.min(W, x)); y = Math.max(0, Math.min(H, y));
      const d = [y, W - x, H - y, x];   // 到上、右、下、左边界
      const k = d.indexOf(Math.min.apply(null, d));
      return k === 0 ? x : k === 1 ? W + y : k === 2 ? W + H + (W - x) : 2 * W + H + (H - y);
    };
    const borderPath = (s1, s2, dir) => {
      const corners = [0, W, W + H, 2 * W + H, PER];
      const out = [];
      let s = s1;
      if (dir > 0) {
        if (s2 < s1) s2 += PER;
        for (;;) {
          const next = corners.find(c => c > s + 1e-9);
          if (next == null || next >= s2) break;
          s = next; out.push(pointAt(s));
        }
        out.push(pointAt(s2));
      } else {
        if (s2 > s1) s2 -= PER;
        for (;;) {
          const prev = corners.slice().reverse().find(c => c < s - 1e-9);
          if (prev == null || prev <= s2) break;
          s = prev; out.push(pointAt(s));
        }
        out.push(pointAt(s2));
      }
      return out;
    };
    const probe = [px(COAST[1]), py(COAST[0])];

    if (COAST_MODE === 'flood') {
      const rings = floodSea(COAST_PTS.map(function (p) { return [px(p[1]), py(p[0])]; }), openCoast, closedCoast, W, H);
      if (!rings) console.error('警告：泛洪起点落在海岸线或图外，海面为空');
      else {
        const keep = rings.filter(r => { let a = 0; const n = r.length / 2; for (let k = 0; k < n; k++) { const j = (k + 1) % n; a += r[2 * k] * r[2 * j + 1] - r[2 * j] * r[2 * k + 1]; } return Math.abs(a) / 2 > 0.05; });
        const row = polyRow(SEA_NAME, keep.map(r => [true, r]));
        if (row) { water.push(row); console.log(`  海面（泛洪）：${keep.length} 个环，${keep.reduce((v, r) => v + r.length / 2, 0)} 点`); }
      }
    } else {
    const ringOf = (ch, dir) => {
      const sx = ch[0], sy = ch[1], ex = ch[ch.length - 2], ey = ch[ch.length - 1];
      const path = borderPath(sAt(ex, ey), sAt(sx, sy), dir);
      const ring = [];
      for (let k = 0; k < ch.length; k += 2) ring.push(ch[k], ch[k + 1]);
      // 端点吸附到边界，避免与边界路径之间留下缝
      ring[0] = Math.max(0, Math.min(W, ring[0])); ring[1] = Math.max(0, Math.min(H, ring[1]));
      ring[ring.length - 2] = Math.max(0, Math.min(W, ring[ring.length - 2]));
      ring[ring.length - 1] = Math.max(0, Math.min(H, ring[ring.length - 1]));
      for (const p of path) ring.push(p[0], p[1]);
      return ring;
    };
    const ringArea = (r) => { let a = 0; const n = r.length / 2; for (let k = 0; k < n; k++) { const j = (k + 1) % n; a += r[2 * k] * r[2 * j + 1] - r[2 * j] * r[2 * k + 1]; } return Math.abs(a) / 2; };

    if (COAST_MODE === 'land') {
      // 海面 = 整幅地图减去陆地：每条海岸链向「不含探测点」的一侧闭合得到一块陆地，作为孔洞。
      // 游戏用奇偶填充，孔洞会正确挖空；因此重叠的孔洞会互相抵消，需要先去重。
      const land = [];
      for (const ch of chains) for (const dir of [1, -1]) {
        const r = ringOf(ch, dir);
        if (!inPoly(probe[0], probe[1], r)) land.push(r);
      }
      for (const isl of closedCoast) land.push(isl);
      land.sort((a, b) => ringArea(b) - ringArea(a));
      const kept = [];
      for (const r of land) {
        if (ringArea(r) < 0.3) continue;                       // 过滤细碎噪声
        if (kept.some(k => inPoly(r[0], r[1], k))) continue;    // 已被更大的陆地包含
        kept.push(r);
      }
      const bboxRing = [0, 0, W, 0, W, H, 0, H];
      const rings = [[true, bboxRing]];
      for (const r of kept) rings.push([false, r]);
      const row = polyRow(SEA_NAME, rings);
      if (row) {
        water.push(row); waysPts.water += bboxRing.length / 2;
        console.log(`  海面（整幅减陆地）：海岸链 ${chains.length} 条，保留陆地 ${kept.length} 块，闭合岛屿 ${closedCoast.length} 个`);
      }
    } else {
      const main = chains[0];
      const cands = [ringOf(main, 1), ringOf(main, -1)];
      let sea = cands.find(r => inPoly(probe[0], probe[1], r));
      if (!sea) { sea = cands[0]; console.error('警告：两个候选海面都不包含探测点，取第一个'); }
      const rings = [[true, sea]];
      for (const isl of closedCoast) {
        if (inPoly(isl[0], isl[1], sea)) rings.push([false, isl]);
      }
      const row = polyRow(SEA_NAME, rings);
      if (row) { water.push(row); waysPts.water += sea.length / 2; console.log(`  海面：海岸链 ${main.length / 2} 点，岛屿 ${rings.length - 1} 个`); }
    }
    }
  }
}


// 海岸线泛洪：把 coastline 栅格化为墙，从「已知在海里的探测点」做 4 邻域填充，再把填充区的边界边串成环。
// 半岛与多海湾的城市（利物浦、青岛、布里斯托尔）用「最长海岸链 + 图边闭合」会判错内外，泛洪不受海岸形态影响。
function floodSea(probeCells, openCoast, closedCoast, W, H) {
  const S = 4, FW = W * S, FH = H * S, N = FW * FH;
  const wall = new Uint8Array(N);
  const mark = (ax, ay, bx, by) => {
    const dx = bx - ax, dy = by - ay, steps = Math.max(Math.abs(dx), Math.abs(dy));
    if (!steps) { if (ax >= 0 && ay >= 0 && ax < FW && ay < FH) wall[ay * FW + ax] = 1; return; }
    for (let k = 0; k <= steps; k++) {
      const x = Math.round(ax + dx * k / steps), y = Math.round(ay + dy * k / steps);
      if (x >= 0 && y >= 0 && x < FW && y < FH) wall[y * FW + x] = 1;
    }
  };
  for (const line of openCoast.concat(closedCoast)) {
    for (let k = 0; k + 3 < line.length; k += 2) mark(line[k] * S, line[k + 1] * S, line[k + 2] * S, line[k + 3] * S);
  }
  const sea = new Uint8Array(N);
  const stack = [];
  let seeded = 0;
  for (const pc of probeCells) {
    const sx = Math.round(pc[0] * S), sy = Math.round(pc[1] * S);
    if (sx < 0 || sy < 0 || sx >= FW || sy >= FH || wall[sy * FW + sx] || sea[sy * FW + sx]) continue;
    sea[sy * FW + sx] = 1; stack.push(sy * FW + sx); seeded++;
  }
  if (!seeded) return null;
  while (stack.length) {
    const c = stack.pop(), x = c % FW, y = (c / FW) | 0;
    if (x > 0 && !wall[c - 1] && !sea[c - 1]) { sea[c - 1] = 1; stack.push(c - 1); }
    if (x < FW - 1 && !wall[c + 1] && !sea[c + 1]) { sea[c + 1] = 1; stack.push(c + 1); }
    if (y > 0 && !wall[c - FW] && !sea[c - FW]) { sea[c - FW] = 1; stack.push(c - FW); }
    if (y < FH - 1 && !wall[c + FW] && !sea[c + FW]) { sea[c + FW] = 1; stack.push(c + FW); }
  }
  // 边界边：海格子与非海（或图外）相邻的一侧，按顺时针绕行方向记录
  const VW = FW + 1, edges = new Map();
  const key = (x, y) => y * VW + x;
  const add = (x0, y0, x1, y1) => { const k = key(x0, y0); let a = edges.get(k); if (!a) { a = []; edges.set(k, a); } a.push(x1, y1); };
  for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
    if (!sea[y * FW + x]) continue;
    if (y === 0 || !sea[(y - 1) * FW + x]) add(x, y, x + 1, y);
    if (x === FW - 1 || !sea[y * FW + x + 1]) add(x + 1, y, x + 1, y + 1);
    if (y === FH - 1 || !sea[(y + 1) * FW + x]) add(x + 1, y + 1, x, y + 1);
    if (x === 0 || !sea[y * FW + x - 1]) add(x, y + 1, x, y);
  }
  const rings = [];
  while (edges.size) {
    const fk = edges.keys().next().value;
    let cx = fk % VW, cy = (fk / VW) | 0;
    const ring = [cx, cy];
    for (let guard = 0; guard < 4e6; guard++) {
      const k = key(cx, cy), a = edges.get(k);
      if (!a || !a.length) break;
      const nx = a[a.length - 2], ny = a[a.length - 1];
      if (a.length <= 2) edges.delete(k); else a.length -= 2;
      cx = nx; cy = ny;
      ring.push(cx, cy);
      if (cx === ring[0] && cy === ring[1]) break;
    }
    if (ring.length >= 8) rings.push(ring.map(v => v / S));
  }
  return rings;
}

// ---- 合并道路、支路与铁路线段，写入 roads / streets / rail ----
let mergedCount = 0;
for (const m of mergeSegments(roadSegs)) {
  mergedCount++;
  const meta = m.meta;
  roads.push([ni(meta.name), meta.cls, meta.flags, enc(m.pts)]);
}
// 1 级支路进 streets（单条字符串，'!' 分隔）：只在已开发街区绘制，并参与建筑避让
let mergedStreets = 0;
for (const m of mergeSegments(streetSegs)) {
  const sp = rdp(m.pts, TOL_STREET);
  if (sp.length < 4) continue;
  streets.push(enc(sp)); mergedStreets++;
}
let mergedRail = 0;
for (const m of mergeSegments(railSegs)) {
  mergedRail++;
  rail.push([ni(m.meta.name), m.meta.flags, enc(m.pts), m.meta.hs ? 2003 : 0]);
}
if (process.argv.includes('--debug')) console.log(`  干道线段 ${roadSegs.length} → ${mergedCount} 条；支路线段 ${streetSegs.length} → ${mergedStreets} 段；铁路线段 ${railSegs.length} → ${mergedRail} 条`);

// ---- relation（多面要素与行政边界）----
for (const rel of rels.values()) {
  const t = rel.tags || {}, members = (rel.members || []).filter(m => m.type === 'way' && m.geometry);
  if (!members.length) continue;
  const ringOf = (role) => assemble(members.filter(m => (m.role || 'outer') === role).map(m => toFlat(m.geometry)).filter(f => f.length >= 4));
  if ((isWaterArea(t) && !NO_REL_WATER) || greenKind(t)) {
    const rings = [];
    let dropped = 0;
    for (const r of ringOf('outer')) {
      const flat = r.concat([r[0], r[1]]);
      if (ringPlausible(flat)) rings.push([true, flat]); else dropped++;
    }
    for (const r of ringOf('inner')) {
      const flat = r.concat([r[0], r[1]]);
      if (ringPlausible(flat)) rings.push([false, flat]); else dropped++;
    }
    if (dropped && process.argv.includes('--debug')) console.log(`  丢弃退化环 ${dropped} 个（${t.name || '无名'} ${rel.id}）`);
    if (rings.length) {
      // 无名的小块绿地不写入（面积按外环计）
      if (!isWaterArea(t) && MIN_GREEN_CELLS > 0 && !t.name) {
        const area = rings.filter(r => r[0]).reduce((s, r) => s + ringArea(r[1]), 0);
        if (area < MIN_GREEN_CELLS) continue;
      }
      const row = polyRow(t.name, rings);
      if (row) {
        if (isWaterArea(t)) { water.push(row); waysPts.water += 1; }
        else { const k = greenKind(t); (k === 'park' ? parks : k === 'wood' ? woods : reserves).push(row); waysPts.green += 1; }
      }
    }
    continue;
  }
  if (t.boundary === 'administrative') {
    const al = Number(t.admin_level);
    if (!(al >= 6 && al <= 8)) continue;
    // 本游戏的区级 = 6/7，街道级 = 8；按 --adminmap 把 OSM 等级改写到目标层级后写入
    const outLevel = ADMIN_MAP[al];
    if (outLevel == null) continue;
    for (const r of ringOf('outer')) {
      const flat = r.concat([r[0], r[1]]);
      const pts = rdp(flat, TOL_ADMIN);
      if (pts.length >= 8) { admin.push([outLevel, ni(t.name), 'o' + enc(pts)]); waysPts.admin += pts.length / 2; }
    }
  }
}

// ---- node（地名与车站）----
const places = [];
for (const n of nodes.values()) {
  const t = n.tags || {};
  const x = +px(n.lon).toFixed(2), y = +py(n.lat).toFixed(2);
  if (x < 0 || y < 0 || x > W || y > H) continue;
  const station = t.railway === 'station' || t.public_transport === 'station';
  if (station && t.name) {
    const metro = t.station === 'subway' || t.subway === 'yes' || (t.railway === 'station' && /underground|dlr/i.test(t.network || ''));
    places.push([t.name, x, y, metro ? 0 : 1]);
  } else if (['city', 'town', 'suburb', 'quarter', 'neighbourhood', 'village'].includes(t.place) && t.name) {
    places.push([t.name, x, y, t.place === 'neighbourhood' ? 3 : 2]);
  }
}

// 去重（同名同位置、同名车站）
const seenPlace = new Set(), placesOut = [];
for (const p of places) {
  const key = p[0] + '|' + p[3];
  if (seenPlace.has(key)) continue;
  seenPlace.add(key); placesOut.push(p);
}
placesOut.sort((a, b) => a[3] - b[3] || a[0].localeCompare(b[0]));

// ---------------- 自检 ----------------
function inPoly(x, y, flat) {
  let inside = false;
  const n = flat.length / 2;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = flat[i * 2], yi = flat[i * 2 + 1], xj = flat[j * 2], yj = flat[j * 2 + 1];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
const waterPolys = water.filter(r => typeof r[1] !== 'number');
// 诊断：--debug 打印最大的若干水面多边形与探针结果
if (process.argv.includes('--debug')) {
  const probe = [[51.5007, -0.1246], [51.4875, -0.0180], [51.5080, -0.1281], [51.5050, -0.0230]];
  const big = waterPolys.map((r, k) => [r.reduce((s, v) => s + (typeof v === 'string' ? v.length : 0), 0), k])
    .sort((a, b) => b[0] - a[0]).slice(0, 6);
  for (const [sz, k] of big) {
    const row = waterPolys[k];
    const rings = row.length - 1;
    const hits = probe.map(p => waterAt(p[1], p[0]) ? 1 : 0).join('');
    const first = decLocal(row[1].slice(1));
    let bb = [1e9, 1e9, -1e9, -1e9];
    for (let q = 0; q < first.length; q += 2) { bb[0] = Math.min(bb[0], first[q]); bb[1] = Math.min(bb[1], first[q + 1]); bb[2] = Math.max(bb[2], first[q]); bb[3] = Math.max(bb[3], first[q + 1]); }
    console.log(`  水面 ${k}：名「${row[0] ? names[row[0]] : '无名'}」环 ${rings} 字节 ${sz} 探针 ${hits} 首环点数 ${first.length / 2} 首点 (${first[0]},${first[1]}) 首环bbox ${bb.map(v => v.toFixed(1)).join(',')}`);
  }
}
function waterAt(lon, lat) { return waterAtXY(px(lon), py(lat)); }
function waterAtXY(x, y) {
  for (const row of waterPolys) {
    let ringsHit = 0;
    for (let k = 1; k < row.length; k++) {
      const s = row[k], flat = s.slice(1);
      // 解码仅供自检
      const pts = decLocal(flat);
      if (inPoly(x, y, pts)) ringsHit++;
    }
    if (ringsHit % 2 === 1) return row[0] ? names[row[0]] : '（无名水面）';
  }
  // 河流中心线：与线段距离小于半宽即为水面（与 city.js 的水域掩膜一致）
  for (const row of water) {
    if (typeof row[1] !== 'number') continue;
    const pts = decLocal(row[2]), hw = Math.max(row[1] / 2, 0.025);
    for (let k = 0; k + 3 < pts.length; k += 2) {
      const ax = pts[k], ay = pts[k + 1], bx = pts[k + 2], by = pts[k + 3];
      const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
      let t = L > 0 ? ((x - ax) * dx + (y - ay) * dy) / L : 0;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const qx = ax + dx * t - x, qy = ay + dy * t - y;
      if (qx * qx + qy * qy <= hw * hw) return row[0] ? names[row[0]] : '（无名河流）';
    }
  }
  return null;
}
function decLocal(s) {
  const out = []; let i = 0, x = 0, y = 0;
  while (i < s.length) {
    let r = 0, sh = 0, b;
    do { b = s.charCodeAt(i++) - 63; r |= (b & 31) << sh; sh += 5; } while (b >= 32);
    x += (r & 1) ? ~(r >> 1) : (r >> 1);
    r = 0; sh = 0;
    do { b = s.charCodeAt(i++) - 63; r |= (b & 31) << sh; sh += 5; } while (b >= 32);
    y += (r & 1) ? ~(r >> 1) : (r >> 1);
    out.push(x / 64, y / 64);
  }
  return out;
}

// 自检：河岸上的单点不能作为判据（河流中心线与岸线本来就相差半个河宽），
// 改用河流中心线顶点的覆盖率（多边形与中心线取并集后的水域掩膜），并用 --land 指定的陆地地标反向核对。
const RIVER_RE = new RegExp(arg('river', '.'), 'i');
const riverPts = [];
for (const w of ways.values()) {
  const t = w.tags || {};
  if (t.waterway === 'river' && RIVER_RE.test(t.name || '')) for (const p of w.geometry || []) {
    const x = px(p.lon), y = py(p.lat);
    // 只统计图内顶点：OSM 会返回相交要素的完整几何，图外的点当然不可能是水面
    if (x >= 0 && x <= W && y >= 0 && y <= H) riverPts.push([x, y]);
  }
}
const riverHit = riverPts.length ? riverPts.filter(p => waterAtXY(p[0], p[1])).length / riverPts.length : null;
// 陆地探针：--land "纬度,经度" 可重复（默认不给，仅做河流覆盖检查）
const landProbes = [];
for (let i = 0; i < process.argv.length; i++) {
  if (process.argv[i] !== '--land') continue;
  const p = (process.argv[i + 1] || '').split(',').map(Number);
  if (p.length === 2 && p.every(Number.isFinite)) landProbes.push([`${p[0]},${p[1]}`, p[0], p[1]]);
}
const checkResults = (riverHit == null ? [] : [{ label: `河流中心线覆盖 ${(riverHit * 100).toFixed(0)}%（${riverPts.length} 点）`, water: null, ok: riverHit > 0.6 }])
  .concat(landProbes.map(function (p) { const got = waterAt(p[2], p[1]); return { label: p[0] + '（陆地）', water: got, ok: !got }; }));

// ---------------- 输出 ----------------
const out = [];
out.push("'use strict';");
out.push(`// 由 OpenStreetMap 数据生成（© OpenStreetMap 贡献者，ODbL）。坐标为游戏格（250 m），折线为增量编码，1/64 格精度。`);
out.push(`// 生成工具：scripts/fetch-osm.mjs + scripts/geo-import.mjs；地图网格 ${W}×${H}，原点上角（东经 ${lon0}°、北纬 ${lat0}°）。`);
out.push('(function (CM) {');
out.push(`  (CM.GEOS = CM.GEOS || {}).${name} = {`);
out.push(`    proj: { lon0: ${lon0}, lat0: ${lat0}, kx: ${kx}, ky: ${ky} },`);
const block = (key, arr, fmt) => {
  out.push(`    ${key}: [`);
  for (const row of arr) out.push('      ' + fmt(row) + ',');
  out.push('    ],');
};
block('water', water, (r) => '[' + r.map((v, i) => (i === 0 || typeof v === 'number') ? String(v) : JSON.stringify(v)).join(',') + ']');
block('roads', roads, (r) => `[${r[0]},${r[1]},${r[2]},${JSON.stringify(r[3])}]`);
out.push(`    streets: ${JSON.stringify(streets.join('!'))},`);
block('rail', rail, (r) => `[${r[0]},${r[1]},${JSON.stringify(r[2])},${r[3]}]`);
block('parks', parks, (r) => '[' + r.map((v, i) => (i === 0 || typeof v === 'number') ? String(v) : JSON.stringify(v)).join(',') + ']');
block('reserves', reserves, (r) => '[' + r.map((v, i) => (i === 0 || typeof v === 'number') ? String(v) : JSON.stringify(v)).join(',') + ']');
block('woods', woods, (r) => '[' + r.map((v, i) => (i === 0 || typeof v === 'number') ? String(v) : JSON.stringify(v)).join(',') + ']');
block('admin', admin, (r) => `[${r[0]},${r[1]},${JSON.stringify(r[2])}]`);
out.push('    places: [');
for (const p of placesOut) out.push(`      [${JSON.stringify(p[0])}, ${p[1]}, ${p[2]}, ${p[3]}],`);
out.push('    ],');
out.push('    names: ' + JSON.stringify(names) + ',');
out.push('  };');
out.push('})(window.CM);');
out.push('');

const target = path.join(root, 'js', `geo_${name}.js`);
const text = out.join('\n');
const kb = (Buffer.byteLength(text) / 1024).toFixed(1);
const bad = checkResults.filter(c => !c.ok);
if (!waterPolys.length) { console.error('错误：没有识别到任何水面的多边形，检查 Overpass 查询或分类。'); process.exit(1); }
if (!roads.length) { console.error('错误：没有识别到道路。'); process.exit(1); }
if (bad.length) { console.error('水面自检未通过：' + bad.map(b => b.label + '→' + (b.water || '陆地')).join('；')); process.exit(1); }
await writeFile(target, text);
await mkdir(path.join(root, '.tools', 'osm'), { recursive: true });
const report = {
  map: name, generatedAt: new Date().toISOString(), grid: { W, H, lon0, lat0, kx, ky },
  counts: { water: water.length, waterPolys: waterPolys.length, roads: roads.length, streets: streets.length, rail: rail.length, parks: parks.length, reserves: reserves.length, woods: woods.length, admin: admin.length, places: placesOut.length, names: names.length },
  vertices: waysPts, checkResults, bytes: Buffer.byteLength(text),
};
await writeFile(path.join(root, '.tools', 'osm', name, '_report.json'), JSON.stringify(report, null, 1));
console.log('自检：' + checkResults.map(c => `${c.label}${c.ok ? '✓' : '✗'}(${c.water || '陆地'})`).join('，'));
console.log(`写出 ${path.relative(root, target)}：${kb} KB / 水面多边形 ${waterPolys.length} / 道路 ${roads.length} / 铁路 ${rail.length} / 公园 ${parks.length} / 行政边界 ${admin.length} / 地名 ${placesOut.length}`);
