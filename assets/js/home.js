/* 首页交互 —— 原 index.html 内联脚本，原样迁出 */
(function () {
  "use strict";

  document.documentElement.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- 语言切换 ---------------- */
  var root = document.documentElement;
  var switchBtn = document.getElementById("langSwitch");
  var TITLES = {
    en: "Weicheng Xin · Portfolio",
    zh: "辛伟城 · 作品集"
  };

  function applyLang(lang) {
    var next = lang === "zh" ? "zh" : "en";
    root.setAttribute("data-lang", next);
    root.setAttribute("lang", next === "zh" ? "zh-CN" : "en");
    document.title = TITLES[next];
    try { window.localStorage.setItem("portfolio-lang", next); } catch (err) { /* 私密模式忽略 */ }
    // 简历有两份（中文版 / 英文版），跟随语言切换指向对应文件
    document.querySelectorAll("[data-href-en][data-href-zh]").forEach(function (el) {
      var target = next === "zh" ? el.getAttribute("data-href-zh") : el.getAttribute("data-href-en");
      if (target) el.setAttribute("href", target);
    });
  }

  var saved = null;
  try { saved = window.localStorage.getItem("portfolio-lang"); } catch (err) { saved = null; }
  var initial = saved || ((navigator.language || "").toLowerCase().indexOf("zh") === 0 ? "zh" : "en");
  applyLang(initial);

  if (switchBtn) {
    switchBtn.addEventListener("click", function () {
      applyLang(root.getAttribute("data-lang") === "zh" ? "en" : "zh");
    });
    switchBtn.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        applyLang(root.getAttribute("data-lang") === "zh" ? "en" : "zh");
      }
    });
  }

  /* ---------------- 导航滚动与进度条 ---------------- */
  var nav = document.getElementById("nav");
  var progress = document.getElementById("progress");

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle("solid", y > 24);
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------- 进场动效 ---------------- */
  var revealItems = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function revealAll() {
    revealItems.forEach(function (el) { el.classList.add("in"); });
  }

  if (reduce || !("IntersectionObserver" in window)) {
    revealAll();
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });
    revealItems.forEach(function (el) { observer.observe(el); });

    // 首屏元素立即入场，不等滚动
    window.requestAnimationFrame(function () {
      document.querySelectorAll(".hero .reveal").forEach(function (el) {
        el.classList.add("in");
        observer.unobserve(el);
      });
    });

    // 兜底：若 2.5 秒内一个区块都没触发（观察器被环境禁用等），
    // 才整体显示，保证内容永远可见，同时不影响正常的滚动动效
    window.setTimeout(function () {
      var triggered = document.querySelectorAll(".reveal.in").length;
      if (triggered <= document.querySelectorAll(".hero .reveal").length) {
        revealAll();
      }
      // 再兜一层：把仍未完全显示的元素直接复位，避免动画未执行时停在透明状态
      document.querySelectorAll(".reveal").forEach(function (el) {
        el.classList.add("in");
        if (parseFloat(getComputedStyle(el).opacity) < 0.99) {
          el.style.opacity = "1";
          el.style.transform = "none";
        }
      });
    }, 2500);
  }

  /* ---------------- 卡片轻微跟随鼠标 ---------------- */
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".project").forEach(function (cardEl) {
      cardEl.addEventListener("mousemove", function (event) {
        var rect = cardEl.getBoundingClientRect();
        var dx = (event.clientX - rect.left) / rect.width - 0.5;
        var dy = (event.clientY - rect.top) / rect.height - 0.5;
        cardEl.style.transform =
          "translateY(-4px) rotateX(" + (-dy * 1.6).toFixed(2) + "deg) rotateY(" +
          (dx * 1.6).toFixed(2) + "deg)";
      });
      cardEl.addEventListener("mouseleave", function () { cardEl.style.transform = ""; });
    });
  }
})();
