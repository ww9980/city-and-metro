'use strict';
// 利物浦 · 2000 场景（英国）。地理来自 OpenStreetMap（geo_lv.js，现代数据），本文件补充 2000 年起的区域开放、
// 默西河与码头、道路与桥梁年份、人口就业中心、地标、历史事件、本地任务与英镑经营参数。坐标单位为格（250 m），用 ll(纬度, 经度) 换算。
// 2000 年的利物浦刚从 1980 年代的衰退里走出来：码头早已外迁，阿尔伯特码头在 1980 年代改成了博物馆与商店；
// 默西铁路（Merseyrail）从 1977 年起就在市中心地下运行，但只覆盖南北与威勒尔两条走廊，城市其余部分没有轨道。
// 真实性：默西铁路既有线网、2008 年欧洲文化之都、利物浦一号、利物浦水域再开发、2015 年大西洋塔的年份为史实参考（范围为近似）；
// 2000 年人口与就业分布、增长曲线、造价与票价为估算。
(function (CM) {
  const G = CM.GEOS && CM.GEOS.lv; if (!G) return;
  const P = G.proj, ll = function (lat, lon) { return [+((lon - P.lon0) * P.kx).toFixed(2), +((P.lat0 - lat) * P.ky).toFixed(2)]; };
  const at = function (lat, lon, o) { const p = ll(lat, lon); return Object.assign({ x: p[0], y: p[1] }, o); };
  const poly = function (pts) { return pts.map(function (p) { return ll(p[0], p[1]); }); };
  const anchor = function (name, lat, lon, r) { const p = ll(lat, lon); return { name: name, x: p[0], y: p[1], r: r }; };
  const st = function (name, lat, lon, size, year) { const p = ll(lat, lon); return [name, p[0], p[1], size, year]; };

  // 码头区（Pier Head 与阿尔伯特码头）与利物浦水域再开发范围
  const pierhead = poly([[53.3950, -3.0060], [53.3950, -2.9800], [53.4130, -2.9800], [53.4130, -3.0060]]);
  const albertdock = poly([[53.3960, -3.0000], [53.3960, -2.9870], [53.4030, -2.9870], [53.4030, -3.0000]]);
  const northDocks = poly([[53.4130, -3.0100], [53.4130, -2.9850], [53.4480, -2.9850], [53.4480, -3.0100]]);
  const speke = poly([[53.3280, -2.8700], [53.3280, -2.8300], [53.3450, -2.8300], [53.3450, -2.8700]]);

  const data = {
    city: '利物浦', riverName: '默西河', seaName: '利物浦湾', hsrYear: 9999,
    stages: [[2003, '欧洲文化之都与再开发期'], [2008, '利物浦一号与金融危机期'], [2015, '水域再开发与北方动力期']], stageLast: '自由港与创新区期',
    briefing: {
      lead: '2000 年的利物浦：默西河把城市与威勒尔半岛隔开，河下有两座隧道与一条铁路隧道。市中心的码头早已停止卸货，阿尔伯特码头改成了博物馆与商店，但北边的船坞还是一片空仓库。默西铁路从 1977 年起在市中心地下运行，南北与威勒尔两条走廊有车，其余地方只能坐公交。',
      modes: [
        ['metro', '默西铁路（既有）', '开局接管默西铁路的南北线与威勒尔线，市中心为地下段，不收历史建设费。'],
        ['bus', '公交', '没有轨道覆盖的城区完全依赖公交，进城方向在高峰时段拥堵。'],
        ['bridge', '默西河', '跨河有两条公路隧道与一条铁路隧道，河面宽阔，新建跨河段造价很高。'],
        ['rail', '铁路', '莱姆街是区域铁路的总站，地面铁路会阻隔步行。'],
      ],
    },
    dataNote: [
      ['真实地理', 'hist', '默西河与利物浦湾、码头与船坞、道路与隧道、铁路、公园、行政区边界、地名与地标场地来自 OpenStreetMap（© OpenStreetMap 贡献者，ODbL），2026-10-30 取数、按 250 m 网格投影（转换见 scripts/fetch-osm.mjs 与 scripts/geo-import.mjs）；OSM 为现代数据，按 2000 年场景作历史近似。'],
      ['史实参考', 'hist', '1977 年默西铁路市中心地下段开通、1980 年代阿尔伯特码头再开发、2008 年欧洲文化之都与利物浦一号开业、2008 年金融危机、2015 年利物浦水域与北码头开发、2021 年自由港设立。'],
      ['估算', 'est', '2000 年人口与就业分布、人口增长曲线、出行率、时间价值、造价、票价与运营费用（英镑，2000 年币值）。'],
      ['模拟', 'sim', '2000 年之后的发展、居民出行选择、道路拥堵、客流与财政结果。默西铁路的既有线网由玩家运营；真实的后续线路不会自动出现。'],
      ['', '', '模拟结果不得作为真实利物浦交通规划预测。'],
    ],
    // 利物浦约翰·列侬机场（斯皮克，1986 年更名）：跑道 09/27，约 2.3 km
    airport: { name: '利物浦约翰·列侬机场', closeYear: 9999, buildable: 'underground', runway: [ll(53.3340, -2.8680), ll(53.3380, -2.8350)] },
    runways: [],
    regions: [
      { id: 'airport', name: '利物浦约翰·列侬机场（斯皮克）', poly: speke, open: 2000, plan: 'res', note: '1933 年启用的斯皮克机场，1986 年更名；机场用地不开发，范围内可以地下设站与地下穿越' },
      { id: 'albertdock', name: '阿尔伯特码头', poly: albertdock, open: 2000, plan: 'expo', note: '1846 年建成的封闭式船坞，1972 年关闭，1980 年代改为博物馆、商店与住宅（史实）' },
      { id: 'northdocks', name: '北码头（利物浦水域）', poly: northDocks, open: 2015, plan: 'newtown', note: '2015 年起利物浦水域项目在北码头建设新街区（史实）' },
      { id: 'pierhead', name: '码头区与商业中心', poly: pierhead, open: 2000, plan: 'cbd', note: '三女神建筑、利物浦一号与中央商务区' },
      { id: 'liverpool', name: '利物浦（埃弗顿·托克斯泰斯·沃尔顿）', district: ['Liverpool'], open: 2000, plan: 'mix' },
      { id: 'wirral', name: '威勒尔（伯肯黑德·沃勒西）', district: ['Wirral'], open: 2000, plan: 'res' },
      { id: 'sefton', name: '塞夫顿（布特尔·克罗斯比）', district: ['Sefton'], open: 2000, plan: 'resind' },
      { id: 'knowsley', name: '诺斯利（亨特·柯比）', district: ['Knowsley'], open: 2000, plan: 'res' },
    ],
    defaultRegion: { id: 'outer', name: '外围（默西河与城市边缘）', open: 2010, plan: 'res' },
    plans: CM.DATA.plans,

    // 2000 年人口与就业中心（估算，人/km²；r 约为影响半径 km）
    centers: [
      at(53.4060, -2.9860, { pop: 26000, jobs: 42000, r: 1.2 }),   // 市中心、莱姆街
      at(53.4010, -2.9930, { pop: 14000, jobs: 16000, r: 1.1 }),   // 码头区、阿尔伯特码头
      at(53.4090, -2.9700, { pop: 24000, jobs: 12000, r: 1.2 }),   // 埃弗顿、苏格兰路
      at(53.3960, -2.9660, { pop: 30000, jobs: 8000, r: 1.3 }),    // 托克斯泰斯
      at(53.3830, -2.9440, { pop: 26000, jobs: 7000, r: 1.3 }),    // 莫斯利山、塞夫顿公园
      at(53.4510, -2.9880, { pop: 28000, jobs: 9000, r: 1.3 }),    // 布特尔
      at(53.4400, -2.9650, { pop: 30000, jobs: 8000, r: 1.3 }),    // 沃尔顿、安菲尔德
      at(53.4780, -3.0300, { pop: 22000, jobs: 5000, r: 1.4 }),    // 克罗斯比、滑铁卢
      at(53.3550, -2.8900, { pop: 20000, jobs: 12000, r: 1.4 }),   // 加斯顿、斯皮克
      at(53.3900, -3.0150, { pop: 24000, jobs: 14000, r: 1.3 }),   // 伯肯黑德
      at(53.4300, -3.0450, { pop: 18000, jobs: 4000, r: 1.3 }),    // 沃勒西、新布赖顿
      at(53.4100, -2.8400, { pop: 18000, jobs: 6000, r: 1.4 }),    // 亨特
      at(53.4600, -2.9000, { pop: 16000, jobs: 5000, r: 1.4 }),    // 柯比、法扎克利
    ],
    rural: { pop: 300, jobs: 80 },
    roadYears: {
      '斯特兰德街': 2000, '教堂街': 2000, '戴尔街': 2000, '罗德斯街': 2000, '拜伦街': 2000,
      '苏格兰路': 2000, '伦敦路': 2000, '厄顿路': 2000, '史密斯当路': 2000, '埃奇巷': 2000,
      '皇后大道': 2000, '默西隧道（Queensway）': 1934, '默西隧道（Kingsway）': 1971,
      '利兹街': 2000, '大霍华德街': 2000, '皮克特街': 2000, '海滨大道': 2000,
      'M62 高速公路': 1976, 'M57 高速公路': 1972, 'M53 高速公路': 1972, '利物浦北环': 2000,
      '利物浦一号（步行区）': 2008, '斯特兰德街延伸段': 2012,
    },
    bridgeYears: {
      '默西铁路隧道': 1886, '皇后大道隧道': 1934, '国王大道隧道': 1971,
      '银禧桥': 2001, '国王桥': 2000, '威弗特里桥': 2000,
    },
    bridgeDefaultYear: 2000,
    simRoads: [
      { n: '默西河新跨河通道（模拟规划）', c: 4, y: 2032, p: [[52, 41], [47, 47]] },
      { n: '利物浦水域轻轨走廊（模拟规划）', c: 4, y: 2030, p: [[51, 42], [52, 22]] },
    ],

    // 历史建筑与重要地标（受保护，不得拆除）。x,y 为场地中心（格），w/d 为场地宽与深（米），h 为高度（米）
    landmarks: [
      Object.assign(at(53.4053, -2.9958), { id: 'lv_liver', name: '利物浦港务大楼（三女神）', w: 260, d: 90, year: 1911, kind: 'colonial', h: 90 }),
      Object.assign(at(53.3975, -2.9730), { id: 'lv_cathedral', name: '利物浦座堂', w: 180, d: 130, year: 1978, kind: 'church', h: 101 }),
      Object.assign(at(53.4045, -2.9680), { id: 'lv_metcat', name: '利物浦大都会座堂', w: 130, d: 110, year: 1967, kind: 'dome', h: 84 }),
      Object.assign(at(53.4075, -2.9779), { id: 'lv_lime', name: '莱姆街车站', w: 300, d: 200, year: 1836, kind: 'rail' }),
      Object.assign(at(53.4010, -2.9920), { id: 'lv_albert', name: '阿尔伯特码头', w: 500, d: 380, year: 1846, kind: 'box' }),
      Object.assign(at(53.4388, -2.9663), { id: 'lv_goodison', name: '古迪逊公园球场', w: 240, d: 200, year: 1892, kind: 'stadium' }),
      Object.assign(at(53.4308, -2.9608), { id: 'lv_anfield', name: '安菲尔德球场', w: 260, d: 220, year: 1884, kind: 'stadium' }),
      Object.assign(at(53.3946, -2.9765), { id: 'lv_anglican', name: '利物浦圣公会座堂（希望街）', w: 140, d: 110, year: 1978, kind: 'church' }),
      Object.assign(at(53.4094, -2.9810), { id: 'lv_stgeorge', name: '圣乔治大厅', w: 180, d: 130, year: 1854, kind: 'hall' }),
      Object.assign(at(53.4032, -2.9882), { id: 'lv_one', name: '利物浦一号', w: 400, d: 320, year: 2008, kind: 'mall' }),
      Object.assign(at(53.4010, -2.9800), { id: 'lv_baltic', name: '波罗的海三角区', w: 400, d: 320, year: 2000, kind: 'factory' }),
      Object.assign(at(53.4110, -2.9900), { id: 'lv_central', name: '利物浦中央图书馆', w: 140, d: 110, year: 1879, kind: 'library' }),
      Object.assign(at(53.4100, -2.9960), { id: 'lv_museum', name: '世界博物馆', w: 120, d: 100, year: 1860, kind: 'museum' }),
      Object.assign(at(53.4200, -2.9950), { id: 'lv_everton', name: '埃弗顿（苏格兰路）', w: 600, d: 500, year: 1900, kind: 'box' }),
      Object.assign(at(53.4090, -2.9450), { id: 'lv_knowledge', name: '知识区（大学城）', w: 500, d: 400, year: 1881, kind: 'campus' }),
      Object.assign(at(53.3880, -3.0180), { id: 'lv_birkenhead', name: '伯肯黑德公园', w: 600, d: 500, year: 1847, kind: 'park' }),
      Object.assign(at(53.4280, -3.0400), { id: 'lv_newbrighton', name: '新布赖顿海滨', w: 500, d: 300, year: 1830, kind: 'box' }),
      Object.assign(at(53.4030, -2.9620), { id: 'lv_phil', name: '爱乐音乐厅', w: 90, d: 70, year: 1939, kind: 'concert' }),
      Object.assign(at(53.3990, -2.9700), { id: 'lv_chinatown', name: '利物浦唐人街', w: 200, d: 160, year: 1850, kind: 'box' }),
      Object.assign(at(53.4130, -2.9980), { id: 'lv_stanley', name: '斯坦利船坞（北码头）', w: 900, d: 600, year: 1848, kind: 'box' }),
      Object.assign(at(53.4250, -2.9900), { id: 'lv_tobacco', name: '烟草仓库（Tobacco Warehouse）', w: 260, d: 200, year: 1901, kind: 'box' }),
    ],

    // 开局已运营的默西铁路（Merseyrail）：1977 年市中心地下段开通，2000 年由玩家运营，不收历史建设费
    initialNetwork: {
      year: 1977, note: '默西铁路（Merseyrail）南北线与威勒尔线，市中心为地下段',
      lines: [
        { name: '南北线', color: '#0d5c3f', type: 'underground', year: 1977, stations: [
          st('克罗斯比', 53.4870, -3.0360, 'S', 1848), st('滑铁卢', 53.4760, -3.0300, 'S', 1848),
          st('海福斯与利瑟兰', 53.4640, -3.0000, 'S', 1850), st('布特尔新斯特兰德', 53.4520, -2.9880, 'S', 1850),
          st('布特尔奥里尔路', 53.4470, -2.9930, 'S', 1850), st('银行厅', 53.4420, -2.9870, 'S', 1850),
          st('柯克代尔', 53.4400, -2.9810, 'S', 1850), st('沃尔顿', 53.4400, -2.9700, 'S', 1850),
          st('桑德希尔斯', 53.4270, -2.9930, 'S', 1850), st('摩尔菲尔德', 53.4080, -2.9890, 'M', 1977),
          st('莱姆街', 53.4075, -2.9779, 'L', 1977), st('利物浦中央', 53.4050, -2.9780, 'M', 1977),
          st('詹姆斯街', 53.4050, -2.9920, 'M', 1977), st('布伦瑞克', 53.3900, -2.9760, 'S', 1998),
          st('圣迈克尔', 53.3800, -2.9720, 'S', 1864), st('艾格伯斯', 53.3700, -2.9600, 'S', 1864),
          st('克雷辛顿', 53.3640, -2.9300, 'S', 1864), st('利物浦南帕克韦', 53.3640, -2.8900, 'M', 2006),
        ] },
        { name: '威勒尔线', color: '#f6a800', type: 'underground', year: 1977, stations: [
          st('新布赖顿', 53.4360, -3.0460, 'S', 1888), st('沃勒西格罗夫路', 53.4300, -3.0450, 'S', 1888),
          st('沃勒西村', 53.4240, -3.0400, 'S', 1888), st('伯肯黑德公园', 53.4100, -3.0350, 'S', 1888),
          st('伯肯黑德汉密尔顿广场', 53.3930, -3.0140, 'M', 1977), st('康威公园', 53.3900, -3.0200, 'S', 1977),
          st('伯肯黑德中央', 53.3880, -3.0200, 'S', 1886), st('格林巷', 53.3830, -3.0200, 'S', 1886),
          st('罗克费里', 53.3760, -3.0100, 'S', 1886), st('贝宾顿', 53.3520, -3.0060, 'S', 1840),
          st('阳光港', 53.3490, -2.9980, 'S', 1840), st('斯皮塔尔', 53.3410, -2.9970, 'S', 1840),
          st('布罗姆伯勒雷克', 53.3340, -2.9930, 'S', 1840), st('伊斯特姆雷克', 53.3210, -2.9800, 'S', 1995),
        ] },
      ],
    },
    // 重要设施（v1.9，见 facility.js）：位置按真实地理（近似）、启用/停用年份为史实参考；规模均为估算。
    facilities: [
      { id: 'lv_lime', n: '莱姆街车站', t: 'rail', lm: 'lv_lime', pax: [[2000, 6], [2010, 8], [2020, 9.5], [2030, 10.5]] },
      { id: 'lv_parkway', n: '利物浦南帕克韦站', t: 'rail', at: ll(53.3640, -2.8900), pax: [[2006, 2.5], [2015, 3.4], [2030, 4]] },
      { id: 'lv_airport', n: '利物浦约翰·列侬机场', t: 'air', at: ll(53.3336, -2.8498), pax: [[2000, 3.2], [2010, 5.4], [2019, 7], [2030, 7.5]] },
      { id: 'lv_uni', n: '利物浦大学', t: 'uni', at: ll(53.4060, -2.9640), w: 0.032 },
      { id: 'lv_jmu', n: '利物浦约翰摩尔斯大学', t: 'uni', at: ll(53.4090, -2.9800), w: 0.024 },
      { id: 'lv_hope', n: '利物浦希望大学', t: 'uni', at: ll(53.3910, -2.9560), w: 0.008 },
      { id: 'lv_hosp1', n: '皇家利物浦大学医院', t: 'hosp', at: ll(53.4090, -2.9630), w: 0.05 },
      { id: 'lv_hosp2', n: '安特里大学医院', t: 'hosp', at: ll(53.4720, -2.9300), w: 0.04 },
      { id: 'lv_hosp3', n: '阿罗帕克医院', t: 'hosp', at: ll(53.4000, -3.0300), w: 0.03 },
      { id: 'lv_shop1', n: '利物浦一号', t: 'shop', lm: 'lv_one', w: [[2000, 0], [2008, 0.045]] },
      { id: 'lv_shop2', n: '教堂街商圈', t: 'shop', at: ll(53.4055, -2.9850), r: 0.8, w: [[2000, 0.04], [2008, 0.03]] },
      { id: 'lv_shop3', n: '阿尔伯特码头商业区', t: 'shop', lm: 'lv_albert', w: [[2000, 0.014], [2010, 0.018]] },
      { id: 'lv_shop4', n: '布特尔斯特兰德购物中心', t: 'shop', at: ll(53.4520, -2.9900), w: 0.014 },
      { id: 'lv_cbd1', n: '商业区（Commercial District）', t: 'cbd', at: ll(53.4090, -2.9920), w: [[2000, 0.018], [2015, 0.026]] },
      { id: 'lv_cbd2', n: '北码头商务区', t: 'cbd', at: ll(53.4180, -3.0000), y0: 2015, w: 0.014 },
      { id: 'lv_sc1', n: '阿尔伯特码头', t: 'scenic', lm: 'lv_albert', w: [[2000, 0.022], [2010, 0.026]] },
      { id: 'lv_sc2', n: '利物浦座堂', t: 'scenic', lm: 'lv_cathedral', w: 0.008 },
      { id: 'lv_sc3', n: '圣乔治大厅', t: 'scenic', lm: 'lv_stgeorge', w: 0.006 },
      { id: 'lv_sc4', n: '世界博物馆', t: 'scenic', lm: 'lv_museum', w: 0.006 },
      { id: 'lv_sc5', n: '爱乐音乐厅', t: 'venue', lm: 'lv_phil', w: 0.005 },
      { id: 'lv_sc6', n: '新布赖顿海滨', t: 'scenic', lm: 'lv_newbrighton', w: 0.006 },
      { id: 'lv_pk1', n: '塞夫顿公园', t: 'park', at: ll(53.3830, -2.9420), r: 0.9, w: 0.012 },
      { id: 'lv_pk2', n: '伯肯黑德公园', t: 'park', lm: 'lv_birkenhead', w: 0.012 },
      { id: 'lv_pk3', n: '王子公园', t: 'park', at: ll(53.4180, -2.9600), r: 0.8, w: 0.008 },
      { id: 'lv_stad1', n: '安菲尔德球场', t: 'stadium', lm: 'lv_anfield', w: 0.012 },
      { id: 'lv_stad2', n: '古迪逊公园球场', t: 'stadium', lm: 'lv_goodison', w: 0.01 },
      { id: 'lv_venue1', n: '展览中心（Exhibition Centre）', t: 'venue', at: ll(53.4020, -2.9880), w: 0.012 },
      { id: 'lv_venue2', n: '利物浦竞技场（M&S Bank Arena）', t: 'venue', at: ll(53.4000, -2.9930), y0: 2008, w: 0.012 },
      { id: 'lv_port', n: '利物浦港（北码头与集装箱码头）', t: 'venue', lm: 'lv_stanley', w: [[2000, 0.016], [2015, 0.022]] },
    ],

    districtLabels: [],

    events: [
      { y: 2000, m: 1, tag: '史实', title: '2000 年的利物浦', desc: '市区与近郊约 79 万人。码头早已外迁，阿尔伯特码头在 1980 年代改成博物馆与商店；默西铁路的南北线与威勒尔线在市中心地下运行，其余城区依赖公交。' },
      { y: 2003, m: 1, tag: '史实', title: '申办欧洲文化之都成功', desc: '利物浦获得 2008 年欧洲文化之都称号，市中心与港区的改造项目集中上马。' },
      { y: 2006, m: 6, tag: '史实', title: '利物浦南帕克韦换乘站启用', desc: '铁路、长途汽车与机场巴士集中在一处换乘，南郊的门户地位上升。' },
      { y: 2008, m: 1, tag: '史实', title: '欧洲文化之都年与利物浦一号开业', desc: '市中心商业重心转向利物浦一号，教堂街与汉诺威街的客流被重新分配。' },
      { y: 2008, m: 9, tag: '史实', title: '金融危机', desc: '北码头的再开发计划被推迟，写字楼需求大幅下滑。' },
      { y: 2015, m: 1, tag: '史实', title: '利物浦水域与北码头再开发', desc: '斯坦利船坞一带开始建设新街区与商务区，城市重心向北移动。' },
      { y: 2021, m: 1, tag: '模拟', title: '进入模拟发展阶段', desc: '此后人口、道路和区域变化按模拟规则推演，不代表真实历史。' },
    ],
    // 本地历史主题任务：参考利物浦 2000 年起的实际发展需求，不要求复刻真实线路（奖励单位：万英镑）
    histTasks: [
      { id: 'lv1', appear: [2000, 3], deadline: [2010, 12], type: 'connect', reward: 2400, title: '市中心环', desc: '默西铁路在市中心是两条独立的尽头线，摩尔菲尔德与利物浦中央之间换乘不便。把环闭合。', anchors: [anchor('莱姆街', 53.4075, -2.9779, 3), anchor('利物浦中央', 53.4050, -2.9780, 3), anchor('詹姆斯街', 53.4050, -2.9920, 3), anchor('摩尔菲尔德', 53.4080, -2.9890, 3)] },
      { id: 'lv2', appear: [2001, 1], deadline: [2012, 12], type: 'connect', reward: 2600, title: '阿尔伯特码头接驳', desc: '码头区改成了博物馆与商店，但最近的站要走十几分钟。把码头区接进轨道网。', anchors: [anchor('阿尔伯特码头', 53.4010, -2.9920, 4), anchor('利物浦中央', 53.4050, -2.9780, 3)] },
      { id: 'lv3', appear: [2002, 1], deadline: [2014, 12], type: 'connect', reward: 2400, title: '埃弗顿与安菲尔德', desc: '埃弗顿与安菲尔德的居民要进城，公交在苏格兰路上排队。', anchors: [anchor('埃弗顿（苏格兰路）', 53.4200, -2.9950, 3), anchor('安菲尔德球场', 53.4308, -2.9608, 3), anchor('莱姆街', 53.4075, -2.9779, 3)] },
      { id: 'lv4', appear: [2004, 1], deadline: [2016, 12], type: 'connect', reward: 2500, title: '南郊与机场', desc: '南帕克韦换乘站与机场之间的接驳是南郊最缺的一环。', anchors: [anchor('利物浦南帕克韦站', 53.3640, -2.8900, 3), anchor('利物浦约翰·列侬机场', 53.3336, -2.8498, 4)] },
      { id: 'lv5', appear: [2006, 1], deadline: [2018, 12], type: 'coverage', target: 0.35, reward: 3000, title: '覆盖内城', desc: '步行 15 分钟可到达车站的人口不低于 35%。' },
      { id: 'lv6', appear: [2014, 1], deadline: [2028, 12], type: 'connect', reward: 2600, title: '北码头与市中心', desc: '利物浦水域项目让北码头有了新的就业，与市中心之间需要轨道。', anchors: [anchor('斯坦利船坞（北码头）', 53.4130, -2.9980, 4), anchor('莱姆街', 53.4075, -2.9779, 3)] },
    ],
    dynTasks: [
      { id: 'lvd1', from: [2003, 1], to: [2014, 12], type: 'connect', months: 42, reward: 1200, title: '文化之都通勤', desc: '文化之都年的客流高峰让市中心的换乘压力暴露出来。', anchors: [anchor('莱姆街', 53.4075, -2.9779, 3), anchor('阿尔伯特码头', 53.4010, -2.9920, 4)] },
      { id: 'lvd2', from: [2008, 1], to: [2022, 12], type: 'connect', months: 42, reward: 1400, title: '利物浦一号接驳', desc: '商业重心东移后，教堂街与利物浦一号之间需要新的通道。', anchors: [anchor('利物浦一号', 53.4032, -2.9882, 3), anchor('莱姆街', 53.4075, -2.9779, 3)] },
      { id: 'lvd3', from: [2016, 1], to: [2030, 12], type: 'connect', months: 42, reward: 1500, title: '北码头接驳', desc: '北码头的新街区入住后，通勤需求快速上升。', anchors: [anchor('斯坦利船坞（北码头）', 53.4130, -2.9980, 4), anchor('利物浦中央', 53.4050, -2.9780, 3)] },
    ],
    taskNote: '历史主题任务参考利物浦 2000 年起的实际发展需求（市中心环、码头区、欧洲文化之都、南帕克韦换乘、北码头再开发），不要求按真实线路建设，只需满足目标描述。',
    // 线路配色参考默西铁路与利物浦地铁规划
    lineColorsNice: ['#0d5c3f', '#f6a800', '#e60012', '#0072bc', '#8e44ad', '#00a8a8', '#d35400', '#c2185b', '#5c6bc0', '#7cb342'],
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
    throw new Error('利物浦：阶段目标锚点未找到 ' + name);
  };

  // 历史发展阶段（v2.2，eras.js）：summary 中「史实」可查证，「估算」为模型设定的发展倾向
  data.eras = [
    { id: 'lv-e1', from: 2000, name: '码头之后', tag: '史实',
      summary: '史实：1977 年默西铁路市中心地下段开通，1980 年代阿尔伯特码头改为博物馆与商店，2003 年申办欧洲文化之都成功。估算：就业集中在市中心与码头区，内城人口仍在流失，北码头大片空置，威勒尔半岛以居住为主。',
      grow: { pop: { liverpool: 0.9, wirral: 1.05, sefton: 1.0, knowsley: 1.0, pierhead: 1.1 }, jobs: { pierhead: 1.2, albertdock: 1.15, liverpool: 1.0 } },
      relocate: { pop: { liverpool: 0.0004 } },
      demand: { decayHW: 1.0 },
      corridors: [{ a: 'liverpool', b: 'pierhead', f: 1.2 }, { a: 'sefton', b: 'pierhead', f: 1.15 }, { a: 'wirral', b: 'pierhead', f: 1.15 }],
      goals: [{ id: 'lv-g1', from: 2001, type: 'connect', months: 60, reward: 2000, title: '码头区接驳', desc: '阿尔伯特码头改成了博物馆与商店，但最近的默西铁路车站要走十几分钟。用地铁把码头区接进轨道网。', anchors: [site('阿尔伯特码头', 4), site('莱姆街车站', 3)] }] },
    { id: 'lv-e2', from: 2003, name: '欧洲文化之都', tag: '史实',
      summary: '史实：2003 年获得 2008 年欧洲文化之都称号，2006 年南帕克韦换乘站启用，2008 年利物浦一号开业。估算：市中心与码头区投资集中，内城人口开始回流，南郊的换乘走廊形成。',
      grow: { pop: { pierhead: 1.4, albertdock: 1.3, liverpool: 1.05, sefton: 1.05 }, jobs: { pierhead: 1.35, albertdock: 1.3, liverpool: 1.1 } },
      demand: { decayHW: 1.05, hub: 1.1 },
      corridors: [{ a: 'liverpool', b: 'pierhead', f: 1.25 }, { a: 'knowsley', b: 'pierhead', f: 1.15 }],
      goals: [{ id: 'lv-g2', from: 2006, type: 'connect', months: 60, reward: 2200, title: '南郊与机场', desc: '南帕克韦换乘站启用后，机场与换乘站之间的接驳成为南郊最缺的一环。用地铁把两者连起来。', anchors: [site('利物浦南帕克韦站', 3), site('利物浦约翰·列侬机场', 4)] }] },
    { id: 'lv-e3', from: 2008, name: '利物浦一号与金融危机', tag: '史实',
      summary: '史实：2008 年利物浦一号开业、同年爆发金融危机，北码头再开发计划被推迟。估算：商业重心东移，写字楼需求下滑，内城人口回流放缓，威勒尔与塞夫顿的通勤压力集中在两条隧道上。',
      grow: { pop: { pierhead: 1.2, albertdock: 1.1, liverpool: 1.0, wirral: 1.0 }, jobs: { pierhead: 1.15, liverpool: 1.05, albertdock: 1.1 } },
      demand: { decayHW: 1.1 },
      corridors: [{ a: 'wirral', b: 'pierhead', f: 1.2 }, { a: 'sefton', b: 'pierhead', f: 1.15 }],
      goals: [{ id: 'lv-g3', from: 2009, type: 'connect', months: 60, reward: 2200, title: '埃弗顿与安菲尔德', desc: '埃弗顿与安菲尔德的居民进城只有苏格兰路一条走廊。用地铁把这一带与市中心连起来。', anchors: [site('埃弗顿（苏格兰路）', 3), site('安菲尔德球场', 3)] }] },
    { id: 'lv-e4', from: 2015, name: '水域再开发与北方动力', tag: '史实',
      summary: '史实：2015 年起利物浦水域项目在北码头建设新街区，2021 年设立自由港。估算：就业重心从市中心向北码头移动，内城人口恢复增长，默西铁路两条走廊的客流接近饱和。',
      grow: { pop: { northdocks: 1.9, pierhead: 1.25, liverpool: 1.1, wirral: 1.05 }, jobs: { northdocks: 1.8, pierhead: 1.2, liverpool: 1.05 } },
      demand: { decayHW: 1.1, hub: 1.05 },
      corridors: [{ a: 'northdocks', b: 'pierhead', f: 1.25 }, { a: 'liverpool', b: 'pierhead', f: 1.1 }],
      goals: [{ id: 'lv-g4', from: 2016, type: 'connect', months: 60, reward: 2400, title: '北码头与市中心', desc: '利物浦水域项目让北码头有了新的就业与住户。用地铁把北码头与市中心连起来。', anchors: [site('斯坦利船坞（北码头）', 4), site('莱姆街车站', 3)] }] },
    { id: 'lv-e5', from: 2021, name: '模拟未来', tag: '模拟',
      summary: '模拟：此后的发展按模型推演，不代表真实历史。估算：北码头与自由港带动就业，威勒尔与塞夫顿的通勤继续依赖两条隧道，跨河通道成为全网瓶颈。',
      grow: { pop: { northdocks: 1.5, pierhead: 1.15, liverpool: 1.1, wirral: 1.05 }, jobs: { northdocks: 1.4, pierhead: 1.15 } },
      demand: { lz: 1.1, decayHW: 1.1 }, corridors: [{ a: 'wirral', b: 'pierhead', f: 1.1 }] },
  ];

  const INF = [[2000, 0.008], [2003, 0.014], [2005, 0.021], [2008, 0.036], [2009, -0.005], [2012, 0.028], [2016, 0.01], [2020, 0.009], [2022, 0.09], [2024, 0.035], [2030, 0.02], [2050, 0.02]];
  (CM.MAP_LIST = CM.MAP_LIST || []).push({
    id: 'lv', name: '利物浦', title: '利物浦 · 2000', sub: '真实地理 · 2000 年起 · 英镑',
    desc: '从 2000 年的利物浦开始：码头早已外迁，阿尔伯特码头改成了博物馆，北边的船坞还是一片空仓库。默西铁路从 1977 年起在市中心地下运行，但只覆盖南北与威勒尔两条走廊。你要接管这两条线，再把它铺到没有轨道的城区。',
    facts: [['范围', '26 km × 20 km'], ['起始', '2000 年'], ['人口', '约 79 万'], ['货币', '英镑（GBP）'], ['既有地铁', '默西铁路 2 线 32 站'], ['模式', '经营挑战 / 自由建造']],
    modes: ['challenge', 'free'], kind: 'real', mapVersion: 1, scenario: 'lv-2000',
    region: '英国', tagline: '接管默西铁路，把码头与内城接进来', difficulty: 4, tags: ['已有地铁', '过河', '再开发'],
    intro: '2000 年的利物浦是一座刚从衰退里走出来的城市。默西河把城市与威勒尔半岛隔开，河下只有两条公路隧道与一条铁路隧道；市中心的码头早已停止卸货，阿尔伯特码头成了旅游点，北边的船坞还空着。默西铁路有两条线在市中心地下运行，但内城、埃弗顿与南郊都没有轨道。你要先接管这两条线，再把它们铺出去。',
    features: [['train', '既有默西铁路', '开局接管南北线与威勒尔线共 32 站，不收历史建设费'], ['bridge', '默西河', '跨河只有两条隧道，新建跨河段造价很高'], ['building', '码头区与北码头', '阿尔伯特码头、利物浦一号与北码头按年份更新'], ['coin', '英镑经营', '造价、票价、拨款与债券按英镑计算，2008 年后长期低息']],
    highlights: [[2003, '申办欧洲文化之都成功'], [2006, '南帕克韦换乘站'], [2008, '欧洲文化之都与利物浦一号'], [2015, '利物浦水域再开发'], [2021, '自由港设立']],
    geo: G, data: data,
    econ: { devOffset: 20, money: 6.3 },   // 出行选择参数：利物浦 2000 年约对应广州样本 2020 年的发展阶段；币值按 2000 年英镑缩放
    cfg: {
      W: 104, H: 80, START: { y: 2000, m: 1, d: 1, minute: 360 },
      // 工作周：英国长期实行五天工作周（史实）
      workWeek: { sat: [[2000, 0]], school: [[2000, 0]] },
      growth: Object.assign({}, CM.CFG.growth, { popCurve: [[2000, 7.9e5], [2005, 7.85e5], [2010, 8.0e5], [2015, 8.3e5], [2020, 8.6e5], [2030, 9.0e5], [2050, 9.4e5], [2300, 9.6e5]], histEnd: 2020, jobsRatio: [[2000, 0.56], [2010, 0.58], [2020, 0.6], [2040, 0.61]] }),
      money: { code: 'GBP', unit: '英镑', wan: '万英镑', yi: '亿英镑', sym: '£' },
      econBase: 2000,
      cost: Object.assign({}, CM.CFG.cost, {
        trackPerKm: { underground: 28000, surface: 4200, elevated: 11000 },
        riverPerKm: { underground: 22000, surface: 16000, elevated: 16000 },   // 默西河：河底隧道 / 跨河桥梁附加
        hillPerKm: 9000, protectedPerKm: 7000,
        station: { underground: { S: 11000, M: 18000, L: 29000 }, elevated: { S: 6000, M: 9500, L: 15000 }, surface: { S: 3500, M: 5800, L: 9500 } },
        demolishPerCell: 24000,
        inflation: INF,
      }),
      ops: Object.assign({}, CM.CFG.ops, { carKmCost: 0.0011, stationDaily: { S: 2.0, M: 3.4, L: 5.8 }, inflation: INF }),
      fareDefault: { mode: 'flat', flat: 1.6 }, fareRange: { min: 0, max: 5, step: 0.1 },
      economy: Object.assign({}, CM.CFG.economy, { startFunds: 620000, grantBase: [[2000, 32000], [2005, 38000], [2010, 42000], [2015, 46000], [2020, 52000], [2050, 72000]], debtLimit: -380000, rewardScale: 6.3,
        // 英镑债券：2008 年后长期低息，2022 年起通胀推高利率
        bonds: { local: { rate: [[2000, 0.053], [2003, 0.045], [2008, 0.045], [2012, 0.018], [2020, 0.003], [2022, 0.04], [2030, 0.035], [2050, 0.04]], quotaMonths: 6, capMonths: 30 }, ct: { spread: 0.015, quotaMonths: 4, capMonths: 18 }, term6: 0.003 } }),
      // 城市经济（macro.js）：2000 年地图范围 GVA 约 78 亿英镑（估算；利物浦城市区域约 170 亿英镑，地图覆盖默西河两岸主要部分）
      macro: {
        area: '地图范围（利物浦、塞夫顿南部、威勒尔北部与诺斯利西部）', region: '英国',
        gdp0: 780000, revRatio: [[2000, 0.15], [2010, 0.16], [2020, 0.17], [2040, 0.17]], revElastic: 1.5,
        prod: [[2000, 0.026], [2007, 0.02], [2009, 0.002], [2012, 0.014], [2019, 0.012], [2020, -0.06], [2022, 0.03], [2030, 0.018], [2050, 0.015], [2080, 0.01]],
        infl: 'uk', longRun: { infl: 0.02 }, histEnd: 2020, ref: 'uk',
        struct: { trade: 0.5, fin: 0.45, ind: 0.5, tour: 0.5, prop: 0.6 },
        events: [
          { id: 'dotcom2001', y: 2001, m: 3, scale: 0.7 },
          { id: 'gfc2008', y: 2008, m: 9, scale: 1.2 },
          { id: 'brexit2016', y: 2016, m: 6 },
          { id: 'covid2020', y: 2020, m: 3, scale: 1.15 },
        ],
      },
    },
    cam: { cx: 58, cy: 42, zoom: 18 },
  });
})(window.CM);
