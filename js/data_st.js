'use strict';
// 汕头 · 1990 场景。地理来自 OpenStreetMap（geo_st.js，现代数据），本文件补充 1990 年起的区域开放、汕头内海湾与礐石、
// 道路与桥梁年份、人口就业中心、地标、历史事件、本地任务与人民币经营参数。坐标单位为格（250 m），用 ll(纬度, 经度) 换算。
// 开局没有地铁（汕头至今没有城市轨道交通），路网完全由玩家规划；1990 年内海湾上还没有桥，过海只能靠轮渡。
// 真实性：经济特区扩区、广梅汕铁路与汕头站、汕头海湾大桥、礐石大桥、2003 年区划调整、外砂机场迁建、东海岸新城填海的
// 年份为史实参考（范围为近似）；1990 年人口与就业分布、增长曲线、造价与票价为估算。
(function (CM) {
  const G = CM.GEOS && CM.GEOS.st; if (!G) return;
  const P = G.proj, ll = function (lat, lon) { return [+((lon - P.lon0) * P.kx).toFixed(2), +((P.lat0 - lat) * P.ky).toFixed(2)]; };
  const at = function (lat, lon, o) { const p = ll(lat, lon); return Object.assign({ x: p[0], y: p[1] }, o); };
  const poly = function (pts) { return pts.map(function (p) { return ll(p[0], p[1]); }); };
  const anchor = function (name, lat, lon, r) { const p = ll(lat, lon); return { name: name, x: p[0], y: p[1], r: r }; };

  // 小公园开埠区（骑楼老城，1920—30 年代形成）与龙湖特区起步区（1981 年 1.6 km²，1984 年扩至 22.6 km²）
  const oldTown = poly([[23.3530, 116.6720], [23.3530, 116.6880], [23.3660, 116.6880], [23.3660, 116.6720]]);
  const longhuSEZ = poly([[23.3680, 116.7100], [23.3680, 116.7280], [23.3820, 116.7280], [23.3820, 116.7100]]);
  const qishi = poly([[23.3300, 116.6960], [23.3300, 116.7160], [23.3480, 116.7160], [23.3480, 116.6960]]);
  const dongan = poly([[23.3400, 116.7700], [23.3400, 116.8000], [23.3600, 116.8000], [23.3600, 116.7700]]);
  const shanda = poly([[23.4080, 116.6200], [23.4080, 116.6400], [23.4250, 116.6400], [23.4250, 116.6200]]);
  const waisha = poly([[23.4150, 116.7500], [23.4150, 116.7800], [23.4420, 116.7800], [23.4420, 116.7500]]);

  const data = {
    city: '汕头', riverName: '韩江', seaName: '汕头内海湾', hsrYear: 2023,
    stages: [[1995, '铁路与跨海大桥期'], [2003, '区划调整与转型期'], [2011, '机场迁建与东海岸期']], stageLast: '省域副中心期',
    briefing: {
      lead: '1990 年的汕头：经济特区刚刚扩区，龙湖一带还是新填出来的工业地块，小公园的骑楼里挤着百货与茶楼。汕头内海湾把城市切成南北两半，海上没有一座桥，过海要靠轮渡；铁路还没有通，出远门走外砂机场或者长途汽车。',
      modes: [
        ['metro', '地铁', '汕头没有城市轨道交通。你将规划这座城市的第一张轨道网。'],
        ['bus', '公交与轮渡', '老城与龙湖之间靠公交，南北两岸之间靠广场轮渡与礐石轮渡，高峰时段码头排队。'],
        ['bridge', '汕头内海湾', '1990 年内海湾上没有桥。跨海段可以建隧道或桥梁，造价很高。'],
        ['rail', '铁路', '广梅汕铁路 1995 年通车、汕头站启用。列车本身不参与模拟，但火车站会产生市内接驳出行，地面铁路会阻隔步行。'],
      ],
    },
    dataNote: [
      ['真实地理', 'hist', '汕头内海湾与海岸线、韩江水系、道路与桥梁、铁路、公园与山体、行政区（区与街道）边界、地名与地标场地来自 OpenStreetMap（© OpenStreetMap 贡献者，ODbL），2026-10-30 取数、按 250 m 网格投影（转换见 scripts/fetch-osm.mjs 与 scripts/geo-import.mjs）；OSM 为现代数据，按 1990 年场景作历史近似，1990 年之后的填海（东海岸新城）在图上按现代岸线绘制。'],
      ['史实参考', 'hist', '1981 年汕头经济特区设立、1991 年特区扩大到全市、1995 年广梅汕铁路与汕头海湾大桥通车、1999 年礐石大桥通车、2003 年澄海与潮阳撤市设区、2011 年外砂机场停航迁建揭阳潮汕机场、2014 年起东海岸新城填海。'],
      ['估算', 'est', '1990 年人口与就业分布、人口增长曲线、出行率、时间价值、造价、票价与运营费用（人民币）。'],
      ['模拟', 'sim', '2000 年之后的发展、居民出行选择、道路拥堵、客流与财政结果；真实的后续线路与汕汕高铁不会自动出现。'],
      ['', '', '模拟结果不得作为真实汕头交通规划预测。'],
    ],
    // 外砂机场（1974 年启用，2011 年 12 月停航，民航迁至揭阳潮汕机场）：跑道 04/22，长约 2.5 km
    airport: { name: '汕头外砂机场', closeYear: 2011, buildable: 'underground', runway: [ll(23.4400, 116.7530), ll(23.4140, 116.7710)] },
    runways: [],
    regions: [
      { id: 'airport', name: '外砂机场（已停航）', poly: waisha, open: 1990, plan: 'res', note: '1974 年启用的军民合用机场，2011 年 12 月民航停航迁至揭阳潮汕机场；范围内可以地下设站与地下穿越' },
      { id: 'qishi', name: '礐石风景名胜区', scenic: true, open: null, poly: qishi, note: '内海湾南岸的山地风景区，不可开发' },
      { id: 'shanda', name: '桑浦山·汕头大学', poly: shanda, open: 1990, plan: 'campus', note: '1981 年创办的汕头大学与桑浦山北麓' },
      { id: 'dongan', name: '东海岸新城', poly: dongan, open: 2014, plan: 'newtown', note: '2014 年起围填海形成的新城，1990 年这里还是海面' },
      { id: 'oldtown', name: '小公园开埠区', poly: oldTown, open: 1990, plan: 'oldmix', note: '1920—30 年代形成的骑楼街区，人口密集、街巷狭窄' },
      { id: 'longhusez', name: '龙湖经济特区', poly: longhuSEZ, open: 1990, plan: 'ind', note: '1981 年设立的经济特区起步区，以出口加工与电子装配为主' },
      { id: 'jinping', name: '金平区（金砂·广厦·石炮台）', district: ['金平区'], open: 1990, plan: 'mix' },
      { id: 'longhu', name: '龙湖区（珠池·新津·外砂）', district: ['龙湖区'], open: 1990, plan: 'resind' },
      { id: 'haojiang', name: '濠江区（达濠·河浦·广澳）', district: ['濠江区'], open: 1990, plan: 'res' },
    ],
    defaultRegion: { id: 'outer', name: '外围（牛田洋·桑浦山·濠江南部）', open: 2000, plan: 'res' },
    plans: CM.DATA.plans,

    // 1990 年人口与就业中心（估算，人/km²；r 约为影响半径 km）
    centers: [
      at(23.3595, 116.6800, { pop: 60000, jobs: 30000, r: 1.2 }),   // 小公园、安平路
      at(23.3560, 116.6880, { pop: 50000, jobs: 22000, r: 1.1 }),   // 中山路、外马路
      at(23.3680, 116.6950, { pop: 55000, jobs: 20000, r: 1.3 }),   // 金砂、金韩
      at(23.3750, 116.7100, { pop: 40000, jobs: 18000, r: 1.3 }),   // 广厦、珠池
      at(23.3740, 116.7200, { pop: 25000, jobs: 35000, r: 1.4 }),   // 龙湖特区
      at(23.3520, 116.7000, { pop: 35000, jobs: 15000, r: 1.1 }),   // 石炮台、海滨
      at(23.3850, 116.7000, { pop: 20000, jobs: 6000, r: 1.2 }),    // 浮东、浮西
      at(23.3950, 116.7200, { pop: 18000, jobs: 7000, r: 1.2 }),    // 东墩、下蓬
      at(23.3620, 116.7350, { pop: 15000, jobs: 12000, r: 1.3 }),   // 新津、珠津
      at(23.4160, 116.6290, { pop: 12000, jobs: 10000, r: 1.5 }),   // 汕头大学、桑浦山
      at(23.4250, 116.7600, { pop: 15000, jobs: 6000, r: 1.4 }),    // 外砂、机场
      at(23.2900, 116.7120, { pop: 22000, jobs: 9000, r: 1.3 }),    // 达濠
      at(23.3380, 116.7030, { pop: 12000, jobs: 5000, r: 1.2 }),    // 礐石
      at(23.2700, 116.7000, { pop: 9000, jobs: 3000, r: 1.5 }),     // 河浦、濠江南部
    ],
    rural: { pop: 500, jobs: 120 },
    roadYears: {
      '外马路': 1920, '升平路': 1920, '安平路': 1920, '民族路': 1925, '中山路': 1928, '海滨路': 1930,
      '汕汾路': 1932, '潮汕路': 1933, '大学路': 1981, '金砂路': 1985, '长平路': 1986, '金环路': 1988,
      '嵩山路': 1990, '衡山路': 1990, '珠池路': 1990, '长江路': 1992, '庐山路': 1992, '泰山路': 1995,
      '韩江路': 1995, '黄河路': 1996, '深汕高速公路': 1996, '礐石大桥': 1999, '南滨路': 1999,
      '汕汾高速公路': 2001, '中山东路': 2003, '汕揭高速公路': 2010, '金鸿公路': 2011,
      '东海岸大道': 2014, '新津路': 2016, '中阳大道': 2020, '汕北大道': 2021,
    },
    bridgeYears: {
      '汕头海湾大桥': 1995, '礐石大桥': 1999, '牛田洋特大桥': 2023, '汕头湾海底隧道': 2022,
    },
    bridgeDefaultYear: 1990,
    simRoads: [
      { n: '汕头湾第二海底隧道（模拟规划）', c: 4, y: 2032, p: [[80, 52], [79, 59]] },
      { n: '濠江—广澳快速路（模拟规划）', c: 4, y: 2035, p: [[69, 79], [78, 92]] },
    ],

    // 历史建筑与重要地标（受保护，不得拆除）。x,y 为场地中心（格），w/d 为场地宽与深（米），h 为高度（米）
    landmarks: [
      Object.assign(at(23.36005, 116.67925), { id: 'st_zhongshan', name: '小公园中山纪念亭', w: 90, d: 80, year: 1934, kind: 'traditional' }),
      Object.assign(at(23.36250, 116.67970), { id: 'st_laomagong', name: '老妈宫', w: 60, d: 50, year: 1732, kind: 'temple' }),
      Object.assign(at(23.35900, 116.68100), { id: 'st_post', name: '汕头邮政总局大楼', w: 80, d: 60, year: 1922, kind: 'colonial' }),
      Object.assign(at(23.35960, 116.68040), { id: 'st_nansheng', name: '南生百货大楼', w: 70, d: 60, year: 1932, kind: 'colonial' }),
      Object.assign(at(23.35830, 116.67930), { id: 'st_kaibu', name: '汕头开埠文化陈列馆', w: 90, d: 70, year: 1906, kind: 'museum' }),
      Object.assign(at(23.35420, 116.68220), { id: 'st_cityhall', name: '汕头市人民政府', w: 220, d: 160, year: 1985, kind: 'hall' }),
      Object.assign(at(23.41630, 116.62910), { id: 'st_uni', name: '汕头大学', w: 1200, d: 900, year: 1981, kind: 'campus' }),
      Object.assign(at(23.37200, 116.69000), { id: 'st_med', name: '汕头大学医学院', w: 600, d: 450, year: 1983, kind: 'campus' }),
      Object.assign(at(23.37470, 116.75240), { id: 'st_station', name: '汕头站', w: 340, d: 200, year: 1995, kind: 'rail' }),
      Object.assign(at(23.33900, 116.70600), { id: 'st_qishi', name: '礐石山', w: 1000, d: 800, year: 1900, kind: 'temple', h: 128 }),
      Object.assign(at(23.34800, 116.73800), { id: 'st_expo', name: '潮汕历史文化博览中心', w: 300, d: 220, year: 2017, kind: 'museum' }),
      Object.assign(at(23.36200, 116.69000), { id: 'st_museum', name: '汕头市博物馆', w: 200, d: 160, year: 1995, kind: 'museum' }),
      Object.assign(at(23.37400, 116.71800), { id: 'st_sez', name: '龙湖工业区', w: 900, d: 700, year: 1981, kind: 'factory' }),
      Object.assign(at(23.34800, 116.72800), { id: 'st_port', name: '汕头港（珠池港区）', w: 600, d: 400, year: 1975, kind: 'box' }),
      Object.assign(at(23.37500, 116.71000), { id: 'st_tv', name: '汕头电视塔', w: 60, d: 60, year: 1988, kind: 'tvtower', h: 212 }),
      Object.assign(at(23.37000, 116.68500), { id: 'st_zhongshanpark', name: '中山公园', w: 500, d: 400, year: 1928, kind: 'park' }),
      Object.assign(at(23.36800, 116.69500), { id: 'st_jinsha', name: '金砂公园', w: 260, d: 220, year: 1987, kind: 'park' }),
      Object.assign(at(23.35500, 116.70000), { id: 'st_huaqiao', name: '华侨公园', w: 220, d: 180, year: 1993, kind: 'park' }),
      Object.assign(at(23.34000, 116.76000), { id: 'st_mayu', name: '妈屿岛', w: 700, d: 500, year: 1900, kind: 'temple' }),
      Object.assign(at(23.36300, 116.70100), { id: 'st_intl', name: '汕头国际大酒店', w: 90, d: 80, year: 1993, kind: 'skyscraper', h: 108 }),
      Object.assign(at(23.37000, 116.63000), { id: 'st_niutianyang', name: '牛田洋围垦区', w: 1400, d: 1000, year: 1969, kind: 'box' }),
      Object.assign(at(23.34500, 116.74500), { id: 'st_donghai', name: '东海岸新城', w: 900, d: 700, year: 2014, kind: 'boom' }),
      Object.assign(at(23.35200, 116.69300), { id: 'st_swatow', name: '汕头海关旧址', w: 80, d: 60, year: 1921, kind: 'colonial' }),
      Object.assign(at(23.36600, 116.71200), { id: 'st_golden', name: '汕头市第一中学', w: 300, d: 240, year: 1904, kind: 'campus' }),
    ],

    // 重要设施（v1.9，见 facility.js）：位置按真实地理（近似）、启用/停用年份为史实参考；规模均为估算。
    facilities: [
      { id: 'st_rail', n: '汕头站', t: 'rail', lm: 'st_station', pax: [[1995, 2.2], [2000, 3], [2010, 3.2], [2020, 3.6], [2030, 4.5]] },
      { id: 'st_south', n: '汕头南站（高铁）', t: 'rail', at: ll(23.2900, 116.7300), pax: [[2023, 2.5], [2030, 4]], note: '汕汕高铁车站，2023 年启用。' },
      { id: 'st_airport', n: '汕头外砂机场', t: 'air', at: ll(23.42700, 116.76200), y1: 2011, pax: [[1990, 0.9], [2000, 1.6], [2010, 2.2]], note: '1974 年启用，2011 年 12 月民航停航，迁至揭阳潮汕机场。' },
      { id: 'st_uni', n: '汕头大学', t: 'uni', lm: 'st_uni', w: 0.03 },
      { id: 'st_med', n: '汕头大学医学院', t: 'uni', lm: 'st_med', w: 0.012 },
      { id: 'st_voc', n: '汕头职业技术学院', t: 'uni', at: ll(23.4030, 116.6640), y0: 2002, w: 0.01 },
      { id: 'st_no1', n: '汕头市第一中学', t: 'uni', lm: 'st_golden', w: 0.008 },
      { id: 'st_hosp1', n: '汕头大学医学院第一附属医院', t: 'hosp', at: ll(23.37000, 116.69000), w: 0.05 },
      { id: 'st_hosp2', n: '汕头市中心医院', t: 'hosp', at: ll(23.36000, 116.68500), w: 0.04 },
      { id: 'st_hosp3', n: '汕头市第二人民医院', t: 'hosp', at: ll(23.35600, 116.67900), w: 0.028 },
      { id: 'st_shop1', n: '小公园商圈', t: 'shop', at: ll(23.36000, 116.68000), r: 0.9, w: [[1990, 0.04], [2000, 0.03], [2010, 0.022], [2020, 0.02]] },
      { id: 'st_shop2', n: '长平路商圈', t: 'shop', at: ll(23.36500, 116.70000), y0: 1995, w: [[1995, 0.015], [2010, 0.03], [2020, 0.028]] },
      { id: 'st_shop3', n: '金砂路商圈', t: 'shop', at: ll(23.36900, 116.69300), w: [[1990, 0.012], [2005, 0.02]] },
      { id: 'st_shop4', n: '汕头万象城', t: 'shop', at: ll(23.35600, 116.71800), y0: 2021, w: 0.03 },
      { id: 'st_shop5', n: '汕头苏宁广场', t: 'shop', at: ll(23.36100, 116.70300), y0: 2014, w: 0.022 },
      { id: 'st_shop6', n: '达濠渔港市场', t: 'shop', at: ll(23.29100, 116.71100), w: 0.012 },
      { id: 'st_cbd1', n: '珠池路商务区', t: 'cbd', at: ll(23.36300, 116.72500), y0: 1995, w: [[1995, 0.006], [2010, 0.018]] },
      { id: 'st_cbd2', n: '龙湖商务区', t: 'cbd', at: ll(23.37600, 116.71900), y0: 2000, w: [[2000, 0.008], [2015, 0.02]] },
      { id: 'st_cbd3', n: '东海岸新城商务区', t: 'cbd', at: ll(23.35000, 116.78500), y0: 2016, w: [[2016, 0.004], [2030, 0.016]] },
      { id: 'st_sc1', n: '小公园开埠区', t: 'scenic', lm: 'st_zhongshan', r: 0.9, w: [[1990, 0.02], [2010, 0.014], [2018, 0.026]] },
      { id: 'st_sc2', n: '礐石风景区', t: 'scenic', lm: 'st_qishi', w: 0.02 },
      { id: 'st_sc3', n: '妈屿岛', t: 'scenic', lm: 'st_mayu', w: 0.008 },
      { id: 'st_sc4', n: '潮汕历史文化博览中心', t: 'scenic', lm: 'st_expo', w: [[1990, 0], [2017, 0.012]] },
      { id: 'st_sc5', n: '汕头市博物馆', t: 'scenic', lm: 'st_museum', w: 0.006 },
      { id: 'st_sc6', n: '开埠文化陈列馆', t: 'scenic', lm: 'st_kaibu', w: 0.006 },
      { id: 'st_sc7', n: '老妈宫', t: 'scenic', lm: 'st_laomagong', w: 0.005 },
      { id: 'st_sc8', n: '汕头大学（校园）', t: 'scenic', lm: 'st_uni', w: 0.008 },
      { id: 'st_pk1', n: '中山公园', t: 'park', lm: 'st_zhongshanpark', w: 0.012 },
      { id: 'st_pk2', n: '金砂公园', t: 'park', lm: 'st_jinsha', w: 0.008 },
      { id: 'st_pk3', n: '华侨公园', t: 'park', lm: 'st_huaqiao', w: 0.008 },
      { id: 'st_pk4', n: '汕头海湾湿地公园', t: 'park', at: ll(23.34000, 116.77000), y0: 2012, w: 0.008 },
      { id: 'st_stad1', n: '汕头市体育中心', t: 'stadium', at: ll(23.35600, 116.73500), y0: 1992, w: 0.01 },
      { id: 'st_stad2', n: '汕头大学体育场', t: 'stadium', at: ll(23.41800, 116.63400), w: 0.006 },
      { id: 'st_venue1', n: '汕头国际会展中心', t: 'venue', at: ll(23.35200, 116.74000), y0: 2005, w: 0.008 },
      { id: 'st_port', n: '汕头港（珠池港区）', t: 'venue', lm: 'st_port', w: 0.02 },
      { id: 'st_park_ind', n: '汕头高新技术产业开发区', t: 'venue', at: ll(23.38000, 116.73200), y0: 1993, w: 0.012 },
      { id: 'st_bond', n: '汕头保税区', t: 'venue', at: ll(23.33000, 116.76000), y0: 1993, w: 0.008 },
    ],

    districtLabels: [
      ['金平', ['金平区']], ['龙湖', ['龙湖区']], ['濠江', ['濠江区']],
    ],

    events: [
      { y: 1990, m: 1, tag: '史实', title: '1990 年的汕头', desc: '市区约 95 万人。经济特区刚扩区，龙湖一带是新的出口加工地块；内海湾上没有桥，南北两岸靠轮渡；铁路未通，对外交通依赖外砂机场与长途汽车。' },
      { y: 1991, m: 11, tag: '史实', title: '汕头经济特区扩大到全市', desc: '特区范围由龙湖、广澳的 52.6 km² 扩大到汕头市区 234 km²，外资与加工贸易加速进入。' },
      { y: 1995, m: 12, tag: '史实', title: '广梅汕铁路通车、汕头海湾大桥建成', desc: '汕头站启用，铁路接入全国路网；内海湾上第一座跨海大桥通车，南北两岸第一次直连。' },
      { y: 1999, m: 12, tag: '史实', title: '礐石大桥通车', desc: '第二座跨海大桥建成，老城与礐石、达濠之间的通行不再只依赖轮渡。' },
      { y: 2001, m: 1, tag: '估算', title: '信用危机后的调整期', desc: '2000 年前后的走私与骗税案件重创本地信用与外贸，投资与人口增长明显放缓，这一阶段持续到 2000 年代中期。' },
      { y: 2003, m: 1, tag: '史实', title: '区划调整：澄海、潮阳撤市设区', desc: '汕头市区扩大，濠江区设立，城市空间从内海湾两岸向四周展开。' },
      { y: 2011, m: 12, tag: '史实', title: '外砂机场停航，民航迁至揭阳潮汕机场', desc: '运行 37 年的外砂机场停止民航运营，机场片区转为城市用地。' },
      { y: 2014, m: 1, tag: '史实', title: '东海岸新城围填海', desc: '内海湾出海口北侧开始大规模填海造地，形成新的城市拓展空间。' },
      { y: 2021, m: 1, tag: '模拟', title: '进入模拟发展阶段', desc: '此后人口、道路和区域变化按模拟规则推演，不代表真实历史。' },
    ],
    // 本地历史主题任务：参考汕头 1990 年起的实际发展需求，不要求复刻真实线路（奖励单位：万元）
    histTasks: [
      { id: 'st1', appear: [1990, 3], deadline: [1998, 12], type: 'connect', reward: 90000, title: '老城纵轴', desc: '连接小公园、中山路与石炮台，这是老城人口最密集的走廊。', anchors: [anchor('小公园', 23.36005, 116.67925, 3), anchor('中山路', 23.3560, 116.6880, 3), anchor('石炮台', 23.3520, 116.7000, 3)] },
      { id: 'st2', appear: [1991, 1], deadline: [2000, 12], type: 'connect', reward: 100000, title: '老城到龙湖', desc: '特区在龙湖，工人住在老城，每天挤公交上下班。把两边连起来。', anchors: [anchor('小公园', 23.36005, 116.67925, 3), anchor('金砂', 23.3680, 116.6950, 3), anchor('龙湖特区', 23.3740, 116.7200, 4)] },
      { id: 'st3', appear: [1993, 1], deadline: [2004, 12], type: 'connect', reward: 130000, title: '跨过内海湾', desc: '南北两岸之间只有轮渡，码头在高峰时段排队。用地铁把北岸与礐石连起来。', anchors: [anchor('石炮台', 23.3520, 116.7000, 3), anchor('礐石', 23.3380, 116.7030, 4)] },
      { id: 'st4', appear: [1995, 1], deadline: [2005, 12], type: 'connect', reward: 110000, title: '火车站接驳', desc: '广梅汕铁路通车后，汕头站成为对外门户，需要与老城和龙湖连通。', anchors: [anchor('汕头站', 23.37470, 116.75240, 4), anchor('珠池', 23.3620, 116.7350, 3)] },
      { id: 'st5', appear: [2000, 1], deadline: [2010, 12], type: 'coverage', target: 0.3, reward: 150000, title: '覆盖内海湾两岸', desc: '步行 15 分钟可到达车站的人口不低于 30%。' },
      { id: 'st6', appear: [2004, 1], deadline: [2016, 12], type: 'connect', reward: 120000, title: '濠江与达濠', desc: '区划调整后濠江成为市区的一部分，达濠与北岸的联系需要加强。', anchors: [anchor('礐石', 23.3380, 116.7030, 3), anchor('达濠', 23.2900, 116.7120, 4)] },
      { id: 'st7', appear: [2012, 1], deadline: [2026, 12], type: 'connect', reward: 140000, title: '东海岸与机场片区', desc: '机场迁走后片区转为城市用地，东海岸新城开始填海，城市向东生长。', anchors: [anchor('外砂机场', 23.42700, 116.76200, 4), anchor('东海岸新城', 23.34500, 116.74500, 4), anchor('珠池', 23.3620, 116.7350, 3)] },
    ],
    dynTasks: [
      { id: 'std1', from: [1992, 1], to: [2002, 12], type: 'connect', months: 36, reward: 40000, title: '特区通勤', desc: '龙湖特区的工厂招工，通勤需求集中在老城与龙湖之间。', anchors: [anchor('金砂', 23.3680, 116.6950, 3), anchor('龙湖特区', 23.3740, 116.7200, 4)] },
      { id: 'std2', from: [2000, 1], to: [2014, 12], type: 'connect', months: 42, reward: 45000, title: '濠江通勤', desc: '濠江居住人口增加，跨海通勤压力集中在两座大桥上。', anchors: [anchor('礐石', 23.3380, 116.7030, 3), anchor('达濠', 23.2900, 116.7120, 4), anchor('石炮台', 23.3520, 116.7000, 3)] },
      { id: 'std3', from: [2012, 1], to: [2028, 12], type: 'connect', months: 42, reward: 50000, title: '东海岸接驳', desc: '东海岸新城与珠池、新津之间需要新的通道。', anchors: [anchor('东海岸新城', 23.34500, 116.74500, 4), anchor('珠池', 23.3620, 116.7350, 3)] },
    ],
    taskNote: '历史主题任务参考汕头 1990 年起的实际发展需求（特区扩区、跨内海湾、广梅汕铁路、区划调整、机场迁建与东海岸新城），不要求按真实线路建设，只需满足目标描述。',
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
    throw new Error('汕头：阶段目标锚点未找到 ' + name);
  };

  // 历史发展阶段（v2.2，eras.js）：summary 中「史实」可查证，「估算」为模型设定的发展倾向；grow 只改变人口与岗位增长的去向
  // （总量仍按人口曲线），relocate 为每月疏解比例，corridors 为片区间通勤与购物去向倍数，demand 为出行强度与距离倍数，
  // goals 为阶段目标（本城任务，奖励单位：万元）
  data.eras = [
    { id: 'st-e1', from: 1990, name: '特区起步与轮渡时代', tag: '史实',
      summary: '史实：1990 年经济特区刚扩区，内海湾上没有桥，铁路未通。估算：人口与就业集中在小公园老城与金砂一带，龙湖是新的出口加工区，南北两岸之间完全依赖轮渡，跨海通勤几乎不存在。',
      grow: { pop: { oldtown: 0.95, jinping: 1.1, longhusez: 1.5, longhu: 1.2, haojiang: 1.0 }, jobs: { longhusez: 1.8, oldtown: 1.1, jinping: 1.05 } },
      relocate: { pop: { oldtown: 0.0003 } },
      demand: { decayHW: 0.95 },
      corridors: [{ a: 'jinping', b: 'oldtown', f: 1.15 }, { a: 'longhu', b: 'longhusez', f: 1.1 }],
      goals: [{ id: 'st-g1', from: 1991, type: 'connect', months: 72, reward: 80000, title: '老城与龙湖', desc: '特区在龙湖，工人住在老城。公交已经挤不下，用地铁把金砂与龙湖特区连起来。', anchors: [site('金砂公园', 3), site('龙湖工业区', 4)] }] },
    { id: 'st-e2', from: 1995, name: '铁路与跨海大桥', tag: '史实',
      summary: '史实：1995 年 12 月广梅汕铁路通车、汕头站启用，汕头海湾大桥建成；1999 年礐石大桥通车。估算：跨海通道打开后南岸开始开发，龙湖的加工工业进入最快扩张期，老城人口开始向外疏解。',
      grow: { pop: { longhusez: 1.4, longhu: 1.35, jinping: 1.1, oldtown: 0.85, haojiang: 1.25 }, jobs: { longhusez: 1.5, longhu: 1.3, oldtown: 1.0 } },
      relocate: { pop: { oldtown: 0.0006 } },
      demand: { decayHW: 1.05, hub: 1.1 },
      corridors: [{ a: 'jinping', b: 'longhusez', f: 1.2 }, { a: 'haojiang', b: 'jinping', f: 1.15 }],
      goals: [{ id: 'st-g2', from: 1996, type: 'connect', months: 60, reward: 100000, title: '跨过内海湾', desc: '海湾大桥通车后南岸开始开发，但桥上只有汽车。用地铁把北岸的石炮台与礐石连起来。', anchors: [site('汕头港（珠池港区）', 3), site('礐石山', 4)] }] },
    { id: 'st-e3', from: 2003, name: '区划调整与转型', tag: '史实',
      summary: '史实：2000 年前后的走私与骗税案件重创本地信用，投资与外贸增速大幅回落；2003 年澄海、潮阳撤市设区，濠江区设立。估算：增长重心从加工出口转向内需与港口物流，老城持续空心化，濠江与龙湖东部成为新的居住选择。',
      grow: { pop: { haojiang: 1.4, longhu: 1.3, longhusez: 1.1, jinping: 1.0, oldtown: 0.8 }, jobs: { longhusez: 1.15, longhu: 1.25, jinping: 1.0 } },
      relocate: { pop: { oldtown: 0.0007 } },
      demand: { decayHW: 1.1 },
      corridors: [{ a: 'haojiang', b: 'jinping', f: 1.2 }, { a: 'longhu', b: 'longhusez', f: 1.1 }],
      goals: [{ id: 'st-g3', from: 2004, type: 'connect', months: 60, reward: 110000, title: '濠江与达濠', desc: '濠江设区后人口增长最快，达濠与北岸之间只有两座大桥。用地铁把礐石与达濠连起来。', anchors: [site('礐石山', 3), site('达濠渔港市场', 4)] }] },
    { id: 'st-e4', from: 2011, name: '机场迁建与东海岸', tag: '史实',
      summary: '史实：2011 年 12 月外砂机场停航，民航迁至揭阳潮汕机场；2014 年起东海岸新城围填海。估算：城市向东生长，机场片区转为建设用地，龙湖与新津一带成为新的就业中心，跨海通勤仍集中在两座桥上。',
      grow: { pop: { dongan: 1.9, longhu: 1.3, haojiang: 1.25, jinping: 0.95, oldtown: 0.85 }, jobs: { longhu: 1.35, dongan: 1.8, longhusez: 1.0 } },
      demand: { decayHW: 1.1, hub: 1.05 },
      corridors: [{ a: 'dongan', b: 'longhu', f: 1.25 }, { a: 'haojiang', b: 'longhu', f: 1.1 }],
      goals: [{ id: 'st-g4', from: 2012, type: 'connect', months: 60, reward: 130000, title: '东海岸新城', desc: '填海形成的新城开始入住，与珠池、新津之间还没有轨道。用地铁把东海岸新城与珠池连起来。', anchors: [site('东海岸新城', 4), site('汕头港（珠池港区）', 3)] }] },
    { id: 'st-e5', from: 2021, name: '模拟未来', tag: '模拟',
      summary: '模拟：此后的发展按模型推演，不代表真实历史。估算：东海岸新城与濠江继续成长，老城靠文旅与开埠区更新维持人气，跨海通道成为全网最拥挤的一段。',
      grow: { pop: { dongan: 1.5, haojiang: 1.2, longhu: 1.15, oldtown: 0.9 }, jobs: { dongan: 1.5, longhu: 1.2, jinping: 1.05 } },
      demand: { lz: 1.1, decayHW: 1.1 }, corridors: [{ a: 'dongan', b: 'longhu', f: 1.1 }, { a: 'haojiang', b: 'jinping', f: 1.05 }] },
  ];

  const INF = [[1990, 0.031], [1994, 0.24], [1996, 0.083], [1998, -0.008], [2000, 0.014], [2004, 0.039], [2008, 0.059], [2012, 0.026], [2016, 0.02], [2020, 0.025], [2030, 0.02], [2050, 0.02]];
  (CM.MAP_LIST = CM.MAP_LIST || []).push({
    id: 'st', name: '汕头', title: '汕头 · 1990', sub: '真实地理 · 1990 年起 · 人民币',
    desc: '从 1990 年的汕头开始：经济特区刚刚扩区，小公园的骑楼里挤着百货与茶楼，内海湾上没有一座桥，过海要靠轮渡。铁路五年后才通。你要在这个被海湾切成两半的城市里，画出第一张轨道网。',
    facts: [['范围', '33 km × 24 km'], ['起始', '1990 年'], ['人口', '约 95 万'], ['货币', '人民币（CNY）'], ['模式', '经营挑战 / 自由建造']],
    modes: ['challenge', 'free'], kind: 'real', mapVersion: 1, scenario: 'st-1990',
    region: '中国内地', tagline: '内海湾两岸，从轮渡到跨海', difficulty: 3, tags: ['无地铁开局', '跨海湾', '经济特区'],
    intro: '1990 年的汕头还没有一公里轨道，内海湾上也没有一座桥。老城在西北，特区在东边的龙湖，中间隔着海湾与大片还没填出来的滩涂；南岸的礐石与达濠要坐轮渡才能到。五年后铁路与海湾大桥才会来。你要先用一条线串起老城与龙湖，再想办法跨过内海湾。',
    features: [['map', '汕头内海湾', '海湾把城市分成南北两岸，1990 年没有任何跨海通道'], ['bridge', '跨海段', '跨海可以建隧道或桥梁，造价与工期都远高于陆地'], ['building', '经济特区与东海岸', '龙湖特区、机场片区与填海新城按年份出现'], ['coin', '人民币经营', '造价、票价、拨款与债券按人民币计算']],
    highlights: [[1991, '特区扩大到全市'], [1995, '广梅汕铁路与海湾大桥'], [1999, '礐石大桥通车'], [2011, '外砂机场停航'], [2014, '东海岸新城填海']],
    geo: G, data: data,
    econ: { devOffset: -2, money: 1 },   // 出行选择参数：汕头 1990 年约对应广州样本 1988 年的发展阶段
    cfg: {
      W: 120, H: 96, START: { y: 1990, m: 1, d: 1, minute: 360 },
      growth: Object.assign({}, CM.CFG.growth, { popCurve: [[1990, 9.5e5], [1995, 1.15e6], [2000, 1.3e6], [2005, 1.4e6], [2010, 1.55e6], [2015, 1.68e6], [2020, 1.78e6], [2030, 1.95e6], [2050, 2.1e6], [2300, 2.15e6]], histEnd: 2020, jobsRatio: [[1990, 0.48], [2000, 0.5], [2010, 0.52], [2020, 0.54], [2040, 0.55]] }),
      money: { code: 'CNY', unit: '元', wan: '万元', yi: '亿元', sym: '¥' },
      econBase: 1990,
      cost: Object.assign({}, CM.CFG.cost, {
        trackPerKm: { underground: 24000, surface: 5000, elevated: 10500 },
        riverPerKm: { underground: 28000, surface: 19000, elevated: 19000 },   // 汕头内海湾：海底隧道 / 跨海桥梁附加
        hillPerKm: 10000, protectedPerKm: 5000,
        station: { underground: { S: 11000, M: 18000, L: 30000 }, elevated: { S: 6500, M: 10000, L: 15000 }, surface: { S: 3800, M: 6500, L: 9500 } },
        demolishPerCell: 26000,
        inflation: INF,
      }),
      ops: Object.assign({}, CM.CFG.ops, { carKmCost: 0.0009, stationDaily: { S: 1.4, M: 2.4, L: 4.2 }, inflation: INF }),
      fareDefault: { mode: 'flat', flat: 0.5 }, fareRange: { min: 0, max: 5, step: 0.5 },
      economy: Object.assign({}, CM.CFG.economy, { startFunds: 320000, grantBase: [[1990, 16000], [1995, 28000], [2000, 42000], [2005, 70000], [2010, 110000], [2015, 150000], [2020, 180000], [2050, 260000]], debtLimit: -220000, rewardScale: 1.3,
        bonds: { local: { rate: [[1990, 0.09], [1994, 0.11], [1997, 0.07], [2002, 0.04], [2008, 0.045], [2012, 0.038], [2015, 0.034], [2020, 0.033], [2050, 0.03]], quotaMonths: 6, capMonths: 30 }, ct: { spread: 0.02, quotaMonths: 4, capMonths: 18 }, term6: 0.004 } }),
      // 城市经济：1990 年地图范围 GDP 约 45 亿元（估算：汕头全市约 78 亿元，地图覆盖金平、龙湖与濠江主要部分）
      macro: {
        area: '地图范围（金平、龙湖、濠江与礐石）', region: '中国内地',
        gdp0: 450000, revRatio: [[1990, 0.24], [1994, 0.14], [2000, 0.15], [2010, 0.17], [2020, 0.16], [2040, 0.15]], revElastic: 1.5,
        prod: [[1990, 0.12], [1995, 0.17], [1999, 0.1], [2001, 0.045], [2005, 0.07], [2010, 0.075], [2014, 0.065], [2018, 0.055], [2022, 0.045], [2030, 0.032], [2050, 0.02], [2080, 0.015]],
        infl: 'cn', longRun: { infl: 0.02 }, histEnd: 2020, ref: 'cn',
        struct: { trade: 0.6, fin: 0.3, ind: 0.7, tour: 0.45, prop: 0.55 },
        events: [
          { id: 'wto2001', y: 2001, m: 12 },
          { id: 'sars2003', y: 2003, m: 2 },
          { id: 'gfc2008', y: 2008, m: 9, scale: 0.95 },
          { id: 'stim2008', y: 2008, m: 11 },
          { id: 'cnstock2015', y: 2015, m: 6 },
          { id: 'trade2018', y: 2018, m: 7 },
          { id: 'covid2020', y: 2020, m: 1 },
        ],
      },
    },
    cam: { cx: 60, cy: 48, zoom: 18 },
  });
})(window.CM);
