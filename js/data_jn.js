'use strict';
// 济南 · 2000 场景。地理来自 OpenStreetMap（geo_jn.js，现代数据），本文件补充 2000 年起的区域开放、泉城与千佛山、
// 道路与桥梁年份、人口就业中心、地标、历史事件、本地任务与人民币经营参数。坐标单位为格（250 m），用 ll(纬度, 经度) 换算。
// 开局没有地铁（济南地铁 2019 年才开通 1 号线），路网完全由玩家规划。
// 真实性：泉城路改造、经十路拓宽、全运会、京沪高铁济南西站、地铁开通的年份为史实参考（范围为近似）；
// 2000 年人口与就业分布、增长曲线、造价与票价为估算。
(function (CM) {
  const G = CM.GEOS && CM.GEOS.jn; if (!G) return;
  const P = G.proj, ll = function (lat, lon) { return [+((lon - P.lon0) * P.kx).toFixed(2), +((P.lat0 - lat) * P.ky).toFixed(2)]; };
  const at = function (lat, lon, o) { const p = ll(lat, lon); return Object.assign({ x: p[0], y: p[1] }, o); };
  const poly = function (pts) { return pts.map(function (p) { return ll(p[0], p[1]); }); };
  const anchor = function (name, lat, lon, r) { const p = ll(lat, lon); return { name: name, x: p[0], y: p[1], r: r }; };

  // 泉城老城（明府城）与千佛山、华山（华不注）范围（近似）
  const oldCity = poly([[36.6790, 116.9990], [36.6790, 117.0330], [36.6610, 117.0330], [36.6610, 116.9990]]);
  const qianfo = poly([[36.6480, 117.0180], [36.6480, 117.0480], [36.6250, 117.0480], [36.6250, 117.0180]]);
  const huashan = poly([[36.7350, 117.0600], [36.7350, 117.0900], [36.7150, 117.0900], [36.7150, 117.0600]]);

  const data = {
    city: '济南', riverName: '黄河', seaName: '黄河', hsrYear: 2011,
    stages: [[2005, '泉城改造期'], [2010, '全运会与高铁期'], [2019, '轨道交通起步期']], stageLast: '省会都会期',
    briefing: {
      lead: '2000 年的济南：泉水从老城的街巷里涌出，泉城路还没改成步行街，经十路是一条会堵车的城市干道。黄河在城北 6 公里外，千佛山把城市压在南山北水之间；没有地铁，公交与自行车是主要出行方式。',
      modes: [
        ['metro', '地铁', '尚无地铁，2019 年才有一条线路。你将规划这座城市的第一张轨道网。'],
        ['bus', '公交与自行车', '泉城路、经十路沿线在高峰时段拥堵，公交承担大部分出行。'],
        ['bridge', '黄河', '城北的黄河是天然屏障，只有泺口等少数几处过河通道。'],
        ['rail', '铁路', '济南站与济南东站承担对外铁路交通。列车本身不参与模拟，但火车站会产生市内接驳出行，地面铁路会阻隔步行。'],
      ],
    },
    dataNote: [
      ['真实地理', 'hist', '黄河、小清河、大明湖与泉池、道路与桥梁、铁路、公园与山地、行政区（区与街道）边界、地名与地标场地来自 OpenStreetMap（© OpenStreetMap 贡献者，ODbL），2026-10-24 取数、按 250 m 网格投影（转换见 scripts/fetch-osm.mjs 与 scripts/geo-import.mjs）；OSM 为现代数据，按 2000 年场景作历史近似。'],
      ['史实参考', 'hist', '2002 年泉城路改造、2003 年经十路拓宽、2009 年第十一届全运会、2011 年京沪高铁济南西站启用、2019 年济南地铁 1 号线开通。'],
      ['估算', 'est', '2000 年人口与就业分布、人口增长曲线、出行率、时间价值、造价、票价与运营费用（人民币）。'],
      ['模拟', 'sim', '2020 年之后的发展、居民出行选择、道路拥堵、客流与财政结果；真实的后续地铁线路不会自动出现。'],
      ['', '', '模拟结果不得作为真实济南交通规划预测。'],
    ],
    airport: null,
    regions: [
      { id: 'qianfoshan', name: '千佛山风景名胜区', scenic: true, open: null, poly: qianfo },
      { id: 'huashan', name: '华山（华不注）', scenic: true, open: null, poly: huashan },
      { id: 'daminghu', name: '大明湖', park: true, open: 2000, plan: 'res', poly: poly([[36.6795, 117.0145], [36.6795, 117.0285], [36.6725, 117.0285], [36.6725, 117.0145]]), note: '大明湖及其周边公园，保留为绿地' },
      { id: 'oldcity', name: '泉城老城（明府城）', poly: oldCity, open: 2000, plan: 'oldmix' },
      { id: 'gaoxin', name: '高新区（东部）', poly: poly([[36.6900, 117.0800], [36.6900, 117.1150], [36.6550, 117.1150], [36.6550, 117.0800]]), open: 2005, plan: 'resind', note: '2000 年代起成片开发的高新区' },
      { id: 'lixia', name: '历下区（东城·甸柳·燕山）', district: ['历下区'], open: 2000, plan: 'mix' },
      { id: 'shizhong', name: '市中区（大观园·英雄山）', district: ['市中区'], open: 2000, plan: 'mix' },
      { id: 'huaiyin', name: '槐荫区（西市场·段店）', district: ['槐荫区'], open: 2000, plan: 'res' },
      { id: 'tianqiao', name: '天桥区（北园·泺口）', district: ['天桥区'], open: 2000, plan: 'resind' },
      { id: 'licheng', name: '历城区（洪家楼·东部）', district: ['历城区'], open: 2000, plan: 'resind' },
    ],
    defaultRegion: { id: 'outer', name: '外围（黄河以北·南部山区）', open: 2008, plan: 'res' },
    plans: CM.DATA.plans,

    // 2000 年人口与就业中心（估算，人/km²；r 约为影响半径 km）
    centers: [
      at(36.6680, 117.0180, { pop: 32000, jobs: 22000, r: 1.2 }),   // 泉城路、老城
      at(36.6620, 116.9990, { pop: 36000, jobs: 22000, r: 1.1 }),   // 大观园、经四路
      at(36.6730, 116.9900, { pop: 28000, jobs: 28000, r: 1.0 }),   // 济南站
      at(36.6800, 117.0600, { pop: 24000, jobs: 19000, r: 1.2 }),    // 洪家楼
      at(36.6650, 117.0450, { pop: 26000, jobs: 16000, r: 1.2 }),   // 甸柳、燕山
      at(36.6500, 117.0100, { pop: 22000, jobs: 8000, r: 1.1 }),    // 英雄山、七里山
      at(36.6700, 117.0900, { pop: 12000, jobs: 9000, r: 1.4 }),    // 高新区（东部）
      at(36.6350, 117.0300, { pop: 12000, jobs: 4000, r: 1.2 }),    // 千佛山脚下
      at(36.6900, 116.9700, { pop: 18000, jobs: 5000, r: 1.2 }),    // 段店、西市场
      at(36.7000, 117.0100, { pop: 16000, jobs: 5000, r: 1.2 }),    // 北园
      at(36.7200, 116.9900, { pop: 12000, jobs: 6000, r: 1.3 }),    // 泺口、黄河渡口
      at(36.6850, 117.0300, { pop: 18000, jobs: 4000, r: 1.1 }),    // 历山路、解放路
      at(36.6560, 116.9500, { pop: 14000, jobs: 4000, r: 1.3 }),    // 王官庄
      at(36.6100, 117.0200, { pop: 9000, jobs: 3000, r: 1.4 }),     // 南部（二环南）
    ],
    rural: { pop: 500, jobs: 120 },
    roadYears: {
      '经十路': 2000, '泉城路': 2000, '经十东路': 2003, '二环东路': 2002, '二环西路': 2005, '二环南路': 2007,
      '顺河高架路': 1998, '北园大街': 2000, '奥体西路': 2009, '奥体中路': 2009, '旅游路': 2004, '工业南路': 2000,
      '绕城高速公路': 1999, '济青高速公路': 1993, '京福高速公路': 1999, '济南北绕城': 2002, 'G309': 2000,
      '小清河北路': 2008, '凤凰路': 2010, '世纪大道': 2012,
    },
    bridgeYears: {
      '泺口黄河铁路大桥': 1912, '泺口浮桥': 1987, '济南黄河大桥': 1982, '京台高速黄河大桥': 1999,
      '建邦黄河大桥': 2010, '济阳黄河大桥': 2008, '石济客专黄河大桥': 2017, '齐鲁黄河大桥': 2022,
    },
    bridgeDefaultYear: 2000,
    simRoads: [
      { n: '济泺路隧道（模拟规划）', c: 4, y: 2028, p: [[37, 33], [37, 22]] },
    ],

    // 历史建筑与重要地标（受保护，不得拆除）。x,y 为场地中心（格），w/d 为场地宽与深（米），h 为高度（米）
    landmarks: [
      Object.assign(at(36.6619, 117.0122), { id: 'jn_baotu', name: '趵突泉', w: 220, d: 180, year: 1900, kind: 'traditional' }),
      Object.assign(at(36.6728, 117.0230), { id: 'jn_daminghu', name: '大明湖', w: 900, d: 700, year: 1900, kind: 'campus' }),
      Object.assign(at(36.6350, 117.0300), { id: 'jn_qianfo', name: '千佛山', w: 1000, d: 900, year: 581, kind: 'temple' }),
      Object.assign(at(36.6620, 117.0200), { id: 'jn_quancheng', name: '泉城广场', w: 400, d: 300, year: 1999, kind: 'hall' }),
      Object.assign(at(36.67014, 116.98508), { id: 'jn_station', name: '济南站', w: 320, d: 180, year: 1904, kind: 'rail' }),
      Object.assign(at(36.6680, 117.0180), { id: 'jn_zhenzhu', name: '珍珠泉', w: 120, d: 90, year: 1900, kind: 'traditional' }),
      Object.assign(at(36.6650, 117.0100), { id: 'jn_wulong', name: '五龙潭', w: 140, d: 110, year: 1900, kind: 'traditional' }),
      Object.assign(at(36.6650, 117.0280), { id: 'jn_heihu', name: '黑虎泉', w: 100, d: 80, year: 1900, kind: 'traditional' }),
      Object.assign(at(36.6450, 117.0100), { id: 'jn_yingxiong', name: '英雄山烈士陵园', w: 400, d: 300, year: 1949, kind: 'memorial' }),
      Object.assign(at(36.6800, 117.0600), { id: 'jn_hongjialou', name: '洪家楼天主教堂', w: 90, d: 70, year: 1905, kind: 'church', h: 60 }),
      Object.assign(at(36.67565, 117.05405), { id: 'jn_sdu', name: '山东大学（中心校区）', w: 1200, d: 900, year: 1901, kind: 'campus' }),
      Object.assign(at(36.65234, 117.03585), { id: 'jn_sdnu', name: '山东师范大学', w: 900, d: 700, year: 1950, kind: 'campus' }),
      Object.assign(at(36.6560, 116.9600), { id: 'jn_jinanuni', name: '济南大学（西校区）', w: 800, d: 600, year: 1948, kind: 'campus' }),
      Object.assign(at(36.6500, 117.0050), { id: 'jn_spcenter', name: '山东省体育中心', w: 320, d: 300, year: 1988, kind: 'stadium' }),
      Object.assign(at(36.65995, 116.96980), { id: 'jn_xishichang', name: '西市场', w: 260, d: 200, year: 1930, kind: 'box' }),
      Object.assign(at(36.7325, 117.0735), { id: 'jn_huashan', name: '华不注', w: 200, d: 160, year: 1900, kind: 'tower', h: 197 }),
      Object.assign(at(36.65644, 117.11409), { id: 'jn_olympic', name: '济南奥体中心', w: 500, d: 400, year: 2009, kind: 'stadium', h: 60 }),
      Object.assign(at(36.6700, 116.8900), { id: 'jn_weststation', name: '济南西站', w: 400, d: 260, year: 2011, kind: 'rail' }),
      Object.assign(at(36.65203, 117.01190), { id: 'jn_sdutq', name: '山东大学（趵突泉校区）', w: 600, d: 450, year: 1901, kind: 'campus' }),
      Object.assign(at(36.68756, 117.06227), { id: 'jn_sduhl', name: '山东大学（洪楼校区）', w: 500, d: 400, year: 1901, kind: 'campus' }),
      Object.assign(at(36.66269, 117.02763), { id: 'jn_jiefangge', name: '解放阁', w: 80, d: 60, year: 1988, kind: 'tower', h: 30 }),
      Object.assign(at(36.674873, 117.026346), { id: 'jn_chaoran', name: '超然楼', w: 80, d: 60, year: 2008, kind: 'tower', h: 50 }),
      Object.assign(at(36.65978, 117.04675), { id: 'jn_qingqi', name: '济南轻骑公司', w: 400, d: 300, year: 1956, kind: 'factory' }),
      Object.assign(at(36.63974, 116.94882), { id: 'jn_jc2', name: '济南第二机床厂', w: 500, d: 400, year: 1937, kind: 'factory' }),
      Object.assign(at(36.65875, 116.95367), { id: 'jn_bfjc', name: '济南北方机车厂', w: 500, d: 400, year: 1910, kind: 'factory' }),
    ],

    // 重要设施（v1.9，见 facility.js）：位置按真实地理（近似）、启用/停用年份为史实参考；规模均为估算。
    // 遥墙机场在地图范围外，不模拟。
    facilities: [
      { id: 'jn_rail', n: '济南站', t: 'rail', lm: 'jn_station', pax: [[2000, 4], [2005, 5], [2011, 3.8], [2015, 3.5], [2030, 3]] },
      { id: 'jn_east', n: '济南东站', t: 'rail', at: ll(36.74961, 117.15305), pax: [[2018, 3.5], [2025, 5], [2030, 6]], note: '2018 年 12 月 26 日启用（石济客专方向高铁站）。' },
      { id: 'jn_west', n: '济南西站', t: 'rail', lm: 'jn_weststation', pax: [[2011, 4], [2015, 6], [2030, 6.5]], note: '2011 年京沪高铁通车后启用。' },
      { id: 'jn_sdu', n: '山东大学（中心校区）', t: 'uni', lm: 'jn_sdu', w: 0.03 },
      { id: 'jn_sdnu', n: '山东师范大学', t: 'uni', lm: 'jn_sdnu', w: 0.016 },
      { id: 'jn_sduw', n: '山东大学（趵突泉校区·原山医）', t: 'uni', lm: 'jn_sdutq', w: 0.012 },
      { id: 'jn_ujn', n: '济南大学', t: 'uni', lm: 'jn_jinanuni', w: 0.01 },
      { id: 'jn_sdufe', n: '山东财经大学（燕山）', t: 'uni', at: ll(36.64477, 117.06714), w: 0.008 },
      { id: 'jn_qilu', n: '山东大学齐鲁医院', t: 'hosp', at: ll(36.65611, 117.01195), w: 0.05 },
      { id: 'jn_sph', n: '山东省立医院', t: 'hosp', at: ll(36.65665, 116.97770), w: 0.045 },
      { id: 'jn_centralhosp', n: '济南市中心医院', t: 'hosp', at: ll(36.66692, 117.04199), w: 0.03 },
      { id: 'jn_qianfohosp', n: '山东省千佛山医院', t: 'hosp', at: ll(36.6500, 117.0430), w: 0.028 },
      { id: 'jn_quanchengshop', n: '泉城路商圈', t: 'shop', at: ll(36.6680, 117.0180), r: 1.0, w: [[2000, 0.05], [2010, 0.055]] },
      { id: 'jn_daguanyuan', n: '大观园商圈', t: 'shop', at: ll(36.660458, 116.990501), w: 0.015 },
      { id: 'jn_luokou', n: '泺口服装城', t: 'shop', at: ll(36.7150, 116.9950), w: 0.02 },
      { id: 'jn_hongjialou', n: '洪家楼商圈', t: 'shop', at: ll(36.6800, 117.0600), w: 0.015 },
      { id: 'jn_cbd', n: '泉城路商务区', t: 'cbd', at: ll(36.6670, 117.0200), w: [[2000, 0.02], [2010, 0.025]] },
      { id: 'jn_gaoxin', n: '高新区商务区', t: 'cbd', at: ll(36.6700, 117.0900), y0: 2005, w: [[2005, 0.004], [2015, 0.02]] },
      { id: 'jn_baotu', n: '趵突泉公园', t: 'scenic', lm: 'jn_baotu', w: 0.025 },
      { id: 'jn_qianfo', n: '千佛山', t: 'scenic', lm: 'jn_qianfo', w: 0.02 },
      { id: 'jn_daminghu', n: '大明湖', t: 'park', lm: 'jn_daminghu', w: 0.025 },
      { id: 'jn_heihu', n: '黑虎泉·护城河', t: 'scenic', lm: 'jn_heihu', w: 0.01 },
      { id: 'jn_wulong', n: '五龙潭', t: 'scenic', lm: 'jn_wulong', w: 0.008 },
      { id: 'jn_zhenzhu', n: '珍珠泉', t: 'scenic', lm: 'jn_zhenzhu', w: 0.005 },
      { id: 'jn_quanchengpark', n: '泉城公园', t: 'park', at: ll(36.64473, 117.01444), r: 0.8, w: 0.008 },
      { id: 'jn_yingxiong', n: '英雄山', t: 'park', lm: 'jn_yingxiong', w: 0.008 },
      { id: 'jn_forestpark', n: '济南森林公园', t: 'park', at: ll(36.6760, 116.9450), r: 0.8, w: 0.006 },
      { id: 'jn_spcenter', n: '山东省体育中心', t: 'stadium', lm: 'jn_spcenter', w: 0.01 },
      { id: 'jn_olympic', n: '济南奥体中心', t: 'stadium', lm: 'jn_olympic', w: [[2000, 0], [2009, 0.012]] },
      { id: 'jn_shungeng', n: '舜耕国际会展中心', t: 'venue', at: ll(36.6440, 117.0280), y0: 2002, w: 0.006 },
      { id: 'jn_dmhstation', n: '大明湖火车站', t: 'rail', at: ll(36.68067, 117.02208), pax: [[2000, 0.6], [2010, 0.9], [2030, 0.8]] },
      { id: 'jn_zoo', n: '济南动物园', t: 'park', at: ll(36.70098, 116.98148), r: 0.8, w: 0.01 },
      { id: 'jn_jiefangge', n: '解放阁', t: 'scenic', lm: 'jn_jiefangge', w: 0.008 },
      { id: 'jn_chaoran', n: '超然楼', t: 'scenic', lm: 'jn_chaoran', w: 0.006 },
      { id: 'jn_dmhnn', n: '大明湖北门', t: 'scenic', at: ll(36.67775, 117.01924), r: 0.5, w: 0.005 },
      { id: 'jn_baihua', n: '百花洲景区', t: 'scenic', at: ll(36.670871, 117.018664), r: 0.5, w: 0.006 },
      { id: 'jn_arts', n: '山东省艺术学院', t: 'uni', at: ll(36.65578, 117.04036), w: 0.01 },
      { id: 'jn_lanxiang', n: '山东蓝翔学校', t: 'uni', at: ll(36.71556, 116.94637), w: 0.008 },
      { id: 'jn_xingzheng', n: '山东行政学院', t: 'uni', at: ll(36.64597, 117.05937), w: 0.006 },
      { id: 'jn_sduhl', n: '山东大学（洪楼校区）', t: 'uni', lm: 'jn_sduhl', w: 0.012 },
      { id: 'jn_daxinzhuang', n: '大辛庄考古遗址公园', t: 'park', at: ll(36.71009, 117.09919), r: 0.8, y0: 2020, w: 0.004 },
      { id: 'jn_expocenter', n: '济南国际会展中心', t: 'venue', at: ll(36.68559, 117.11718), y0: 2005, w: 0.008 },
      { id: 'jn_softwarepark', n: '齐鲁软件园', t: 'venue', at: ll(36.67369, 117.12640), y0: 2001, w: 0.006 },
      { id: 'jn_dianliu', n: '甸柳购物城', t: 'shop', at: ll(36.661556, 117.065812), w: 0.015 },
      { id: 'jn_wanxiang', n: '万象城', t: 'shop', at: ll(36.65878, 117.09366), w: 0.02 },
    ],

    districtLabels: [
      ['历下', ['历下区']], ['市中', ['市中区']], ['槐荫', ['槐荫区']], ['天桥', ['天桥区']], ['历城', ['历城区']],
    ],

    events: [
      { y: 2000, m: 1, tag: '史实', title: '2000 年的济南', desc: '市区约 320 万人。泉水从老城街巷涌出，泉城路仍是车行道路，经十路承担东西向主要交通；没有地铁，过黄河依靠几座桥梁与浮桥。' },
      { y: 2002, m: 5, tag: '史实', title: '泉城路改造为步行街', desc: '老城最繁华的商业街改为步行街，公交线路调整到周边道路。' },
      { y: 2003, m: 6, tag: '史实', title: '经十路拓宽改造', desc: '东西向主干道拓宽，成为城市最主要的交通走廊。' },
      { y: 2005, m: 1, tag: '估算', title: '东部新区起步', desc: '高新区与东部新区开始成片开发，职住中心向东移动。' },
      { y: 2009, m: 10, tag: '史实', title: '第十一届全运会在济南举行', desc: '奥体中心（东荷西柳）落成，东部城区配套建设加快。' },
      { y: 2011, m: 6, tag: '史实', title: '京沪高铁通车，济南西站启用', desc: '西部形成新的铁路枢纽，城市向西扩展。' },
      { y: 2019, m: 1, tag: '史实', title: '济南地铁 1 号线开通', desc: '长清—西客站方向的市域快线开通，济南进入轨道交通时代。' },
      { y: 2021, m: 1, tag: '模拟', title: '进入模拟发展阶段', desc: '此后人口、道路和区域变化按模拟规则推演，不代表真实历史。' },
    ],
    // 本地历史主题任务：参考济南 2000 年起的实际发展需求，不要求复刻真实线路（奖励单位：万元）
    histTasks: [
      { id: 'jn1', appear: [2000, 3], deadline: [2008, 12], type: 'connect', reward: 120000, title: '泉城纵轴', desc: '连接济南站、泉城路与泉城广场，这是老城最繁忙的走廊。', anchors: [anchor('济南站', 36.67014, 116.98508, 3), anchor('泉城路', 36.6680, 117.0180, 3), anchor('泉城广场', 36.6620, 117.0200, 4)] },
      { id: 'jn2', appear: [2001, 1], deadline: [2010, 12], type: 'connect', reward: 130000, title: '经十路东西走廊', desc: '沿经十路连接西市场、泉城广场与甸柳、燕山。', anchors: [anchor('西市场', 36.65995, 116.96980, 4), anchor('泉城广场', 36.6620, 117.0200, 3), anchor('燕山', 36.6650, 117.0450, 3)] },
      { id: 'jn3', appear: [2002, 1], deadline: [2012, 12], type: 'connect', reward: 110000, title: '老城到千佛山', desc: '连接泉城广场、千佛山与英雄山，服务南部居住区。', anchors: [anchor('泉城广场', 36.6620, 117.0200, 3), anchor('千佛山', 36.6350, 117.0300, 3), anchor('英雄山', 36.6450, 117.0100, 3)] },
      { id: 'jn4', appear: [2004, 1], deadline: [2015, 12], type: 'connect', reward: 150000, title: '跨黄河', desc: '泺口一带是主要的过河通道，把北岸与老城连起来。', anchors: [anchor('泺口', 36.7200, 116.9900, 4), anchor('北园', 36.7000, 117.0100, 3), anchor('济南站', 36.67014, 116.98508, 3)] },
      { id: 'jn5', appear: [2008, 1], deadline: [2010, 10], type: 'coverage', target: 0.3, reward: 180000, title: '全运会前的覆盖', desc: '2009 年 10 月全运会开幕前，步行 15 分钟可到达车站的人口不低于 30%。' },
      { id: 'jn6', appear: [2009, 1], deadline: [2015, 12], type: 'connect', reward: 140000, title: '东部与奥体', desc: '全运会后东部城区发展加快，连接洪家楼、高新区与奥体中心。', anchors: [anchor('洪家楼', 36.6800, 117.0600, 3), anchor('高新区', 36.6700, 117.0900, 4), anchor('奥体中心', 36.65644, 117.11409, 4)] },
      { id: 'jn7', appear: [2011, 6], deadline: [2020, 12], type: 'connect', reward: 120000, title: '高铁西站接驳', desc: '京沪高铁济南西站启用后，需要与老城和西市场连通。', anchors: [anchor('济南西站', 36.6700, 116.8900, 4), anchor('段店', 36.6900, 116.9700, 4)] },
    ],
    dynTasks: [
      { id: 'jnd1', from: [2003, 1], to: [2012, 12], type: 'connect', months: 36, reward: 45000, title: '东部通勤', desc: '高新区就业增长，连接高新区、甸柳与老城。', anchors: [anchor('高新区', 36.6700, 117.0900, 4), anchor('甸柳', 36.6650, 117.0450, 3), anchor('泉城路', 36.6680, 117.0180, 3)] },
      { id: 'jnd2', from: [2006, 1], to: [2018, 12], type: 'connect', months: 36, reward: 40000, title: '北园与泺口', desc: '北园大街沿线人口密集，需要接驳。', anchors: [anchor('北园', 36.7000, 117.0100, 3), anchor('泺口', 36.7200, 116.9900, 3), anchor('济南站', 36.67014, 116.98508, 3)] },
      { id: 'jnd3', from: [2012, 1], to: [2025, 12], type: 'connect', months: 42, reward: 50000, title: '西客站片区', desc: '高铁西站周边开发，连接西客站、段店与老城。', anchors: [anchor('济南西站', 36.6700, 116.8900, 4), anchor('段店', 36.6900, 116.9700, 4), anchor('大观园', 36.660458, 116.990501, 3)] },
    ],
    taskNote: '历史主题任务参考济南 2000 年起的实际发展需求（泉城路改造、经十路、跨黄河、全运会、高铁西站），不要求按真实线路建设，只需满足目标描述。',
    lineColorsNice: ['#e60012', '#0072bc', '#f6a800', '#00a651', '#8e44ad', '#00a8a8', '#d35400', '#c2185b', '#5c6bc0', '#7cb342'],
    places: (G.places || []).map(function (p) { return [p[0], p[1], p[2], p[3]]; }),
  };

  const INF = [[2000, 0.004], [2004, 0.039], [2008, 0.059], [2012, 0.026], [2016, 0.02], [2020, 0.025], [2030, 0.02], [2050, 0.02]];
  (CM.MAP_LIST = CM.MAP_LIST || []).push({
    id: 'jn', name: '济南', title: '济南 · 2000', sub: '真实地理 · 2000 年起 · 人民币',
    desc: '从 2000 年的济南开始：泉水从老城街巷涌出，黄河在城北 6 公里外，千佛山把城市压在南山北水之间。没有地铁，你要从泉城路与经十路画起第一张轨道网。',
    facts: [['范围', '24 km × 20 km'], ['起始', '2000 年'], ['人口', '约 320 万'], ['货币', '人民币（CNY）'], ['模式', '经营挑战 / 自由建造']],
    modes: ['challenge', 'free'], kind: 'real', mapVersion: 2, scenario: 'jn-2000',
    region: '中国内地', tagline: '泉城、黄河与千佛山', difficulty: 2, tags: ['无地铁开局', '跨黄河', '省会城市'],
    intro: '2000 年的济南还没有一公里地铁。老城被泉水与湖山围住，东西向的出行全压在经十路上，北边是黄河，南边是千佛山。你要在泉城路与经十路之间画出第一条线，再把东部新区、高铁西站与黄河北岸接进来。',
    features: [['map', '泉城老城与千佛山', '老城街巷、大明湖与千佛山限制选线，南部山区不能开发'], ['bridge', '黄河', '城北黄河只有泺口等少数过河通道'], ['building', '省会与高铁', '2009 年全运会、2011 年京沪高铁西站带动东部与西部'], ['coin', '人民币经营', '造价、票价、拨款与债券按人民币计算']],
    highlights: [[2002, '泉城路改造为步行街'], [2009, '第十一届全运会'], [2011, '京沪高铁济南西站'], [2019, '济南地铁 1 号线开通']],
    geo: G, data: data,
    econ: { devOffset: 4, money: 1 },
    cfg: {
      W: 96, H: 80, START: { y: 2000, m: 1, d: 1, minute: 360 },
      growth: Object.assign({}, CM.CFG.growth, { popCurve: [[2000, 3.2e6], [2005, 3.35e6], [2010, 3.6e6], [2015, 3.9e6], [2020, 4.2e6], [2030, 4.6e6], [2050, 5.0e6], [2300, 5.2e6]], histEnd: 2020, jobsRatio: [[2000, 0.5], [2010, 0.54], [2020, 0.56], [2040, 0.57]] }),
      money: { code: 'CNY', unit: '元', wan: '万元', yi: '亿元', sym: '¥' },
      econBase: 2000,
      cost: Object.assign({}, CM.CFG.cost, {
        trackPerKm: { underground: 35000, surface: 7000, elevated: 14000 },
        riverPerKm: { underground: 22000, surface: 16000, elevated: 16000 },
        hillPerKm: 12000, protectedPerKm: 6000,
        station: { underground: { S: 13000, M: 22000, L: 35000 }, elevated: { S: 7000, M: 12000, L: 18000 }, surface: { S: 4500, M: 7500, L: 11000 } },
        demolishPerCell: 32000,
        inflation: INF,
      }),
      ops: Object.assign({}, CM.CFG.ops, { carKmCost: 0.001, stationDaily: { S: 1.6, M: 2.8, L: 4.8 }, inflation: INF }),
      fareDefault: { mode: 'flat', flat: 1 }, fareRange: { min: 0, max: 6, step: 0.5 },
      economy: Object.assign({}, CM.CFG.economy, { startFunds: 400000, grantBase: [[2000, 20000], [2005, 32000], [2010, 55000], [2015, 75000], [2020, 95000], [2050, 150000]], debtLimit: -260000, rewardScale: 1.2,
        bonds: { local: { rate: [[2000, 0.045], [2004, 0.042], [2008, 0.04], [2012, 0.035], [2015, 0.032], [2020, 0.032], [2050, 0.03]], quotaMonths: 6, capMonths: 30 }, ct: { spread: 0.02, quotaMonths: 4, capMonths: 18 }, term6: 0.004 } }),
      // 城市经济：2000 年地图范围 GDP 约 600 亿元（估算：全市约 950 亿元，地图覆盖主要城区）
      macro: {
        area: '地图范围（老城、历下、市中、槐荫、天桥与历城西部）', region: '中国内地',
        gdp0: 6000000, revRatio: [[2000, 0.14], [2010, 0.19], [2020, 0.18], [2040, 0.17]], revElastic: 1.5,
        prod: [[2000, 0.095], [2005, 0.1], [2008, 0.085], [2011, 0.075], [2015, 0.055], [2019, 0.045], [2025, 0.035], [2035, 0.022], [2050, 0.015], [2080, 0.012]],
        infl: 'cn', longRun: { infl: 0.02 }, histEnd: 2020, ref: 'cn',
        struct: { trade: 0.55, fin: 0.35, ind: 0.6, tour: 0.5, prop: 0.55 },
        events: [
          { id: 'wto2001', y: 2001, m: 12 },
          { id: 'sars2003', y: 2003, m: 2 },
          { id: 'gfc2008', y: 2008, m: 9, scale: 0.9 },
          { id: 'stim2008', y: 2008, m: 11 },
          { id: 'cnstock2015', y: 2015, m: 6 },
          { id: 'trade2018', y: 2018, m: 7 },
          { id: 'covid2020', y: 2020, m: 1 },
        ],
      },
    },
    cam: { cx: 50, cy: 42, zoom: 18 },
    // v1→v2：修正多地标准确位置、新增 POI；不影响存档数据（地标与设施从地图数据重建）
    migrate: function (payload, from) { if (from >= 2) return; },
  });
})(window.CM);
