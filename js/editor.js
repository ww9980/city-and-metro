'use strict';
// 地图编辑器（v2.3）：在游戏地图上交互式增删、移动、调整 地标 / 商圈 / 片区 / 设施。
// 编辑直接写入 CM.DATA（当前地图数据对象），可保存到 localStorage 并在下次载入该图时自动应用；
// 「保存并重开本图」用改动后的数据重新生成城市（会重置进度）。编辑器只在有游戏时可用。
(function (CM) {
  const U = CM.U;

  // 四类可编辑对象。arr 指向 CM.DATA 上的数组字段；color 为标记与选中态的主色。
  const TABS = [
    { k: 'landmarks', name: '地标', arr: 'landmarks', color: '#e4572e' },
    { k: 'centers', name: '商圈', arr: 'centers', color: '#c026d3' },
    { k: 'regions', name: '片区', arr: 'regions', color: '#0d9488' },
    { k: 'facilities', name: '设施', arr: 'facilities', color: '#2563eb' },
  ];
  const LM_KINDS = ['church', 'hall', 'rail', 'campus', 'stadium', 'skyscraper', 'box', 'factory', 'library', 'museum', 'mall', 'expo', 'opera', 'concert', 'venue', 'site'];
  const PLAN_OPTS = [['res', '住宅'], ['resind', '住宅/产业'], ['com', '商业办公'], ['ind', '工业仓储'], ['mix', '混合'], ['cbd', '商务中心'], ['oldmix', '老城混合'], ['port', '港口'], ['inst', '公共机构']];

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function num(v, d) { const n = Number(v); return isFinite(n) ? n : d; }
  function ovKey(id) { return 'cm.editor.' + id; }          // 本机覆盖层（localStorage 保存）
  function bakedKey(id) { return 'cm.editor.baked.' + id; } // 覆写原始数据（写回地图数据对象）
  function readOv(id) { try { const s = localStorage.getItem(ovKey(id)); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
  function readBaked(id) { try { const s = localStorage.getItem(bakedKey(id)); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
  function clone(o) { try { return JSON.parse(JSON.stringify(o)); } catch (e) { return o; } }
  function subset(D) { return { landmarks: D.landmarks || [], centers: D.centers || [], regions: D.regions || [], defaultRegion: D.defaultRegion || null, facilities: D.facilities || [] }; }
  function clampMap(x, y) { return [U.clamp(x, 0, CM.CFG.W - 0.01), U.clamp(y, 0, CM.CFG.H - 0.01)]; }
  function bboxOf(poly) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const q of poly) { if (q[0] < x0) x0 = q[0]; if (q[1] < y0) y0 = q[1]; if (q[0] > x1) x1 = q[0]; if (q[1] > y1) y1 = q[1]; } return [x0, y0, x1, y1]; }

  // ---------------- 样式 ----------------
  function injectCSS() {
    if (document.getElementById('ed-css')) return;
    const st = document.createElement('style'); st.id = 'ed-css';
    st.textContent = `
    #ed-entry{position:fixed;left:14px;bottom:calc(14px + var(--safe-bottom,0px));z-index:960;display:none;
      align-items:center;justify-content:center;width:40px;height:40px;padding:0;border-radius:50%;border:1px solid var(--line-strong);
      background:var(--surface);color:var(--text);cursor:pointer;
      box-shadow:var(--shadow-sm);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
    #ed-entry:hover{background:var(--surface-2)}
    #ed-entry.on{display:flex}
    #ed{position:fixed;inset:0;z-index:900;display:none;pointer-events:none}
    #ed.on{display:block}
    #ed-catch{position:absolute;inset:0;pointer-events:auto;cursor:crosshair}
    #ed-svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}
    #ed-marks{position:absolute;inset:0;pointer-events:none;overflow:visible}
    /* 标记：容器是 0 尺寸锚点，圆点以 translate(-50%,-50%) 精确落在锚点上；标签向右偏移，不参与居中 */
    .ed-mark{position:absolute;width:0;height:0;pointer-events:none}
    .ed-dot{position:absolute;left:0;top:0;transform:translate(-50%,-50%);width:12px;height:12px;border-radius:50%;
      border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);pointer-events:auto;cursor:grab}
    .ed-mark.sel .ed-dot{width:16px;height:16px;box-shadow:0 0 0 4px rgba(255,255,255,.6),0 2px 8px rgba(0,0,0,.5)}
    .ed-mark.drag .ed-dot{cursor:grabbing}
    .ed-lab{position:absolute;left:9px;top:0;transform:translateY(-50%);font:600 11px/1 var(--font);color:#fff;
      background:rgba(15,23,42,.72);padding:2px 5px;border-radius:5px;opacity:0;transition:opacity .12s;pointer-events:none;
      max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .ed-mark:hover .ed-lab,.ed-mark.sel .ed-lab{opacity:1}
    #ed-handles{position:absolute;inset:0;pointer-events:none;overflow:visible}
    .ed-handle{position:absolute;width:13px;height:13px;transform:translate(-50%,-50%);background:#fff;
      border:2px solid var(--accent);border-radius:3px;pointer-events:auto;box-shadow:0 1px 4px rgba(0,0,0,.3)}
    .ed-handle[data-corner="0"],.ed-handle[data-corner="2"]{cursor:nwse-resize}
    .ed-handle[data-corner="1"],.ed-handle[data-corner="3"]{cursor:nesw-resize}
    #ed-panel{position:absolute;top:0;right:0;width:320px;max-width:92vw;height:100%;pointer-events:auto;
      background:var(--surface-solid);border-left:1px solid var(--line-strong);display:flex;flex-direction:column;
      box-shadow:-10px 0 30px rgba(36,66,104,.12);font-family:var(--font);color:var(--text)}
    #ed-head{padding:14px 14px 10px;border-bottom:1px solid var(--line)}
    #ed-title{font:700 15px/1.2 var(--font);display:flex;justify-content:space-between;align-items:center}
    #ed-sub{font-size:11.5px;color:var(--muted);margin-top:5px;line-height:1.5}
    #ed-tabs{display:flex;gap:4px;padding:8px 10px;border-bottom:1px solid var(--line)}
    .ed-tab{flex:1;padding:7px 4px;border-radius:8px;border:1px solid transparent;background:transparent;color:var(--muted);
      font:600 12px/1 var(--font);cursor:pointer}
    .ed-tab.on{background:var(--accent-soft);color:var(--accent);border-color:var(--accent-soft)}
    #ed-body{flex:1;overflow:auto;padding:8px 10px}
    .ed-row{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:8px;cursor:pointer;font-size:12.5px}
    .ed-row:hover{background:var(--hover)}
    .ed-row.sel{background:var(--accent-soft);color:var(--accent)}
    .ed-row .ed-ri{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .ed-row .ed-c{color:var(--faint);font-size:11px;flex:0 0 auto}
    .ed-del{border:none;background:transparent;color:var(--bad);cursor:pointer;font-size:15px;line-height:1;padding:2px 4px;border-radius:6px}
    .ed-del:hover{background:var(--bad-soft)}
    #ed-empty{color:var(--muted);font-size:12.5px;padding:18px 8px;text-align:center;line-height:1.6}
    #ed-edit{border-top:1px solid var(--line);padding:10px 12px;background:var(--surface-2)}
    .ed-f{display:flex;align-items:center;gap:8px;margin-bottom:8px}
    .ed-f label{flex:0 0 66px;font-size:12px;color:var(--muted)}
    .ed-f input,.ed-f select{flex:1;min-width:0;padding:6px 8px;border-radius:8px;border:1px solid var(--line-strong);
      background:var(--surface-solid);color:var(--text);font:500 12.5px/1 var(--font)}
    #ed-foot{border-top:1px solid var(--line);padding:10px 12px;display:flex;flex-wrap:wrap;gap:6px}
    #ed-status{flex:1 1 100%;font-size:11px;color:var(--muted);padding-top:1px}
    #ed-status b{color:var(--accent);font-weight:700}
    .ed-btn{flex:1 1 auto;padding:8px 10px;border-radius:9px;border:1px solid var(--line-strong);background:var(--surface-solid);
      color:var(--text);font:600 12px/1 var(--font);cursor:pointer;white-space:nowrap}
    .ed-btn:hover{background:var(--surface-2)}
    .ed-btn.pri{background:var(--accent);border-color:var(--accent);color:#fff}
    .ed-btn.pri:hover{filter:brightness(1.08)}
    .ed-btn.danger{color:var(--bad);border-color:var(--bad-soft)}
    #ed-hint{position:absolute;left:50%;bottom:calc(16px + var(--safe-bottom,0px));transform:translateX(-50%);
      background:rgba(15,23,42,.82);color:#fff;font:600 12px/1.4 var(--font);padding:8px 14px;border-radius:999px;
      pointer-events:none;opacity:0;transition:opacity .15s;white-space:nowrap;max-width:90vw;overflow:hidden;text-overflow:ellipsis}
    #ed-hint.on{opacity:1}
    @media (max-width:560px){#ed-panel{width:270px}}
    `;
    document.head.appendChild(st);
  }

  // ---------------- 位置与命名 ----------------
  function lmById(D, id) { for (const l of D.landmarks || []) if (l.id === id) return l; return null; }
  function posOf(tab, it, D) {
    if (tab === 'regions') { const p = it.poly || []; if (!p.length) return null; let x = 0, y = 0; for (const q of p) { x += q[0]; y += q[1]; } return { x: x / p.length, y: y / p.length }; }
    if (tab === 'facilities') {
      if (it.at) return { x: it.at[0], y: it.at[1] };
      if (it.lm) { const l = lmById(D, it.lm); if (l) return { x: l.x, y: l.y }; }
      if (typeof it.x === 'number') return { x: it.x, y: it.y };
      return null;
    }
    if (typeof it.x === 'number' && typeof it.y === 'number') return { x: it.x, y: it.y };
    return null;
  }
  function nameOf(tab, it) {
    if (tab === 'landmarks') return it.name || it.id || '地标';
    if (tab === 'centers') return it.name || ('人口中心 ' + Math.round(it.pop || 0) + ' 人');
    if (tab === 'regions') return it.name || it.id || '片区';
    if (tab === 'facilities') return it.n || it.id || '设施';
    return '';
  }
  function setPos(tab, it, x, y, D, dx, dy) {
    if (tab === 'regions') { const p = it.poly || []; if (!p.length) return; for (const q of p) { q[0] = U.clamp(q[0] + dx, 0, CM.CFG.W); q[1] = U.clamp(q[1] + dy, 0, CM.CFG.H); } return; }
    if (tab === 'facilities') {
      if (it.lm) { const l = lmById(D, it.lm); if (l) { l.x = x; l.y = y; return; } }
      if (it.at) { it.at[0] = x; it.at[1] = y; return; }
      it.x = x; it.y = y; return;
    }
    it.x = x; it.y = y;
  }

  // ---------------- 编辑器 ----------------
  function Editor(R, ui, tools) {
    this.R = R; this.ui = ui; this.tools = tools;
    this.open = false; this.tab = 'landmarks'; this.sel = null; this.placing = false;
    this.drag = null; this.pan = null; this.rsz = null; this.seq = 0;
    injectCSS();
    this._build();
    this._bind();
    this._watchEntry();
    // 关键：把标记定位挂到渲染循环里、在相机变换算好之后同一帧执行，
    // 否则缩放/平移时标记会用到上一帧的变换，看起来相对底图漂移。
    const self = this, origRender = R.render;
    if (typeof origRender === 'function') {
      R.render = function (dt, ui) { const out = origRender.call(this, dt, ui); if (self.open) self._positions(); return out; };
    }
  }
  CM.Editor = Editor;

  Editor.prototype.D = function () { return CM.DATA; };
  Editor.prototype.list = function (tab) { const t = this.tabDef(tab); return (this.D()[t.arr] || []); };
  Editor.prototype.tabDef = function (k) { for (const t of TABS) if (t.k === (k || this.tab)) return t; return TABS[0]; };

  Editor.prototype._build = function () {
    // 入口按钮
    this.entry = document.createElement('button');
    this.entry.id = 'ed-entry'; this.entry.type = 'button';
    this.entry.title = '地图编辑'; this.entry.setAttribute('aria-label', '地图编辑');
    this.entry.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>';
    this.entry.onclick = function () { this.enter(); }.bind(this);
    document.body.appendChild(this.entry);

    const root = document.createElement('div'); root.id = 'ed';
    root.innerHTML = `
      <div id="ed-catch"></div>
      <svg id="ed-svg"></svg>
      <div id="ed-marks"></div>
      <div id="ed-handles"></div>
      <div id="ed-hint"></div>
      <aside id="ed-panel">
        <div id="ed-head">
          <div id="ed-title"><span>地图编辑器</span><button class="ed-btn" id="ed-close" style="flex:0 0 auto;padding:5px 9px">关闭</button></div>
          <div id="ed-sub">点击放置、拖动移动、右侧修改属性。<b>存到本机</b>只在本浏览器生效（覆盖层）；<b>覆写本图</b>会改写该图的初始数据。</div>
        </div>
        <div id="ed-tabs"></div>
        <div id="ed-body"></div>
        <div id="ed-edit"></div>
        <div id="ed-foot">
          <button class="ed-btn pri" id="ed-add">＋ 添加</button>
          <button class="ed-btn" id="ed-save-local" title="保存为覆盖层，仅本浏览器生效，不修改地图初始数据">存到本机</button>
          <button class="ed-btn" id="ed-save-baked" title="把编辑写回该图的初始数据（可在重置中恢复）">覆写本图</button>
          <button class="ed-btn" id="ed-restart" title="用已保存的数据重新生成城市">重开本图</button>
          <button class="ed-btn danger" id="ed-reset">重置</button>
          <div id="ed-status"></div>
        </div>
      </aside>`;
    document.body.appendChild(root);
    this.root = root; this.catch = root.querySelector('#ed-catch'); this.svg = root.querySelector('#ed-svg');
    this.marks = root.querySelector('#ed-marks'); this.handles = root.querySelector('#ed-handles'); this.hintEl = root.querySelector('#ed-hint');
    this.tabsEl = root.querySelector('#ed-tabs'); this.bodyEl = root.querySelector('#ed-body'); this.editEl = root.querySelector('#ed-edit');

    // tabs
    this.tabsEl.innerHTML = TABS.map(function (t) { return '<button class="ed-tab" data-k="' + t.k + '">' + t.name + '</button>'; }).join('');
    this.tabsEl.addEventListener('click', function (e) {
      const b = e.target.closest('.ed-tab'); if (!b) return;
      this.tab = b.dataset.k; this.sel = null; this.placing = false; this._render(); this._rebuild();
    }.bind(this));

    root.querySelector('#ed-close').onclick = function () { this.exit(); }.bind(this);
    root.querySelector('#ed-add').onclick = function () { this.placing = !this.placing; this._render(); this._hint(this.placing ? '点击地图放置新的' + this.tabDef().name : ''); }.bind(this);
    root.querySelector('#ed-save-local').onclick = function () { this.saveLocal(); }.bind(this);
    root.querySelector('#ed-save-baked').onclick = function () { this.saveBaked(); }.bind(this);
    root.querySelector('#ed-restart').onclick = function () { this.restart(); }.bind(this);
    root.querySelector('#ed-reset').onclick = function () { this.reset(); }.bind(this);
    this.statusEl = root.querySelector('#ed-status');

    // 编辑区：事件委托
    this.editEl.addEventListener('input', function (e) {
      const it = this.sel; if (!it) return; const f = e.target.dataset.f; if (!f) return;
      const v = e.target.value;
      if (f === 'name') { if (this.tab === 'landmarks') it.name = v; else if (this.tab === 'centers') it.name = v; else if (this.tab === 'regions') it.name = v; else if (this.tab === 'facilities') it.n = v; }
      else if (f === 'kind') it.kind = v;
      else if (f === 'plan') it.plan = v;
      else if (f === 't') it.t = v;
      else if (f === 'w') { if (this.tab === 'centers') it.w = num(v, it.w); else it.w = num(v, it.w); }
      else if (f === 'd') it.d = num(v, it.d);
      else if (f === 'h') it.h = num(v, it.h);
      else if (f === 'pop') it.pop = num(v, it.pop);
      else if (f === 'jobs') it.jobs = num(v, it.jobs);
      else if (f === 'r') it.r = num(v, it.r);
      else if (f === 'open') it.open = Math.round(num(v, it.open));
      this._renderList(); this._rebuild();
    }.bind(this));

    this._loop = this._loop.bind(this);
  };

  Editor.prototype._bind = function () {
    const self = this;
    this.catch.addEventListener('pointerdown', function (e) { self._onCatchDown(e); });
    this.catch.addEventListener('wheel', function (e) { e.preventDefault(); self.R.zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.2 : 1 / 1.2); }, { passive: false });
    this.marks.addEventListener('pointerdown', function (e) {
      const el = e.target.closest('.ed-mark'); if (!el || !el._item) return;
      e.stopPropagation(); e.preventDefault();
      self.sel = el._item; self._renderList(); self._renderEdit(); self._syncHandles();
      const p = posOf(self.tab, el._item, self.D()); const w = self.R.unproject(e.clientX, e.clientY);
      self.drag = { item: el._item, startS: { x: e.clientX, y: e.clientY }, base: p ? { x: p.x, y: p.y } : { x: w.x, y: w.y }, moved: false, el: el };
      el.classList.add('drag'); el.classList.add('sel');
      try { el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    });
    // 片区选中后，四角出现缩放手柄，拖拽改变片区大小（以原多边形的包围盒为基准按比例缩放）
    this.handles.addEventListener('pointerdown', function (e) {
      const el = e.target.closest('.ed-handle'); if (!el || !self.sel || !self.sel.poly) return;
      e.stopPropagation(); e.preventDefault();
      self.rsz = { item: self.sel, corner: +el.dataset.corner, bbox0: bboxOf(self.sel.poly), poly0: self.sel.poly.map(function (q) { return [q[0], q[1]]; }) };
      try { el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    });
    window.addEventListener('pointermove', function (e) { self._onWinMove(e); });
    window.addEventListener('pointerup', function (e) { self._onWinUp(e); });
    window.addEventListener('keydown', function (e) {
      if (!self.open) return;
      if (e.key === 'Escape') { if (self.placing) { self.placing = false; self._render(); self._hint(''); } else self.exit(); }
      else if ((e.key === 'Delete' || e.key === 'Backspace') && self.sel && !/input|select|textarea/i.test((document.activeElement || {}).tagName || '')) { e.preventDefault(); self.deleteSel(); }
    });
  };

  Editor.prototype._watchEntry = function () {
    const self = this;
    setInterval(function () {
      const show = !!CM.game && !self.open;
      self.entry.classList.toggle('on', show);
    }, 300);
  };

  // ---------------- 进入 / 退出 ----------------
  Editor.prototype.enter = function () {
    if (!CM.game) return;
    this.open = true; this.placing = false; this.sel = null; this.drag = null; this.pan = null;
    this.root.classList.add('on'); this.entry.classList.remove('on');
    if (this.tools) this.tools.setTool('select');
    this._render(); this._rebuild(); this._updateStatus();
    this._raf = requestAnimationFrame(this._loop);
  };
  Editor.prototype.exit = function () {
    this.open = false; this.root.classList.remove('on');
    this._hint('');
    if (this._raf) cancelAnimationFrame(this._raf); this._raf = 0;
  };

  // ---------------- 指针：平移 / 放置 ----------------
  Editor.prototype._onCatchDown = function (e) {
    if (e.button === 2) return;
    this.pan = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, moved: false };
  };
  Editor.prototype._onWinMove = function (e) {
    if (!this.open) return;
    if (this.rsz) { const w = this.R.unproject(e.clientX, e.clientY); this._resizeTo(w.x, w.y); return; }
    if (this.drag) {
      const w = this.R.unproject(e.clientX, e.clientY);
      if (!this.drag.moved && Math.hypot(e.clientX - this.drag.startS.x, e.clientY - this.drag.startS.y) > 2) this.drag.moved = true;
      const x = U.clamp(w.x, 0, CM.CFG.W - 0.01), y = U.clamp(w.y, 0, CM.CFG.H - 0.01);
      if (this.tab === 'regions') { const dx = x - this.drag.base.x, dy = y - this.drag.base.y; this.drag.base = { x: x, y: y }; setPos(this.tab, this.drag.item, x, y, this.D(), dx, dy); }
      else setPos(this.tab, this.drag.item, x, y, this.D());
      return;
    }
    if (this.pan) {
      const dx = e.clientX - this.pan.x, dy = e.clientY - this.pan.y;
      if (!this.pan.moved && Math.hypot(e.clientX - this.pan.sx, e.clientY - this.pan.sy) > 4) this.pan.moved = true;
      if (this.pan.moved) this.R.panBy(dx, dy);
      this.pan.x = e.clientX; this.pan.y = e.clientY;
    }
  };
  Editor.prototype._onWinUp = function (e) {
    if (!this.open) return;
    if (this.rsz) { this.rsz = null; this._renderList(); return; }
    if (this.drag) { const el = this.drag.el; if (el) el.classList.remove('drag'); this.drag = null; this._renderList(); this._renderEdit(); return; }
    if (this.pan) {
      const moved = this.pan.moved; this.pan = null;
      if (!moved) {   // 视为点击
        if (this.placing) { this._place(e.clientX, e.clientY); }
        else { this.sel = null; this._renderList(); this._renderEdit(); }
      }
    }
  };

  // ---------------- 增 / 删 ----------------
  Editor.prototype._place = function (sx, sy) {
    const w = this.R.unproject(sx, sy);
    const x = U.clamp(w.x, 0, CM.CFG.W - 0.01), y = U.clamp(w.y, 0, CM.CFG.H - 0.01);
    const D = this.D(); this.seq++;
    const id = 'ed_' + this.tab.slice(0, 2) + '_' + Date.now().toString(36) + '_' + this.seq;
    let item;
    if (this.tab === 'landmarks') { item = { id: id, name: '新地标', x: x, y: y, w: 120, d: 90, kind: 'site' }; (D.landmarks = D.landmarks || []).push(item); }
    else if (this.tab === 'centers') { item = { x: x, y: y, pop: 8000, jobs: 4000, r: 1.1, name: '新商圈' }; (D.centers = D.centers || []).push(item); }
    else if (this.tab === 'facilities') { item = { id: id, n: '新设施', t: 'shop', at: [x, y], w: 0.01 }; (D.facilities = D.facilities || []).push(item); }
    else {   // 片区：以点击点为中心的 8×8 格矩形
      const hw = 4, hh = 4, yr = CM.game ? CM.game.year() : CM.CFG.START.y;
      item = { id: id, name: '新片区', poly: [[x - hw, y - hh], [x + hw, y - hh], [x + hw, y + hh], [x - hw, y + hh]].map(function (q) { return [U.clamp(q[0], 0, CM.CFG.W), U.clamp(q[1], 0, CM.CFG.H)]; }), open: yr, plan: 'res' };
      (D.regions = D.regions || []).push(item);
    }
    this.sel = item; this.placing = false; this._render(); this._rebuild();
    this._hint('');
  };
  Editor.prototype.deleteSel = function () {
    const it = this.sel; if (!it) return;
    const arr = this.list(); const i = arr.indexOf(it);
    if (i >= 0) arr.splice(i, 1);
    this.sel = null; this._render(); this._rebuild();
  };

  // 拖拽四角手柄：把原多边形从起始包围盒线性映射到新包围盒（保持形状、改变大小）
  Editor.prototype._resizeTo = function (mx, my) {
    const r = this.rsz; if (!r || !r.item.poly) return;
    const b = r.bbox0; let x0 = b[0], y0 = b[1], x1 = b[2], y1 = b[3];
    mx = U.clamp(mx, 0, CM.CFG.W); my = U.clamp(my, 0, CM.CFG.H);
    const c = r.corner;
    if (c === 0) { x0 = mx; y0 = my; } else if (c === 1) { x1 = mx; y0 = my; } else if (c === 2) { x1 = mx; y1 = my; } else { x0 = mx; y1 = my; }
    const min = 1;
    if (x1 - x0 < min) { if (c === 0 || c === 3) x0 = x1 - min; else x1 = x0 + min; }
    if (y1 - y0 < min) { if (c === 0 || c === 1) y0 = y1 - min; else y1 = y0 + min; }
    const bw = (b[2] - b[0]) || 1, bh = (b[3] - b[1]) || 1, poly = r.item.poly;
    for (let i = 0; i < r.poly0.length && i < poly.length; i++) {
      const q = r.poly0[i], u = (q[0] - b[0]) / bw, v = (q[1] - b[1]) / bh;
      poly[i][0] = U.clamp(x0 + u * (x1 - x0), 0, CM.CFG.W);
      poly[i][1] = U.clamp(y0 + v * (y1 - y0), 0, CM.CFG.H);
    }
  };

  // 片区被选中时显示四角缩放手柄；其它情况清空
  Editor.prototype._syncHandles = function () {
    if (!this.handles) return;
    this.handles.innerHTML = '';
    if (this.tab !== 'regions' || !this.sel || !this.sel.poly || !this.sel.poly.length) return;
    for (let i = 0; i < 4; i++) { const el = document.createElement('div'); el.className = 'ed-handle'; el.dataset.corner = i; this.handles.appendChild(el); }
  };

  // ---------------- 保存（两种）/ 重开 / 重置 ----------------
  Editor.prototype.snapshot = function () { return clone(subset(this.D())); };

  // 选项一：存到本机（localStorage 覆盖层，不改地图初始数据）
  Editor.prototype.saveLocal = function () {
    try {
      localStorage.setItem(ovKey(CM.mapId), JSON.stringify(subset(this.D())));
      this._toast('已存到本机：仅本浏览器生效（覆盖层），不改地图初始数据');
    } catch (e) { this._toast('保存失败：' + e.message); }
    this._updateStatus();
  };

  // 选项二：覆写本图原始数据（写回 CM.MAPS[id].data，并保存为新的初始数据；保留快照以便重置恢复）
  Editor.prototype.saveBaked = function () {
    if (!window.confirm('覆写本图原始数据？\n\n当前编辑会成为该图的初始数据（本浏览器内所有新游戏都用它）。\n之后可用「重置」恢复出厂数据。')) return;
    const id = CM.mapId, m = CM.MAPS[id], snap = this.snapshot();
    if (m && m.data) {
      if (!m._origData) m._origData = clone(subset(m.data));   // 首次覆写前留一份原样
      m.data.landmarks = snap.landmarks; m.data.centers = snap.centers; m.data.regions = snap.regions;
      m.data.defaultRegion = snap.defaultRegion; m.data.facilities = snap.facilities;
    }
    // 同步当前运行中的地图数据（下一次重开本图时完全生效）
    const D = this.D();
    D.landmarks = snap.landmarks; D.centers = snap.centers; D.regions = snap.regions;
    D.defaultRegion = snap.defaultRegion; D.facilities = snap.facilities;
    try { localStorage.setItem(bakedKey(id), JSON.stringify(snap)); localStorage.removeItem(ovKey(id)); } catch (e) { /* ignore */ }
    this.sel = null; this._render(); this._rebuild(); this._updateStatus();
    this._toast('已覆写本图原始数据（重开本图后完全生效）');
  };

  Editor.prototype.restart = function () {
    const g = CM.game; const mode = g ? g.mode : 'free'; const map = CM.mapId;
    this.exit();
    if (CM.newGame) CM.newGame({ map: map, mode: mode });
  };

  Editor.prototype.reset = function () {
    const id = CM.mapId, m = CM.MAPS[id];
    try { localStorage.removeItem(ovKey(id)); localStorage.removeItem(bakedKey(id)); } catch (e) { /* ignore */ }
    if (m && m._origData) {   // 覆写过：把地图数据对象恢复成覆写前的样子
      const o = m._origData;
      m.data.landmarks = o.landmarks; m.data.centers = o.centers; m.data.regions = o.regions;
      m.data.defaultRegion = o.defaultRegion; m.data.facilities = o.facilities;
      delete m._origData;
      const D = this.D();
      D.landmarks = o.landmarks; D.centers = o.centers; D.regions = o.regions;
      D.defaultRegion = o.defaultRegion; D.facilities = o.facilities;
    }
    this.sel = null; this._render(); this._rebuild(); this._updateStatus();
    this._toast('已清除本图编辑（本机 + 覆写），重开本图恢复出厂数据');
  };

  Editor.prototype._updateStatus = function () {
    if (!this.statusEl) return;
    const id = CM.mapId;
    const baked = !!readBaked(id), local = !!readOv(id);
    let s;
    if (baked) s = '本图：<b>已覆写原始数据</b>';
    else if (local) s = '本图：已存到本机（覆盖层）';
    else s = '本图：未保存编辑';
    this.statusEl.innerHTML = s;
  };

  // 载入地图时：先应用「覆写」到地图数据对象（在 useMap 的 Object.assign 之前），再应用「本机」覆盖层
  CM.Editor.bakeInto = function (m) {
    if (!m || !m.data) return;
    const baked = readBaked(m.id); if (!baked) return;
    if (!m._origData) m._origData = clone(subset(m.data));
    if (Array.isArray(baked.landmarks)) m.data.landmarks = baked.landmarks;
    if (Array.isArray(baked.centers)) m.data.centers = baked.centers;
    if (Array.isArray(baked.regions)) m.data.regions = baked.regions;
    if (baked.defaultRegion) m.data.defaultRegion = baked.defaultRegion;
    if (Array.isArray(baked.facilities)) m.data.facilities = baked.facilities;
  };
  CM.Editor.applyOverrides = function (id) {
    const o = readOv(id); if (!o) return;
    const D = CM.DATA;
    if (Array.isArray(o.landmarks)) D.landmarks = o.landmarks;
    if (Array.isArray(o.centers)) D.centers = o.centers;
    if (Array.isArray(o.regions)) D.regions = o.regions;
    if (o.defaultRegion) D.defaultRegion = o.defaultRegion;
    if (Array.isArray(o.facilities)) D.facilities = o.facilities;
  };

  // ---------------- 渲染 ----------------
  Editor.prototype._render = function () {
    // tabs 选中态
    const tabs = this.tabsEl.querySelectorAll('.ed-tab');
    for (const b of tabs) b.classList.toggle('on', b.dataset.k === this.tab);
    const addBtn = this.root.querySelector('#ed-add');
    addBtn.textContent = this.placing ? '点击地图放置…' : '＋ 添加';
    addBtn.classList.toggle('pri', !this.placing);
    this._renderList(); this._renderEdit(); this._syncHandles();
  };
  Editor.prototype._renderList = function () {
    const arr = this.list(), tab = this.tab, self = this;
    if (!arr.length) { this.bodyEl.innerHTML = '<div id="ed-empty">此类别暂无条目。<br>点「＋ 添加」后在地图上点击放置。</div>'; return; }
    const rows = arr.map(function (it, i) {
      const p = posOf(tab, it, self.D());
      const c = p ? Math.round(p.x) + ',' + Math.round(p.y) : '—';
      return '<div class="ed-row' + (it === self.sel ? ' sel' : '') + '" data-i="' + i + '">' +
        '<span class="ed-ri">' + esc(nameOf(tab, it)) + '</span><span class="ed-c">' + c + '</span>' +
        '<button class="ed-del" data-del="' + i + '" title="删除">×</button></div>';
    }).join('');
    this.bodyEl.innerHTML = rows;
    this.bodyEl.onclick = function (e) {
      const d = e.target.closest('[data-del]');
      if (d) { e.stopPropagation(); const i = +d.dataset.del; self.list().splice(i, 1); self.sel = null; self._render(); self._rebuild(); return; }
      const r = e.target.closest('.ed-row'); if (!r) return;
      const it = self.list()[+r.dataset.i]; if (!it) return;
      self.sel = it; self._renderList(); self._renderEdit(); self._syncHandles();
      const p = posOf(tab, it, self.D()); if (p && self.R.cam) { self.R.cam.cx = p.x; self.R.cam.cy = p.y; self.R.cam.fly = null; if (self.R.computeTransform) self.R.computeTransform(); }
    };
  };
  Editor.prototype._renderEdit = function () {
    const it = this.sel;
    if (!it) { this.editEl.innerHTML = '<div style="color:var(--muted);font-size:12px;text-align:center">选中一个条目以编辑属性</div>'; return; }
    const D = this.D(), tab = this.tab;
    let fs = '';
    const field = function (label, f, val, type, extra) { return '<div class="ed-f"><label>' + label + '</label><input data-f="' + f + '" type="' + (type || 'text') + '" value="' + esc(val) + '" ' + (extra || '') + '></div>'; };
    const sel = function (label, f, val, opts) { return '<div class="ed-f"><label>' + label + '</label><select data-f="' + f + '">' + opts.map(function (o) { const v = Array.isArray(o) ? o[0] : o, n = Array.isArray(o) ? o[1] : o; return '<option value="' + esc(v) + '"' + (String(val) === String(v) ? ' selected' : '') + '>' + esc(n) + '</option>'; }).join('') + '</select></div>'; };

    if (tab === 'landmarks') {
      fs += field('名称', 'name', it.name || '');
      fs += sel('类型', 'kind', it.kind || 'site', LM_KINDS);
      fs += field('宽(米)', 'w', it.w || 100, 'number');
      fs += field('深(米)', 'd', it.d || 80, 'number');
      fs += field('高(米)', 'h', it.h || 0, 'number');
    } else if (tab === 'centers') {
      fs += field('名称', 'name', it.name || '');
      fs += field('人口', 'pop', Math.round(it.pop || 0), 'number');
      fs += field('岗位', 'jobs', Math.round(it.jobs || 0), 'number');
      fs += field('半径', 'r', it.r || 1, 'number', 'step="0.1"');
    } else if (tab === 'regions') {
      fs += field('名称', 'name', it.name || '');
      fs += field('开放年', 'open', it.open == null ? '' : it.open, 'number');
      fs += sel('用地', 'plan', it.plan || 'res', PLAN_OPTS);
      const p = posOf(tab, it, D); if (p) fs += '<div class="ed-f"><label>中心</label><input value="' + Math.round(p.x) + ', ' + Math.round(p.y) + '" disabled></div>';
    } else {
      fs += field('名称', 'n', it.n || '');
      const types = CM.Fac && CM.Fac.TYPES ? Object.keys(CM.Fac.TYPES).map(function (k) { return [k, CM.Fac.TYPES[k].name]; }) : ['shop'];
      fs += sel('类型', 't', it.t || 'shop', types);
      if (typeof it.w === 'number') fs += field('权重', 'w', it.w, 'number', 'step="0.001"');
      if (it.lm) fs += '<div style="color:var(--muted);font-size:11px;margin-top:2px">位置跟随地标 ' + esc(it.lm) + '</div>';
    }
    fs += '<button class="ed-btn danger" id="ed-del-sel" style="margin-top:6px">删除此' + this.tabDef().name + '</button>';
    this.editEl.innerHTML = fs;
    const del = this.editEl.querySelector('#ed-del-sel'); if (del) del.onclick = function () { this.deleteSel(); }.bind(this);
  };

  // 重建标记与片区轮廓
  Editor.prototype._rebuild = function () {
    this.marks.innerHTML = ''; this.svg.innerHTML = '';
    const D = this.D(), tab = this.tab, arr = this.list(), def = this.tabDef();
    const NS = 'http://www.w3.org/2000/svg';
    if (tab === 'regions') {
      for (const it of arr) {
        const p = it.poly; if (!p || !p.length) continue;
        const poly = document.createElementNS(NS, 'polygon');
        poly.setAttribute('fill', def.color + '22'); poly.setAttribute('stroke', def.color); poly.setAttribute('stroke-width', '1.5');
        poly._poly = p; poly._item = it; this.svg.appendChild(poly);
      }
    }
    for (const it of arr) {
      const el = document.createElement('div'); el.className = 'ed-mark'; el._item = it;
      const dot = document.createElement('div'); dot.className = 'ed-dot'; dot.style.background = def.color;
      const lab = document.createElement('div'); lab.className = 'ed-lab'; lab.textContent = nameOf(tab, it);
      el.appendChild(dot); el.appendChild(lab);
      if (it === this.sel) el.classList.add('sel');
      this.marks.appendChild(el);
    }
    this._positions(); this._syncHandles();
  };

  Editor.prototype._positions = function () {
    const D = this.D(), tab = this.tab, R = this.R, arr = this.list();
    const marks = this.marks.children;
    for (let i = 0; i < arr.length && i < marks.length; i++) {
      const it = arr[i], p = posOf(tab, it, D), el = marks[i];
      if (!p) { el.style.display = 'none'; continue; }
      const s = R.P(p.x, p.y, 0);
      el.style.display = ''; el.style.left = s.x + 'px'; el.style.top = s.y + 'px';
    }
    if (tab === 'regions') {
      for (const poly of this.svg.children) {
        const pts = poly._poly, out = [];
        for (const q of pts) { const s = R.P(q[0], q[1], 0); out.push(s.x.toFixed(1) + ',' + s.y.toFixed(1)); }
        poly.setAttribute('points', out.join(' '));
        const selNow = poly._item === this.sel; poly.setAttribute('stroke-width', selNow ? '3' : '1.5');
      }
    }
    if (this.handles && this.handles.children.length === 4 && this.sel && this.sel.poly && this.sel.poly.length) {
      const b = bboxOf(this.sel.poly), cs = [[b[0], b[1]], [b[2], b[1]], [b[2], b[3]], [b[0], b[3]]], hs = this.handles.children;
      for (let i = 0; i < 4; i++) { const s = R.P(cs[i][0], cs[i][1], 0); hs[i].style.left = s.x + 'px'; hs[i].style.top = s.y + 'px'; }
    }
  };

  Editor.prototype._loop = function () {
    if (!this.open) return;
    if (!CM.game) { this.exit(); return; }
    this._positions();
    this._raf = requestAnimationFrame(this._loop);
  };

  Editor.prototype._hint = function (txt) {
    if (!txt) { this.hintEl.classList.remove('on'); this.hintEl.textContent = ''; return; }
    this.hintEl.textContent = txt; this.hintEl.classList.add('on');
  };
  Editor.prototype._toast = function (txt) { this._hint(txt); clearTimeout(this._toastT); this._toastT = setTimeout(function () { this._hint(''); }.bind(this), 2200); };

  // 载入地图时应用本图保存的编辑：先「覆写原始数据」写入 m.data（须在 useMap 的 Object.assign 之前），
  // 再应用「存到本机」的覆盖层（叠加在覆写之上）
  if (CM.useMap) {
    const orig = CM.useMap;
    CM.useMap = function (id) {
      try { Editor.bakeInto(CM.MAPS[id] || CM.MAPS.gz); } catch (e) { /* ignore */ }
      const m = orig(id);
      try { Editor.applyOverrides(id); } catch (e) { /* ignore */ }
      return m;
    };
  }
})(window.CM);
