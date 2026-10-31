'use strict';
// 曼彻斯特 · 2000 场景（英国）。地理来自 OpenStreetMap（geo_mc.js，现代数据），本文件补充 2000 年起的区域开放、
// 运河与船坞、道路与桥梁年份、人口就业中心、地标、历史事件、本地任务与英镑经营参数。坐标单位为格（250 m），用 ll(纬度, 经度) 换算。
// 2000 年的曼彻斯特：1996 年市中心爆炸案之后的重建正在进行，Metrolink 轻轨从 1992 年起运营两条线（伯里—维多利亚、
// 奥尔特灵厄姆—皮卡迪利），但整个城市只有这 30 公里；索尔福德码头与特拉福德公园还在转型，媒体城要等到 2011 年。
// 真实性：1996 年爆炸案、2002 年英联邦运动会、Metrolink 各段通车、媒体城、斯宾宁菲尔德的年份为史实参考（范围为近似）；
// 2000 年人口与就业分布、增长曲线、造价与票价为估算。
(function (CM) {
  const G = CM.GEOS && CM.GEOS.mc; if (!G) return;
  const P = G.proj, ll = function (lat, lon) { return [+((lon - P.lon0) * P.kx).toFixed(2), +((P.lat0 - lat) * P.ky).toFixed(2)]; };
  const at = function (lat, lon, o) { const p = ll(lat, lon); return Object.assign({ x: p[0], y: p[1] }, o); };
  const poly = function (pts) { return pts.map(function (p) { return ll(p[0], p[1]); }); };
  const anchor = function (name, lat, lon, r) { const p = ll(lat, lon); return { name: name, x: p[0], y: p[1], r: r }; };
  const st = function (name, lat, lon, size, year) { const p = ll(lat, lon); return [name, p[0], p[1], size, year]; };

  // 市中心商务区、斯宾宁菲尔德、安科茨与北区，索尔福德码头与特拉福德公园
  const core = poly([[53.4720, -2.2560], [53.4720, -2.2250], [53.4900, -2.2250], [53.4900, -2.2560]]);
  const spinningfields = poly([[53.4780, -2.2560], [53.4780, -2.2460], [53.4830, -2.2460], [53.4830, -2.2560]]);
  const ancoats = poly([[53.4800, -2.2350], [53.4800, -2.2150], [53.4920, -2.2150], [53.4920, -2.2350]]);
  const salfordQuays = poly([[53.4660, -2.3050], [53.4660, -2.2800], [53.4800, -2.2800], [53.4800, -2.3050]]);
  const traffordPark = poly([[53.4520, -2.3350], [53.4520, -2.2900], [53.4720, -2.2900], [53.4720, -2.3350]]);
  const airport = poly([[53.3400, -2.2950], [53.3400, -2.2550], [53.3650, -2.2550], [53.3650, -2.2950]]);

  const data = {
    city: '曼彻斯特', riverName: '艾尔韦尔河', seaName: '曼彻斯特运河', hsrYear: 9999,
    stages: [[2002, '英联邦运动会与东区重建期'], [2011, '媒体城与北方动力期'], [2020, '轻轨扩张与市中心更新期']], stageLast: '创新区与零碳期',
    briefing: {
      lead: '2000 年的曼彻斯特：1996 年市中心爆炸案炸掉的街区还在重建，Metrolink 轻轨从 1992 年起运营伯里与奥尔特灵厄姆两条线，全部里程只有 30 公里。索尔福德码头的仓库改成了办公楼，特拉福德公园还是大片的厂房与仓库；东区等着英联邦运动会。',
      modes: [
        ['metro', 'Metrolink 轻轨（既有）', '开局接管伯里线与奥尔特灵厄姆线，共 30 公里，不收历史建设费。'],
        ['bus', '公交', '轻轨没有覆盖的城区完全依赖公交，进城走廊在高峰时段拥堵。'],
        ['bridge', '曼彻斯特运河与艾尔韦尔河', '运河与河把城市切开，跨河段造价较高。'],
        ['rail', '铁路', '皮卡迪利与维多利亚是两座尽头式大站，地面铁路会阻隔步行。'],
      ],
    },
    dataNote: [
      ['真实地理', 'hist', '艾尔韦尔河、曼彻斯特运河与索尔福德码头、道路与桥梁、铁路、公园、行政区边界、地名与地标场地来自 OpenStreetMap（© OpenStreetMap 贡献者，ODbL），2026-10-30 取数、按 250 m 网格投影（转换见 scripts/fetch-osm.mjs 与 scripts/geo-import.mjs）；OSM 为现代数据，按 2000 年场景作历史近似。'],
      ['史实参考', 'hist', '1992 年 Metrolink 伯里线与奥尔特灵厄姆线通车、1996 年市中心爆炸案、2002 年英联邦运动会、2011 年媒体城启用、2012 年起 Metrolink 二期扩张、2015 年北方动力。'],
      ['估算', 'est', '2000 年人口与就业分布、人口增长曲线、出行率、时间价值、造价、票价与运营费用（英镑，2000 年币值）。'],
      ['模拟', 'sim', '2000 年之后的发展、居民出行选择、道路拥堵、客流与财政结果。Metrolink 的既有线网由玩家运营；真实的后续线路不会自动出现。'],
      ['', '', '模拟结果不得作为真实曼彻斯特交通规划预测。'],
    ],
    // 曼彻斯特机场（1938 年启用）：跑道 05L/23R 与 05R/23L
    airport: { name: '曼彻斯特机场', closeYear: 9999, buildable: 'underground', runway: [ll(53.3650, -2.2900), ll(53.3450, -2.2600)] },
    runways: [{ a: ll(53.3620, -2.2960), b: ll(53.3420, -2.2660), from: 2001 }],
    regions: [
      { id: 'airport', name: '曼彻斯特机场', poly: airport, open: 2000, plan: 'res', note: '1938 年启用，2001 年第二条跑道投用；机场用地不开发，范围内可以地下设站与地下穿越' },
      { id: 'traffordpark', name: '特拉福德公园（工业区）', poly: traffordPark, open: 2000, plan: 'ind', note: '1896 年建立的世界上第一个规划工业园，2000 年仍是仓储与制造业集中地' },
      { id: 'salfordquays', name: '索尔福德码头与媒体城', poly: salfordQuays, open: 2000, plan: 'resind', note: '1894 年开凿的曼彻斯特船坞，1980 年代关闭后改造为办公与住宅，2011 年媒体城启用（史实）' },
      { id: 'spinningfields', name: '斯宾宁菲尔德（商务区）', poly: spinningfields, open: 2001, plan: 'cbd', note: '2001 年起在旧法院与仓库区建设的商务区（史实）' },
      { id: 'ancoats', name: '安科茨与北区', poly: ancoats, open: 2000, plan: 'resind', note: '19 世纪的棉纺厂区，1990 年代起改为公寓、酒吧与创意办公' },
      { id: 'core', name: '市中心（皮卡迪利·市场街）', poly: core, open: 2000, plan: 'cbd', note: '1996 年爆炸案后的重建区，2000 年时仍有大片空地' },
      { id: 'manchester', name: '曼彻斯特（休姆·莫斯赛德·威辛顿）', district: ['Manchester'], open: 2000, plan: 'mix' },
      { id: 'salford', name: '索尔福德（埃克尔斯·沃克登）', district: ['Salford'], open: 2000, plan: 'res' },
      { id: 'trafford', name: '特拉福德（斯特雷特福德·塞尔的）', district: ['Trafford'], open: 2000, plan: 'res' },
      { id: 'stockport', name: '斯托克波特', district: ['Stockport'], open: 2000, plan: 'resind' },
      { id: 'bury', name: '伯里（拉德克利夫·怀特菲尔德）', district: ['Bury'], open: 2000, plan: 'res' },
      { id: 'oldham', name: '奥尔德姆', district: ['Oldham'], open: 2005, plan: 'res' },
      { id: 'tameside', name: '泰姆赛德（阿什顿安德莱恩·海德）', district: ['Tameside'], open: 2000, plan: 'resind' },
      { id: 'rochdale', name: '罗奇代尔（米德尔顿·海伍德）', district: ['Rochdale'], open: 2005, plan: 'res' },
      { id: 'bolton', name: '博尔顿（法恩沃思·霍里奇）', district: ['Bolton'], open: 2005, plan: 'res' },
      { id: 'wigan', name: '维根（利·阿瑟顿）', district: ['Wigan'], open: 2010, plan: 'res' },
    ],
    defaultRegion: { id: 'outer', name: '外围（曼彻斯特运河与城市边缘）', open: 2015, plan: 'res' },
    plans: CM.DATA.plans,

    // 2000 年人口与就业中心（估算，人/km²；r 约为影响半径 km）
    centers: [
      at(53.4808, -2.2426, { pop: 24000, jobs: 68000, r: 1.3 }),   // 市中心
      at(53.4770, -2.2400, { pop: 16000, jobs: 26000, r: 1.1 }),   // 皮卡迪利、市场街
      at(53.4850, -2.2300, { pop: 18000, jobs: 12000, r: 1.2 }),   // 安科茨、北区
      at(53.4670, -2.2340, { pop: 22000, jobs: 20000, r: 1.2 }),   // 大学区、拉什霍姆
      at(53.4830, -2.2930, { pop: 26000, jobs: 16000, r: 1.2 }),   // 索尔福德
      at(53.4720, -2.2950, { pop: 14000, jobs: 22000, r: 1.2 }),   // 索尔福德码头
      at(53.4650, -2.3200, { pop: 9000, jobs: 34000, r: 1.6 }),    // 特拉福德公园
      at(53.4630, -2.2910, { pop: 20000, jobs: 7000, r: 1.2 }),    // 老特拉福德
      at(53.4400, -2.2800, { pop: 24000, jobs: 7000, r: 1.3 }),    // 乔尔顿
      at(53.4300, -2.2300, { pop: 26000, jobs: 8000, r: 1.3 }),    // 威辛顿、迪兹伯里
      at(53.4170, -2.2300, { pop: 18000, jobs: 6000, r: 1.4 }),    // 迪兹伯里
      at(53.4830, -2.3500, { pop: 20000, jobs: 9000, r: 1.3 }),    // 埃克尔斯
      at(53.4250, -2.3200, { pop: 22000, jobs: 8000, r: 1.3 }),    // 塞尔的
      at(53.4106, -2.1574, { pop: 26000, jobs: 18000, r: 1.4 }),   // 斯托克波特
      at(53.5350, -2.2830, { pop: 20000, jobs: 6000, r: 1.3 }),    // 普雷斯特维奇
      at(53.5510, -2.2960, { pop: 16000, jobs: 5000, r: 1.4 }),    // 怀特菲尔德
      at(53.4900, -2.1000, { pop: 22000, jobs: 12000, r: 1.4 }),   // 阿什顿安德莱恩
      at(53.3800, -2.2800, { pop: 14000, jobs: 12000, r: 1.5 }),   // 威森肖、机场
    ],
    rural: { pop: 300, jobs: 80 },
    roadYears: {
      '市场街': 2000, '迪恩斯盖特': 2000, '牛津路': 2000, '莫斯利街': 2000, '波特兰街': 2000,
      '公主街': 2000, '皮卡迪利': 2000, '罗奇代尔路': 2000, '奥尔德姆路': 2000, '阿什顿新路': 2000,
      'M60 环城高速': 2000, 'M62 高速公路': 1976, 'M56 高速公路': 1975, 'M602 高速公路': 1982,
      '曼彻斯特大道（ Mancunian Way）': 1967, '摄政路': 2000, '查尔斯街': 2000,
      '大安科茨街': 2005, '轻轨二期走廊': 2012, '斯宾宁菲尔德步行区': 2008,
    },
    bridgeYears: {
      '布莱克弗里尔桥': 2000, '维多利亚桥': 2000, '特拉福德路桥': 2000, '巴顿斯温格桥': 2000,
      '国王桥': 2000, '艾尔韦尔桥': 2000, '曼彻斯特运河高架桥': 1967,
    },
    bridgeDefaultYear: 2000,
    simRoads: [
      { n: '曼彻斯特轻轨西延（模拟规划）', c: 4, y: 2030, p: [[39, 48], [23, 48]] },
      { n: '机场联络线（模拟规划）', c: 4, y: 2032, p: [[45, 92], [43, 100]] },
    ],

    // 历史建筑与重要地标（受保护，不得拆除）。x,y 为场地中心（格），w/d 为场地宽与深（米），h 为高度（米）
    landmarks: [
      Object.assign(at(53.48540, -2.24430), { id: 'mc_cathedral', name: '曼彻斯特座堂', w: 110, d: 90, year: 1421, kind: 'church', h: 40 }),
      Object.assign(at(53.47940, -2.24440), { id: 'mc_townhall', name: '曼彻斯特市政厅', w: 160, d: 130, year: 1877, kind: 'hall', h: 85 }),
      Object.assign(at(53.47740, -2.23090), { id: 'mc_picc', name: '皮卡迪利车站', w: 320, d: 220, year: 1842, kind: 'rail' }),
      Object.assign(at(53.48740, -2.24270), { id: 'mc_victoria', name: '维多利亚车站', w: 300, d: 220, year: 1844, kind: 'rail' }),
      Object.assign(at(53.47400, -2.24220), { id: 'mc_oxfordrd', name: '牛津路车站', w: 200, d: 120, year: 1849, kind: 'rail' }),
      Object.assign(at(53.46680, -2.23390), { id: 'mc_uni', name: '曼彻斯特大学', w: 900, d: 700, year: 1824, kind: 'campus' }),
      Object.assign(at(53.46310, -2.29130), { id: 'mc_oldtrafford', name: '老特拉福德球场', w: 260, d: 230, year: 1910, kind: 'stadium' }),
      Object.assign(at(53.48310, -2.20040), { id: 'mc_etihad', name: '曼彻斯特城市球场（东地球场）', w: 260, d: 230, year: 2002, kind: 'stadium' }),
      Object.assign(at(53.47470, -2.29740), { id: 'mc_mediacity', name: '媒体城（MediaCityUK）', w: 500, d: 400, year: 2011, kind: 'skyscraper', h: 60 }),
      Object.assign(at(53.47100, -2.29000), { id: 'mc_quays', name: '索尔福德码头', w: 700, d: 500, year: 1894, kind: 'box' }),
      Object.assign(at(53.48000, -2.25100), { id: 'mc_spinning', name: '斯宾宁菲尔德', w: 300, d: 240, year: 2001, kind: 'skyscraper', h: 110 }),
      Object.assign(at(53.47580, -2.24550), { id: 'mc_johnrylands', name: '约翰·赖兰兹图书馆', w: 100, d: 80, year: 1900, kind: 'library' }),
      Object.assign(at(53.47770, -2.24820), { id: 'mc_peoplehist', name: '人民历史博物馆', w: 90, d: 70, year: 1975, kind: 'museum' }),
      Object.assign(at(53.47850, -2.23600), { id: 'mc_arndale', name: '阿恩代尔购物中心', w: 320, d: 260, year: 1975, kind: 'mall' }),
      Object.assign(at(53.48300, -2.23600), { id: 'mc_nq', name: '北区（Northern Quarter）', w: 400, d: 320, year: 1900, kind: 'box' }),
      Object.assign(at(53.48600, -2.22800), { id: 'mc_ancoats', name: '安科茨棉纺厂区', w: 500, d: 400, year: 1800, kind: 'factory' }),
      Object.assign(at(53.46500, -2.32000), { id: 'mc_traffordpark', name: '特拉福德公园工业区', w: 1400, d: 1000, year: 1896, kind: 'factory' }),
      Object.assign(at(53.45600, -2.28800), { id: 'mc_cricket', name: '老特拉福德板球场', w: 240, d: 200, year: 1857, kind: 'stadium' }),
      Object.assign(at(53.47900, -2.25600), { id: 'mc_gmex', name: '曼彻斯特中央会展中心（原中央车站）', w: 200, d: 150, year: 1880, kind: 'expo' }),
      Object.assign(at(53.47860, -2.24000), { id: 'mc_museum', name: '曼彻斯特博物馆', w: 120, d: 100, year: 1888, kind: 'museum' }),
      Object.assign(at(53.46200, -2.23000), { id: 'mc_contact', name: '曼彻斯特联络剧院', w: 90, d: 70, year: 1999, kind: 'opera' }),
      Object.assign(at(53.47300, -2.24600), { id: 'mc_bridgewater', name: '布里奇沃特音乐厅', w: 90, d: 70, year: 1996, kind: 'concert' }),
      Object.assign(at(53.48000, -2.24200), { id: 'mc_royal', name: '皇家交易所剧院', w: 80, d: 60, year: 1976, kind: 'opera' }),
      Object.assign(at(53.48900, -2.24500), { id: 'mc_arena', name: '曼彻斯特竞技场', w: 200, d: 170, year: 1995, kind: 'venue' }),
    ],

    // 开局已运营的 Metrolink 轻轨：1992 年通车的伯里线与奥尔特灵厄姆线，2000 年由玩家运营，不收历史建设费
    initialNetwork: {
      year: 1992, note: 'Metrolink 轻轨：伯里线（伯里—维多利亚）与奥尔特灵厄姆线（奥尔特灵厄姆—皮卡迪利）',
      lines: [
        { name: '伯里线', color: '#00a651', type: 'surface', year: 1992, stations: [
          st('拉德克利夫', 53.5620, -2.3260, 'S', 1992), st('怀特菲尔德', 53.5510, -2.2960, 'S', 1992),
          st('贝西斯奥巴恩', 53.5420, -2.2870, 'S', 1992), st('普雷斯特维奇', 53.5350, -2.2830, 'S', 1992),
          st('希顿公园', 53.5320, -2.2700, 'S', 1992), st('鲍克谷', 53.5250, -2.2610, 'S', 1992),
          st('克拉姆普萨尔', 53.5170, -2.2520, 'S', 1992), st('亚伯拉罕苔', 53.5100, -2.2450, 'S', 1992),
          st('伍德兰兹路', 53.5040, -2.2410, 'S', 1992), st('皇后路', 53.4980, -2.2380, 'S', 1992),
          st('维多利亚', 53.4874, -2.2427, 'L', 1992),
        ] },
        { name: '奥尔特灵厄姆线', color: '#0072bc', type: 'surface', year: 1992, stations: [
          st('奥尔特灵厄姆', 53.3870, -2.3480, 'M', 1992), st('导航路', 53.3950, -2.3400, 'S', 1992),
          st('廷珀利', 53.4010, -2.3260, 'S', 1992), st('布鲁克兰兹', 53.4090, -2.3180, 'S', 1992),
          st('塞尔的', 53.4250, -2.3200, 'S', 1992), st('戴恩路', 53.4310, -2.3140, 'S', 1992),
          st('斯特雷特福德', 53.4420, -2.3050, 'S', 1992), st('老特拉福德', 53.4570, -2.2890, 'S', 1992),
          st('特拉福德巴', 53.4620, -2.2850, 'S', 1992), st('康布鲁克', 53.4690, -2.2670, 'S', 1992),
          st('迪恩斯盖特', 53.4770, -2.2500, 'M', 1992), st('圣彼得广场', 53.4780, -2.2430, 'M', 1992),
          st('皮卡迪利花园', 53.4810, -2.2370, 'M', 1992), st('皮卡迪利', 53.4774, -2.2309, 'L', 1992),
        ] },
      ],
    },
    // 重要设施（v1.9，见 facility.js）：位置按真实地理（近似）、启用/停用年份为史实参考；规模均为估算。
    facilities: [
      { id: 'mc_picc', n: '皮卡迪利车站', t: 'rail', lm: 'mc_picc', pax: [[2000, 14], [2010, 19], [2020, 24], [2030, 27]] },
      { id: 'mc_victoria', n: '维多利亚车站', t: 'rail', lm: 'mc_victoria', pax: [[2000, 7], [2010, 9], [2020, 11], [2030, 12]] },
      { id: 'mc_oxford', n: '牛津路车站', t: 'rail', lm: 'mc_oxfordrd', pax: [[2000, 3], [2010, 4], [2020, 5]] },
      { id: 'mc_airport', n: '曼彻斯特机场', t: 'air', at: ll(53.3537, -2.2750), pax: [[2000, 18], [2010, 20], [2019, 29], [2030, 32]] },
      { id: 'mc_uni', n: '曼彻斯特大学', t: 'uni', lm: 'mc_uni', w: 0.038 },
      { id: 'mc_mmu', n: '曼彻斯特城市大学', t: 'uni', at: ll(53.4700, -2.2390), w: 0.024 },
      { id: 'mc_salforduni', n: '索尔福德大学', t: 'uni', at: ll(53.4870, -2.2760), w: 0.016 },
      { id: 'mc_hosp1', n: '曼彻斯特皇家医院', t: 'hosp', at: ll(53.4610, -2.2270), w: 0.055 },
      { id: 'mc_hosp2', n: '威森肖医院', t: 'hosp', at: ll(53.3850, -2.2720), w: 0.04 },
      { id: 'mc_hosp3', n: '索尔福德皇家医院', t: 'hosp', at: ll(53.4900, -2.3170), w: 0.038 },
      { id: 'mc_shop1', n: '阿恩代尔购物中心', t: 'shop', lm: 'mc_arndale', w: [[2000, 0.04], [2015, 0.035]] },
      { id: 'mc_shop2', n: '市场街商圈', t: 'shop', at: ll(53.4820, -2.2440), r: 0.7, w: 0.022 },
      { id: 'mc_shop3', n: '特拉福德中心', t: 'shop', at: ll(53.4640, -2.3500), y0: 1998, w: 0.035 },
      { id: 'mc_shop4', n: '北区商圈', t: 'shop', lm: 'mc_nq', w: [[2000, 0.008], [2012, 0.018]] },
      { id: 'mc_cbd1', n: '斯宾宁菲尔德商务区', t: 'cbd', lm: 'mc_spinning', w: [[2000, 0], [2005, 0.02], [2015, 0.03]] },
      { id: 'mc_cbd2', n: '市中心商务区', t: 'cbd', at: ll(53.4790, -2.2480), w: [[2000, 0.026], [2015, 0.032]] },
      { id: 'mc_cbd3', n: '索尔福德码头商务区', t: 'cbd', lm: 'mc_quays', w: [[2000, 0.01], [2011, 0.022]] },
      { id: 'mc_sc1', n: '曼彻斯特座堂', t: 'scenic', lm: 'mc_cathedral', w: 0.007 },
      { id: 'mc_sc2', n: '约翰·赖兰兹图书馆', t: 'scenic', lm: 'mc_johnrylands', w: 0.005 },
      { id: 'mc_sc3', n: '人民历史博物馆', t: 'scenic', lm: 'mc_peoplehist', w: 0.005 },
      { id: 'mc_sc4', n: '曼彻斯特博物馆', t: 'scenic', lm: 'mc_museum', w: 0.006 },
      { id: 'mc_sc5', n: '布里奇沃特音乐厅', t: 'venue', lm: 'mc_bridgewater', w: 0.006 },
      { id: 'mc_sc6', n: '曼彻斯特竞技场', t: 'venue', lm: 'mc_arena', w: 0.008 },
      { id: 'mc_sc7', n: '媒体城', t: 'scenic', lm: 'mc_mediacity', w: [[2000, 0], [2011, 0.014]] },
      { id: 'mc_pk1', n: '希顿公园', t: 'park', at: ll(53.5360, -2.2600), r: 1.0, w: 0.012 },
      { id: 'mc_pk2', n: '菲利普斯公园', t: 'park', at: ll(53.4930, -2.2400), r: 0.7, w: 0.008 },
      { id: 'mc_pk3', n: '普拉特菲尔兹公园', t: 'park', at: ll(53.4660, -2.2230), r: 0.8, w: 0.008 },
      { id: 'mc_stad1', n: '老特拉福德球场', t: 'stadium', lm: 'mc_oldtrafford', w: 0.014 },
      { id: 'mc_stad2', n: '曼彻斯特城市球场', t: 'stadium', lm: 'mc_etihad', w: [[2000, 0], [2002, 0.012]] },
      { id: 'mc_stad3', n: '老特拉福德板球场', t: 'stadium', lm: 'mc_cricket', w: 0.008 },
      { id: 'mc_venue1', n: '曼彻斯特中央会展中心', t: 'venue', lm: 'mc_gmex', w: 0.012 },
      { id: 'mc_venue2', n: '曼彻斯特联络剧院', t: 'venue', lm: 'mc_contact', w: 0.005 },
    ],

    districtLabels: [],

    events: [
      { y: 2000, m: 1, tag: '史实', title: '2000 年的曼彻斯特', desc: '市区与近郊约 160 万人。Metrolink 只有伯里与奥尔特灵厄姆两条线、共 30 公里；1996 年爆炸案炸掉的市中心街区还在重建，索尔福德码头的仓库改成了办公楼。' },
      { y: 2001, m: 1, tag: '史实', title: '斯宾宁菲尔德商务区动工', desc: '旧法院与仓库区开始改造为写字楼群，市中心的就业继续向西扩展。' },
      { y: 2002, m: 7, tag: '史实', title: '英联邦运动会在曼彻斯特举行', desc: '东区建起城市球场与体育园区，轻轨随后向东延伸。' },
      { y: 2005, m: 1, tag: '史实', title: '轻轨向老特拉福德与东区延伸', desc: 'Metrolink 从既有铁路走廊转向街道与旧铁路，覆盖范围扩大到码头区与东区。' },
      { y: 2011, m: 1, tag: '史实', title: '媒体城启用', desc: 'BBC 等机构迁入索尔福德码头，媒体城成为新的就业极。' },
      { y: 2015, m: 1, tag: '史实', title: '北方动力计划', desc: '以曼彻斯特为核心的 regional 计划推动交通与投资，轻轨继续扩张。' },
      { y: 2020, m: 1, tag: '史实', title: '轻轨网成型', desc: 'Metrolink 成为英国最大的轻轨系统，市中心形成十字换乘。' },
      { y: 2021, m: 1, tag: '模拟', title: '进入模拟发展阶段', desc: '此后人口、道路和区域变化按模拟规则推演，不代表真实历史。' },
    ],
    // 本地历史主题任务：参考曼彻斯特 2000 年起的实际发展需求，不要求复刻真实线路（奖励单位：万英镑）
    histTasks: [
      { id: 'mc1', appear: [2000, 3], deadline: [2010, 12], type: 'connect', reward: 2400, title: '市中心十字', desc: '伯里线止于维多利亚、奥尔特灵厄姆线止于皮卡迪利，两条线在市中心不互通。把它们连起来。', anchors: [anchor('维多利亚', 53.4874, -2.2427, 3), anchor('皮卡迪利', 53.4774, -2.2309, 3)] },
      { id: 'mc2', appear: [2001, 1], deadline: [2012, 12], type: 'connect', reward: 2500, title: '码头区与市中心', desc: '索尔福德码头改造后有了办公与住户，但轻轨只从旁边经过。把码头区接进网。', anchors: [anchor('索尔福德码头', 53.4710, -2.2900, 4), anchor('圣彼得广场', 53.4780, -2.2430, 3)] },
      { id: 'mc3', appear: [2002, 1], deadline: [2014, 12], type: 'connect', reward: 2600, title: '东区与城市球场', desc: '英联邦运动会后东区有了新球场与住宅，需要与市中心连通。', anchors: [anchor('曼彻斯特城市球场（东地球场）', 53.4831, -2.2004, 4), anchor('皮卡迪利', 53.4774, -2.2309, 3)] },
      { id: 'mc4', appear: [2004, 1], deadline: [2016, 12], type: 'connect', reward: 2500, title: '特拉福德公园', desc: '特拉福德公园是最大的就业集中地，工人从城市各处赶来。', anchors: [anchor('特拉福德公园工业区', 53.4650, -2.3200, 5), anchor('老特拉福德', 53.4570, -2.2890, 3)] },
      { id: 'mc5', appear: [2006, 1], deadline: [2018, 12], type: 'coverage', target: 0.35, reward: 3000, title: '覆盖内城', desc: '步行 15 分钟可到达车站的人口不低于 35%。' },
      { id: 'mc6', appear: [2010, 1], deadline: [2024, 12], type: 'connect', reward: 2700, title: '机场与南郊', desc: '曼彻斯特机场是英国第三繁忙的机场，与市中心之间只有铁路。', anchors: [anchor('曼彻斯特机场', 53.3537, -2.2750, 5), anchor('威森肖、机场', 53.3800, -2.2800, 4)] },
      { id: 'mc7', appear: [2012, 1], deadline: [2026, 12], type: 'connect', reward: 2600, title: '媒体城', desc: '媒体城启用后，索尔福德码头的通勤需求翻了一倍。', anchors: [anchor('媒体城（MediaCityUK）', 53.4747, -2.2974, 4), anchor('索尔福德码头', 53.4710, -2.2900, 3)] },
    ],
    dynTasks: [
      { id: 'mcd1', from: [2003, 1], to: [2015, 12], type: 'connect', months: 42, reward: 1200, title: '大学与市中心', desc: '大学区与市中心之间的走廊是全网最挤的一段。', anchors: [anchor('曼彻斯特大学', 53.4668, -2.2339, 3), anchor('圣彼得广场', 53.4780, -2.2430, 3)] },
      { id: 'mcd2', from: [2008, 1], to: [2022, 12], type: 'connect', months: 42, reward: 1400, title: '索尔福德通勤', desc: '索尔福德的居住人口增长，进城只有几条公交线。', anchors: [anchor('索尔福德', 53.4830, -2.2930, 3), anchor('维多利亚', 53.4874, -2.2427, 3)] },
      { id: 'mcd3', from: [2016, 1], to: [2030, 12], type: 'connect', months: 42, reward: 1500, title: '机场接驳', desc: '机场客流持续增长，铁路之外需要新的轨道通道。', anchors: [anchor('曼彻斯特机场', 53.3537, -2.2750, 5), anchor('迪兹伯里', 53.4170, -2.2300, 4)] },
    ],
    taskNote: '历史主题任务参考曼彻斯特 2000 年起的实际发展需求（市中心十字、索尔福德码头、英联邦运动会、特拉福德公园、媒体城、机场），不要求按真实线路建设，只需满足目标描述。',
    // 线路配色参考 Metrolink
    lineColorsNice: ['#00a651', '#0072bc', '#e60012', '#f6a800', '#8e44ad', '#00a8a8', '#d35400', '#c2185b', '#5c6bc0', '#7cb342'],
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
    throw new Error('曼彻斯特：阶段目标锚点未找到 ' + name);
  };

  // 历史发展阶段（v2.2，eras.js）：summary 中「史实」可查证，「估算」为模型设定的发展倾向
  data.eras = [
    { id: 'mc-e1', from: 2000, name: '爆炸案之后', tag: '史实',
      summary: '史实：1996 年市中心爆炸案后大规模重建，1992 年通车的 Metrolink 只有伯里与奥尔特灵厄姆两条线。估算：就业集中在市中心与特拉福德公园，索尔福德码头的办公与住宅刚刚起步，东区还等着英联邦运动会。',
      grow: { pop: { manchester: 0.95, salford: 1.05, trafford: 1.05, stockport: 1.0, bury: 1.0, ancoats: 1.2, salfordquays: 1.5 }, jobs: { core: 1.2, traffordpark: 1.1, salfordquays: 1.3, ancoats: 1.1 } },
      relocate: { pop: { manchester: 0.0003 } },
      demand: { decayHW: 1.0 },
      corridors: [{ a: 'salford', b: 'core', f: 1.2 }, { a: 'trafford', b: 'core', f: 1.15 }, { a: 'stockport', b: 'core', f: 1.1 }],
      goals: [{ id: 'mc-g1', from: 2001, type: 'connect', months: 60, reward: 2000, title: '码头区与市中心', desc: '索尔福德码头改造后有了办公与住户，但轻轨只从旁边经过。用地铁把码头区与市中心连起来。', anchors: [site('索尔福德码头', 4), site('斯宾宁菲尔德', 3)] }] },
    { id: 'mc-e2', from: 2002, name: '英联邦运动会与东区', tag: '史实',
      summary: '史实：2002 年英联邦运动会在曼彻斯特举行，东区建起城市球场与体育园区，轻轨随后向东延伸。估算：东区与码头区的投资集中，市中心重建完成，人口开始回流内城。',
      grow: { pop: { ancoats: 1.6, salfordquays: 1.5, core: 1.3, manchester: 1.05, salford: 1.1 }, jobs: { core: 1.25, ancoats: 1.3, salfordquays: 1.25 } },
      demand: { decayHW: 1.05, hub: 1.1 },
      corridors: [{ a: 'ancoats', b: 'core', f: 1.2 }, { a: 'salfordquays', b: 'core', f: 1.2 }],
      goals: [{ id: 'mc-g2', from: 2003, type: 'connect', months: 60, reward: 2200, title: '东区与城市球场', desc: '英联邦运动会后东区有了新球场与住宅。用地铁把城市球场与皮卡迪利连起来。', anchors: [site('曼彻斯特城市球场（东地球场）', 4), site('皮卡迪利车站', 3)] }] },
    { id: 'mc-e3', from: 2011, name: '媒体城与北方动力', tag: '史实',
      summary: '史实：2011 年媒体城启用，2015 年北方动力计划推出，Metrolink 扩张为英国最大的轻轨系统。估算：就业向索尔福德码头与市中心集中，内城人口快速回升，通勤带外扩到机场与斯托克波特。',
      grow: { pop: { salfordquays: 1.6, core: 1.25, ancoats: 1.3, manchester: 1.1, salford: 1.1, trafford: 1.05 }, jobs: { salfordquays: 1.6, core: 1.2, ancoats: 1.2 } },
      demand: { decayHW: 1.1, hub: 1.1 },
      corridors: [{ a: 'salfordquays', b: 'core', f: 1.25 }, { a: 'trafford', b: 'core', f: 1.15 }],
      goals: [{ id: 'mc-g3', from: 2012, type: 'connect', months: 60, reward: 2400, title: '媒体城', desc: '媒体城启用后索尔福德码头的通勤需求翻了一倍。用地铁把媒体城与市中心连起来。', anchors: [site('媒体城（MediaCityUK）', 4), site('斯宾宁菲尔德', 3)] }] },
    { id: 'mc-e4', from: 2020, name: '轻轨扩张之后', tag: '史实',
      summary: '史实：2020 年 Metrolink 已成为英国最大的轻轨系统，市中心形成十字换乘。估算：人口增长最快的仍是市中心与码头区，机场与南郊的通勤压力上升，东区完成绅士化。',
      grow: { pop: { core: 1.3, salfordquays: 1.3, ancoats: 1.2, manchester: 1.15, trafford: 1.05 }, jobs: { core: 1.25, salfordquays: 1.3 } },
      demand: { decayHW: 1.1, hub: 1.1 },
      corridors: [{ a: 'trafford', b: 'core', f: 1.15 }, { a: 'stockport', b: 'core', f: 1.1 }],
      goals: [{ id: 'mc-g4', from: 2020, type: 'connect', months: 60, reward: 2500, title: '机场与南郊', desc: '曼彻斯特机场是英国第三繁忙的机场，与市中心之间只有铁路。用地铁把机场与南郊连起来。', anchors: [site('曼彻斯特机场', 5), site('威森肖医院', 4)] }] },
    { id: 'mc-e5', from: 2021, name: '模拟未来', tag: '模拟',
      summary: '模拟：此后的发展按模型推演，不代表真实历史。估算：市中心与码头区继续加密，机场走廊与东区成为新的增长极，跨运河与跨河的通道成为瓶颈。',
      grow: { pop: { core: 1.2, salfordquays: 1.25, ancoats: 1.15, manchester: 1.1 }, jobs: { core: 1.2, salfordquays: 1.2 } },
      demand: { lz: 1.1, decayHW: 1.1 }, corridors: [{ a: 'salford', b: 'core', f: 1.1 }] },
  ];

  const INF = [[2000, 0.008], [2003, 0.014], [2005, 0.021], [2008, 0.036], [2009, -0.005], [2012, 0.028], [2016, 0.01], [2020, 0.009], [2022, 0.09], [2024, 0.035], [2030, 0.02], [2050, 0.02]];
  (CM.MAP_LIST = CM.MAP_LIST || []).push({
    id: 'mc', name: '曼彻斯特', title: '曼彻斯特 · 2000', sub: '真实地理 · 2000 年起 · 英镑',
    desc: '从 2000 年的曼彻斯特开始：1996 年爆炸案炸掉的街区还在重建，Metrolink 轻轨只有伯里与奥尔特灵厄姆两条线、共 30 公里，而且两条线在市中心并不互通。索尔福德码头的仓库刚改成办公楼，东区还等着英联邦运动会。',
    facts: [['范围', '26 km × 28 km'], ['起始', '2000 年'], ['人口', '约 160 万'], ['货币', '英镑（GBP）'], ['既有轻轨', 'Metrolink 2 线 25 站'], ['模式', '经营挑战 / 自由建造']],
    modes: ['challenge', 'free'], kind: 'real', mapVersion: 1, scenario: 'mc-2000',
    region: '英国', tagline: '接管 Metrolink，把两条线连成一网', difficulty: 4, tags: ['已有地铁', '轻轨扩张', '再开发'],
    intro: '2000 年的曼彻斯特刚从 1996 年的爆炸案里恢复。Metrolink 是英国第一条现代轻轨，但它只有两条线：一条从北边的伯里开进维多利亚，一条从西南的奥尔特灵厄姆开到皮卡迪利，两条线在市中心并不相通，乘客要下车走十几分钟。索尔福德码头的仓库改成了办公楼，特拉福德公园还是一片厂房，东区在等 2002 年的英联邦运动会。你要先把这两条线接起来，再把它们铺到码头、东区、特拉福德与机场。',
    features: [['train', '既有 Metrolink 轻轨', '开局接管伯里线与奥尔特灵厄姆线共 25 站，不收历史建设费'], ['bridge', '运河与艾尔韦尔河', '跨河与跨运河段造价较高，桥位有限'], ['building', '码头区与东区', '索尔福德码头、斯宾宁菲尔德、媒体城与东区按年份更新'], ['coin', '英镑经营', '造价、票价、拨款与债券按英镑计算，2008 年后长期低息']],
    highlights: [[2002, '英联邦运动会'], [2005, '轻轨向码头与东区延伸'], [2011, '媒体城启用'], [2015, '北方动力计划'], [2020, '英国最大轻轨系统']],
    geo: G, data: data,
    econ: { devOffset: 20, money: 6.3 },   // 出行选择参数：曼彻斯特 2000 年约对应广州样本 2020 年的发展阶段；币值按 2000 年英镑缩放
    cfg: {
      W: 104, H: 112, START: { y: 2000, m: 1, d: 1, minute: 360 },
      // 工作周：英国长期实行五天工作周（史实）
      workWeek: { sat: [[2000, 0]], school: [[2000, 0]] },
      growth: Object.assign({}, CM.CFG.growth, { popCurve: [[2000, 1.6e6], [2005, 1.62e6], [2010, 1.7e6], [2015, 1.78e6], [2020, 1.85e6], [2030, 1.98e6], [2050, 2.15e6], [2300, 2.2e6]], histEnd: 2020, jobsRatio: [[2000, 0.56], [2010, 0.58], [2020, 0.6], [2040, 0.61]] }),
      money: { code: 'GBP', unit: '英镑', wan: '万英镑', yi: '亿英镑', sym: '£' },
      econBase: 2000,
      cost: Object.assign({}, CM.CFG.cost, {
        trackPerKm: { underground: 28000, surface: 3600, elevated: 10000 },   // 轻轨为主：地面段成本明显低于地铁
        riverPerKm: { underground: 20000, surface: 14000, elevated: 14000 },
        hillPerKm: 9000, protectedPerKm: 7000,
        station: { underground: { S: 11000, M: 18000, L: 29000 }, elevated: { S: 5800, M: 9000, L: 14000 }, surface: { S: 3200, M: 5400, L: 8800 } },
        demolishPerCell: 24000,
        inflation: INF,
      }),
      ops: Object.assign({}, CM.CFG.ops, { carKmCost: 0.0011, stationDaily: { S: 1.9, M: 3.2, L: 5.6 }, inflation: INF }),
      fareDefault: { mode: 'flat', flat: 1.4 }, fareRange: { min: 0, max: 5, step: 0.1 },
      economy: Object.assign({}, CM.CFG.economy, { startFunds: 640000, grantBase: [[2000, 34000], [2005, 40000], [2010, 44000], [2015, 48000], [2020, 54000], [2050, 74000]], debtLimit: -400000, rewardScale: 6.3,
        bonds: { local: { rate: [[2000, 0.053], [2003, 0.045], [2008, 0.045], [2012, 0.018], [2020, 0.003], [2022, 0.04], [2030, 0.035], [2050, 0.04]], quotaMonths: 6, capMonths: 30 }, ct: { spread: 0.015, quotaMonths: 4, capMonths: 18 }, term6: 0.003 } }),
      // 城市经济（macro.js）：2000 年地图范围 GVA 约 280 亿英镑（估算；大曼彻斯特约 350 亿英镑，地图覆盖曼彻斯特、索尔福德、特拉福德与斯托克波特北部）
      macro: {
        area: '地图范围（曼彻斯特、索尔福德、特拉福德、斯托克波特北部与伯里南部）', region: '英国',
        gdp0: 2800000, revRatio: [[2000, 0.15], [2010, 0.16], [2020, 0.17], [2040, 0.17]], revElastic: 1.5,
        prod: [[2000, 0.028], [2007, 0.022], [2009, 0.002], [2012, 0.016], [2019, 0.014], [2020, -0.06], [2022, 0.032], [2030, 0.02], [2050, 0.016], [2080, 0.011]],
        infl: 'uk', longRun: { infl: 0.02 }, histEnd: 2020, ref: 'uk',
        struct: { trade: 0.5, fin: 0.5, ind: 0.45, tour: 0.45, prop: 0.65 },
        events: [
          { id: 'dotcom2001', y: 2001, m: 3, scale: 0.7 },
          { id: 'gfc2008', y: 2008, m: 9, scale: 1.2 },
          { id: 'brexit2016', y: 2016, m: 6 },
          { id: 'covid2020', y: 2020, m: 3, scale: 1.15 },
        ],
      },
    },
    cam: { cx: 52, cy: 49, zoom: 18 },
  });
})(window.CM);
