# Weicheng Xin - Portfolio

Digital product manager, class of 2027. I understand finance operations, and I can turn
processes into systems that actually ship.

**Live site:** <https://gaibian005.github.io/portfolio/>

## What is in here

| Path | What it is |
| --- | --- |
| [`portfolio/Xin-Weicheng-Portfolio.pdf`](./portfolio/Xin-Weicheng-Portfolio.pdf) | 15-page portfolio (Chinese, desensitised): four case studies with product screenshots, numbers and design trade-offs |
| [`prototype/`](./prototype/) | Interactive high-fidelity prototype of a conversational market-insight assistant (HTML5 + CSS3 + vanilla JS, no framework, runs offline) |
| [`index.html`](./index.html) | Landing page that links the two artifacts above |

## Case studies in the portfolio

1. **Overseas expense control system** - supplier, contract, invoice, payment and accounting-voucher
   flows brought online, from kickoff to UAT; phase-1 requirements and solution design.
2. **Document master-data extraction and cleanup** - tens of thousands of contracts and invoices turned
   into structured, auditable master data (JSON for machines, Excel for audit).
3. **Market Insight Assistant** - a conversational product for non-expert investors, with evidence
   chains, a tri-state attribution model and an explicit go/no-go quality bar.
4. **AI automation in finance** - two end-to-end agent cases (bulk attachment download; six-language
   invoice recognition) plus the methodology behind them.

## Selected numbers

- 85%+ of invoice and contract records, 90%+ of supplier records loaded into the master-data hub
- 80%+ match rate between the two legacy workflows (MD5 hash, file size, text content, SAP cross-links)
- 8 accounting-automation requirements shipped, cutting average manual time by 80%
- 47 of 62 six-language invoices passed automated review; the remaining 15 were classified and
  handed back to a human instead of being forced through

## Data note

Everything here is desensitised. Personal names are replaced with role names, internal links and
system addresses are removed, and internal codes are shown as demo values. Emails, company names and
institution names are kept only where they are needed to make the experience verifiable.

## Running the prototype locally

```bash
cd prototype
python -m http.server 8000
# then open http://localhost:8000
```

Or just open `prototype/index.html` directly in a browser.

## Contact

Weicheng Xin · (+86) 177 7119 5591 · 418794028@qq.com
