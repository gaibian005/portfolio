/* 原型冒烟交互测试（Node 环境，无浏览器）
   运行：node test-smoke.js
   说明：stub 最小 DOM，加载 script.js 全部逻辑，
   验证对话剧本、追问引擎、消息渲染、富文本安全等核心交互链路 */
'use strict';
const fs = require('fs');
const assert = require('assert');

global.document = {
  readyState: 'loading',
  addEventListener() {},
  getElementById() { return null; },
  querySelector() { return null; },
  querySelectorAll() { return []; },
  createElement() { return { className: '', innerHTML: '', classList: { add() {}, remove() {}, toggle() {} }, appendChild() {} }; }
};
global.window = { innerWidth: 1200, addEventListener() {} };
global.location = { hash: '' };
global.localStorage = { getItem: () => null, setItem() {} };
global.requestAnimationFrame = (fn) => {};

const src = fs.readFileSync(__dirname + '/script.js', 'utf8');
const testCode = `
;(function () {
  const assert = require('assert');
  const T = (name, fn) => { try { fn(); console.log('PASS  ' + name); } catch (e) { console.log('FAIL  ' + name + ' :: ' + e.message); process.exitCode = 1; } };

  T('数据规模：7 标的 / 8 异动 / 8 归因 / 2 内容', () => {
    assert.strictEqual(Object.keys(DATA.symbols).length, 7);
    assert.strictEqual(DATA.anomalies.length, 8);
    assert.strictEqual(DATA.attributions.length, 8);
    assert.strictEqual(DATA.contents.length, 2);
  });

  T('剧本：7 条消息，含 3 条自选归因主动推送（聚焦用户标的）', () => {
    const s = buildScript();
    assert.strictEqual(s.length, 7);
    const atts = s.filter(m => m.type === 'attribution');
    assert.strictEqual(atts.length, 3);
    assert.ok(atts.every(m => m.pushed === true));
    assert.ok(atts.some(m => m.anomalyId === 'a-ky-01'));
    assert.ok(atts.some(m => m.anomalyId === 'a-sh-01'));
    assert.ok(atts.some(m => m.anomalyId === 'a-blj-01'));
    assert.ok(!atts.some(m => m.anomalyId === 'a-sy-01')); // 非自选默认不推
  });

  T('剧本：晨报+复盘+大盘+欢迎语齐备', () => {
    const s = buildScript();
    assert.ok(s.some(m => m.type === 'content' && m.contentId === 'c-chenbao-0907'));
    assert.ok(s.some(m => m.type === 'content' && m.contentId === 'c-fupan-0907'));
    assert.ok(s.some(m => m.type === 'market'));
    assert.ok(s[0].html.includes('自选'));
  });

  T('S-1：昆仑归因卡含 4 条证据链与白话结论', () => {
    const html = attributionInner('a-ky-01');
    assert.ok(html.includes('白话归因结论'));
    assert.ok(html.includes('公告'));
    assert.ok((html.match(/data-ev-toggle/g) || []).length === 4);
    assert.ok(html.includes('2.6 亿'));
    assert.ok(html.includes('推理路径'));
    assert.ok(html.includes('不构成投资建议'));
  });

  T('S-4：松韵存疑卡为灰色诚实态，绝不伪装结论', () => {
    const html = attributionInner('a-sy-01');
    assert.ok(html.includes('暂无可验证归因'));
    assert.ok(html.includes('存疑'));
    assert.ok(html.includes('已排查'));
    assert.ok(!html.includes('✓ 白话归因结论'));
  });

  T('S-2：公告三句话消息含 发生什么/意味着什么/要注意什么', () => {
    const html = announceInner('ann-ky-1', 'ky');
    assert.ok(html.includes('发生什么'));
    assert.ok(html.includes('意味着什么'));
    assert.ok(html.includes('要注意什么'));
    assert.ok(html.includes('不构成任何买卖建议'));
  });

  T('追问：我的自选今天怎么样 → 概览+定位昆仑归因', () => {
    const r = answerFor('我的自选今天怎么样');
    assert.ok(r.msgs[0].html.includes('昆仑电子'));
    assert.ok(r.msgs[0].html.includes('星河生物'));
    assert.ok(r.msgs[0].html.includes('蓝鲸科技'));
    assert.strictEqual(r.scroll, 'msg-att-a-ky-01');
  });

  T('追问：昆仑电子为什么涨 → 定位到归因消息', () => {
    const r = answerFor('昆仑电子为什么涨');
    assert.strictEqual(r.scroll, 'msg-att-a-ky-01');
  });

  T('追问：这个归因可靠吗 → 证据链说明+定位', () => {
    const r = answerFor('这个归因可靠吗');
    assert.ok(r.msgs[0].html.includes('4 条来源'));
    assert.strictEqual(r.scroll, 'msg-att-a-ky-01');
  });

  T('追问：还有什么信号 → 含松韵存疑诚实提示（S-4 入口）', () => {
    const r = answerFor('还有什么信号');
    assert.ok(r.msgs[0].html.includes('存疑'));
    assert.ok(r.msgs[0].html.includes('松韵'));
  });

  T('追问：松韵为什么跌 → 贴出存疑归因卡', () => {
    const r = answerFor('松韵为什么跌');
    assert.ok(r.msgs.some(m => m.type === 'attribution' && m.anomalyId === 'a-sy-01'));
  });

  T('追问：看看蓝鲸科技 → 贴标的卡（I-7 自选关联）', () => {
    const r = answerFor('看看蓝鲸科技');
    assert.ok(r.msgs.some(m => m.type === 'symbol' && m.sid === 'blj'));
  });

  T('追问：放量是什么意思 → 术语解释消息（I-3）', () => {
    const r = answerFor('放量是什么意思');
    assert.ok(r.msgs.some(m => m.type === 'terms'));
    assert.ok(termsInner(['放量', '量比']).includes('量是价格的'));
  });

  T('追问：大盘 → 贴大盘速览卡', () => {
    const r = answerFor('今天大盘怎么样');
    assert.ok(r.msgs.some(m => m.type === 'market'));
    assert.ok(marketInner().includes('+0.6%'));
  });

  T('兜底：未知问题 → 诚实引导不装懂', () => {
    const r = answerFor('明天买什么好');
    assert.ok(r.msgs[0].html.includes('不装懂'));
  });

  T('chips 全部有对应追问路径', () => {
    CHIPS.forEach(c => {
      const r = answerFor(c);
      assert.ok(r.msgs.length > 0, 'chip 无回答: ' + c);
    });
  });

  T('消息渲染：用户/助手气泡与主动推送标识', () => {
    const u = msgHtml({ id: 'x1', role: 'user', type: 'text', time: '10:00', html: 'hi' });
    assert.ok(u.includes('msg user'));
    const a = msgHtml({ id: 'x2', role: 'assistant', type: 'text', time: '10:01', html: 'ok', pushed: true });
    assert.ok(a.includes('msg assistant'));
    assert.ok(a.includes('主动推送'));
  });

  T('复盘长消息：含自选故事线与免责', () => {
    const html = contentInner('c-fupan-0907');
    assert.ok(html.includes('盘后复盘'));
    assert.ok(html.includes('昆仑电子'));
    assert.ok(html.includes('归因存疑'));
    assert.ok(html.includes('不构成投资建议'));
  });

  T('安全：富文本白名单转义（b/term 保留，script 注入被转义）', () => {
    const out = renderRich('<b>加粗</b><term data-term="量比">量比</term><script>alert(1)</script>');
    assert.ok(out.includes('<b>加粗</b>'));
    assert.ok(out.includes('<term data-term="量比">量比</term>'));
    assert.ok(!out.includes('<script>'));
    assert.ok(out.includes('&lt;script&gt;'));
  });

  T('路由：#chat/att/a-ky-01 深链解析', () => {
    location.hash = '#chat/att/a-ky-01';
    const r = parseHash();
    assert.strictEqual(r.tab, 'chat');
    location.hash = '#anomaly';
    assert.strictEqual(parseHash().tab, 'anomaly');
    location.hash = '';
  });

  console.log('---- smoke done ----');
})();
`;

try {
  eval(src + testCode);
} catch (e) {
  console.error('LOAD FAIL ::', e.message);
  process.exitCode = 1;
}
