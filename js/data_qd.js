'use strict';
// 青岛 · 2000 场景。地理来自 OpenStreetMap（geo_qd.js，现代数据，含海岸线与胶州湾），本文件补充 2000 年起的
// 区域开放、道路与桥梁年份、人口就业中心、地标、历史事件、本地任务与人民币经营参数。坐标单位为格（250 m），用 ll(纬度, 经度) 换算。
// 开局没有地铁（青岛地铁 2016 年才开通 3 号线），路网完全由玩家规划。
// 真实性：奥帆赛、胶州湾隧道与大桥、地铁开通的年份为史实参考（范围为近似）；行政区按现代区划（2000 年的四方区已并入市北区）。
(function (CM) {
  const G = CM.GEOS && CM.GEOS.qd; if (!G) return;
  const P = G.proj, ll = function (lat, lon) { return [+((lon - P.lon0) * P.kx).toFixed(2), +((P.lat0 - lat) * P.ky).toFixed(2)]; };
  const at = function (lat, lon, o) { const p = ll(lat, lon); return Object.assign({ x: p[0], y: p[1] }, o); };
  const poly = function (pts) { return pts.map(function (p) { return ll(p[0], p[1]); }); };
  const anchor = function (name, lat, lon, r) { const p = ll(lat, lon); return { name: name, x: p[0], y: p[1], r: r }; };

  // 老城（市南西部）与浮山后、李村（近似）
  const oldtown = poly([[36.0720, 120.3030], [36.0720, 120.3450], [36.0500, 120.3450], [36.0500, 120.3030]]);
  const fushanhou = poly([[36.0900, 120.3900], [36.0900, 120.4250], [36.0700, 120.4250], [36.0700, 120.3900]]);

  const data = {
    city: '青岛', riverName: '胶州湾', seaName: '黄海', hsrYear: 2000,
    stages: [[2008, '老城与港口期'], [2011, '桥隧与北岸期'], [2016, '轨道交通起步期']], stageLast: '湾区都会期',
    briefing: {
      lead: '2000 年的青岛：老城沿着胶州湾口排开，栈桥与中山路还是城市的门面；东部香港中路一带的写字楼刚刚成形，台东与李村是工人聚居的老城区。没有地铁，公交与自行车承担出行，去黄岛要坐轮渡。',
      modes: [
        ['metro', '地铁', '尚无地铁，2016 年才开通 3 号线。你将规划这座城市的第一张轨道网。'],
        ['bus', '公交与自行车', '中山路、台东与香港中路在高峰时段拥堵，公交线路沿几条干道集中。'],
        ['bridge', '海湾与轮渡', '胶州湾把黄岛与主城隔开，2000 年只能坐轮渡；2011 年才有隧道与跨海大桥。'],
        ['rail', '铁路', '青岛站是尽头式车站，列车本身不参与模拟，但车站会产生市内接驳出行，地面铁路会阻隔步行。'],
      ],
    },
    dataNote: [
      ['真实地理', 'hist', '海岸线与胶州湾、河流与水库、道路与桥梁、铁路、公园与山体、行政区（区）边界、地名与地标场地来自 OpenStreetMap（© OpenStreetMap 贡献者，ODbL），2026-10-24 取数、按 250 m 网格投影（转换见 scripts/fetch-osm.mjs 与 scripts/geo-import.mjs）；OSM 为现代数据，按 2000 年场景作历史近似。'],
      ['史实参考', 'hist', '2008 年奥帆赛、2011 年胶州湾隧道与跨海大桥通车、2016 年青岛地铁 3 号线开通。行政区按现代区划（2000 年的四方区已并入市北区），黄岛与胶南的岸线为现代形态。'],
      ['估算', 'est', '2000 年人口与就业分布、人口增长曲线、出行率、时间价值、造价、票价与运营费用（人民币）。'],
      ['模拟', 'sim', '2020 年之后的发展、居民出行选择、道路拥堵、客流与财政结果；真实的后续地铁线路不会自动出现。'],
      ['', '', '模拟结果不得作为真实青岛交通规划预测。'],
    ],
    airport: null,
    regions: [
      { id: 'laoshan', name: '崂山风景区', scenic: true, open: null, poly: poly([[36.1498, 120.4200], [36.1498, 120.4745], [36.0900, 120.4745], [36.0900, 120.4200]]) },
      { id: 'oldtown', name: '老城（市南西部·栈桥）', poly: oldtown, open: 2000, plan: 'oldmix' },
      { id: 'fushanhou', name: '浮山后·燕儿岛', poly: fushanhou, open: 2000, plan: 'newtown' },
      { id: 'shinan', name: '市南区（香港中路·湛山）', district: ['市南区'], open: 2000, plan: 'cbd' },
      { id: 'shibei', name: '市北区（台东·四方）', district: ['市北区'], open: 2000, plan: 'mix' },
      { id: 'licang', name: '李沧区（沧口·李村）', district: ['李沧区'], open: 2000, plan: 'resind' },
      { id: 'laoshanq', name: '崂山区（沙子口·高科技园）', district: ['崂山区'], open: 2000, plan: 'resind' },
    ],
    defaultRegion: { id: 'outer', name: '外围（胶州湾北部·山地）', open: 2008, plan: 'res' },
    plans: CM.DATA.plans,

    centers: [
      at(36.0620, 120.3170, { pop: 30000, jobs: 22000, r: 1.0 }),   // 中山路、栈桥
      at(36.0650, 120.3130, { pop: 12000, jobs: 16000, r: 0.8 }),   // 青岛站、港口
      at(36.0780, 120.3500, { pop: 32000, jobs: 10000, r: 1.2 }),   // 台东
      at(36.0850, 120.3700, { pop: 30000, jobs: 12000, r: 1.3 }),   // 四方、北岭
      at(36.1450, 120.4200, { pop: 26000, jobs: 8000, r: 1.3 }),    // 李村
      at(36.1200, 120.3900, { pop: 22000, jobs: 9000, r: 1.2 }),    // 沧口
      at(36.0630, 120.3830, { pop: 12000, jobs: 24000, r: 1.0 }),   // 香港中路、五四广场
      at(36.0620, 120.3620, { pop: 18000, jobs: 6000, r: 1.0 }),    // 湛山
      at(36.0800, 120.4050, { pop: 16000, jobs: 5000, r: 1.2 }),    // 浮山后
      at(36.1000, 120.4300, { pop: 12000, jobs: 6000, r: 1.4 }),    // 崂山（高科园）
      at(36.1100, 120.4400, { pop: 8000, jobs: 3000, r: 1.2 }),     // 沙子口
      at(36.1350, 120.3700, { pop: 14000, jobs: 4000, r: 1.3 }),    // 城阳南
    ],
    rural: { pop: 400, jobs: 100 },
    roadYears: {
      '香港中路': 1997, '香港东路': 2000, '山东路': 1995, '南京路': 1998, '福州路': 1999, '辽阳西路': 2002,
      '胶州湾高速公路': 1995, '青银高速公路': 2000, '沈海高速公路': 2003, '环胶州湾高速公路': 1995,
      '滨海大道': 2005, '海尔路': 2000, '黑龙江路': 2002, '重庆路': 2004, '胶州湾隧道': 2011, '胶州湾大桥': 2011,
      '银川西路': 2003, '东西快速路': 2003, '新冠高架路': 2011,
    },
    bridgeYears: {
      '胶州湾隧道': 2011, '胶州湾跨海大桥': 2011, '青岛海湾大桥': 2011, '女姑口大桥': 1995, '李村河桥': 1990,
    },
    bridgeDefaultYear: 2000,
    simRoads: [
      { n: '第二条跨海通道（模拟规划）', c: 4, y: 2032, p: [[20, 42], [40, 42]] },
    ],

    landmarks: [
      Object.assign(at(36.0632, 120.3162), { id: 'qd_zhanqiao', name: '栈桥', w: 80, d: 200, rot: 10, year: 1892, kind: 'tower', h: 20 }),
      Object.assign(at(36.0530, 120.3480), { id: 'qd_badaquan', name: '八大关', w: 900, d: 800, year: 1930, kind: 'colonial' }),
      Object.assign(at(36.0570, 120.3380), { id: 'qd_xiaoyushan', name: '小鱼山', w: 200, d: 160, year: 1985, kind: 'tower', h: 60 }),
      Object.assign(at(36.0650, 120.3180), { id: 'qd_catholic', name: '圣弥厄尔天主教堂', w: 80, d: 60, year: 1934, kind: 'church', h: 56 }),
      Object.assign(at(36.0670, 120.3230), { id: 'qd_christian', name: '基督教堂', w: 60, d: 50, year: 1910, kind: 'church', h: 39 }),
      Object.assign(at(36.0650, 120.3130), { id: 'qd_station', name: '青岛站', w: 260, d: 150, year: 1901, kind: 'rail' }),
      Object.assign(at(36.0630, 120.3830), { id: 'qd_wusi', name: '五四广场', w: 300, d: 300, year: 1997, kind: 'memorial' }),
      Object.assign(at(36.0600, 120.3900), { id: 'qd_sailing', name: '奥帆中心', w: 400, d: 350, year: 2006, kind: 'box' }),
      Object.assign(at(36.0780, 120.3520), { id: 'qd_brewery', name: '青岛啤酒厂（登州路）', w: 300, d: 240, year: 1903, kind: 'factory' }),
      Object.assign(at(36.0660, 120.3200), { id: 'qd_signal', name: '信号山', w: 150, d: 120, year: 1897, kind: 'tower', h: 98 }),
      Object.assign(at(36.0700, 120.3300), { id: 'qd_qingdaoshan', name: '青岛山炮台', w: 200, d: 180, year: 1899, kind: 'box' }),
      Object.assign(at(36.0620, 120.3620), { id: 'qd_zhanshan', name: '湛山寺', w: 160, d: 140, year: 1945, kind: 'temple' }),
      Object.assign(at(36.0580, 120.3350), { id: 'qd_ouc', name: '中国海洋大学（鱼山）', w: 500, d: 400, year: 1924, kind: 'campus' }),
      Object.assign(at(36.0700, 120.4150), { id: 'qd_qdu', name: '青岛大学', w: 900, d: 700, year: 1993, kind: 'campus' }),
      Object.assign(at(36.0870, 120.4400), { id: 'qd_shilaoren', name: '石老人', w: 100, d: 80, year: 1900, kind: 'tower', h: 17 }),
      Object.assign(at(36.1470, 120.3800), { id: 'qd_northstation', name: '青岛北站', w: 400, d: 260, year: 2014, kind: 'rail' }),
      Object.assign(at(36.1420, 120.4300), { id: 'qd_laoshan', name: '崂山（巨峰）', w: 600, d: 500, year: 1900, kind: 'temple', h: 300 }),
    ],

    facilities: [
      { id: 'qd_rail', n: '青岛站', t: 'rail', lm: 'qd_station', pax: [[2000, 2.5], [2008, 3], [2014, 2], [2030, 2.5]] },
      { id: 'qd_north', n: '青岛北站', t: 'rail', lm: 'qd_northstation', pax: [[2014, 1.5], [2020, 3], [2030, 3.5]], note: '2014 年启用，分担青岛站客流。' },
      { id: 'qd_sifang', n: '四方站', t: 'rail', at: ll(36.1080, 120.3700), pax: [[2000, 0.8], [2014, 0.3], [2030, 0.3]] },
      { id: 'qd_ouc', n: '中国海洋大学（鱼山）', t: 'uni', lm: 'qd_ouc', w: 0.022 },
      { id: 'qd_qdu', n: '青岛大学', t: 'uni', lm: 'qd_qdu', w: 0.018 },
      { id: 'qd_qtech', n: '青岛理工大学', t: 'uni', at: ll(36.0850, 120.3700), w: 0.012 },
      { id: 'qd_qau', n: '青岛农业大学', t: 'uni', at: ll(36.1420, 120.3950), w: 0.008 },
      { id: 'qd_qingyi', n: '青岛大学医学院附属医院', t: 'hosp', at: ll(36.0630, 120.3330), w: 0.05 },
      { id: 'qd_shili', n: '青岛市市立医院', t: 'hosp', at: ll(36.0680, 120.3250), w: 0.04 },
      { id: 'qd_central', n: '青岛市中心医院', t: 'hosp', at: ll(36.1150, 120.3900), w: 0.03 },
      { id: 'qd_zhongshan', n: '中山路商圈', t: 'shop', at: ll(36.0620, 120.3170), r: 1.0, w: [[2000, 0.05], [2010, 0.035]] },
      { id: 'qd_taidong', n: '台东商圈', t: 'shop', at: ll(36.0780, 120.3500), w: 0.035 },
      { id: 'qd_hk', n: '香港中路商圈', t: 'shop', at: ll(36.0630, 120.3830), r: 1.2, w: [[2000, 0.04], [2010, 0.05]] },
      { id: 'qd_licun', n: '李村商圈', t: 'shop', at: ll(36.1450, 120.4200), w: 0.02 },
      { id: 'qd_cbd', n: '香港中路商务区', t: 'cbd', at: ll(36.0640, 120.3800), r: 1.2, w: [[2000, 0.015], [2010, 0.03]] },
      { id: 'qd_port', n: '青岛港（大港）', t: 'venue', at: ll(36.0800, 120.3100), w: 0.01 },
      { id: 'qd_zhanqiao', n: '栈桥', t: 'scenic', lm: 'qd_zhanqiao', w: 0.02 },
      { id: 'qd_badaquan', n: '八大关·花石楼', t: 'scenic', lm: 'qd_badaquan', w: 0.02 },
      { id: 'qd_beach', n: '第一海水浴场', t: 'scenic', at: ll(36.0520, 120.3450), w: 0.015 },
      { id: 'qd_laoshan', n: '崂山风景区', t: 'scenic', lm: 'qd_laoshan', w: 0.025 },
      { id: 'qd_signal', n: '信号山公园', t: 'scenic', lm: 'qd_signal', w: 0.006 },
      { id: 'qd_zhongshanpark', n: '中山公园', t: 'park', at: ll(36.0600, 120.3400), r: 0.8, w: 0.012 },
      { id: 'qd_wusi', n: '五四广场', t: 'park', lm: 'qd_wusi', w: 0.015 },
      { id: 'qd_olympic', n: '奥帆中心', t: 'venue', lm: 'qd_sailing', w: [[2000, 0], [2008, 0.012]] },
    ],

    districtLabels: [['市南', ['市南区']], ['市北', ['市北区']], ['李沧', ['李沧区']], ['崂山', ['崂山区']]],

    events: [
      { y: 2000, m: 1, tag: '史实', title: '2000 年的青岛', desc: '市区约 230 万人。老城围绕栈桥与中山路，东部香港中路一带刚成形；去黄岛要坐轮渡，没有地铁，公交与自行车是主要出行方式。' },
      { y: 2001, m: 1, tag: '史实', title: '青岛港吞吐量突破亿吨', desc: '港口与外贸带动城市经济，前湾港区持续扩建。' },
      { y: 2006, m: 1, tag: '史实', title: '奥帆中心开工', desc: '北海船厂搬迁，燕儿岛一带建设奥运帆船比赛场地。' },
      { y: 2008, m: 8, tag: '史实', title: '第 29 届奥运会帆船比赛在青岛举行', desc: '城市基础设施与滨海景观大规模改造。' },
      { y: 2011, m: 6, tag: '史实', title: '胶州湾隧道与跨海大桥通车', desc: '黄岛与主城之间有了全天候通道，西海岸开始大规模开发。' },
      { y: 2016, m: 12, tag: '史实', title: '青岛地铁 3 号线全线通车', desc: '青岛进入轨道交通时代，线路沿老城与李村之间运行。' },
      { y: 2021, m: 1, tag: '模拟', title: '进入模拟发展阶段', desc: '此后人口、道路和区域变化按模拟规则推演，不代表真实历史。' },
    ],
    histTasks: [
      { id: 'qd1', appear: [2000, 3], deadline: [2010, 12], type: 'connect', reward: 130000, title: '老城到台东', desc: '连接青岛站、中山路与台东，这是老城最繁忙的走廊。', anchors: [anchor('青岛站', 36.0650, 120.3130, 3), anchor('中山路', 36.0620, 120.3170, 3), anchor('台东', 36.0780, 120.3500, 4)] },
      { id: 'qd2', appear: [2001, 1], deadline: [2012, 12], type: 'connect', reward: 140000, title: '东部与老城', desc: '香港中路一带成为新的商务中心，把它与老城、台东连起来。', anchors: [anchor('香港中路', 36.0630, 120.3830, 3), anchor('湛山', 36.0620, 120.3620, 3), anchor('中山路', 36.0620, 120.3170, 3)] },
      { id: 'qd3', appear: [2002, 1], deadline: [2015, 12], type: 'connect', reward: 150000, title: '李村与沧口', desc: '北部工人聚居区到市中心的通勤需求集中在几条干道上。', anchors: [anchor('李村', 36.1450, 120.4200, 4), anchor('沧口', 36.1200, 120.3900, 3), anchor('台东', 36.0780, 120.3500, 3)] },
      { id: 'qd4', appear: [2005, 1], deadline: [2010, 8], type: 'coverage', target: 0.3, reward: 200000, title: '奥帆赛前的覆盖', desc: '2008 年奥帆赛前，步行 15 分钟可到达车站的人口不低于 30%。' },
      { id: 'qd5', appear: [2008, 1], deadline: [2015, 12], type: 'connect', reward: 130000, title: '浮山后与崂山', desc: '东部居住区与高科园增长，连接浮山后、崂山与香港中路。', anchors: [anchor('浮山后', 36.0800, 120.4050, 4), anchor('崂山', 36.1000, 120.4300, 4), anchor('香港中路', 36.0630, 120.3830, 3)] },
      { id: 'qd6', appear: [2011, 6], deadline: [2022, 12], type: 'connect', reward: 180000, title: '胶州湾东岸', desc: '2011 年隧道与跨海大桥通车后，前湾港与团岛之间的岸线成为新的通勤方向。', anchors: [anchor('团岛', 36.0550, 120.2950, 3), anchor('前湾港', 36.0200, 120.2300, 5), anchor('青岛站', 36.0650, 120.3130, 3)] },
      { id: 'qd7', appear: [2014, 1], deadline: [2020, 12], type: 'connect', reward: 120000, title: '北站接驳', desc: '青岛北站启用后，与李村、沧口连成一线。', anchors: [anchor('青岛北站', 36.1470, 120.3800, 4), anchor('李村', 36.1450, 120.4200, 3)] },
    ],
    dynTasks: [
      { id: 'qdd1', from: [2003, 1], to: [2013, 12], type: 'connect', months: 36, reward: 45000, title: '东部通勤', desc: '香港中路就业增长，连接浮山后、湛山与香港中路。', anchors: [anchor('浮山后', 36.0800, 120.4050, 4), anchor('湛山', 36.0620, 120.3620, 3), anchor('香港中路', 36.0630, 120.3830, 3)] },
      { id: 'qdd2', from: [2006, 1], to: [2018, 12], type: 'connect', months: 36, reward: 40000, title: '老城旅游', desc: '栈桥与八大关的游客集中在夏季，需要接驳。', anchors: [anchor('栈桥', 36.0607, 120.3185, 3), anchor('八大关', 36.0530, 120.3480, 3), anchor('中山路', 36.0620, 120.3170, 3)] },
      { id: 'qdd3', from: [2012, 1], to: [2025, 12], type: 'connect', months: 42, reward: 55000, title: '前湾港', desc: '前湾港区与团岛一带的就业增长，需要与主城连通。', anchors: [anchor('前湾港', 36.0200, 120.2300, 5), anchor('团岛', 36.0550, 120.2950, 3)] },
    ],
    taskNote: '历史主题任务参考青岛 2000 年起的实际发展需求（东部新区、李村通勤、奥帆赛、跨胶州湾、北站），不要求按真实线路建设，只需满足目标描述。',
    lineColorsNice: ['#e60012', '#0072bc', '#f6a800', '#00a651', '#8e44ad', '#00a8a8', '#d35400', '#c2185b', '#5c6bc0', '#7cb342'],
    places: (G.places || []).map(function (p) { return [p[0], p[1], p[2], p[3]]; }),
  };

  const INF = [[2000, 0.004], [2004, 0.039], [2008, 0.059], [2012, 0.026], [2016, 0.02], [2020, 0.025], [2030, 0.02], [2050, 0.02]];
  (CM.MAP_LIST = CM.MAP_LIST || []).push({
    id: 'qd', name: '青岛', title: '青岛 · 2000', sub: '真实地理 · 2000 年起 · 人民币',
    desc: '从 2000 年的青岛开始：栈桥与中山路还是城市的门面，东部写字楼刚刚成形，去黄岛要坐轮渡。没有地铁，你要在老城、台东、李村与香港中路之间画出第一张轨道网。',
    facts: [['范围', '26 km × 20 km'], ['起始', '2000 年'], ['人口', '约 230 万'], ['货币', '人民币（CNY）'], ['模式', '经营挑战 / 自由建造']],
    modes: ['challenge', 'free'], kind: 'real', mapVersion: 1, scenario: 'qd-2000',
    region: '中国内地', tagline: '海湾、老城与东部新区', difficulty: 3, tags: ['无地铁开局', '跨海湾', '滨海城市'],
    intro: '2000 年的青岛还没有地铁。城市沿着胶州湾口摊开：老城挤在栈桥与中山路一带，台东与四方是工人聚居区，东部的香港中路刚刚立起写字楼，李村还是一片老城区。黄岛隔着胶州湾，只能坐轮渡。你要把这些片区连成一张网，再等 2011 年的隧道与跨海大桥。',
    features: [['wave', '胶州湾与黄海', '海湾把黄岛与主城隔开，滨海与山地限制选线'], ['building', '老城与八大关', '老城街巷与历史街区受保护，不能拆除'], ['bridge', '跨海通道', '2000 年只有轮渡，2011 年隧道与跨海大桥通车'], ['coin', '人民币经营', '造价、票价、拨款与债券按人民币计算']],
    highlights: [[2008, '奥运会帆船比赛'], [2011, '胶州湾隧道与跨海大桥'], [2016, '地铁 3 号线通车']],
    geo: G, data: data,
    econ: { devOffset: 5, money: 1 },
    cfg: {
      W: 104, H: 80, START: { y: 2000, m: 1, d: 1, minute: 360 },
      growth: Object.assign({}, CM.CFG.growth, { popCurve: [[2000, 2.3e6], [2005, 2.45e6], [2010, 2.9e6], [2015, 3.4e6], [2020, 3.9e6], [2030, 4.4e6], [2050, 4.8e6], [2300, 5.0e6]], histEnd: 2020, jobsRatio: [[2000, 0.5], [2010, 0.55], [2020, 0.57], [2040, 0.58]] }),
      money: { code: 'CNY', unit: '元', wan: '万元', yi: '亿元', sym: '¥' },
      econBase: 2000,
      cost: Object.assign({}, CM.CFG.cost, {
        trackPerKm: { underground: 42000, surface: 9000, elevated: 18000 },
        riverPerKm: { underground: 26000, surface: 20000, elevated: 20000 },   // 胶州湾：海底隧道 / 跨海桥梁附加
        hillPerKm: 14000, protectedPerKm: 6000,
        station: { underground: { S: 15000, M: 25000, L: 40000 }, elevated: { S: 8000, M: 14000, L: 22000 }, surface: { S: 5000, M: 8500, L: 13000 } },
        demolishPerCell: 38000,
        inflation: INF,
      }),
      ops: Object.assign({}, CM.CFG.ops, { carKmCost: 0.0011, stationDaily: { S: 1.8, M: 3.2, L: 5.5 }, inflation: INF }),
      fareDefault: { mode: 'flat', flat: 1 }, fareRange: { min: 0, max: 6, step: 0.5 },
      economy: Object.assign({}, CM.CFG.economy, { startFunds: 450000, grantBase: [[2000, 24000], [2005, 38000], [2010, 62000], [2015, 85000], [2020, 105000], [2050, 160000]], debtLimit: -300000, rewardScale: 1.4,
        bonds: { local: { rate: [[2000, 0.045], [2004, 0.042], [2008, 0.04], [2012, 0.035], [2015, 0.032], [2020, 0.032], [2050, 0.03]], quotaMonths: 6, capMonths: 30 }, ct: { spread: 0.02, quotaMonths: 4, capMonths: 18 }, term6: 0.004 } }),
      // 城市经济：2000 年地图范围 GDP 约 900 亿元（估算：全市约 1150 亿元，地图覆盖七区主要部分）
      macro: {
        area: '地图范围（市南、市北、李沧、崂山与城阳南、黄岛）', region: '中国内地',
        gdp0: 9000000, revRatio: [[2000, 0.14], [2010, 0.19], [2020, 0.18], [2040, 0.17]], revElastic: 1.5,
        prod: [[2000, 0.1], [2005, 0.1], [2008, 0.085], [2011, 0.075], [2015, 0.055], [2019, 0.045], [2025, 0.035], [2035, 0.022], [2050, 0.015], [2080, 0.012]],
        infl: 'cn', longRun: { infl: 0.02 }, histEnd: 2020, ref: 'cn',
        struct: { trade: 0.85, fin: 0.4, ind: 0.7, tour: 0.55, prop: 0.6 },
        events: [
          { id: 'wto2001', y: 2001, m: 12 },
          { id: 'sars2003', y: 2003, m: 2 },
          { id: 'gfc2008', y: 2008, m: 9, scale: 1.05 },
          { id: 'stim2008', y: 2008, m: 11 },
          { id: 'cnstock2015', y: 2015, m: 6 },
          { id: 'trade2018', y: 2018, m: 7 },
          { id: 'covid2020', y: 2020, m: 1 },
        ],
      },
    },
    cam: { cx: 52, cy: 40, zoom: 18 },
  });
})(window.CM);
