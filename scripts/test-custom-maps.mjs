// Shandong 分支新增城市（伦敦、济南、青岛、泰安）的接入回归：
// 地图登记与尺寸、数据坐标范围、阶段数据（v2.2 eras）、开局生成、推进与存档往返。
// 只使用内存中的浏览器存储替身，不读取玩家数据。
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const memory = new Map();
const localStorage = { getItem: k => memory.get(k) || null, setItem: (k, v) => memory.set(k, String(v)), removeItem: k => memory.delete(k) };
const context = { console, performance, atob, btoa, TextEncoder, TextDecoder, localStorage, navigator: { hardwareConcurrency: 4, deviceMemory: 4 }, matchMedia: () => ({ matches: false }), setTimeout, clearTimeout };
context.window = context;
vm.createContext(context);
for (const [, src] of (await readFile(path.join(root, 'index.html'), 'utf8')).matchAll(/<script src="([^"]+)"/g)) {
  vm.runInContext(await readFile(path.join(root, src), 'utf8'), context, { filename: src });
  if (src === 'js/save.js') break;
}
const C = context.CM;
const CUSTOM = { ld: 1990, jn: 2000, qd: 2000, ta: 2000 };

for (const id of Object.keys(CUSTOM)) {
  const m = C.MAPS[id];
  assert.ok(m, '自定义地图未登记：' + id);
  const W = m.cfg.W, H = m.cfg.H, G = m.geo, D = m.data;
  assert.ok(Number.isInteger(m.mapVersion) && m.mapVersion >= 1, id + ': mapVersion 无效');
  assert.ok(G && G.proj, id + ': 缺少地理投影');
  assert.equal(G.W === undefined || G.W === W, true, id + ': 地理网格宽度与 cfg.W 不一致');
  assert.equal(G.H === undefined || G.H === H, true, id + ': 地理网格高度与 cfg.H 不一致');
  assert.equal(m.cfg.START.y, CUSTOM[id], id + ': 起始年份不符');

  const inside = (x, y, what) => assert.ok(Number.isFinite(x) && Number.isFinite(y) && x >= -1 && y >= -1 && x <= W + 1 && y <= H + 1, id + ': ' + what + ' 超出地图范围 (' + x + ',' + y + ')');
  const regionIds = new Set(D.regions.map(r => r.id));
  if (D.defaultRegion) regionIds.add(D.defaultRegion.id);
  assert.equal(regionIds.size, D.regions.length + (D.defaultRegion ? 1 : 0), id + ': 片区 id 重复');
  for (const r of D.regions) for (const p of r.poly || []) inside(p[0], p[1], '片区 ' + r.id);
  for (const c of D.centers || []) inside(c.x, c.y, '人口中心');
  for (const l of D.landmarks || []) if (typeof l.x === 'number') inside(l.x, l.y, '地标 ' + l.name);
  for (const f of D.facilities || []) if (f.at) inside(f.at[0], f.at[1], '设施 ' + f.n);
  for (const t of (D.histTasks || []).concat(D.dynTasks || [])) for (const a of t.anchors || []) inside(a.x, a.y, '任务锚点 ' + a.name);
  for (const r of D.roadYears ? Object.keys(D.roadYears) : []) assert.ok(typeof r === 'string');

  // v2.2 历史发展阶段：阶段时间递增、片区 id 有效、阶段目标坐标在范围内
  const eras = D.eras || [];
  assert.ok(eras.length >= 3, id + ': 需要至少 3 个历史发展阶段（v2.2）');
  assert.equal(eras[0].from, CUSTOM[id], id + ': 首个阶段应始于开局年份');
  for (let k = 1; k < eras.length; k++) assert.ok(eras[k].from > eras[k - 1].from, id + ': 阶段年份须递增');
  for (const e of eras) {
    assert.ok(e.id && e.name && e.summary, id + ': 阶段缺少 id / name / summary');
    for (const weights of Object.values(e.grow || {})) for (const region of Object.keys(weights)) assert.ok(regionIds.has(region), id + ': 阶段 ' + e.id + ' 引用未知片区 ' + region);
    for (const c of e.corridors || []) for (const end of [c.a, c.b]) assert.ok(regionIds.has(end), id + ': 阶段 ' + e.id + ' 走廊引用未知片区 ' + end);
    for (const g of e.goals || []) {
      assert.ok(g.id && g.title && g.desc, id + ': 阶段目标缺少 id / title / desc');
      for (const a of g.anchors || []) inside(a.x, a.y, '阶段目标锚点 ' + g.title);
    }
  }
}

// 开局、推进与存档往返：每座新增城市都要能建城、结算并还原
for (const id of Object.keys(CUSTOM)) {
  C.useMap(id);
  const game = C.Game.create({ mode: 'free' });
  assert.equal(game.clock.y, CUSTOM[id], id + ': 开局年份');
  assert.ok(game.city.totals().pop > 0, id + ': 开局没有人口');
  assert.ok(game.city.totals().jobs > 0, id + ': 开局没有岗位');
  assert.equal(C.Eras.enabled(), true, id + ': 阶段数据未生效');
  assert.ok(C.Eras.current(game.year()), id + ': 当前阶段为空');
  game.startJump(3);
  while (game.jumping) game.stepJump();
  assert.equal(game.clock.m, 4, id + ': 推进三个月后应为 4 月');
  assert.ok(game.econ.ledger.length === 3, id + ': 月度账本条数不符');
  const restored = C.Game.restore(JSON.parse(JSON.stringify(game.serialize())));
  assert.equal(JSON.stringify(restored.clock), JSON.stringify(game.clock), id + ': 存档时钟不一致');
  assert.equal(JSON.stringify(restored.net), JSON.stringify(game.net), id + ': 存档线网不一致');
  assert.equal(JSON.stringify(restored.econ.serialize()), JSON.stringify(game.econ.serialize()), id + ': 存档账本不一致');
  assert.ok(restored.startBase && restored.eraBase, id + ': 存档缺少发展阶段基准');
  // 阶段推进：把时钟拨到下一阶段，结算一次应生成阶段记录
  const next = (C.MAPS[id].data.eras || []).find(e => e.from > game.clock.y);
  if (next) {
    game.clock.y = next.from; game.clock.m = 1;
    assert.ok(C.Eras.month(game), id + ': 进入新阶段时应生成阶段总结');
    assert.equal(game.eraBase.id, C.Eras.current(game.clock.y).id, id + ': 阶段基准未更新');
  }
}
console.log('PASS custom maps: ld / jn / qd / ta registration, bounds, eras, settlement and save round trip');
