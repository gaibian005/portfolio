# Weicheng Xin · Portfolio

**English** ｜ [跳转到中文说明](#中文说明)

Digital product manager, class of 2027. I understand finance operations, and I can turn processes
into systems that actually shipped.

**Live site:** <https://gaibian005.github.io/portfolio/> — bilingual, with an EN / 中文 switch in the navigation.

---

## What is in here

| Path | What it is |
| --- | --- |
| [`index.html`](./index.html) | Bilingual landing page (English / Chinese switch) that links everything below |
| [`resumes/`](./resumes/) | One-page resume: `Xin-Weicheng-Resume-EN.pdf` (English) and `Xin-Weicheng-Resume-CN.pdf` (Chinese) — the landing page links to whichever matches the selected language |
| [`portfolio/Xin-Weicheng-Portfolio.pdf`](./portfolio/Xin-Weicheng-Portfolio.pdf) | 15-page portfolio in Chinese: four case studies with product screenshots, numbers and design trade-offs |
| [`prototype/`](./prototype/) | Interactive high-fidelity prototype of a conversational market-insight assistant (HTML5 + CSS3 + vanilla JS, no framework, runs offline) |

## Case studies, and how they rank

The portfolio is built on three tiers: one core case carries the product claim, two supporting cases
prove the method, and one backing study shows how I read rules that are still being written.

| Tier | Case | What it proves |
| --- | --- | --- |
| ★ Core | **Overseas expense control system** (COROS, finance digitalisation) | Requirements and solution design for nine modules, three approval flows, and the boundaries to four external systems; went live on 1 September 2026 |
| ◆ Supporting | **Document master-data extraction & cleanup** | Tens of thousands of legacy documents turned into structured, auditable master data |
| ◆ Supporting | **Market insight assistant** (Tencent AI Bootcamp) | Defining a product where no reference exists: evidence chains, a tri-state output model and an explicit launch bar |
| ○ Backing | **EU product-access compliance study** | How I read rules that are still being negotiated, and what they change in system design |

## Selected numbers

- 2026.09.01 — the expense control system went live; development finished 20 days ahead of plan
- 85%+ of invoice and contract records, 90%+ of supplier records, and 70%+ of in-transit contracts and
  drawdown records loaded into the master-data hub, saving the finance team 1–2 months of manual work
- 80%+ match rate between the two legacy workflows, verified through two independent trails
  (MD5 hash, file size, text content versus the document-to-SAP path)
- 8 accounting-automation requirements shipped, cutting average manual time by 80%

## Data note

Everything here is desensitised: internal links and system addresses are removed, colleagues are shown
as role names, and internal codes appear as demo values. Company and institution names are kept only
where they make the experience verifiable.

## Running the prototype locally

```bash
cd prototype
python -m http.server 8000
# then open http://localhost:8000
```

Or just open `prototype/index.html` directly in a browser.

## Contact

Weicheng Xin · (+86) 177 7119 5591 · 418794028@qq.com

---

## 中文说明

**数字化产品经理 · 2027 届**。我懂财务业务，也能把流程做成真的能上线的系统。

**在线作品集：** <https://gaibian005.github.io/portfolio/> —— 中英双语，导航栏右上角可切换。

### 仓库里有什么

| 路径 | 说明 |
| --- | --- |
| [`index.html`](./index.html) | 双语落地页（中英切换），作品集与原型的总入口 |
| [`resumes/`](./resumes/) | 一页纸简历：`Xin-Weicheng-Resume-CN.pdf`（中文）与 `Xin-Weicheng-Resume-EN.pdf`（英文），落地页按当前语言自动指向对应版本 |
| [`portfolio/Xin-Weicheng-Portfolio.pdf`](./portfolio/Xin-Weicheng-Portfolio.pdf) | 15 页中文作品集：四件作品，含系统截图、关键数字与设计取舍 |
| [`prototype/`](./prototype/) | 可交互高保真原型：面向非专业投资者的对话式行情助手（HTML5 + CSS3 + 原生 JS，无框架，可离线运行） |

### 四件作品与层级

作品集按三个层级组织：主案例承担产品能力的主要举证，支撑案例证明方法与可信设计，背景背书证明对规则变化的判断。

| 层级 | 作品 | 证明什么 |
| --- | --- | --- |
| ★ 主案例 | **海外费用控制系统**（高驰 COROS · 财务数字化） | 九个模块的需求与产品方案、三条独立审批流、四个外部系统边界；2026 年 9 月 1 日正式上线 |
| ◆ 支撑案例 | **单据主数据清洗与重构** | 上万份旧单据做成可进主数据中心、可审计的结构化数据 |
| ◆ 支撑案例 | **行情翻译官与异动侦探**（腾讯 AI 训练营） | 没有标准答案时定义产品：证据链、三种输出态与明确的上线门槛 |
| ○ 背景背书 | **欧盟产品准入合规研究** | 规则仍在博弈阶段时怎么判断，以及它对系统设计的影响 |

### 关键数字

- **2026.09.01** 费控系统正式上线，开发完成比计划提前 20 天
- **85%+** 发票与合同信息、**90%+** 供应商信息、**70%+** 在途合同与提款单核销记录进入主数据中心，
  直接减少财务团队 1–2 个月工作量
- **80%+** 双流程勾稽率，靠两套独立线索互相印证（文件哈希 / 大小 / 文本内容 对比 单据到 SAP 的链路）
- **8 个**核算自动化需求落地，平均工作耗时缩短 80%

### 数据说明

仓库内所有数据均已脱敏：内部链接与系统地址已删除，同事姓名按角色替换，内部编码以示例值呈现；
公司与机构名称仅保留在便于核实经历的位置。

### 联系方式

辛伟城 · (+86) 177 7119 5591 · 418794028@qq.com
