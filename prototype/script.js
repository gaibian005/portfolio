/* =========================================================
   行情助手 · 翻译官与异动侦探 —— 对话式智能体助手原型
   手机端 · 纯原生 JS · 无框架 · 离线可运行
   交互形态：对话界面为核心载体（PRD 第 6/9/10 章）
   - 解读/归因/复盘以助手气泡呈现
   - 异动以"主动推送消息"进入对话流（S-1）
   - 快捷追问 chips + 自由输入（会话式追问，回答带证据链）
   - 存疑诚实态（S-4）· 术语点按（I-3）· 免责全覆盖（I-6）
   mock 数据结构对齐 PRD 12.3
   ========================================================= */
'use strict';

/* =========================================================
   一、mock 数据层（全部虚构，避免真实标的）
   ========================================================= */
const DATA = (function () {

  // ---- 标的 symbols：虚构公司 7 家 ----
  const symbols = {
    'blj': { id: 'blj', name: '蓝鲸科技', code: '3000xx', avatar: 'b', price: '18.42', pct: '+6.2', prev: '17.34' },
    'yf':  { id: 'yf',  name: '云帆新材', code: '6000xx', avatar: 'o', price: '9.15', pct: '-3.4', prev: '9.47' },
    'ky':  { id: 'ky',  name: '昆仑电子', code: '0024xx', avatar: 'r', price: '32.70', pct: '+4.8', prev: '31.21' },
    'sh':  { id: 'sh',  name: '星河生物', code: '3001xx', avatar: 'c', price: '54.20', pct: '+9.9', prev: '49.32' },
    'hn':  { id: 'hn',  name: '海岳智造', code: '6010xx', avatar: 'b', price: '11.06', pct: '-2.1', prev: '11.30' },
    'md':  { id: 'md',  name: '明德医疗', code: '6880xx', avatar: 'p', price: '78.15', pct: '+1.2', prev: '77.22' },
    'sy':  { id: 'sy',  name: '松韵食品', code: '6030xx', avatar: 'o', price: '6.44', pct: '-6.7', prev: '6.90' }
  };

  // ---- 常用术语解释库（F-T3 / I-3）----
  const terms = {
    '量比': { name: '量比', text: '今天到现在为止，这只股票每 1 分钟的成交股数，和历史平时每 1 分钟的成交股数比一下。大于 1 说明比平时热闹，放大越明显越说明有资金关注。', example: '量比 3.2，相当于今天同时段的交易热度是平时 3 倍多。' },
    '换手率': { name: '换手率', text: '今天买卖交换的股数，占这只股票总流通股本的比例。换手率越高，说明当天有越多的人在交易这只股票。', example: '换手率 8%，意味着一百股里有约八股在今天换过主人。' },
    '主力资金': { name: '主力资金', text: '通常指单笔成交金额较大的那类交易（大单），一般被理解为机构或大户的动作。但它只是一个统计口径，不是绝对可靠的信号。', example: '“主力净流入 1.2 亿”表示大单买入金额比大单卖出多出约 1.2 亿。' },
    '龙虎榜': { name: '龙虎榜', text: '交易所每天公布涨跌特别激烈的股票上，当天买入和卖出金额靠前的一批营业部席位名单。很多人会拿它来观察“谁在买”。', example: '上了龙虎榜，就能看到当日买入最靠前的几家席位名字。' },
    '北向资金': { name: '北向资金', text: '通过沪深港通机制，从香港等境外渠道流入 A 股的交易资金，通常被当作观察外资动向的参考窗口。', example: '北向资金净流入，多被理解为外资当天偏积极。' },
    '资金净流入': { name: '资金净流入', text: '一段时间里“主动买盘金额”减去“主动卖盘金额”。数字为正说明按更高价成交的买入更多。', example: '净流入为正，通常解读为买盘相对更积极。' },
    '市盈率': { name: '市盈率(PE)', text: '股价除以每股一年的盈利。可以粗略理解成“按现在的赚钱速度，多少年能靠利润回本”。越小越显得“便宜”，但不同行业差别很大。', example: '市盈率 15，约为回本需要 15 年（粗略口径）。' },
    '放量': { name: '放量', text: '成交股数明显比前几天放大。量是价格的“燃料”，量放大常伴随价格变化，需要结合起来看，不能单独下结论。', example: '放量涨停 vs 缩量上涨，含义往往不同。' },
    '涨停': { name: '涨跌停', text: '交易所为控制短期波动，对单日涨跌幅设上限。普通股票主板一般是 ±10%，创业板/科创板是 ±20%。', example: '触到上限就叫涨停或跌停。' },
    '主力净流出': { name: '主力净流出', text: '“主力资金”统计口径下，卖出大单金额明显多于买入大单金额，显示为净流出，通常被解读为大资金偏减仓。', example: '当日主力净流出 8500 万，属于明显流出。' },
    '沪指': { name: '沪指', text: '上证指数，覆盖在上海交易所上市的股票，是观察 A 股整体表现的常用大盘指数之一。', example: '“沪指涨 0.6%”代表大盘整体小幅上行。' },
    '科创50': { name: '科创50指数', text: '由上交所科创板里 50 只规模较大、代表性较强的公司构成，反映科创板整体情况。', example: '科创50 走强，多与科技成长类公司情绪相关。' }
  };

  // ---- 归因证据链 attributions ----
  // 结构：{ anomalyId, conclusion, sub, status:'verified'|'doubt', evList:[{src,type,label,time,quote?,metrics?,steps?,note?}] }
  const attributions = [
    {
      anomalyId: 'a-ky-01', status: 'verified', conclusion: '昆仑电子午后快速拉升，最直接的关联线索来自其午间发布的一份海外大额订单公告，同时伴随明显的资金放量进场。',
      sub: '我们把这则公告与当日资金流、板块情绪放在一起对照，目前这条解释最有依据；但“放量是订单消息引起的”仍属推断，不具备因果必然性。',
      evList: [
        { src: '公告', type: '来源一', label: '公司公告 · 三季报新签订单', time: '2026-09-07 12:40',
          quote: '“……全资子公司于近日与境外客户签署《战略合作协议》，预计涉及产品订单金额合计约人民币 2.6 亿元，占公司最近一期经审计营收的 18.3%。该协议不构成强制披露的重大合同，相关产品将按计划分期交付……”',
          note: '来源：公司披露的订单进展公告原文摘录（非正式中文逐字）。' },
        { src: '行情', type: '来源二', label: '分时量价数据 · 午后放量', time: '2026-09-07 13:00-13:20',
          metrics: [
            { k: '13:00 后均价抬升', v: '由 31.2 → 32.5 元' },
            { k: '午后 20 分钟量能', v: '约为前日同时段 4.1 倍' },
            { k: '收盘涨幅', v: '+4.8%' }
          ], note: '行情数据为演示 mock，字段结构对齐真实链路。' },
        { src: '资金', type: '来源三', label: '主力资金流向 · 净流入', time: '2026-09-07 全天累计（13:30 快照）',
          metrics: [ { k: '大单净流入', v: '约 +6800 万元' }, { k: '北向席位资金', v: '净流入居前' } ],
          note: '主力资金为统计口径数据，不代表真实买卖双方身份。' },
        { src: '推理', type: '推理路径', label: '把线索串起来 · 3 步', time: '生成时间 13:42',
          steps: [
            '12:40 出现一份涉及“海外订单、金额可观”的公告，属今日该股唯一盘中利好类信息。',
            '13:00 起股价与成交同步放量上行，量价变化与公告发布时间高度吻合。',
            '资金侧同时出现大单净流入，与“新增订单带来基本面预期”的方向一致。'
          ], note: '上述推理为模型生成的解释性路径，仅供理解，不等同于事实因果关系。' }
      ]
    },
    {
      anomalyId: 'a-sh-01', status: 'verified', conclusion: '星河生物盘中快速冲击涨停，背后同时叠加了“行业政策利好 + 昨日公告业绩预喜”两条线索，且成交创近三个月新高，形成合力。',
      sub: '两条线索均有公开来源支撑；但涨跌背后的真实驱动常是综合的，我们无法百分之百还原每一笔买卖的动机。',
      evList: [
        { src: '公告', type: '来源一', label: '昨日公告 · 中报业绩预喜', time: '2026-09-06 20:10',
          quote: '“……预计本期归属于上市公司股东的净利润同比增长 40%–60%，主要系核心产品需求旺盛、产能利用率提升所致……”', note: '公告原文摘要。' },
        { src: '舆情', type: '来源二', label: '行业政策 · 医疗设备更新', time: '2026-09-07 09:20',
          quote: '当日早间多篇行业快讯报道“医疗设备更新及采购支持”相关政策方向，涉及公司所处细分领域。', note: '为公开新闻口径，非公司自行发布。' },
        { src: '行情', type: '来源三', label: '量价创新高', time: '2026-09-07 14:00',
          metrics: [ { k: '当日涨幅', v: '触 +9.9% 涨停价' }, { k: '成交额', v: '创近 90 日新高' }, { k: '换手率', v: '约 8%' } ] },
        { src: '推理', type: '推理路径', label: '把线索串起来 · 2 步', time: '生成时间 14:12',
          steps: [ '业绩预喜在前一日晚间发布，为股价提供基本面底色。', '行业政策消息在早盘发酵，放大了市场关注度并推动资金进场。' ],
          note: '推理路径仅为解释，不构成投资判断。' }
      ]
    },
    {
      anomalyId: 'a-sy-01', status: 'doubt', conclusion: '松韵食品午后出现快速下跌，成交量明显放大，但截至当前我们未能找到任何公告、新闻或资金面依据能与这一波下跌清晰对应。',
      sub: '依据归因红线：没有可验证来源，就绝不伪装成确定结论。当前归因状态标记为“存疑”，宁可如实告知“暂未查明”，也不编造理由。',
      evList: [
        { src: '未知', type: '检索范围', label: '已排查 · 常见归因通道', time: '排查截至 14:30',
          note: '已检索：当日公司公告、行业新闻、资金大单、龙虎榜与舆情热词。未发现与该时点下跌直接相关的公开可验证信息。' }
      ]
    },
    {
      anomalyId: 'a-blj-01', status: 'verified', conclusion: '蓝鲸科技的大单持续净流入，更多指向“机构/大户关注度上升 + 板块景气”的方向，属于资金面的偏积极信号而非确定性的基本面利好。',
      sub: '资金流只是统计口径，反映买卖金额结构，无法反映真实交易者身份与后续意图，因此归因偏“信号解读”而非“结论”。',
      evList: [
        { src: '资金', type: '来源一', label: '主力资金净流入 · 两日累计', time: '2026-09-07 11:05 快照',
          metrics: [ { k: '今日大单净流入', v: '约 +1.2 亿元' }, { k: '量比', v: '3.2' } ], note: '主力资金为统计口径数据。' },
        { src: '舆情', type: '来源二', label: '市场传闻与板块热度', time: '2026-09-07 盘中',
          quote: '多家资讯提到“纳入北向关注名单”相关传闻，但公司未公告，属未证实的市场信息。', note: '传闻未经公司证实，仅作背景。' },
        { src: '推理', type: '推理路径', label: '把信号串起来 · 2 步', time: '生成时间 11:12',
          steps: [ '大单连续两日净流入，叠加量比放大，指向关注度上升。', '传闻方向与之呼应，但缺少公司层面证实，故定性为“信号解读”。' ],
          note: '推理仅为解释，不构成投资判断。' }
      ]
    },
    {
      anomalyId: 'a-yf-01', status: 'verified', conclusion: '云帆新材的冲高回落，资金侧出现明显净流出，更符合“拉高后获利盘顺势了结”的日内交易轮廓，而非突发的公司层面利空。',
      sub: '股价波动方向与资金流出方向一致，是我们支持“了结/流出”解读的主要依据；仍需以公告口径为准，若出现新信息会更新。',
      evList: [
        { src: '行情', type: '来源一', label: '分时走势 · 冲高回落', time: '2026-09-07 09:30-10:30',
          metrics: [ { k: '早盘最高涨幅', v: '+3.1%' }, { k: '回落后跌幅', v: '-3.4%' } ] },
        { src: '资金', type: '来源二', label: '主力净流出', time: '2026-09-07 10:30 快照',
          metrics: [ { k: '主力净流出', v: '约 -8500 万元' } ], note: '统计口径数据。' },
        { src: '推理', type: '推理路径', label: '对照资金看走势', time: '生成时间 10:40',
          steps: [ '早盘冲高后主力资金净流出放大。', '流出方向与股价由涨转跌一致，指向获利了结。' ],
          note: '推理仅为解释，不构成投资判断。' }
      ]
    },
    {
      anomalyId: 'a-hn-01', status: 'verified', conclusion: '海岳智造的回落与其自身消息面关联较弱，更多是随整个制造业板块走弱的“板块联动”结果。',
      sub: '当日该股无独立公告或新闻，跌幅也与板块整体方向一致，故归因偏向“跟随板块”，而非个股独立事件。',
      evList: [
        { src: '行情', type: '来源一', label: '板块指数 · 制造业', time: '2026-09-07 尾盘',
          metrics: [ { k: '所属板块当日', v: '整体走弱' } ] },
        { src: '推理', type: '推理路径', label: '区分个股与板块', time: '生成时间 15:10',
          steps: [ '翻查该股当日无独立公告/新闻。', '下跌方向与所属板块一致，更多是板块beta。' ],
          note: '推理仅为解释，不构成投资判断。' }
      ]
    },
    {
      anomalyId: 'a-md-01', status: 'verified', conclusion: '明德医疗的量价分歧，来自盘中一则澄清公告引发的“多空如何解读该信息”的分歧，属于信息消化期的典型表现。',
      sub: '公告澄清会减少不确定性，但市场仍需时间消化其对预期的影响，故表现为放量而不大涨。',
      evList: [
        { src: '公告', type: '来源一', label: '媒体报道澄清公告', time: '2026-09-07 09:35',
          quote: '公司就相关媒体报道作出澄清，提示相关情况与报道表述存在出入，具体以公告为准。', note: '公告原文摘要。' },
        { src: '行情', type: '来源二', label: '量价数据', time: '2026-09-07 全天',
          metrics: [ { k: '量比', v: '1.9' }, { k: '收盘涨幅', v: '+1.2%' } ] },
        { src: '推理', type: '推理路径', label: '解读分歧假设', time: '生成时间 15:00',
          steps: [ '澄清公告后成交放大、股价却仅微涨。', '提示多空对“该信息是偏正面还是中性”存在分歧，处于消化阶段。' ],
          note: '推理仅为解释，不构成投资判断。' }
      ]
    },
    {
      anomalyId: 'a-sh-02', status: 'verified', conclusion: '星河生物盘后舆情热度抬升，主要是其“盘中冲板”这一事件的讨论被放大，属于话题热度，而非新增的实质性信息。',
      sub: '舆情热度≠新增利好，多数讨论围绕当日行情展开，缺少新的公司或行业信息支撑，故仅作热度提示。',
      evList: [
        { src: '舆情', type: '来源一', label: '舆情热度 · 词频抬升', time: '2026-09-07 15:32',
          quote: '讨论量较昨日放大 3 倍，热词多与该股当日涨停、行业政策相关。', note: '舆情为平台讨论统计口径。' },
        { src: '推理', type: '推理路径', label: '热度来源判断', time: '生成时间 15:40',
          steps: [ '热度在涨停后集中出现。', '内容多为对当日行情的讨论而非新增信息。' ],
          note: '推理仅为解释，不构成投资判断。' }
      ]
    }
  ];

  // ---- 异动事件 anomalies ----
  const anomalies = [
    { id: 'a-ky-01', sid: 'ky', type: '资金·放量拉升', time: '13:20', status: 'verified',
      what: '午后成交量放大至 5 日均值 4 倍，股价 40 分钟拉涨 +4.8%',
      cause: '初步归因：午间 2.6 亿海外订单公告 + 大单资金进场' },
    { id: 'a-sh-01', sid: 'sh', type: '股价·快速冲板', time: '13:58', status: 'verified',
      what: '股价快速上行并冲击涨停（+9.9%），成交创近 90 日新高',
      cause: '初步归因：行业政策利好叠加昨日业绩预喜公告' },
    { id: 'a-blj-01', sid: 'blj', type: '资金·持续流入', time: '11:05', status: 'verified',
      what: '大单资金持续净流入，主力净流入约 1.2 亿，量比放大至 3.2',
      cause: '初步归因：板块景气 + 昨日纳入北向关注名单传闻发酵' },
    { id: 'a-yf-01', sid: 'yf', type: '股价·冲高回落', time: '10:26', status: 'verified',
      what: '早盘冲高 3% 后回落翻绿，最终收跌 -3.4%，振幅扩大',
      cause: '初步归因：获利盘了结叠加主力净流出约 8500 万' },
    { id: 'a-sy-01', sid: 'sy', type: '股价·急跌放量', time: '14:02', status: 'doubt',
      what: '午后放量急跌 -6.7%，成交量约为前日 2.6 倍',
      cause: '暂无可验证归因：未检索到可验证依据，诚实展示存疑' },
    { id: 'a-hn-01', sid: 'hn', type: '股价·震荡下行', time: '14:36', status: 'verified',
      what: '随制造业板块整体走弱，股价收跌 -2.1%，成交温和',
      cause: '初步归因：板块beta行情联动，个股无独立消息' },
    { id: 'a-md-01', sid: 'md', type: '异动·量价温和', time: '09:47', status: 'verified',
      what: '成交额放大但股价仅微涨，量比抬升至 1.9，波动率明显上升',
      cause: '初步归因：盘中公告澄清后分歧加大，多空博弈升温' },
    { id: 'a-sh-02', sid: 'sh', type: '舆情·热度突增', time: '15:32', status: 'verified',
      what: '网络舆情热度盘后显著抬升，讨论量较昨日放大 3 倍',
      cause: '初步归因：收盘涨停引发话题度，多为讨论而非新增信息' }
  ];

  // ---- 内容栏目 contents：晨报 + 盘后复盘各 1 期 ----
  const contents = [
    {
      id: 'c-chenbao-0907', type: '晨报', title: '盘前晨报 · 9月7日', time: '2026-09-07 07:50',
      desc: '隔夜要闻白话版 + 今天值得留意的看点。',
      blocks: [
        { head: '隔夜要闻（白话版）', paras: [
            '外围市场整体平稳，能源与大宗商品价格小幅回落，对资源类板块或有温和影响。',
            '消息面未见能引发 A 股系统性变化的重大政策，今日或延续结构性行情。' ] },
        { head: '今日看点', paras: [
            '关注科技与制造板块能否延续热度；留意<term data-term="量比">量比</term>明显放大的个股，看是否有新消息发酵。',
            '我会全天盯着你的自选与全市场异动，有动静随时在这里告诉你。' ] }
      ]
    },
    {
      id: 'c-fupan-0907', type: '复盘', title: '盘后复盘 · 9月7日', time: '2026-09-07 17:30',
      desc: '把今天散落的故事线串成一条完整的盘面叙事。',
      blocks: [
        { head: '今日一句话', paras: [
            '今天大盘整体<b>震荡偏暖</b>，沪指收涨 0.6%，但真正的主角不在指数，而在几只“<b>突然放量、各有故事</b>”的个股身上。' ] },
        { head: '主要异动 · 谁在动', paras: [
            '<b>昆仑电子</b>：午后 40 分钟放量拉涨 4.8%，关联线索是午间 2.6 亿海外订单公告。',
            '<b>星河生物</b>：行业利好 + 昨晚业绩预喜共振，盘中一度冲击涨停。',
            '<b>松韵食品</b>：放量急跌 6.7%，我们未找到可验证依据，<b>如实标记为“归因存疑”</b>，不作猜测。' ] },
        { head: '隐性信号榜', paras: [
            '<b>资金关注度</b>：蓝鲸科技连续两日主力净流入，量比放大。',
            '<b>舆情热度</b>：星河生物涨停后盘后讨论量大增，多为话题热度而非新增信息。' ] },
        { head: '明日关注点（仅提示信息，不构成建议）', paras: [
            '昆仑电子订单公告的交付与落地进展；星河生物业绩预喜后的量能延续情况；松韵食品在无可验证归因前的波动，需继续观察是否有公开信息补齐。' ] }
      ]
    }
  ];

  // ---- 标的详情白话解读 ----
  const symbolDetails = {
    'ky': {
      plain: '今天昆仑电子的故事可以这样讲：<b>午间</b>它公布了一份 2.6 亿的海外大单，消息一出，午后资金进场、成交量放大，股价 40 分钟涨了 4.8%。简单说，今天它的波动，<b>很可能和这份订单公告直接相关</b>。',
      statsK: [ { k: '现价', v: '¥32.70' }, { k: '涨跌幅', v: '+4.8%' }, { k: '量比', v: '3.2' } ],
      anns: [ { id: 'ann-ky-1', title: '关于签订海外大额订单协议的公告', pages: '全文 40 页 · 发布 12:40' } ]
    },
    'blj': {
      plain: '蓝鲸科技连续两天出现<b>主力资金净流入</b>，今天量比放大到 3.2，股价也随之温和上行。放在市场语言里，这通常被解读为<b>大资金的关注度在上升</b>。不过要记住，主力资金只是一个统计口径，并不代表资金就一定“看好”并继续流入。',
      statsK: [ { k: '现价', v: '¥18.42' }, { k: '涨跌幅', v: '+6.2%' }, { k: '量比', v: '3.2' } ],
      anns: []
    },
    'sh': {
      plain: '星河生物今天盘中一度冲击涨停。它的底气来自两件事叠加：一是昨晚刚发的<b>中报业绩预喜</b>，二是今天早间<b>行业政策消息升温</b>。一内一外两条线索同时发力，情绪和资金被点燃，成交也创出近 90 日新高。',
      statsK: [ { k: '现价', v: '¥54.20' }, { k: '涨跌幅', v: '+9.9%' }, { k: '换手率', v: '8%' } ],
      anns: [ { id: 'ann-sh-1', title: '2026 年半年度业绩预告', pages: '全文 28 页 · 发布 20:10' } ]
    },
    'yf': {
      plain: '云帆新材今天<b>先冲高、后回落</b>：早盘一度涨 3%，随后一路走弱，收盘反而跌了 3.4%。对照资金数据，今天<b>主力净流出明显</b>，更能看出是“拉高后有人顺势了结”的轮廓，而不是基本面突发利空。',
      statsK: [ { k: '现价', v: '¥9.15' }, { k: '涨跌幅', v: '-3.4%' }, { k: '量比', v: '2.1' } ],
      anns: []
    },
    'hn': {
      plain: '海岳智造今天下跌 <b>2.1%</b>，翻它的公告和新闻，并没有发现个股特有的消息。它的回落更多是<b>跟随整个制造业板块走弱</b>。遇到这种“没个股消息却下跌”的情况，先分清是“自己的事”还是“大家的事”，能少很多误读。',
      statsK: [ { k: '现价', v: '¥11.06' }, { k: '涨跌幅', v: '-2.1%' }, { k: '量比', v: '0.9' } ],
      anns: []
    },
    'sy': {
      plain: '松韵食品今天午后出现一波<b>放量急跌 -6.7%</b>。我们把它可能的常见原因——公告、新闻、资金大单、龙虎榜——都排查了一遍，<b>目前没有找到能清晰对应这波下跌的可验证依据</b>，因此归因状态标记为“存疑”。我们选择如实告诉你，而不是编一个看似合理的理由。',
      statsK: [ { k: '现价', v: '¥6.44' }, { k: '涨跌幅', v: '-6.7%' }, { k: '量比', v: '2.6' } ],
      anns: []
    },
    'md': {
      plain: '明德医疗今天成交额明显放大，但股价只微涨了 1.2%。配合盘中一则公告澄清，多空双方在“这条信息到底是好是坏”上出现了分歧，波动率也随之上升——属于典型的信息消化期的表现。',
      statsK: [ { k: '现价', v: '¥78.15' }, { k: '涨跌幅', v: '+1.2%' }, { k: '量比', v: '1.9' } ],
      anns: [ { id: 'ann-md-1', title: '关于媒体报道的澄清公告', pages: '全文 12 页 · 发布 09:35' } ]
    }
  };

  // ---- 公告“三句话看懂”翻译库（S-2）----
  const announceTranslations = {
    'ann-ky-1': {
      title: '海外大额订单协议公告',
      three: [
        { lab: '发生什么', txt: '公司签了一份 2.6 亿的海外订单协议，占去年营收约 18%。' },
        { lab: '意味着什么', txt: '算是一笔“看得见体量”的新增订单，可能对未来业绩有帮助，但需要按计划分期交付、落地才作数。' },
        { lab: '要注意什么', txt: '这只是公司对一件经营事件的披露，不代表股价一定涨，也不构成任何买卖建议。' }
      ],
      extra: '小提示：不懂的术语可点按 —— <term data-term="主力资金">主力资金</term> · <term data-term="放量">放量</term>'
    },
    'ann-sh-1': {
      title: '中报业绩预告',
      three: [
        { lab: '发生什么', txt: '公司预计上半年净利润同比增长 40%–60%。' },
        { lab: '意味着什么', txt: '说明公司说“今年生意明显比去年好”，是一个偏正面的经营信号。' },
        { lab: '要注意什么', txt: '业绩预喜影响的是“预期”，真实兑现要等中报正式数字，价格也不一定就此一路向上。' }
      ]
    },
    'ann-md-1': {
      title: '媒体报道澄清公告',
      three: [
        { lab: '发生什么', txt: '有媒体报道了公司的一些情况，公司专门发公告做澄清和说明。' },
        { lab: '意味着什么', txt: '公司主动澄清，通常是想让市场不被不准确的消息带偏，管理上更透明。' },
        { lab: '要注意什么', txt: '澄清不等于利好，核心要回到澄清里具体说了什么事实。' }
      ]
    }
  };

  return { symbols, terms, attributions, anomalies, contents, symbolDetails, announceTranslations };
})();

/* =========================================================
   二、全局状态与工具
   ========================================================= */
const state = {
  tab: 'chat',          // chat | anomaly | mine
  messages: [],         // 对话消息流
  dynSeq: 0,
  watched: ['blj', 'ky', 'sh'],
  pushShown: false
};

const $ = (s, el) => (el || document).querySelector(s);
const chatList = () => $('#chatList');
const chatScrollEl = () => $('#chatScroll');

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// 富文本白名单：<b> 与 <term data-term=..>，其余转义（I-3 术语点按）
function renderRich(html) {
  let out = '';
  const re = /(<\/?(?:b|term)(?:\s+data-term="[^"]*")?\s*\/?>)/g;
  let last = 0, m;
  while ((m = re.exec(html))) {
    out += esc(html.slice(last, m.index));
    out += m[1];
    last = m.index + m[1].length;
  }
  out += esc(html.slice(last));
  return out;
}

function dynId() { return 'dyn-' + (++state.dynSeq); }
function nowTime() {
  const d = new Date();
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}
function getAtt(anomalyId) {
  const a = DATA.anomalies.find(x => x.id === anomalyId);
  const att = DATA.attributions.find(x => x.anomalyId === anomalyId) ||
    { anomalyId, status: a ? a.status : 'verified', conclusion: a ? a.cause : '', sub: '演示用简短结论。', evList: [] };
  return { a, att };
}

/* hash 路由：#chat | #anomaly | #mine | #chat/att/<anomalyId>（深链定位归因消息） */
function parseHash() {
  const parts = location.hash.replace(/^#/, '').split('/').filter(Boolean);
  const tab = ['chat', 'anomaly', 'mine'].includes(parts[0]) ? parts[0] : 'chat';
  let attId = null;
  if (parts[0] === 'chat' && parts[1] === 'att' && parts[2]) attId = parts[2];
  return { tab, attId };
}

/* =========================================================
   三、对话剧本（9月7日 全天消息流）
   ========================================================= */
function buildScript() {
  return [
    { id: 'm-welcome', role: 'assistant', type: 'text', time: '08:00',
      html: '早上好！我是你的<b>行情助手</b>，只干两件事：把你的自选标的<b>翻译成大白话</b>，替你<b>盯它们的异常动向</b>。<br><br>今天盯着你的 3 只自选：蓝鲸科技、昆仑电子、星河生物。有异动我会第一时间在这里推送，你随时可以追问。' },
    { id: 'm-chenbao', role: 'assistant', type: 'content', contentId: 'c-chenbao-0907', time: '07:50', pushed: true },
    { id: 'att-a-blj-01', role: 'assistant', type: 'attribution', anomalyId: 'a-blj-01', time: '11:12', pushed: true },
    { id: 'att-a-ky-01', role: 'assistant', type: 'attribution', anomalyId: 'a-ky-01', time: '13:42', pushed: true },
    { id: 'att-a-sh-01', role: 'assistant', type: 'attribution', anomalyId: 'a-sh-01', time: '14:12', pushed: true },
    { id: 'm-market', role: 'assistant', type: 'market', time: '15:05' },
    { id: 'm-fupan', role: 'assistant', type: 'content', contentId: 'c-fupan-0907', time: '17:30', pushed: true }
  ];
}

/* =========================================================
   四、消息渲染
   ========================================================= */
function msgDomId(m) {
  if (m.type === 'attribution' && m.id.startsWith('att-')) return 'msg-att-' + m.anomalyId;
  return 'msg-' + m.id;
}

function msgHtml(m) {
  const isUser = m.role === 'user';
  const inner = bubbleInner(m);
  const meta = `<div class="msg-meta">${m.pushed ? '<span class="push-flag">主动推送</span>' : ''}<span>${esc(m.time || '')}</span></div>`;
  return `
  <div class="msg ${isUser ? 'user' : 'assistant'}" id="${msgDomId(m)}">
    <div class="msg-avatar">${isUser ? '我' : '译'}</div>
    <div class="bubble-col">
      ${meta}
      <div class="bubble">${inner}</div>
    </div>
  </div>`;
}

function bubbleInner(m) {
  switch (m.type) {
    case 'text': return `<div class="rich">${renderRich(m.html || '')}</div>`;
    case 'market': return marketInner();
    case 'attribution': return attributionInner(m.anomalyId);
    case 'symbol': return symbolInner(m.sid);
    case 'announce': return announceInner(m.annId, m.sid);
    case 'content': return contentInner(m.contentId);
    case 'terms': return termsInner(m.names);
    default: return '<div class="muted small">（演示占位）</div>';
  }
}

/* 大盘一句话 */
function marketInner() {
  return `
  <div class="market-strip">
    <div class="market-idx"><span class="chg">+0.6%</span><span class="idx">沪指 3,420.15 · 收盘</span></div>
    <div class="market-summary">今天大盘<b>震荡偏暖</b>，指数波澜不惊，真正的故事在个股：多只股票午后突然<term data-term="放量">放量</term>，各有各的线索。</div>
  </div>
  <div class="xs muted" style="margin-top:6px">白话快评 · 数据截至 15:00 · 演示 mock</div>`;
}

/* 归因消息卡（S-1 核心 / S-4 存疑） */
function attributionInner(anomalyId) {
  const { a, att } = getAtt(anomalyId);
  if (!a) return '<div class="muted small">未找到该异动</div>';
  const sym = DATA.symbols[a.sid];
  const doubt = att.status === 'doubt' || a.status === 'doubt';
  let h = `<div class="card-inner">`;
  h += `
    <div class="row gap8">
      <div class="avatar ${sym.avatar}" style="width:32px;height:32px;font-size:14px;border-radius:10px">${esc(sym.name.charAt(0))}</div>
      <div class="spacer"><span class="symbol-chip">${esc(sym.name)}</span> <span class="small muted">${esc(a.type)}</span></div>
      <span class="flag ${doubt ? 'doubt' : 'red'}">${doubt ? '存疑' : '已归因'}</span>
    </div>`;
  h += `
    <div class="conclusion ${doubt ? 'doubt' : ''}">
      <div class="conclusion-flag ${doubt ? 'doubt' : ''}">${doubt ? '◐ 暂无可验证归因' : '✓ 白话归因结论'}</div>
      <div class="conclusion-text">${esc(att.conclusion)}</div>
      <div class="conclusion-sub">${esc(att.sub)}</div>
    </div>`;
  if (doubt) {
    h += `
    <div class="doubt-box">
      <div class="head">为什么“存疑”，而不是给一个说法？</div>
      按归因红线：没有可验证来源，就绝不伪装成确定结论。这条下跌我们没有找到能站得住脚的公告、新闻或资金依据，所以如实标记为“暂无可验证归因”。宁可承认“还没查到”，也不编造一个看似合理的理由。后续如有公开信息补齐，会第一时间更新。
    </div>`;
  }
  if (att.evList.length) {
    h += `<div class="evidence-list">${att.evList.map(ev => evidenceBlock(ev)).join('')}</div>`;
  }
  h += `<div class="xs muted">触发 ${esc(a.time)} · 证据链 ${att.evList.length} 条来源 · 演示 mock · 不构成投资建议</div>`;
  h += `</div>`;
  return h;
}

function evidenceBlock(ev) {
  let detail = '';
  if (ev.quote) detail += `<div class="quote">${esc(ev.quote)}</div>`;
  if (ev.metrics) {
    detail += ev.metrics.map(m => `<div class="metric-row"><span class="k">${esc(m.k)}</span><span class="v">${esc(m.v)}</span></div>`).join('');
  }
  if (ev.steps) {
    detail += `<div class="xs muted" style="margin:8px 0 4px;font-weight:700;color:var(--ink-2)">推理路径</div>`;
    detail += ev.steps.map((s, i) => `<div class="reason-step"><span class="n">${i + 1}</span><span>${esc(s)}</span></div>`).join('');
  }
  if (ev.note) detail += `<div class="xs muted" style="margin-top:8px">${esc(ev.note)}</div>`;
  if (ev.time) detail += `<div><span class="src-time">数据时间戳：${esc(ev.time)}</span></div>`;
  return `
  <div class="evidence-block">
    <button class="evidence-summary" data-ev-toggle>
      <span class="src-badge ${esc(ev.src)}">${esc(ev.src)}</span>
      <span class="t">${esc(ev.type)} · ${esc(ev.label)}</span>
      <span class="chev">›</span>
    </button>
    <div class="evidence-detail"><div class="evidence-inner">${detail || '<div class="muted small">无进一步展开内容</div>'}</div></div>
  </div>`;
}

/* 标的消息卡（点自选 / 问个股时贴出） */
function symbolInner(sid) {
  const sym = DATA.symbols[sid];
  if (!sym) return '<div class="muted small">未找到该标的</div>';
  const det = DATA.symbolDetails[sid] || { plain: '', statsK: [], anns: [] };
  const pctCls = (sym.pct || '').startsWith('-') ? 'down' : 'up';
  let h = `<div class="card-inner">
    <div class="symbol-header">
      <div class="avatar ${sym.avatar}">${esc(sym.name.charAt(0))}</div>
      <div class="spacer"><div class="sym-name">${esc(sym.name)}</div><div class="sym-code">${esc(sym.code)} · 演示标的</div></div>
      <div class="pct ${pctCls}">${esc(sym.pct)}%</div>
    </div>
    <div class="stat-grid">
      <div class="stat"><div class="v">¥${esc(sym.price)}</div><div class="k">现价</div></div>
      <div class="stat"><div class="v pct ${pctCls}">${esc(sym.pct)}%</div><div class="k">今日涨跌</div></div>
      <div class="stat"><div class="v">${esc(sym.prev)}</div><div class="k">昨收</div></div>
    </div>`;
  if (det.plain) h += `<div class="rich" style="font-size:13.5px;line-height:1.7">${renderRich(det.plain)}</div>`;
  if (det.statsK && det.statsK.length) {
    h += `<div class="row gap6" style="flex-wrap:wrap">${det.statsK.map(s => `<span class="tag">${esc(s.k)}：<b style="color:var(--ink)">${esc(s.v)}</b></span>`).join('')}</div>`;
  }
  if (det.anns && det.anns.length) {
    h += det.anns.map(an => announceCard(an.id, an.title, an.pages)).join('');
  }
  h += `<div class="xs muted">演示 mock · 不构成投资建议</div></div>`;
  return h;
}

/* 公告“三句话看懂”折叠卡（S-2，用于标的卡内） */
function announceCard(id, title, pages) {
  const tr = DATA.announceTranslations[id];
  return `
  <div class="announce">
    <button class="announce-head" data-ann-toggle>
      <span class="src-badge 公告">公告</span>
      <span class="t">${esc(title)}</span>
      <span class="announce-pages">${esc(pages || '')}</span>
      <span class="chev">›</span>
    </button>
    ${tr ? `<div class="three-lines">
      ${tr.three.map(l => `
        <div class="three-line"><span class="lab ${l.lab === '发生什么' ? 'a' : l.lab === '意味着什么' ? 'b' : 'c'}">${esc(l.lab)}</span><span class="txt">${esc(l.txt)}</span></div>`).join('')}
      ${tr.extra ? `<div class="three-line"><span class="lab" style="background:var(--gray-bg);color:var(--ink-3)">小提示</span><span class="txt">${renderRich(tr.extra)}</span></div>` : ''}
    </div>` : '<div class="three-lines"><div class="muted small">暂无翻译</div></div>'}
  </div>`;
}

/* 公告三句话消息（追问"公告讲了什么"时贴出） */
function announceInner(annId, sid) {
  const sym = DATA.symbols[sid];
  const tr = DATA.announceTranslations[annId];
  let h = `<div class="card-inner">
    <div class="row gap8">
      ${sym ? `<div class="avatar ${sym.avatar}" style="width:32px;height:32px;font-size:14px;border-radius:10px">${esc(sym.name.charAt(0))}</div>
      <span class="symbol-chip">${esc(sym.name)}</span>` : ''}
      <span class="spacer"></span>
      <span class="flag red">公告翻译</span>
    </div>
    <div class="small" style="line-height:1.65">40 页公告太长？我用<b>三句话</b>给你讲清楚：</div>`;
  if (tr) {
    h += tr.three.map(l => `
      <div class="three-line" style="align-items:flex-start"><span class="lab ${l.lab === '发生什么' ? 'a' : l.lab === '意味着什么' ? 'b' : 'c'}">${esc(l.lab)}</span><span class="txt" style="flex:1">${esc(l.txt)}</span></div>`).join('');
    if (tr.extra) h += `<div class="xs muted">${renderRich(tr.extra)}</div>`;
  }
  h += `<div class="xs muted">翻译自公告原文摘要 · 演示 mock · 不构成投资建议</div></div>`;
  return h;
}

/* 晨报/复盘长消息 */
function contentInner(contentId) {
  const c = DATA.contents.find(x => x.id === contentId);
  if (!c) return '<div class="muted small">未找到内容</div>';
  let h = `<div class="card-inner">
    <div class="row gap8">
      <span class="content-type-flag ct-${esc(c.type)}">${esc(c.type)}</span>
      <span class="small muted">${esc(c.time)}</span>
    </div>
    <div style="font-weight:800;font-size:15px">${esc(c.title)}</div>
    <div class="small muted">${esc(c.desc)}</div>`;
  c.blocks.forEach(b => {
    h += `<div class="content-block"><h4>${esc(b.head)}</h4>${b.paras.map(p => `<div class="content-p">${renderRich(p)}</div>`).join('')}</div>`;
  });
  h += `<div class="xs muted">定时内容 · 演示 mock · 不构成投资建议</div></div>`;
  return h;
}

/* 术语解释消息（追问术语时贴出） */
function termsInner(names) {
  let h = `<div class="card-inner">`;
  names.forEach(n => {
    const t = DATA.terms[n];
    if (!t) return;
    h += `
    <div>
      <div style="font-weight:800;color:var(--brand);font-size:14px">${esc(t.name)}</div>
      <div style="font-size:13px;color:var(--ink-2);line-height:1.7">${esc(t.text)}</div>
      <div class="xs muted" style="margin-top:5px;background:var(--gray-bg);border-radius:8px;padding:6px 9px">举例：${esc(t.example)}</div>
    </div>`;
  });
  h += `</div>`;
  return h;
}

/* =========================================================
   五、追问引擎（会话式：chips / 自由输入 → 带证据链的回答）
   核心：围绕用户自选标的服务；查不到依据就如实存疑
   ========================================================= */
const CHIPS = ['我的自选今天怎么样', '昆仑电子为什么涨', '昆仑的公告讲了什么', '这个归因可靠吗', '还有什么信号', '松韵为什么跌'];

function textMsg(html) { return { id: dynId(), role: 'assistant', type: 'text', time: nowTime(), html }; }
function dynAttMsg(anomalyId) { return { id: dynId(), role: 'assistant', type: 'attribution', anomalyId, time: nowTime() }; }

// 返回 { msgs: [...], scroll: domId|null }
function answerFor(input) {
  const t = input.trim();

  // 自选概览（核心入口）
  if (/自选|持仓|我的股|我的.*标的/.test(t)) {
    return { msgs: [
      textMsg('你的 3 只自选今天<b>都有动静</b>：<br>· <b>昆仑电子</b> +4.8%：午后放量拉升，已归因（海外订单公告 + 资金进场），证据链 4 条来源；<br>· <b>星河生物</b> +9.9%：盘中一度冲板，已归因（行业政策 + 昨晚业绩预喜），证据链 4 条来源；<br>· <b>蓝鲸科技</b> +6.2%：主力资金连续两日净流入，属"信号解读"而非确定结论。<br><br>对应归因卡片都在上方对话里，可逐条点开证据链验证。')
    ], scroll: 'msg-att-a-ky-01' };
  }

  // 大盘
  if (/大盘|指数|市场|行情怎么样/.test(t)) {
    return { msgs: [
      textMsg('今天大盘整体<b>震荡偏暖</b>：沪指收涨 <b>0.6%</b> 报 3,420.15。指数波澜不惊，真正的故事在个股——包括你自选的两只。给你一张速览卡：'),
      { id: dynId(), role: 'assistant', type: 'market', time: nowTime() }
    ], scroll: null };
  }

  // 自选标的归因直达
  if (/昆仑/.test(t) && /为什么|怎么|涨|拉升|异动|放量/.test(t)) {
    return { msgs: [
      textMsg('昆仑电子午后 40 分钟放量拉升 +4.8%，<b>已归因</b>：午间 2.6 亿海外订单公告 + 大单资金进场。带你去看带证据链的归因卡：')
    ], scroll: 'msg-att-a-ky-01' };
  }
  if (/星河/.test(t) && /为什么|怎么|涨|涨停|异动|冲板/.test(t)) {
    return { msgs: [
      textMsg('星河生物盘中一度冲击涨停（+9.9%），归因是<b>行业政策利好 + 昨晚业绩预喜</b>两条线索共振，成交创近 90 日新高。')
    ], scroll: 'msg-att-a-sh-01' };
  }
  if (/蓝鲸/.test(t) && /为什么|怎么|涨|异动|流入|资金/.test(t)) {
    return { msgs: [
      textMsg('蓝鲸科技连续两日<b>主力资金净流入</b>（今日约 1.2 亿），量比放大到 3.2。注意：这是"关注度上升"的信号解读，不是确定性结论。')
    ], scroll: 'msg-att-a-blj-01' };
  }

  // 公告三句话（S-2）
  if (/公告|订单/.test(t)) {
    return { msgs: [
      textMsg('昆仑电子午间那份 40 页的订单公告，我用<b>三句话</b>给你讲清楚：'),
      { id: dynId(), role: 'assistant', type: 'announce', annId: 'ann-ky-1', sid: 'ky', time: nowTime() },
      textMsg('想看这份公告如何与盘面互相印证，可点快捷问题"这个归因可靠吗"。')
    ], scroll: null };
  }

  // 验证归因（信任层）
  if (/可靠|可信|证据|验证|真的吗|准不准/.test(t)) {
    return { msgs: [
      textMsg('问得好——<b>每条结论都必须能被验证</b>。以昆仑电子为例，它带 <b>4 条来源</b>：公告原文（含时间戳）、分时量价、主力资金快照、以及明示"仅为解释路径"的推理步骤，可逐层点开核对。<br><br>另一条原则：<b>查不到依据时直接说"存疑"</b>，绝不编理由。带你看昆仑那条的证据链：')
    ], scroll: 'msg-att-a-ky-01' };
  }

  // 隐形信号（含松韵存疑提示，S-4 入口）
  if (/信号|雷达|还有什么/.test(t)) {
    return { msgs: [
      textMsg('今天你的关注圈内外，这些信号值得知道：<br><br>· <b>资金关注度</b>：蓝鲸科技（自选）连续两日主力净流入约 1.2 亿，量比 3.2；<br>· <b>舆情热度</b>：星河生物（自选）涨停后讨论量放大 3 倍——注意<b>热度≠新增利好</b>；<br>· <b>全市场异动</b>：松韵食品放量急跌 -6.7%，但我们<b>没找到可验证依据，已如实标记"存疑"</b>，不猜理由——这正是"不编造"原则。想看排查过程，直接问我"松韵为什么跌"。')
    ], scroll: null };
  }

  // 存疑案例（S-4）
  if (/松韵|存疑|查不到/.test(t)) {
    return { msgs: [
      textMsg('松韵食品午后放量急跌 -6.7%。我们把<b>公告、新闻、资金大单、龙虎榜、舆情</b>都排查了一遍，<b>没有找到可验证依据</b>。按归因红线，如实标记为"暂无可验证归因"，而不是猜一个理由。排查过程贴给你：'),
      dynAttMsg('a-sy-01')
    ], scroll: null };
  }

  // 复盘
  if (/复盘|总结|今天发生了什么/.test(t)) {
    return { msgs: [ textMsg('今日盘后复盘已生成（含你的自选故事线），带你定位过去：') ], scroll: 'msg-m-fupan' };
  }

  // 术语解释
  if (/放量|量比|换手|主力|龙虎榜|什么意思|术语/.test(t)) {
    const names = [];
    if (/量比/.test(t)) names.push('量比');
    if (/放量/.test(t)) names.push('放量');
    if (/换手/.test(t)) names.push('换手率');
    if (/主力|净流/.test(t)) names.push('主力资金');
    if (/龙虎榜/.test(t)) names.push('龙虎榜');
    return { msgs: [
      textMsg('用大白话解释给你：'),
      { id: dynId(), role: 'assistant', type: 'terms', names: names.length ? names : ['放量', '量比'], time: nowTime() }
    ], scroll: null };
  }

  // 标的名 → 贴标的卡（I-7 自选关联）
  const symHit = Object.values(DATA.symbols).find(s => t.includes(s.name));
  if (symHit) {
    return { msgs: [
      textMsg(`这是 <b>${esc(symHit.name)}</b> 今天的白话解读：`),
      { id: dynId(), role: 'assistant', type: 'symbol', sid: symHit.id, time: nowTime() }
    ], scroll: null };
  }

  // 兜底
  return { msgs: [
    textMsg('这个问题我先不装懂——演示环境里我最有把握的是：<br>· 问<b>自选</b>：我的自选今天怎么样<br>· 问<b>归因</b>：昆仑电子为什么涨 / 星河生物怎么看<br>· 问<b>公告</b>：昆仑的公告讲了什么<br>· 问<b>验证</b>：这个归因可靠吗<br>· 问<b>信号</b>：还有什么信号<br>· 问<b>术语</b>：放量是什么意思<br><br>也可以点下方快捷问题。所有回答都附证据链，查不到就如实存疑。')
  ], scroll: null };
}

/* =========================================================
   六、对话流操作：追加消息 / typing / 滚动定位
   ========================================================= */
function appendMsg(m) {
  state.messages.push(m);
  chatList().insertAdjacentHTML('beforeend', msgHtml(m));
  bindNode(chatList().lastElementChild);
  scrollBottom();
}

function pushUser(text) {
  appendMsg({ id: dynId(), role: 'user', type: 'text', time: nowTime(), html: esc(text) });
}

function showTyping() {
  const el = document.createElement('div');
  el.className = 'msg assistant';
  el.innerHTML = `
    <div class="msg-avatar">译</div>
    <div class="bubble-col"><div class="bubble">
      <span class="typing-dots"><i></i><i></i><i></i></span>
      <span class="small muted" style="margin-left:6px">正在核对证据…</span>
    </div></div>`;
  chatList().appendChild(el);
  scrollBottom();
  return el;
}

function scrollBottom() {
  requestAnimationFrame(() => { chatScrollEl().scrollTop = chatScrollEl().scrollHeight; });
}

// 定位到某条消息并高亮（异动 Tab 跳回对话 / 追问引导）
function scrollToMsg(domId) {
  const el = document.getElementById(domId);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');
}

function handleSend(text) {
  const t = (text || '').trim();
  if (!t) return;
  pushUser(t);
  $('#chatInput').value = '';
  const typing = showTyping();
  setTimeout(() => {
    typing.remove();
    const res = answerFor(t);
    res.msgs.forEach(m => appendMsg(m));
    if (res.scroll) setTimeout(() => scrollToMsg(res.scroll), 250);
    scrollBottom();
  }, 550 + Math.random() * 400);
}

/* =========================================================
   七、Tab 渲染：对话 / 异动时间线 / 我的
   ========================================================= */
function renderChat() {
  chatList().innerHTML = state.messages.map(m => msgHtml(m)).join('') + `
    <div class="disclaimer" style="margin:2px 0 6px"><b>内容不构成投资建议</b>：以上均为对公开演示数据的白话解读与归因分析，不构成任何投资建议，不含荐股、买卖点提示或收益承诺。市场有风险，投资需谨慎。</div>`;
  bindNode(chatList());
  scrollBottom();
}

function renderAnomaly() {
  const el = $('#anomalyList');
  let h = `<div class="section-title"><span class="bar"></span>异动时间线 <span class="muted small">9月7日</span></div>
    <div class="xs muted" style="margin:-4px 2px 10px">自选标的高亮展示；红=已归因 · 灰=暂无可验证归因（存疑）。点任意一条，回到对话查看归因与证据链。</div>`;
  DATA.anomalies.forEach(a => {
    const sym = DATA.symbols[a.sid];
    const doubt = a.status === 'doubt';
    const isWatch = state.watched.includes(a.sid);
    h += `
    <div class="card" data-att="${esc(a.id)}" ${isWatch ? 'style="border-color:#c9d9ff"' : ''}>
      <div class="anomaly-top">
        <span class="flag ${doubt ? 'doubt' : 'red'}">${doubt ? '存疑' : '异动'}</span>
        ${isWatch ? '<span class="flag purple">自选</span>' : ''}
        <span class="small muted">${esc(a.type)}</span>
        <span class="spacer"></span>
        <span class="time">${esc(a.time)}</span>
      </div>
      <div class="row gap8">
        <div class="avatar ${sym.avatar}" style="width:30px;height:30px;font-size:14px;border-radius:9px">${esc(sym.name.charAt(0))}</div>
        <span class="symbol-chip">${esc(sym.name)}</span>
      </div>
      <div class="anomaly-what" style="margin-top:8px">${esc(a.what)}</div>
      <div class="anomaly-cause ${doubt ? 'doubt' : ''}">${esc(a.cause)}</div>
      <div class="evidence-note ${doubt ? 'gray' : ''}">${doubt ? '归因存疑 · 查看排查过程 ›' : '回到对话查看证据链 ›'}</div>
    </div>`;
  });
  h += `<div class="disclaimer"><b>内容不构成投资建议</b>：异动信息与归因均为演示 mock 数据，仅供原型演示。</div>`;
  el.innerHTML = h;
  el.querySelectorAll('[data-att]').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.att;
      // 非剧本消息（如松韵）先补发一条归因消息再定位
      if (!document.getElementById('msg-att-' + id)) {
        appendMsg({ id: 'att-' + id, role: 'assistant', type: 'attribution', anomalyId: id, time: nowTime() });
      }
      switchTab('chat');
      setTimeout(() => scrollToMsg('msg-att-' + id), 100);
    });
  });
}

function renderMine() {
  const el = $('#mineList');
  const watch = state.watched.map(id => DATA.symbols[id]).filter(Boolean);
  let h = `
  <div class="mine-hero">
    <div class="avatar" style="width:56px;height:56px;font-size:24px;margin:0 auto 8px;background:linear-gradient(135deg,var(--brand),#6aa0ff)">译</div>
    <div class="h2">行情助手</div>
    <div class="sub">把你的自选翻译成人话，把异动查个明白</div>
  </div>
  <div class="card" style="cursor:default">
    <div class="row"><span class="section-title" style="margin:0"><span class="bar"></span>我的自选</span><span class="muted small" style="margin-left:auto">${watch.length} 只 · 演示</span></div>
    ${watch.map(s => `
      <div class="watch-stock" data-sid="${esc(s.id)}">
        <div class="avatar ${s.avatar}" style="width:34px;height:34px;font-size:15px;border-radius:10px">${esc(s.name.charAt(0))}</div>
        <div class="spacer"><div class="name">${esc(s.name)}</div><div class="code">${esc(s.code)}</div></div>
        <div class="pct ${(s.pct || '').startsWith('-') ? 'down' : 'up'}" style="font-size:13px">${esc(s.pct)}%</div>
        <span class="chev muted" style="margin-left:4px">›</span>
      </div>`).join('')}
    <div class="xs muted" style="margin-top:8px">点自选回到对话，助手会贴出该标的的白话解读（I-7 自选关联）。</div>
  </div>
  <div class="card" style="cursor:default">
    <div class="row menu-item" id="menuSignal"><span class="ico">信</span>隐形信号榜 <span class="spacer"></span><span class="xs muted">问助手即可</span></div>
    <div class="row menu-item"><span class="ico">推</span>提醒设置 <span class="spacer"></span><span class="xs muted">异动/复盘推送已开启</span></div>
    <div class="row menu-item"><span class="ico">话</span>术语解释库 <span class="spacer"></span><span class="xs muted">${Object.keys(DATA.terms).length} 个 · 点正文术语即可</span></div>
    <div class="row menu-item"><span class="ico">介</span>关于本产品 <span class="spacer"></span><span class="chev muted">›</span></div>
  </div>
  <div class="disclaimer"><b>内容不构成投资建议</b>：本产品为信息解读智能体助手原型，所有数据均为虚构演示，不构成任何投资建议。</div>`;
  el.innerHTML = h;
  el.querySelectorAll('[data-sid]').forEach(w => {
    w.addEventListener('click', () => {
      const sym = DATA.symbols[w.dataset.sid];
      switchTab('chat');
      setTimeout(() => handleSend('看看' + sym.name), 150);
    });
  });
  const sig = $('#menuSignal');
  if (sig) sig.addEventListener('click', () => {
    switchTab('chat');
    setTimeout(() => handleSend('还有什么信号'), 150);
  });
}

/* =========================================================
   八、事件绑定（证据链手风琴 / 公告折叠 / 术语气泡）
   ========================================================= */
function bindNode(root) {
  if (!root) return;
  root.querySelectorAll('[data-ev-toggle]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      btn.closest('.evidence-block').classList.toggle('open');
    });
  });
  root.querySelectorAll('[data-ann-toggle]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      btn.closest('.announce').classList.toggle('open');
    });
  });
  root.querySelectorAll('.term').forEach(t => {
    t.addEventListener('click', (e) => {
      e.stopPropagation();
      showTermBubble(t.dataset.term, t);
    });
  });
}

function showTermBubble(name, anchor) {
  const term = DATA.terms[name];
  if (!term) return;
  const bubble = $('#termBubble');
  $('#termBubbleName').textContent = term.name;
  $('#termBubbleText').textContent = term.text;
  $('#termBubbleExample').textContent = '举例：' + term.example;
  bubble.hidden = false;
  if (window.innerWidth < 480) {  // 小屏转底部抽屉（I-3）
    bubble.classList.add('sheet');
    bubble.style.left = '0px'; bubble.style.right = '0px';
    bubble.style.top = 'auto'; bubble.style.bottom = '16px';
    return;
  }
  bubble.classList.remove('sheet');
  const rect = anchor.getBoundingClientRect();
  const bW = bubble.offsetWidth, bH = bubble.offsetHeight;
  let left = Math.max(12, Math.min(rect.left + rect.width / 2 - bW / 2, window.innerWidth - bW - 12));
  let top = rect.top - bH - 10;
  if (top < 8) top = rect.bottom + 10;
  bubble.style.left = left + 'px';
  bubble.style.top = top + 'px';
  bubble.style.bottom = 'auto';
}

/* =========================================================
   九、Tab 切换与路由（刷新不丢当前 Tab）
   ========================================================= */
function switchTab(tab) {
  if (location.hash !== '#' + tab) location.hash = tab;
  else applyTab(tab);
}

function applyTab(tab) {
  state.tab = tab;
  $('#page-chat').hidden = tab !== 'chat';
  $('#page-anomaly').hidden = tab !== 'anomaly';
  $('#page-mine').hidden = tab !== 'mine';
  document.querySelectorAll('.tab-item').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  if (tab === 'anomaly') renderAnomaly();
  if (tab === 'mine') renderMine();
}

function onHashChange() {
  applyTab(parseHash().tab);
}

/* =========================================================
   十、初始化：合规弹窗 / 推送通知（S-1）/ 输入区 / 启动
   ========================================================= */
function initCompliance() {
  const modal = $('#complianceModal');
  let seen = false;
  try { seen = !!localStorage.getItem('trans_dc_seen'); } catch (e) {}
  if (seen) return;
  modal.hidden = false;
  $('#complianceOk').addEventListener('click', () => {
    try { localStorage.setItem('trans_dc_seen', '1'); } catch (e) {}
    modal.hidden = true;
    maybeShowPush();
  });
}

/* 类手机通知推送（S-1）→ 点击回到对话定位昆仑归因 */
function maybeShowPush() {
  if (state.pushShown || state.tab !== 'chat') return;
  state.pushShown = true;
  setTimeout(() => {
    const notice = $('#pushNotice');
    $('#pushTitle').textContent = '昆仑电子 午后放量拉升';
    $('#pushSub').textContent = '40 分钟涨 +4.8%，关联午间海外订单公告';
    notice.hidden = false;
  }, 900);
}

function initPush() {
  const notice = $('#pushNotice');
  $('#pushClose').addEventListener('click', (e) => { e.stopPropagation(); notice.hidden = true; });
  notice.addEventListener('click', (e) => {
    if (e.target.closest('#pushClose')) return;
    notice.hidden = true;
    scrollToMsg('msg-att-a-ky-01');   // I-1：推送直达归因
  });
}

function initComposer() {
  const chipsEl = $('#chips');
  chipsEl.innerHTML = CHIPS.map(c => `<button class="chip">${esc(c)}</button>`).join('');
  chipsEl.querySelectorAll('.chip').forEach(c => {
    c.addEventListener('click', () => handleSend(c.textContent));
  });
  const input = $('#chatInput');
  const send = () => handleSend(input.value);
  $('#sendBtn').addEventListener('click', send);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });
}

function initTermBubbleDismiss() {
  $('#termBubbleClose').addEventListener('click', () => { $('#termBubble').hidden = true; });
  document.addEventListener('click', (e) => {
    const b = $('#termBubble');
    if (!b.hidden && !e.target.closest('.term-bubble') && !e.target.closest('.term')) b.hidden = true;
  });
}

function initTabbar() {
  document.querySelectorAll('.tab-item').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });
}

function boot() {
  state.messages = buildScript();
  initTabbar();
  initCompliance();
  initPush();
  initComposer();
  initTermBubbleDismiss();
  renderChat();
  applyTab(parseHash().tab);
  window.addEventListener('hashchange', onHashChange);
  if (state.complianceSeen || (function () { try { return !!localStorage.getItem('trans_dc_seen'); } catch (e) { return false; } })()) {
    maybeShowPush();
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
