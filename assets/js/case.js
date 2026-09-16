/* 案例页交互 —— 原 case/overseas-expense/index.html 内联脚本，原样迁出 */
  (function () {
    "use strict";
    var root = document.documentElement;
    var btn = document.getElementById("langSwitch");
    var TITLES = {
      zh: "海外费控系统 · 案例 | 辛伟城",
      en: "Overseas expense control · case study | Weicheng Xin"
    };

    function apply(lang) {
      var next = lang === "zh" ? "zh" : "en";
      root.setAttribute("data-lang", next);
      root.setAttribute("lang", next === "zh" ? "zh-CN" : "en");
      document.title = TITLES[next];
      try { window.localStorage.setItem("portfolio-lang", next); } catch (err) { /* ignore */ }
    }

    var saved = null;
    try { saved = window.localStorage.getItem("portfolio-lang"); } catch (err) { saved = null; }
    apply(saved || ((navigator.language || "").toLowerCase().indexOf("zh") === 0 ? "zh" : "en"));

    if (btn) {
      btn.addEventListener("click", function () {
        apply(root.getAttribute("data-lang") === "zh" ? "en" : "zh");
      });
    }
  })();
