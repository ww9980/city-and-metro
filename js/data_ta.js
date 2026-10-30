'use strict';
// 泰安 · 2000 场景。地理来自 OpenStreetMap（geo_ta.js，现代数据），本文件补充 2000 年起的区域开放、泰山与山城关系、
// 道路与铁路年份、人口就业中心、地标、历史事件、本地任务与人民币经营参数。坐标单位为格（250 m），用 ll(纬度, 经度) 换算。
// 开局没有地铁（泰安至今没有城市轨道交通），路网完全由玩家规划。
// 真实性：泰山世界遗产、京沪高铁泰安站的年份为史实参考（范围为近似）；2000 年人口与就业分布、造价与票价为估算。
(function (CM) {
  const G = CM.GEOS && CM.GEOS.ta; if (!G) return;
  const P = G.proj, ll = function (lat, lon) { return [+((lon - P.lon0) * P.kx).toFixed(2), +((P.lat0 - lat) * P.ky).toFixed(2)]; };
  const at = function (lat, lon, o) { const p = ll(lat, lon); return Object.assign({ x: p[0], y: p[1] }, o); };
  const poly = function (pts) { return pts.map(function (p) { return ll(p[0], p[1]); }); };
  const anchor = function (name, lat, lon, r) { const p = ll(lat, lon); return { name: name, x: p[0], y: p[1], r: r }; };

  // 泰山风景名胜区：山体主体（近似，北侧到图边）；南界沿环山路，山体不越过环山路进入城区
  const taishan = poly([
    [36.2630, 116.9910], [36.2630, 117.1690], [36.2291, 117.1690],
    [36.2275, 117.1615], [36.2263, 117.1570], [36.2190, 117.1505],
    [36.2169, 117.1465], [36.2094, 117.1406], [36.2049, 117.1293],
    [36.2073, 117.1193], [36.2060, 117.1028], [36.2049, 117.0963],
    [36.2039, 117.0823], [36.2062, 117.0727], [36.2094, 117.0670],
    [36.2146, 117.0532], [36.2169, 117.0464], [36.2235, 117.0352],
    [36.2324, 117.0233], [36.2374, 117.0131], [36.2518, 117.0039],
  ]);
  // 岱庙—红门—天外村之间的老城与登山入口
  const oldcity = poly([[36.1960, 117.0850], [36.1960, 117.1200], [36.1780, 117.1200], [36.1780, 117.0850]]);

  const data = {
    city: '泰安', riverName: '汶河', seaName: '汶河', hsrYear: 2011,
    stages: [[2005, '山城发展期'], [2011, '高铁与旅游期'], [2020, '新城开发期']], stageLast: '山城都会期',
    briefing: {
      lead: '2000 年的泰安：泰山在北，城市在南，岱庙与红门之间是老城的商业街，环山路把登山入口连起来。城市规模不大，公交与自行车足够；泰山的游客一年比一年多，火车站与登山口之间的短途接驳成了最忙的走廊。',
      modes: [
        ['metro', '地铁', '泰安没有城市轨道交通，你将规划这座城市的第一张轨道网。'],
        ['bus', '公交与自行车', '青年路、东岳大街沿线在节假日与登山旺季拥堵。'],
        ['bridge', '山地', '泰山山体与风景名胜区不能开发，线路只能绕行或地下穿越。'],
        ['rail', '铁路', '泰山站与 2011 年的京沪高铁泰安站承担对外交通。列车本身不参与模拟，但车站会产生市内接驳出行。'],
      ],
    },
    dataNote: [
      ['真实地理', 'hist', '泰山山体与风景名胜区、河流与水库、道路与铁路、公园与林地、行政区（区）边界、地名与地标场地来自 OpenStreetMap（© OpenStreetMap 贡献者，ODbL），2026-10-24 取数、按 250 m 网格投影（转换见 scripts/fetch-osm.mjs 与 scripts/geo-import.mjs）；OSM 为现代数据，按 2000 年场景作历史近似。'],
      ['史实参考', 'hist', '1987 年泰山列入世界自然与文化双遗产、2011 年京沪高铁泰安站启用。泰山索道与登山步道为背景，不参与模拟。'],
      ['估算', 'est', '2000 年人口与就业分布、人口增长曲线、出行率、时间价值、造价、票价与运营费用（人民币）。'],
      ['模拟', 'sim', '2020 年之后的发展、居民出行选择、道路拥堵、客流与财政结果。'],
      ['', '', '模拟结果不得作为真实泰安交通规划预测。'],
    ],
    airport: null,
    regions: [
      { id: 'taishan', name: '泰山风景名胜区', scenic: true, open: null, poly: taishan },
      { id: 'oldcity', name: '老城（岱庙）', poly: oldcity, open: 2000, plan: 'oldmix' },
      { id: 'taishanq', name: '泰山区（青年路·东岳大街）', district: ['泰山区'], open: 2000, plan: 'mix' },
      { id: 'daiyue', name: '岱岳区（西部·南部）', district: ['岱岳区'], open: 2000, plan: 'res' },
      { id: 'highzone', name: '泰安高新区', poly: poly([[36.1750, 117.0700], [36.1750, 117.0000], [36.1550, 117.0000], [36.1550, 117.0700]]), open: 2005, plan: 'mix' },
    ],
    defaultRegion: { id: 'outer', name: '外围（山北·汶河以南）', open: 2008, plan: 'res' },
    plans: CM.DATA.plans,

    centers: [
      at(36.1880, 117.1020, { pop: 26000, jobs: 16000, r: 1.0 }),   // 岱庙、青年路
      at(36.1900, 117.0950, { pop: 18000, jobs: 12000, r: 0.9 }),   // 泰山站、火车站片区
      at(36.1830, 117.1150, { pop: 20000, jobs: 8000, r: 1.0 }),    // 东岳大街东段
      at(36.1950, 117.0850, { pop: 12000, jobs: 5000, r: 0.9 }),    // 天外村、环山路西
      at(36.2000, 117.1050, { pop: 6000, jobs: 3000, r: 0.8 }),     // 红门、登山入口
      at(36.1750, 117.0800, { pop: 14000, jobs: 6000, r: 1.1 }),    // 高新区
      at(36.1700, 117.1200, { pop: 12000, jobs: 4000, r: 1.2 }),    // 南部居住区
      at(36.1900, 117.0600, { pop: 12000, jobs: 4000, r: 1.2 }),    // 西部（天平湖）
    ],
    rural: { pop: 400, jobs: 100 },
    roadYears: {
      '东岳大街': 2000, '青年路': 2000, '环山路': 2000, '岱宗大街': 2000, '长城路': 2003, '迎胜路': 2002,
      '灵山大街': 2005, '擂鼓石大街': 2006, '泰肥一级路': 2001, '京台高速公路': 1999, '泰莱高速公路': 2002,
      '泰新高速公路': 2007, '天烛峰路': 2008,
    },
    bridgeYears: { '汶河大桥': 1990, '天平湖桥': 2003 },
    bridgeDefaultYear: 2000,
    simRoads: [],
    landmarks: [
      Object.assign(at(36.1942, 117.1251), { id: 'ta_daimiao', name: '岱庙', w: 400, d: 300, year: 1008, kind: 'temple' }),
      Object.assign(at(36.2066, 117.1223), { id: 'ta_hongmen', name: '红门', w: 120, d: 90, year: 1626, kind: 'traditional' }),
      Object.assign(at(36.2561, 117.1035), { id: 'ta_nantianmen', name: '南天门', w: 80, d: 60, year: 1264, kind: 'tower', h: 20 }),
      Object.assign(at(36.2561, 117.1035), { id: 'ta_yuhuang', name: '玉皇顶', w: 80, d: 60, year: 1008, kind: 'temple', h: 1532 }),
      Object.assign(at(36.2068, 117.1002), { id: 'ta_tianwaicun', name: '天外村', w: 160, d: 120, year: 1900, kind: 'hall' }),
      Object.assign(at(36.1865, 117.1031), { id: 'ta_station', name: '泰山站', w: 220, d: 140, year: 1909, kind: 'rail' }),
      Object.assign(at(36.1942, 117.1120), { id: 'ta_sdau', name: '山东农业大学', w: 800, d: 600, year: 1906, kind: 'campus' }),
      Object.assign(at(36.2007, 117.1268), { id: 'ta_tsmc', name: '山东科技大学', w: 700, d: 500, year: 1974, kind: 'campus' }),
      Object.assign(at(36.2068, 117.1110), { id: 'ta_puzhaosi', name: '普照寺', w: 140, d: 110, year: 520, kind: 'temple' }),
      Object.assign(at(36.2068, 117.1254), { id: 'ta_wangmuchi', name: '王母池', w: 100, d: 80, year: 220, kind: 'temple' }),
      Object.assign(at(36.2039, 117.0639), { id: 'ta_stadium', name: '泰安市体育中心', w: 260, d: 220, year: 1995, kind: 'stadium' }),
      Object.assign(at(36.1769, 117.0294), { id: 'ta_hsstation', name: '泰安站（高铁）', w: 300, d: 200, year: 2011, kind: 'rail' }),
      Object.assign(at(36.2244, 117.0321), { id: 'ta_taishanxueyuan', name: '泰山学院', w: 400, d: 300, year: 2002, kind: 'campus' }),
    ],
    facilities: [
      { id: 'ta_rail', n: '泰山站', t: 'rail', lm: 'ta_station', pax: [[2000, 1.2], [2011, 0.9], [2020, 1.0], [2030, 1.1]] },
      { id: 'ta_hsr', n: '泰安站（高铁）', t: 'rail', lm: 'ta_hsstation', pax: [[2011, 1.2], [2015, 1.6], [2030, 1.8]], note: '2011 年京沪高铁通车后启用。' },
      { id: 'ta_sdau', n: '山东农业大学', t: 'uni', lm: 'ta_sdau', w: 0.022, note: '2004 年前主校区在泰安，此后迁出，岱宗校区保留。' },
      { id: 'ta_tsmc', n: '山东科技大学', t: 'uni', lm: 'ta_tsmc', w: 0.016 },
      { id: 'ta_taishanxueyuan', n: '泰山学院', t: 'uni', lm: 'ta_taishanxueyuan', w: 0.018, note: '2002 年 3 月合并成立。' },
      { id: 'ta_central', n: '泰安市中心医院', t: 'hosp', at: ll(36.1890, 117.0870), w: 0.04 },
      { id: 'ta_tsmch', n: '泰山医学院附属医院', t: 'hosp', at: ll(36.1860, 117.1100), w: 0.03 },
      { id: 'ta_daimiao', n: '岱庙', t: 'scenic', lm: 'ta_daimiao', w: 0.025 },
      { id: 'ta_hongmen', n: '红门·登山入口', t: 'scenic', lm: 'ta_hongmen', w: 0.3 },
      { id: 'ta_tianwai', n: '天外村·索道下站', t: 'scenic', lm: 'ta_tianwaicun', w: 0.24 },
      { id: 'ta_zhongtian', n: '中天门', t: 'scenic', lm: 'ta_zhongtianmen', w: 0.01 },
      { id: 'ta_yuhuang', n: '玉皇顶', t: 'scenic', lm: 'ta_yuhuang', w: 0.015 },
      { id: 'ta_puzhaosi', n: '普照寺', t: 'scenic', lm: 'ta_puzhaosi', w: 0.006 },
      { id: 'ta_shop', n: '青年路商圈', t: 'shop', at: ll(36.1875, 117.1225), r: 0.9, w: 0.035 },
      { id: 'ta_east', n: '财源街商圈', t: 'shop', at: ll(36.1830, 117.1150), w: 0.015 },
      { id: 'ta_cbd', n: '泰安商务区（东岳大街）', t: 'cbd', at: ll(36.1850, 117.1080), w: 0.012 },
      { id: 'ta_wanda', n: '万达广场', t: 'shop', at: ll(36.1822, 117.0810), w: 0.03, note: '2015 年开业。' },
      { id: 'ta_yinzuo', n: '银座（泰山站旁）', t: 'shop', at: ll(36.1831, 117.0966), w: 0.025, note: '2001 年 1 月 12 日开业。' },
      { id: 'ta_liangyou', n: '泰安良友百货超市', t: 'shop', at: ll(36.1860, 117.1000), w: 0.02, note: '2004 年 1 月 6 日开业，替代亚细亚商城，5 年后倒闭。' },
      { id: 'ta_sihai', n: '四海商城', t: 'shop', at: ll(36.1840, 117.1050), w: 0.02, note: '1996 年 1 月 28 日开业，存续 18 年。' },
      { id: 'ta_stadium', n: '泰安市体育中心', t: 'stadium', lm: 'ta_stadium', w: 0.008 },
      { id: 'ta_taishan', n: '泰山风景名胜区', t: 'park', at: ll(36.2300, 117.1080), r: 2.0, w: 0.03 },
    ],
    districtLabels: [['泰山', ['泰山区']], ['岱岳', ['岱岳区']]],
    events: [
      { y: 2000, m: 1, tag: '史实', title: '2000 年的泰安', desc: '市区约 60 万人。泰山在北，岱庙与红门之间是老城商业街；没有轨道交通，登山游客与市民共用几条主干道。' },
      { y: 2005, m: 1, tag: '估算', title: '高新区起步', desc: '城市向东南扩展，高新区开始成片开发。' },
      { y: 2008, m: 1, tag: '估算', title: '旅游客流持续增长', desc: '泰山年游客量逐年增加，登山入口与火车站之间的接驳压力上升。' },
      { y: 2011, m: 6, tag: '史实', title: '京沪高铁通车，泰安站启用', desc: '高铁站在城西，与老城之间需要新的接驳走廊。' },
      { y: 2021, m: 1, tag: '模拟', title: '进入模拟发展阶段', desc: '此后人口、道路和区域变化按模拟规则推演，不代表真实历史。' },
    ],
    histTasks: [
      { id: 'ta1', appear: [2000, 3], deadline: [2010, 12], type: 'connect', reward: 60000, title: '山城纵轴', desc: '连接泰山站、岱庙与红门，这是登山客流与市民共用的走廊。', anchors: [anchor('泰山站', 36.1865, 117.1031, 3), anchor('岱庙', 36.1942, 117.1251, 2), anchor('红门', 36.2066, 117.1223, 2)] },
      { id: 'ta2', appear: [2001, 1], deadline: [2012, 12], type: 'connect', reward: 70000, title: '东西向主干', desc: '沿东岳大街连接火车站片区、青年路与东部居住区。', anchors: [anchor('泰山站', 36.1865, 117.1031, 3), anchor('青年路', 36.1875, 117.1225, 2), anchor('体育中心', 36.2046, 117.06336, 3)] },
      { id: 'ta3', appear: [2005, 1], deadline: [2015, 12], type: 'connect', reward: 60000, title: '高新区接驳', desc: '高新区就业增长，连接高新区、南部居住区与老城。', anchors: [anchor('高新区', 36.1750, 117.0800, 3), anchor('南部居住区', 36.1700, 117.1200, 3), anchor('岱庙', 36.1942, 117.1251, 2)] },
      { id: 'ta4', appear: [2008, 1], deadline: [2015, 12], type: 'coverage', target: 0.35, reward: 80000, title: '旅游城市的覆盖', desc: '步行 15 分钟可到达车站的人口不低于 35%。' },
      { id: 'ta5', appear: [2011, 6], deadline: [2020, 12], type: 'connect', reward: 80000, title: '高铁站接驳', desc: '京沪高铁泰安站在城西，把它与老城、红门连起来。', anchors: [anchor('泰安站（高铁）', 36.1769, 117.0294, 3), anchor('泰山站', 36.1865, 117.1031, 3), anchor('红门', 36.2066, 117.1223, 2)] },
    ],
    dynTasks: [
      { id: 'tad1', from: [2003, 1], to: [2015, 12], type: 'connect', months: 36, reward: 25000, title: '登山旺季', desc: '节假日登山客流集中，连接天外村、红门与泰山站。', anchors: [anchor('天外村', 36.2068, 117.1002, 2), anchor('红门', 36.2066, 117.1223, 2), anchor('泰山站', 36.1865, 117.1031, 3)] },
      { id: 'tad2', from: [2012, 1], to: [2025, 12], type: 'connect', months: 42, reward: 30000, title: '西部新城', desc: '高铁站周边开发，连接泰安站、高新区与老城。', anchors: [anchor('泰安站（高铁）', 36.1769, 117.0294, 3), anchor('高新区', 36.1750, 117.0800, 3)] },
    ],
    taskNote: '历史主题任务参考泰安 2000 年起的实际需求（山城纵轴、东西主干、高新区、旅游覆盖与高铁接驳），不要求按真实线路建设。',
    lineColorsNice: ['#c8102e', '#0072bc', '#f6a800', '#00a651', '#8e44ad', '#00a8a8', '#d35400', '#5c6bc0'],
    places: (G.places || []).map(function (p) { return [p[0], p[1], p[2], p[3]]; }),
  };

  // 阶段目标的锚点：用地标 / 设施的既有坐标，避免手填经纬度与投影不一致（名称写错时载入即报错）
  const site = function (name, r) {
    const L = data.landmarks || [], F = data.facilities || [];
    const byName = L.find(function (l) { return l.name === name; });
    if (byName && typeof byName.x === 'number') return { name: name, x: byName.x, y: byName.y, r: r };
    const f = F.find(function (x) { return x.n === name; });
    if (f) {
      const l2 = f.lm && L.find(function (l) { return l.id === f.lm; });
      if (l2 && typeof l2.x === 'number') return { name: name, x: l2.x, y: l2.y, r: r };
      if (f.at) return { name: name, x: f.at[0], y: f.at[1], r: r };
    }
    throw new Error('泰安：阶段目标锚点未找到 ' + name);
  };

  // 历史发展阶段（v2.2，eras.js）：summary 中「史实」可查证，「估算」为模型设定的发展倾向；grow 只改变人口与岗位增长的去向
  // （总量仍按人口曲线），relocate 为每月疏解比例，corridors 为片区间通勤与购物去向倍数，demand 为出行强度与距离倍数，
  // goals 为阶段目标（本城任务，奖励单位：万元）
  data.eras = [
    { id: 'ta-e1', from: 2000, name: '岱庙与山城', tag: '史实',
      summary: '史实：2000 年的泰安是一座以泰山旅游与铁路枢纽为生的小城，城区沿东岳大街东西展开，京沪铁路从城西经过。估算：人口与就业集中在岱庙、青年路与财源街一带，高新区尚未成形，登山客流集中在节假日。',
      grow: { pop: { oldcity: 0.95, taishanq: 1.1, daiyue: 1.1 }, jobs: { oldcity: 1.1, taishanq: 1.15 } },
      relocate: { pop: { oldcity: 0.0003 } },
      demand: { decayHW: 1.0, lz: 1.1 },
      corridors: [{ a: 'taishanq', b: 'oldcity', f: 1.15 }, { a: 'daiyue', b: 'oldcity', f: 1.05 }],
      goals: [{ id: 'ta-g1', from: 2002, type: 'connect', months: 60, reward: 25000, title: '登山入口接驳', desc: '节假日的登山客流从泰山站涌向红门与天外村，公交排起长队。用地铁把泰山站与红门连起来。', anchors: [site('泰山站', 3), site('红门', 3)] }] },
    { id: 'ta-e2', from: 2005, name: '高新区起步', tag: '史实',
      summary: '史实：2005 年前后泰安高新区开始成片开发，城市重心逐步向东、向西两侧扩展。估算：老城人口向泰山大街与西部新区疏解，高新区的产业与就业开始增长，旅游客流随收入提高逐年增加。',
      grow: { pop: { highzone: 1.6, daiyue: 1.25, taishanq: 1.1, oldcity: 0.9 }, jobs: { highzone: 1.8, taishanq: 1.15, oldcity: 1.0 } },
      relocate: { pop: { oldcity: 0.0004 } },
      demand: { decayHW: 1.05, lz: 1.1 },
      corridors: [{ a: 'highzone', b: 'oldcity', f: 1.15 }, { a: 'taishanq', b: 'oldcity', f: 1.1 }],
      goals: [{ id: 'ta-g2', from: 2007, type: 'connect', months: 60, reward: 25000, title: '高新区接驳', desc: '高新区的工厂与园区开始招工，职工多住在老城与东岳大街沿线。用地铁把青年路商圈与高新区连起来。', anchors: [site('青年路商圈', 3), site('山东科技大学', 4)] }] },
    { id: 'ta-e3', from: 2011, name: '高铁与旅游期', tag: '史实',
      summary: '史实：2011 年 6 月京沪高铁通车，泰安站启用，从北京、上海到泰山的时间大幅缩短。估算：高铁站周边与西部新区开始建设，旅游客流明显增长，节假日的老城与登山入口压力更大。',
      grow: { pop: { daiyue: 1.35, highzone: 1.4, taishanq: 1.1, oldcity: 0.88 }, jobs: { highzone: 1.5, daiyue: 1.3, taishanq: 1.2, oldcity: 1.0 } },
      demand: { decayHW: 1.05, lz: 1.15, hub: 1.15 },
      corridors: [{ a: 'daiyue', b: 'oldcity', f: 1.2 }, { a: 'highzone', b: 'oldcity', f: 1.15 }],
      goals: [{ id: 'ta-g3', from: 2011, type: 'connect', months: 60, reward: 30000, title: '高铁站进城', desc: '京沪高铁泰安站启用后，旅客需要进城。用地铁把泰安站与东岳大街的商务区连起来。', anchors: [site('泰安站（高铁）', 4), site('泰安商务区（东岳大街）', 3)] }] },
    { id: 'ta-e4', from: 2020, name: '新城开发期', tag: '史实',
      summary: '史实：2020 年前后泰安继续向西、向东扩展，高铁片区与高新区成为新的建设重点。估算：老城人口基本稳定，西部新城与高新区吸纳新增人口，旅游与休闲出行占比继续提高。',
      grow: { pop: { daiyue: 1.35, highzone: 1.35, taishanq: 1.05, oldcity: 0.9 }, jobs: { daiyue: 1.35, highzone: 1.35, taishanq: 1.15, oldcity: 1.0 } },
      demand: { hw: 1.02, decayHW: 1.1, lz: 1.15, hub: 1.1 },
      corridors: [{ a: 'daiyue', b: 'taishanq', f: 1.2 }, { a: 'highzone', b: 'taishanq', f: 1.1 }],
      goals: [{ id: 'ta-g4', from: 2020, type: 'connect', months: 60, reward: 35000, title: '高铁站到登山口', desc: '高铁客流与登山客流在同一座城市里交汇。用地铁把泰安站与红门连起来。', anchors: [site('泰安站（高铁）', 4), site('红门', 3)] }] },
    { id: 'ta-e5', from: 2021, name: '模拟未来', tag: '模拟',
      summary: '模拟：此后的发展按模型推演，不代表真实历史。估算：西部新城与高新区继续成长，老城保持稳定，旅游客流随城市名气提高。',
      grow: { pop: { daiyue: 1.25, highzone: 1.25, taishanq: 1.05, oldcity: 0.92 }, jobs: { daiyue: 1.25, highzone: 1.25, taishanq: 1.1 } },
      demand: { lz: 1.1, decayHW: 1.05 }, corridors: [{ a: 'daiyue', b: 'taishanq', f: 1.1 }] },
  ];

  const INF = [[2000, 0.004], [2004, 0.039], [2008, 0.059], [2012, 0.026], [2016, 0.02], [2020, 0.025], [2030, 0.02], [2050, 0.02]];
  (CM.MAP_LIST = CM.MAP_LIST || []).push({
    id: 'ta', name: '泰安', title: '泰安 · 2000', sub: '真实地理 · 2000 年起 · 人民币',
    desc: '从 2000 年的泰安开始：泰山在北，城市在南，岱庙到红门是老城最热闹的一段。城市不大，但登山客流与市民通勤都压在几条路上。你要用一条小规模的轨道网，把山门、车站与新区连起来。',
    facts: [['范围', '16 km × 14 km'], ['起始', '2000 年'], ['人口', '约 60 万'], ['货币', '人民币（CNY）'], ['模式', '经营挑战 / 自由建造']],
    modes: ['challenge', 'free'], kind: 'real', mapVersion: 2, scenario: 'ta-2000',
    region: '中国内地', tagline: '泰山脚下的山城', difficulty: 1, tags: ['无地铁开局', '山地', '旅游城市'],
    intro: '2000 年的泰安是一座山脚下的小城：泰山在北，城区沿山脚展开，岱庙、红门与天外村是三条登山入口。城市没有地铁，公交线路沿东岳大街与青年路集中。你要在最少的线路上，同时照顾市民通勤与一年几百万的登山客流。',
    features: [['mountain', '泰山不可开发', '山体与风景名胜区限制选线，只能绕行或地下穿越'], ['building', '山城格局', '老城沿山脚展开，岱庙与红门是受保护的历史片区'], ['train', '高铁接驳', '2011 年京沪高铁泰安站在城西，需要新的接驳走廊'], ['coin', '人民币经营', '城市规模小，资金与客流都紧，早期线路必须精打细算']],
    highlights: [[2005, '高新区起步'], [2011, '京沪高铁泰安站启用']],
    geo: G, data: data,
    econ: { devOffset: 0, money: 1 },
    cfg: {
      W: 64, H: 56, START: { y: 2000, m: 1, d: 1, minute: 360 },
      growth: Object.assign({}, CM.CFG.growth, { popCurve: [[2000, 6.0e5], [2005, 6.8e5], [2010, 7.5e5], [2015, 8.2e5], [2020, 9.0e5], [2030, 9.6e5], [2050, 1.0e6], [2300, 1.05e6]], histEnd: 2020, jobsRatio: [[2000, 0.48], [2010, 0.52], [2020, 0.55], [2040, 0.56]] }),
      money: { code: 'CNY', unit: '元', wan: '万元', yi: '亿元', sym: '¥' },
      econBase: 2000,
      cost: Object.assign({}, CM.CFG.cost, {
        trackPerKm: { underground: 30000, surface: 6000, elevated: 12000 },
        riverPerKm: { underground: 20000, surface: 15000, elevated: 15000 },
        hillPerKm: 14000, protectedPerKm: 6000,
        station: { underground: { S: 10000, M: 17000, L: 28000 }, elevated: { S: 6000, M: 10000, L: 15000 }, surface: { S: 4000, M: 6500, L: 9500 } },
        demolishPerCell: 26000,
        inflation: INF,
      }),
      ops: Object.assign({}, CM.CFG.ops, { carKmCost: 0.0009, stationDaily: { S: 1.3, M: 2.2, L: 3.6 }, inflation: INF }),
      fareDefault: { mode: 'flat', flat: 1 }, fareRange: { min: 0, max: 5, step: 0.5 },
      economy: Object.assign({}, CM.CFG.economy, { startFunds: 120000, grantBase: [[2000, 8000], [2005, 12000], [2010, 20000], [2015, 26000], [2020, 32000], [2050, 50000]], debtLimit: -80000, rewardScale: 0.5,
        bonds: { local: { rate: [[2000, 0.045], [2004, 0.042], [2008, 0.04], [2012, 0.035], [2015, 0.032], [2020, 0.032], [2050, 0.03]], quotaMonths: 6, capMonths: 30 }, ct: { spread: 0.02, quotaMonths: 4, capMonths: 18 }, term6: 0.004 } }),
      // 城市经济：2000 年地图范围 GDP 约 180 亿元（估算：全市约 400 亿元，地图覆盖泰山区与岱岳区北部）
      macro: {
        area: '地图范围（泰山区与岱岳区北部）', region: '山东',
        gdp0: 1800000, revRatio: [[2000, 0.14], [2010, 0.19], [2020, 0.18], [2040, 0.17]], revElastic: 1.5,
        prod: [[2000, 0.09], [2005, 0.1], [2008, 0.085], [2011, 0.075], [2015, 0.055], [2019, 0.045], [2025, 0.035], [2035, 0.022], [2050, 0.015], [2080, 0.012]],
        infl: 'cn', longRun: { infl: 0.02 }, histEnd: 2020, ref: 'cn',
        struct: { trade: 0.4, fin: 0.25, ind: 0.45, tour: 0.85, prop: 0.4 },
        events: [
          { id: 'wto2001', y: 2001, m: 12 },
          { id: 'sars2003', y: 2003, m: 2, scale: 1.2 },
          { id: 'gfc2008', y: 2008, m: 9, scale: 0.8 },
          { id: 'stim2008', y: 2008, m: 11 },
          { id: 'cnstock2015', y: 2015, m: 6 },
          { id: 'trade2018', y: 2018, m: 7, scale: 0.8 },
          { id: 'covid2020', y: 2020, m: 1, scale: 1.3 },
        ],
      },
    },
    cam: { cx: 32, cy: 30, zoom: 20 },
    // v1→v2：泰山风景区南界改为沿环山路（不再越过环山路进入城区），原 HILL 格中已不在新景区范围内的恢复为 RURAL
    migrate: function (payload, from) {
      if (from >= 2) return;
      var W = 64, H = 56, N = W * H, lu = payload.city && payload.city.lu;
      if (!lu || !lu.b || lu.b.length !== N) return;
      var Pr = (G && G.proj) || { lon0: 116.991, lat0: 36.2629, kx: 359.4, ky: 445.28 };
      var cv = function (lat, lon) { return [(lon - Pr.lon0) * Pr.kx, (Pr.lat0 - lat) * Pr.ky]; };
      var pts = [
        [36.2630, 116.9910], [36.2630, 117.1690], [36.2291, 117.1690],
        [36.2275, 117.1615], [36.2263, 117.1570], [36.2190, 117.1505],
        [36.2169, 117.1465], [36.2094, 117.1406], [36.2049, 117.1293],
        [36.2073, 117.1193], [36.2060, 117.1028], [36.2049, 117.0963],
        [36.2039, 117.0823], [36.2062, 117.0727], [36.2094, 117.0670],
        [36.2146, 117.0532], [36.2169, 117.0464], [36.2235, 117.0352],
        [36.2324, 117.0233], [36.2374, 117.0131], [36.2518, 117.0039],
      ].map(function (p) { return cv(p[0], p[1]); });
      var m = pts.length;
      for (var c = 0; c < N; c++) {
        if (lu.b[c] !== 8) continue;  // LU.HILL
        var i = c % W, j = (c / W) | 0, px = i + 0.5, py = j + 0.5, inside = false;
        for (var k = 0, l = m - 1; k < m; l = k++) {
          var xk = pts[k][0], yk = pts[k][1], xl = pts[l][0], yl = pts[l][1];
          if ((yk > py) !== (yl > py) && px < (xl - xk) * (py - yk) / (yl - yk) + xk) inside = !inside;
        }
        if (!inside) lu.b[c] = 0;  // LU.RURAL
      }
    },
  });
})(window.CM);
