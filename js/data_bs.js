'use strict';
// 布里斯托尔 · 1960 场景（英国）。地理来自 OpenStreetMap（geo_bs.js，现代数据），本文件补充 1960 年起的区域开放、
// 埃文河与港池、道路与桥梁年份、人口就业中心、地标、历史事件、本地任务与英镑经营参数。坐标单位为格（250 m），用 ll(纬度, 经度) 换算。
// 1960 年的布里斯托尔刚从战争里恢复：1940—41 年的大空袭抹平了布罗德米德与城堡街一带，战后重建正在进行；
// 有轨电车已于 1941 年停驶，公交与自行车是主要出行方式；菲尔顿的飞机厂正在造客机，埃文茅斯的码头还在卸货。
// 真实性：空袭后的重建、协和飞机首飞、M4/M5 与 M32 高速、码头衰落与港区再开发、卡博特广场的年份为史实参考（范围为近似）；
// 1960 年人口与就业分布、增长曲线、造价与票价为估算。
(function (CM) {
  const G = CM.GEOS && CM.GEOS.bs; if (!G) return;
  const P = G.proj, ll = function (lat, lon) { return [+((lon - P.lon0) * P.kx).toFixed(2), +((P.lat0 - lat) * P.ky).toFixed(2)]; };
  const at = function (lat, lon, o) { const p = ll(lat, lon); return Object.assign({ x: p[0], y: p[1] }, o); };
  const poly = function (pts) { return pts.map(function (p) { return ll(p[0], p[1]); }); };
  const anchor = function (name, lat, lon, r) { const p = ll(lat, lon); return { name: name, x: p[0], y: p[1], r: r }; };

  // 战后重建区（布罗德米德与城堡街，1941 年被炸平）与港池（Harbourside）
  const broadmead = poly([[51.4555, -2.5920], [51.4555, -2.5820], [51.4610, -2.5820], [51.4610, -2.5920]]);
  const harbour = poly([[51.4420, -2.6250], [51.4420, -2.5950], [51.4520, -2.5950], [51.4520, -2.6250]]);
  const avonmouth = poly([[51.4850, -2.7300], [51.4850, -2.6800], [51.5150, -2.6800], [51.5150, -2.7300]]);
  const filton = poly([[51.4980, -2.6100], [51.4980, -2.5500], [51.5350, -2.5500], [51.5350, -2.6100]]);
  const lulsgate = poly([[51.3750, -2.7280], [51.3750, -2.7080], [51.3900, -2.7080], [51.3900, -2.7280]]);

  const data = {
    city: '布里斯托尔', riverName: '埃文河', seaName: '布里斯托尔湾', hsrYear: 9999,
    stages: [[1968, '协和飞机与内环期'], [1974, '高速公路与港口转型期'], [1985, '金融与港区再开发期']], stageLast: '创意产业与通勤带期',
    briefing: {
      lead: '1960 年的布里斯托尔还在战后恢复：1940—41 年的大空袭把布罗德米德与城堡街一带炸成平地，新的购物中心正在废墟上盖起来。埃文河的港池里还停着货船，菲尔顿的飞机厂在造喷气客机。有轨电车 1941 年就停驶了，街上跑的是公交、自行车和越来越多的私家车。',
      modes: [
        ['metro', '地铁', '布里斯托尔没有城市轨道。你将规划这座城市的第一张轨道网。'],
        ['bus', '公交与自行车', '战后公交线路快速扩张，市中心几条街承担了几乎全部换乘。'],
        ['bridge', '埃文河与港池', '河与港池把城市切开，过河靠几座老桥，桥面窄、坡道陡。'],
        ['rail', '铁路', '坦普尔草地是西南地区最大的车站之一，地面铁路会阻隔步行。'],
      ],
    },
    dataNote: [
      ['真实地理', 'hist', '埃文河与港池、海岸线与塞文河口、道路与桥梁、铁路、公园与丘陵、行政区边界、地名与地标场地来自 OpenStreetMap（© OpenStreetMap 贡献者，ODbL），2026-10-30 取数、按 250 m 网格投影（转换见 scripts/fetch-osm.mjs 与 scripts/geo-import.mjs）；OSM 为现代数据，按 1960 年场景作历史近似。'],
      ['史实参考', 'hist', '1940—41 年布里斯托尔大空袭、战后布罗德米德重建、1941 年有轨电车停驶、1969 年协和飞机在菲尔顿首飞、1970 年代 M4/M5 与 M32 高速、1980 年代起港区再开发、2008 年卡博特广场。'],
      ['估算', 'est', '1960 年人口与就业分布、人口增长曲线、出行率、时间价值、造价、票价与运营费用（英镑，1960 年币值）。'],
      ['模拟', 'sim', '1960 年之后的发展、居民出行选择、道路拥堵、客流与财政结果；真实的后续线路不会自动出现。'],
      ['', '', '模拟结果不得作为真实布里斯托尔交通规划预测。'],
    ],
    // 布里斯托尔机场（卢尔斯盖特，1957 年由法尔顿迁来）：跑道 09/27，约 2.0 km
    airport: { name: '布里斯托尔机场', closeYear: 9999, buildable: 'underground', runway: [ll(51.3790, -2.7300), ll(51.3865, -2.7080)] },
    runways: [],
    regions: [
      { id: 'airport', name: '布里斯托尔机场（卢尔斯盖特）', poly: lulsgate, open: 1960, plan: 'res', note: '1957 年由法尔顿迁至卢尔斯盖特；机场用地不开发，范围内可以地下设站与地下穿越' },
      { id: 'avonmouth', name: '埃文茅斯与皇家波特伯里（码头）', poly: avonmouth, open: 1960, plan: 'port', note: '埃文河口的深水码头与油罐区，1960 年代仍是城市的主要货运门户' },
      { id: 'filton', name: '菲尔顿与帕奇威（飞机厂）', poly: filton, open: 1960, plan: 'ind', note: '1910 年建立的飞机厂，战后造不列颠尼亚客机，1960 年代参与协和飞机' },
      { id: 'broadmead', name: '布罗德米德（战后重建商业区）', poly: broadmead, open: 1960, plan: 'cbd', note: '1941 年被炸平，战后按整体规划重建为购物中心' },
      { id: 'harbour', name: '港池与红崖（Harbourside）', poly: harbour, open: 1960, plan: 'resind', note: '1960 年代仍在卸货，1970 年代起码头外迁，1980 年代转为住宅与博物馆' },
      { id: 'oldcity', name: '老城与宽街', poly: poly([[51.4500, -2.6000], [51.4500, -2.5820], [51.4560, -2.5820], [51.4560, -2.6000]]), open: 1960, plan: 'oldmix' },
      { id: 'clifton', name: '克利夫顿与雷德兰', poly: poly([[51.4480, -2.6400], [51.4480, -2.6080], [51.4780, -2.6080], [51.4780, -2.6400]]), open: 1960, plan: 'res' },
      { id: 'bedminster', name: '贝德明斯特与南村', poly: poly([[51.4300, -2.6100], [51.4300, -2.5820], [51.4480, -2.5820], [51.4480, -2.6100]]), open: 1960, plan: 'resind' },
      { id: 'stpauls', name: '圣保罗与伊斯顿', poly: poly([[51.4560, -2.5900], [51.4560, -2.5500], [51.4780, -2.5500], [51.4780, -2.5900]]), open: 1960, plan: 'resind' },
      { id: 'horfield', name: '霍菲尔德与洛克利兹', poly: poly([[51.4780, -2.6000], [51.4780, -2.5600], [51.4980, -2.5600], [51.4980, -2.6000]]), open: 1960, plan: 'res' },
      { id: 'hartcliffe', name: '哈特克利夫与威瑟姆', poly: poly([[51.3950, -2.6300], [51.3950, -2.5850], [51.4300, -2.5850], [51.4300, -2.6300]]), open: 1960, plan: 'res' },
      { id: 'kingswood', name: '金斯伍德与汉纳姆', poly: poly([[51.4480, -2.5200], [51.4480, -2.4800], [51.4750, -2.4800], [51.4750, -2.5200]]), open: 1960, plan: 'resind' },
    ],
    defaultRegion: { id: 'outer', name: '外围（索德伯里·斯托克吉福德·波蒂斯黑德）', open: 1975, plan: 'res' },
    plans: CM.DATA.plans,

    // 1960 年人口与就业中心（估算，人/km²；r 约为影响半径 km）
    centers: [
      at(51.4545, -2.5879, { pop: 34000, jobs: 32000, r: 1.1 }),   // 市中心、宽街
      at(51.4580, -2.5870, { pop: 22000, jobs: 26000, r: 1.0 }),   // 布罗德米德、城堡街
      at(51.4490, -2.5810, { pop: 18000, jobs: 22000, r: 1.1 }),   // 坦普尔草地、红崖
      at(51.4520, -2.6180, { pop: 28000, jobs: 9000, r: 1.2 }),    // 克利夫顿、热泉
      at(51.4680, -2.6120, { pop: 24000, jobs: 7000, r: 1.2 }),    // 雷德兰、科瑟姆
      at(51.4700, -2.5850, { pop: 26000, jobs: 8000, r: 1.2 }),    // 圣安德鲁、蒙彼利埃
      at(51.4620, -2.5700, { pop: 30000, jobs: 14000, r: 1.3 }),   // 圣保罗、伊斯顿
      at(51.4380, -2.5980, { pop: 32000, jobs: 12000, r: 1.3 }),   // 贝德明斯特、南村
      at(51.4860, -2.5860, { pop: 22000, jobs: 9000, r: 1.3 }),    // 霍菲尔德、洛克利兹
      at(51.4100, -2.6100, { pop: 18000, jobs: 4000, r: 1.4 }),    // 哈特克利夫
      at(51.5055, -2.5855, { pop: 12000, jobs: 26000, r: 1.6 }),   // 菲尔顿飞机厂
      at(51.5050, -2.7000, { pop: 9000, jobs: 14000, r: 1.6 }),    // 埃文茅斯码头
      at(51.4600, -2.5050, { pop: 16000, jobs: 6000, r: 1.4 }),    // 金斯伍德
      at(51.5150, -2.5450, { pop: 8000, jobs: 7000, r: 1.5 }),     // 斯托克吉福德、帕奇威
    ],
    rural: { pop: 400, jobs: 100 },
    roadYears: {
      '宽街': 1960, '葡萄酒街': 1960, '皇后路': 1960, '王子街': 1960, '红崖街': 1960,
      '圣殿大道': 1965, '邦德街': 1965, '波特兰广场': 1963, '布罗德米德': 1960,
      '内环路': 1967, '圣菲利普桥路': 1968, '阿什顿路': 1960, '贝德明斯特百老汇': 1965,
      '克利夫顿唐': 1960, '韦尔斯路': 1960, '格洛斯特路': 1960, '切尔滕纳姆路': 1960,
      'M32 高速公路': 1975, 'M4 高速公路': 1972, 'M5 高速公路': 1977, '环路（Ring Road）': 1962,
      'M5 埃文茅斯支线': 1977, '卡博特广场': 2008, '港区大道': 1996, 'MetroBus 快速公交道': 2018,
    },
    bridgeYears: {
      '克利夫顿吊桥': 1864, '王子街桥': 1879, '贝德明斯特桥': 1831, '阿什顿大道桥': 1906,
      '圣殿桥': 1870, '加斯渡口桥': 1906, 'M32 跨线桥': 1975, '埃文茅斯高架桥': 1977,
    },
    bridgeDefaultYear: 1960,
    simRoads: [
      { n: '港区轻轨走廊（模拟规划）', c: 4, y: 2030, p: [[52, 44], [50, 50]] },
      { n: '南布里斯托尔环线（模拟规划）', c: 4, y: 2034, p: [[46, 64], [62, 58]] },
    ],

    // 历史建筑与重要地标（受保护，不得拆除）。x,y 为场地中心（格），w/d 为场地宽与深（米），h 为高度（米）
    landmarks: [
      Object.assign(at(51.45170, -2.60100), { id: 'bs_cathedral', name: '布里斯托尔座堂', w: 130, d: 100, year: 1148, kind: 'church', h: 52 }),
      Object.assign(at(51.44830, -2.58860), { id: 'bs_redcliffe', name: '圣玛丽红崖教堂', w: 80, d: 60, year: 1200, kind: 'church', h: 70 }),
      Object.assign(at(51.45490, -2.62790), { id: 'bs_clifton', name: '克利夫顿吊桥', w: 420, d: 60, year: 1864, kind: 'arch', h: 75 }),
      Object.assign(at(51.45700, -2.60400), { id: 'bs_uni', name: '布里斯托尔大学', w: 900, d: 700, year: 1909, kind: 'campus' }),
      Object.assign(at(51.44900, -2.58100), { id: 'bs_temple', name: '坦普尔草地车站', w: 400, d: 240, year: 1840, kind: 'rail' }),
      Object.assign(at(51.45400, -2.59600), { id: 'bs_theatre', name: '布里斯托尔皇家剧院', w: 90, d: 70, year: 1766, kind: 'opera' }),
      Object.assign(at(51.45500, -2.60600), { id: 'bs_museum', name: '布里斯托尔博物馆与美术馆', w: 120, d: 90, year: 1905, kind: 'museum' }),
      Object.assign(at(51.45800, -2.58700), { id: 'bs_broadmead', name: '布罗德米德购物中心', w: 300, d: 240, year: 1957, kind: 'mall' }),
      Object.assign(at(51.45600, -2.58300), { id: 'bs_castlepark', name: '城堡公园', w: 400, d: 320, year: 1956, kind: 'park' }),
      Object.assign(at(51.50550, -2.58550), { id: 'bs_filton', name: '菲尔顿飞机工厂', w: 1400, d: 900, year: 1910, kind: 'factory' }),
      Object.assign(at(51.50500, -2.70000), { id: 'bs_avonmouth', name: '埃文茅斯码头', w: 900, d: 600, year: 1877, kind: 'box' }),
      Object.assign(at(51.49000, -2.72000), { id: 'bs_portbury', name: '皇家波特伯里码头', w: 800, d: 500, year: 1978, kind: 'box' }),
      Object.assign(at(51.45700, -2.59600), { id: 'bs_royal', name: '布里斯托尔皇家医院', w: 200, d: 150, year: 1735, kind: 'box' }),
      Object.assign(at(51.44000, -2.62000), { id: 'bs_ashton', name: '阿什顿门球场', w: 260, d: 220, year: 1887, kind: 'stadium' }),
      Object.assign(at(51.48600, -2.58300), { id: 'bs_memorial', name: '纪念球场', w: 240, d: 200, year: 1921, kind: 'stadium' }),
      Object.assign(at(51.45170, -2.59300), { id: 'bs_council', name: '布里斯托尔市政厅', w: 200, d: 160, year: 1956, kind: 'hall' }),
      Object.assign(at(51.44700, -2.59700), { id: 'bs_ssgb', name: '大不列颠号（SS Great Britain）', w: 120, d: 40, year: 1843, kind: 'box' }),
      Object.assign(at(51.46100, -2.60800), { id: 'bs_brandon', name: '布兰登山电视塔', w: 60, d: 60, year: 1967, kind: 'tvtower', h: 160 }),
      Object.assign(at(51.48000, -2.64000), { id: 'bs_downs', name: '克利夫顿唐与天文台', w: 700, d: 500, year: 1766, kind: 'park' }),
      Object.assign(at(51.46600, -2.62000), { id: 'bs_zoo', name: '布里斯托尔动物园', w: 300, d: 240, year: 1836, kind: 'park' }),
    ],

    // 重要设施（v1.9，见 facility.js）：位置按真实地理（近似）、启用/停用年份为史实参考；规模均为估算。
    facilities: [
      { id: 'bs_rail', n: '坦普尔草地车站', t: 'rail', lm: 'bs_temple', pax: [[1960, 2.4], [1970, 2.6], [1990, 3.4], [2010, 5.2], [2030, 6.5]] },
      { id: 'bs_parkway', n: '布里斯托尔公园大道站', t: 'rail', at: ll(51.5136, -2.5422), pax: [[1972, 1.2], [1990, 2.2], [2010, 3.2]], note: '1972 年随 M32 高速一并启用的换乘站。' },
      { id: 'bs_airport', n: '布里斯托尔机场', t: 'air', at: ll(51.38270, -2.71910), pax: [[1960, 0.2], [1975, 0.6], [1990, 1.4], [2010, 5.6], [2030, 8]] },
      { id: 'bs_uni', n: '布里斯托尔大学', t: 'uni', lm: 'bs_uni', w: 0.03 },
      { id: 'bs_uwe', n: '西英格兰大学', t: 'uni', at: ll(51.50000, -2.54800), y0: 1992, w: 0.022 },
      { id: 'bs_bri', n: '布里斯托尔皇家医院', t: 'hosp', lm: 'bs_royal', w: 0.045 },
      { id: 'bs_southmead', n: '南米德医院', t: 'hosp', at: ll(51.41700, -2.58900), w: 0.035 },
      { id: 'bs_shop1', n: '布罗德米德商圈', t: 'shop', lm: 'bs_broadmead', w: [[1960, 0.03], [1990, 0.026], [2008, 0.02]] },
      { id: 'bs_shop2', n: '卡博特广场', t: 'shop', at: ll(51.45700, -2.58800), y0: 2008, w: 0.03 },
      { id: 'bs_shop3', n: '克利夫顿村', t: 'shop', at: ll(51.45500, -2.62000), w: 0.014 },
      { id: 'bs_shop4', n: '画廊购物中心', t: 'shop', at: ll(51.45700, -2.59200), y0: 1991, w: 0.018 },
      { id: 'bs_cbd1', n: '市中心商务区', t: 'cbd', at: ll(51.45350, -2.59300), w: [[1960, 0.014], [1980, 0.02], [2000, 0.028]] },
      { id: 'bs_cbd2', n: '坦普尔区商务区', t: 'cbd', at: ll(51.44700, -2.57900), y0: 2012, w: 0.016 },
      { id: 'bs_sc1', n: '克利夫顿吊桥', t: 'scenic', lm: 'bs_clifton', w: 0.014 },
      { id: 'bs_sc2', n: '港池与大不列颠号', t: 'scenic', lm: 'bs_ssgb', w: [[1960, 0.004], [1970, 0.012], [2000, 0.018]] },
      { id: 'bs_sc3', n: '布里斯托尔座堂', t: 'scenic', lm: 'bs_cathedral', w: 0.008 },
      { id: 'bs_sc4', n: '布里斯托尔博物馆与美术馆', t: 'scenic', lm: 'bs_museum', w: 0.008 },
      { id: 'bs_sc5', n: '皇家剧院', t: 'venue', lm: 'bs_theatre', w: 0.006 },
      { id: 'bs_pk1', n: '城堡公园', t: 'park', lm: 'bs_castlepark', w: 0.012 },
      { id: 'bs_pk2', n: '克利夫顿唐', t: 'park', lm: 'bs_downs', w: 0.012 },
      { id: 'bs_pk3', n: '阿什顿庄园', t: 'park', at: ll(51.43500, -2.64500), w: 0.01 },
      { id: 'bs_pk4', n: '布里斯托尔动物园', t: 'park', lm: 'bs_zoo', w: 0.008 },
      { id: 'bs_stad1', n: '阿什顿门球场', t: 'stadium', lm: 'bs_ashton', w: 0.01 },
      { id: 'bs_stad2', n: '纪念球场', t: 'stadium', lm: 'bs_memorial', w: 0.008 },
      { id: 'bs_venue1', n: '布里斯托尔竞技场', t: 'venue', at: ll(51.45200, -2.58800), y0: 2001, w: 0.008 },
      { id: 'bs_port', n: '埃文茅斯与皇家波特伯里码头', t: 'venue', lm: 'bs_avonmouth', w: [[1960, 0.02], [1990, 0.016]] },
    ],

    districtLabels: [],

    events: [
      { y: 1960, m: 1, tag: '史实', title: '1960 年的布里斯托尔', desc: '市区与近郊约 52 万人。1940—41 年大空袭留下的空地还在重建，布罗德米德的购物中心刚盖起来；有轨电车已于 1941 年停驶，街上跑公交与自行车，私家车开始增多。' },
      { y: 1963, m: 1, tag: '史实', title: '战后重建与内环规划', desc: '市中心按现代主义规划重建，宽街与圣殿大道开始改造，为汽车让路。' },
      { y: 1968, m: 4, tag: '史实', title: '内环路通车', desc: '穿过市中心的快速路把老城切开，步行被大量打断，公交与汽车争抢同一条走廊。' },
      { y: 1969, m: 4, tag: '史实', title: '协和飞机在菲尔顿首飞', desc: '菲尔顿飞机厂完成英国首架协和原型机（002）的首飞，飞机工业成为城市最重要的雇主之一。' },
      { y: 1972, m: 1, tag: '史实', title: 'M4 高速公路通车', desc: 'M4 与随后的 M5、M32 把布里斯托尔接入国家高速网，城市向郊外铺开，通勤距离迅速拉长。' },
      { y: 1978, m: 1, tag: '史实', title: '皇家波特伯里深水码头启用', desc: '集装箱与深水泊位取代了市中心的港池，港池一带逐渐废弃。' },
      { y: 1985, m: 1, tag: '估算', title: '金融与创意产业起步', desc: '码头外迁后港区空置，保险公司、银行与媒体开始把后台部门放到布里斯托尔。' },
      { y: 1996, m: 1, tag: '史实', title: '港区再开发', desc: '港池一带改造为住宅、博物馆与办公，大不列颠号成为地标。' },
      { y: 2008, m: 9, tag: '史实', title: '卡博特广场开业', desc: '新的购物中心取代了战后重建的布罗德米德，市中心商业重心东移。' },
      { y: 2021, m: 1, tag: '模拟', title: '进入模拟发展阶段', desc: '此后人口、道路和区域变化按模拟规则推演，不代表真实历史。' },
    ],
    // 本地历史主题任务：参考布里斯托尔 1960 年起的实际发展需求，不要求复刻真实线路（奖励单位：万英镑）
    histTasks: [
      { id: 'bs1', appear: [1960, 3], deadline: [1972, 12], type: 'connect', reward: 900, title: '市中心纵轴', desc: '宽街、布罗德米德与坦普尔草地是战后重建的核心，公交全挤在几条街上。', anchors: [anchor('宽街', 51.4545, -2.5879, 3), anchor('布罗德米德', 51.4580, -2.5870, 3), anchor('坦普尔草地', 51.4490, -2.5810, 3)] },
      { id: 'bs2', appear: [1962, 1], deadline: [1975, 12], type: 'connect', reward: 1000, title: '克利夫顿与大学', desc: '克利夫顿、雷德兰的居民与大学的通勤都压在一条窄路上。', anchors: [anchor('克利夫顿吊桥', 51.4549, -2.6279, 4), anchor('布里斯托尔大学', 51.4570, -2.6040, 3), anchor('宽街', 51.4545, -2.5879, 3)] },
      { id: 'bs3', appear: [1964, 1], deadline: [1978, 12], type: 'connect', reward: 1100, title: '过埃文河到南岸', desc: '贝德明斯特与南村的居民要过河进城，桥面窄、坡道陡。', anchors: [anchor('贝德明斯特', 51.4380, -2.5980, 3), anchor('坦普尔草地', 51.4490, -2.5810, 3)] },
      { id: 'bs4', appear: [1966, 1], deadline: [1982, 12], type: 'connect', reward: 1200, title: '菲尔顿与飞机厂', desc: '菲尔顿的飞机厂是城市最大的雇主，工人从霍菲尔德与洛克利兹赶来。', anchors: [anchor('菲尔顿飞机工厂', 51.5055, -2.5855, 5), anchor('霍菲尔德', 51.4860, -2.5860, 3)] },
      { id: 'bs5', appear: [1970, 1], deadline: [1985, 12], type: 'coverage', target: 0.3, reward: 1400, title: '覆盖内城', desc: '步行 15 分钟可到达车站的人口不低于 30%。' },
      { id: 'bs6', appear: [1976, 1], deadline: [1996, 12], type: 'connect', reward: 1100, title: '金斯伍德与东郊', desc: 'M32 通车后东郊人口增长，金斯伍德与汉纳姆需要进城通道。', anchors: [anchor('金斯伍德', 51.4600, -2.5050, 4), anchor('圣保罗与伊斯顿', 51.4620, -2.5700, 3)] },
      { id: 'bs7', appear: [1990, 1], deadline: [2012, 12], type: 'connect', reward: 1300, title: '港区与机场', desc: '港区再开发后，机场与市中心的联系也需要加强。', anchors: [anchor('港池与大不列颠号', 51.4470, -2.5970, 3), anchor('布里斯托尔机场', 51.3827, -2.7191, 4)] },
    ],
    dynTasks: [
      { id: 'bsd1', from: [1965, 1], to: [1980, 12], type: 'connect', months: 42, reward: 500, title: '内城通勤', desc: '圣保罗与伊斯顿的居民到市中心上班，公交已经不够。', anchors: [anchor('圣保罗与伊斯顿', 51.4620, -2.5700, 3), anchor('宽街', 51.4545, -2.5879, 3)] },
      { id: 'bsd2', from: [1975, 1], to: [1995, 12], type: 'connect', months: 42, reward: 600, title: '机场与公园大道', desc: '高速通车后，机场与换乘站的接驳需求上升。', anchors: [anchor('布里斯托尔机场', 51.3827, -2.7191, 4), anchor('布里斯托尔公园大道站', 51.5136, -2.5422, 4)] },
      { id: 'bsd3', from: [1996, 1], to: [2028, 12], type: 'connect', months: 42, reward: 700, title: '港区接驳', desc: '港区改造后人口回流，与市中心之间需要新的通道。', anchors: [anchor('港池与大不列颠号', 51.4470, -2.5970, 3), anchor('布罗德米德', 51.4580, -2.5870, 3)] },
    ],
    taskNote: '历史主题任务参考布里斯托尔 1960 年起的实际发展需求（战后重建、内环路、菲尔顿飞机厂、M4/M5、港区再开发），不要求按真实线路建设，只需满足目标描述。',
    lineColorsNice: ['#e60012', '#0072bc', '#f6a800', '#00a651', '#8e44ad', '#00a8a8', '#d35400', '#c2185b', '#5c6bc0', '#7cb342'],
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
    throw new Error('布里斯托尔：阶段目标锚点未找到 ' + name);
  };

  // 历史发展阶段（v2.2，eras.js）：summary 中「史实」可查证，「估算」为模型设定的发展倾向
  data.eras = [
    { id: 'bs-e1', from: 1960, name: '战后重建与有轨电车之后', tag: '史实',
      summary: '史实：1941 年有轨电车停驶，1940—41 年大空袭后市中心按整体规划重建，1960 年布罗德米德购物中心已在使用。估算：人口与就业集中在市中心、布罗德米德与坦普尔草地，克利夫顿与雷德兰是西侧的居住区，菲尔顿与埃文茅斯是两个独立的就业极。',
      grow: { pop: { oldcity: 0.95, broadmead: 1.05, bedminster: 1.1, clifton: 1.05, stpauls: 1.1, horfield: 1.15, hartcliffe: 1.2, kingswood: 1.2 }, jobs: { broadmead: 1.2, oldcity: 1.15, filton: 1.2, avonmouth: 1.1 } },
      relocate: { pop: { oldcity: 0.0005 } },
      demand: { decayHW: 0.95 },
      corridors: [{ a: 'stpauls', b: 'broadmead', f: 1.15 }, { a: 'bedminster', b: 'oldcity', f: 1.15 }],
      goals: [{ id: 'bs-g1', from: 1962, type: 'connect', months: 72, reward: 800, title: '重建区的纵轴', desc: '战后重建的商业区与老城之间只隔几条街，公交却全部挤在宽街上。用地铁把布罗德米德与坦普尔草地连起来。', anchors: [site('布罗德米德购物中心', 3), site('坦普尔草地车站', 3)] }] },
    { id: 'bs-e2', from: 1968, name: '协和飞机与内环', tag: '史实',
      summary: '史实：1968 年内环路通车，1969 年协和飞机在菲尔顿首飞。估算：汽车迅速取代公交成为主导，内环路把老城切开，菲尔顿的飞机工业进入鼎盛期，郊外住宅沿高速走廊铺开。',
      grow: { pop: { horfield: 1.3, kingswood: 1.3, hartcliffe: 1.25, clifton: 1.0, oldcity: 0.9 }, jobs: { filton: 1.35, broadmead: 1.1, avonmouth: 1.05 } },
      relocate: { pop: { oldcity: 0.0008 } },
      demand: { decayHW: 1.1, car: 1.1 },
      corridors: [{ a: 'kingswood', b: 'broadmead', f: 1.2 }, { a: 'horfield', b: 'filton', f: 1.2 }],
      goals: [{ id: 'bs-g2', from: 1969, type: 'connect', months: 60, reward: 900, title: '菲尔顿与市中心', desc: '飞机厂的工人住在霍菲尔德与洛克利兹，每天靠公交进城。用地铁把菲尔顿与市中心连起来。', anchors: [site('菲尔顿飞机工厂', 5), site('布里斯托尔大学', 3)] }] },
    { id: 'bs-e3', from: 1974, name: '高速公路与港口转型', tag: '史实',
      summary: '史实：1972 年 M4、1975 年 M32、1977 年 M5 通车，1978 年皇家波特伯里深水码头启用，市中心港池的货运逐步停止。估算：城市沿高速向东南与北部铺开，港池一带开始空置，内城人口流失。',
      grow: { pop: { kingswood: 1.35, horfield: 1.25, hartcliffe: 1.2, oldcity: 0.85, stpauls: 0.95 }, jobs: { filton: 1.2, avonmouth: 1.15, broadmead: 0.95 } },
      relocate: { pop: { oldcity: 0.0009, harbour: 0.0006 } },
      demand: { decayHW: 1.15, car: 1.15, hub: 1.05 },
      corridors: [{ a: 'kingswood', b: 'oldcity', f: 1.2 }, { a: 'avonmouth', b: 'oldcity', f: 1.1 }],
      goals: [{ id: 'bs-g3', from: 1976, type: 'connect', months: 60, reward: 1000, title: '东郊与内城', desc: 'M32 通车后金斯伍德与汉纳姆的人口增长最快，进城仍只有一条路。用地铁把金斯伍德与圣保罗连起来。', anchors: [site('城堡公园', 4), site('布里斯托尔大学', 3)] }] },
    { id: 'bs-e4', from: 1985, name: '金融与港区再开发', tag: '史实',
      summary: '史实：1980 年代起保险公司与银行把后台部门放到布里斯托尔，1996 年港区完成再开发，2008 年卡博特广场开业。估算：就业向市中心与港区集中，内城人口回流，通勤带进一步外扩到机场与波特伯里。',
      grow: { pop: { harbour: 1.5, oldcity: 1.15, broadmead: 1.1, clifton: 1.05, kingswood: 1.15, hartcliffe: 1.05 }, jobs: { broadmead: 1.2, harbour: 1.3, filton: 1.05 } },
      demand: { decayHW: 1.1, hub: 1.1 },
      corridors: [{ a: 'harbour', b: 'broadmead', f: 1.2 }, { a: 'kingswood', b: 'broadmead', f: 1.15 }],
      goals: [{ id: 'bs-g4', from: 1996, type: 'connect', months: 60, reward: 1200, title: '港区与机场', desc: '港区改造后人口回流，机场客流也在增长。用地铁把港池与机场连起来。', anchors: [site('大不列颠号（SS Great Britain）', 3), site('布里斯托尔机场', 4)] }] },
    { id: 'bs-e5', from: 2021, name: '模拟未来', tag: '模拟',
      summary: '模拟：此后的发展按模型推演，不代表真实历史。估算：市中心与港区继续加密，东郊与机场走廊承担最多通勤，埃文河口的产业区转型为物流与能源。',
      grow: { pop: { harbour: 1.3, broadmead: 1.1, kingswood: 1.15, horfield: 1.05 }, jobs: { harbour: 1.25, broadmead: 1.15, filton: 1.05 } },
      demand: { lz: 1.1, decayHW: 1.1 }, corridors: [{ a: 'kingswood', b: 'broadmead', f: 1.1 }] },
  ];

  const INF = [[1960, 0.01], [1968, 0.047], [1971, 0.094], [1974, 0.16], [1976, 0.166], [1980, 0.18], [1983, 0.047], [1986, 0.036], [1990, 0.095], [1993, 0.016], [1996, 0.024], [2000, 0.008], [2005, 0.021], [2008, 0.036], [2012, 0.028], [2016, 0.01], [2020, 0.009], [2030, 0.02], [2050, 0.02]];
  (CM.MAP_LIST = CM.MAP_LIST || []).push({
    id: 'bs', name: '布里斯托尔', title: '布里斯托尔 · 1960', sub: '真实地理 · 1960 年起 · 英镑',
    desc: '从 1960 年的布里斯托尔开始：1940—41 年的大空袭把市中心炸成平地，战后重建的购物中心刚刚盖起来，有轨电车已经停驶，私家车正在增多。菲尔顿的飞机厂在造喷气客机，埃文河口的码头还在卸货。没有地铁，你要从一片废墟上的新城开始画线。',
    facts: [['范围', '26 km × 22 km'], ['起始', '1960 年'], ['人口', '约 52 万'], ['货币', '英镑（GBP）'], ['模式', '经营挑战 / 自由建造']],
    modes: ['challenge', 'free'], kind: 'real', mapVersion: 1, scenario: 'bs-1960',
    region: '英国', tagline: '战后重建，从废墟上的新城开始', difficulty: 3, tags: ['无地铁开局', '战后重建', '过河'],
    intro: '1960 年的布里斯托尔还没有一公里轨道。市中心是战争留下的空地与新盖的购物中心，内环路还没有切开老城，埃文河与港池把城市分成几块，过河只有几座窄桥。北边的菲尔顿在造飞机，西边的埃文茅斯在卸货。你要在这个刚从战争里恢复的城市画第一张网，然后看着汽车时代、高速公路与港区再开发一层层改变它。',
    features: [['map', '战后重建的市中心', '1941 年被炸平的街区按整体规划重建，街巷格局与现代城市不同'], ['bridge', '埃文河与港池', '过河靠几座老桥，跨河段造价高'], ['building', '菲尔顿与码头', '飞机制造、港口与港区再开发构成三个不同的就业极'], ['coin', '英镑经营', '造价、票价、拨款与债券按 1960 年代英镑计算，通胀波动剧烈']],
    highlights: [[1968, '内环路通车'], [1969, '协和飞机在菲尔顿首飞'], [1972, 'M4 高速公路通车'], [1978, '皇家波特伯里码头启用'], [1996, '港区再开发'], [2008, '卡博特广场开业']],
    geo: G, data: data,
    econ: { devOffset: 30, money: 1.1 },   // 出行选择参数：1960 年的英国城市约对应广州样本 1990 年的发展阶段；币值按 1960 年英镑缩放
    cfg: {
      W: 104, H: 88, START: { y: 1960, m: 1, d: 1, minute: 360 },
      // 工作周：英国长期实行五天工作周（史实）
      workWeek: { sat: [[1960, 0]], school: [[1960, 0]] },
      growth: Object.assign({}, CM.CFG.growth, { popCurve: [[1960, 5.2e5], [1970, 5.3e5], [1980, 5.1e5], [1990, 5.0e5], [2000, 5.1e5], [2010, 5.6e5], [2020, 6.1e5], [2030, 6.5e5], [2050, 7.0e5], [2300, 7.2e5]], histEnd: 2020, jobsRatio: [[1960, 0.5], [1980, 0.52], [2000, 0.56], [2020, 0.58], [2040, 0.59]] }),
      money: { code: 'GBP', unit: '英镑', wan: '万英镑', yi: '亿英镑', sym: '£' },
      econBase: 1960,
      // 造价按 1960 年英镑（约为 1990 年数值的 1/8；估算，参考 1960 年代英国地铁约 300 万英镑/km 的量级）
      cost: Object.assign({}, CM.CFG.cost, {
        trackPerKm: { underground: 2750, surface: 440, elevated: 1120 },
        riverPerKm: { underground: 2000, surface: 1500, elevated: 1500 },   // 埃文河：河底隧道 / 跨河桥梁附加
        hillPerKm: 1000, protectedPerKm: 750,
        station: { underground: { S: 1120, M: 1870, L: 3000 }, elevated: { S: 620, M: 1000, L: 1620 }, surface: { S: 380, M: 620, L: 1000 } },
        demolishPerCell: 2750,
        inflation: INF,
      }),
      ops: Object.assign({}, CM.CFG.ops, { carKmCost: 0.00015, stationDaily: { S: 0.28, M: 0.48, L: 0.82 }, inflation: INF }),
      fareDefault: { mode: 'flat', flat: 0.16 }, fareRange: { min: 0, max: 0.6, step: 0.02 },
      economy: Object.assign({}, CM.CFG.economy, { startFunds: 88000, grantBase: [[1960, 4400], [1970, 6200], [1980, 7000], [1990, 7600], [2000, 8200], [2020, 9000], [2050, 12000]], debtLimit: -52000, rewardScale: 1.1,
        // 英镑债券：1970 年代通胀高企时利率很高，1992 年退出汇率机制后回落
        bonds: { local: { rate: [[1960, 0.055], [1968, 0.075], [1974, 0.14], [1980, 0.14], [1983, 0.105], [1990, 0.115], [1993, 0.075], [2000, 0.053], [2008, 0.045], [2012, 0.018], [2020, 0.003], [2030, 0.03], [2050, 0.04]], quotaMonths: 6, capMonths: 30 }, ct: { spread: 0.015, quotaMonths: 4, capMonths: 18 }, term6: 0.003 } }),
      // 城市经济（macro.js）：1960 年地图范围 GVA 约 4.5 亿英镑（估算；1960 年英国 GDP 约 270 亿英镑，布里斯托尔地区约占 2%）
      macro: {
        area: '地图范围（布里斯托尔市区、金斯伍德、菲尔顿与埃文茅斯）', region: '英国',
        gdp0: 450000, revRatio: [[1960, 0.2], [1974, 0.22], [1990, 0.18], [2010, 0.15], [2040, 0.15]], revElastic: 1.5,
        prod: [[1960, 0.03], [1965, 0.035], [1970, 0.028], [1974, 0.005], [1978, 0.015], [1980, -0.01], [1985, 0.03], [1990, 0.018], [2008, -0.012], [2012, 0.016], [2020, 0.014], [2030, 0.015], [2050, 0.014], [2080, 0.01]],
        infl: 'uk', longRun: { infl: 0.02 }, histEnd: 2020, ref: 'uk',
        struct: { trade: 0.45, fin: 0.4, ind: 0.75, tour: 0.4, prop: 0.5 },
        events: [
          { id: 'uk1970s', y: 1973, m: 10, scale: 1.15 },
          { id: 'uk1980', y: 1980, m: 3, scale: 0.85 },
          { id: 'uk1990', y: 1990, m: 7 },
          { id: 'blackwed1992', y: 1992, m: 9 },
          { id: 'dotcom2001', y: 2001, m: 3, scale: 0.7 },
          { id: 'gfc2008', y: 2008, m: 9, scale: 1.15 },
          { id: 'brexit2016', y: 2016, m: 6 },
          { id: 'covid2020', y: 2020, m: 3, scale: 1.1 },
        ],
      },
    },
    cam: { cx: 52, cy: 44, zoom: 18 },
  });
})(window.CM);
