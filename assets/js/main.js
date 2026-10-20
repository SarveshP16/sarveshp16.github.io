/* Page choreography: boot overlay, hero intro (scramble + typing), nav,
   mobile menu, scroll reveals, pipeline and timeline progress, counters,
   card tilt, magnetic buttons, and the status-bar clocks.

   GSAP is loaded from a CDN. If it fails, every section still renders in its
   final state — nothing here is load-bearing for the content. */

(function () {
  "use strict";

  var root = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  var hasGsap = !!(gsap && ScrollTrigger) && !reduced;

  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ------------------------------------------------------------ misc */

  var year = $("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------------------------------------------------- text effects */

  var GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&@<>/=+*";

  // Resolve each character from random glyphs, left to right.
  function scramble(el, duration, delay) {
    var finalText = el.getAttribute("data-text") || el.textContent;
    el.setAttribute("data-text", finalText);
    if (reduced) { el.textContent = finalText; return; }

    var chars = finalText.split("");
    var resolveAt = chars.map(function (_, i) {
      return (0.2 + 0.8 * (i / chars.length)) * duration + Math.random() * 180;
    });
    var start = null;
    cancelAnimationFrame(el._scrambleFrame);

    function tick(now) {
      if (start === null) start = now + (delay || 0);
      var t = now - start;
      var out = "";
      var done = true;
      for (var i = 0; i < chars.length; i++) {
        if (chars[i] === " " || t >= resolveAt[i]) {
          out += chars[i];
        } else {
          done = false;
          out += t < 0 ? chars[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
      }
      el.textContent = out;
      if (!done) el._scrambleFrame = requestAnimationFrame(tick);
    }
    el._scrambleFrame = requestAnimationFrame(tick);
  }

  // Type, hold, delete, next — forever.
  function typeLoop(el, words) {
    if (reduced || !words.length) return;
    var wordIndex = 0;
    var charIndex = words[0].length;
    var deleting = true;

    function step() {
      var word = words[wordIndex];
      if (deleting) {
        charIndex--;
        el.textContent = word.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
          return setTimeout(step, 280);
        }
        return setTimeout(step, 32);
      }
      var next = words[wordIndex];
      charIndex++;
      el.textContent = next.slice(0, charIndex);
      if (charIndex === next.length) {
        deleting = true;
        return setTimeout(step, 2400);
      }
      setTimeout(step, 60 + Math.random() * 55);
    }
    setTimeout(step, 2600);
  }

  /* ------------------------------------------------------ hero intro */

  // The hero fades in via CSS (see style.css), starting at first paint. This
  // script may run later than that if the CDN is slow, so time the text
  // effects against page load rather than against when this line runs.
  var booting = root.classList.contains("boot-on");
  var heroStartsAt = booting ? 1500 : 120;
  var untilHero = Math.max(0, heroStartsAt - performance.now());

  $$("[data-scramble]").forEach(function (line, i) {
    scramble(line, 1100, untilHero + i * 180);
  });

  var typed = $("[data-typed]");
  if (typed) {
    var words = [];
    try { words = JSON.parse(typed.getAttribute("data-typed")); } catch (e) {}
    setTimeout(function () { typeLoop(typed, words); }, untilHero);
  }

  // Re-scramble the name on hover — a small reward for poking at it.
  var heroName = $(".hero__name");
  if (heroName && finePointer) {
    var lastScramble = 0;
    heroName.addEventListener("pointerenter", function () {
      var now = Date.now();
      if (now - lastScramble < 1400) return;
      lastScramble = now;
      $$("[data-scramble]").forEach(function (line, i) { scramble(line, 700, i * 90); });
    });
  }

  /* ---------------------------------------------------- boot overlay */

  // CSS fades the overlay out by ~2.15s. Once it's gone, drop it from the DOM
  // and clear boot-on so its scroll lock stops applying.
  var boot = $(".boot");
  setTimeout(function () {
    root.classList.remove("boot-on");
    if (boot) boot.remove();
  }, booting ? Math.max(0, 2200 - performance.now()) : 0);

  /* ------------------------------------------------------------- nav */

  var nav = $("[data-nav]");
  var progress = $("[data-progress]");
  var navLinks = $$(".nav__links a[href^='#']");
  var sections = navLinks
    .map(function (a) { return $(a.getAttribute("href")); })
    .filter(Boolean);
  var lastY = window.scrollY;
  var menuOpen = false;

  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;

    nav.classList.toggle("is-scrolled", y > 24);
    nav.classList.toggle("is-hidden", !menuOpen && y > 500 && y > lastY + 4);
    if (y < lastY - 4 || y < 500) nav.classList.remove("is-hidden");
    lastY = y;

    if (progress) progress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";

    var mark = window.innerHeight * 0.4;
    var active = null;
    sections.forEach(function (s) {
      if (s.getBoundingClientRect().top <= mark) active = s;
    });
    navLinks.forEach(function (a) {
      var on = !!active && a.getAttribute("href") === "#" + active.id;
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }

  var queued = false;
  window.addEventListener("scroll", function () {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { onScroll(); queued = false; });
  }, { passive: true });
  onScroll();

  /* ----------------------------------------------------- mobile menu */

  var toggle = $(".nav__toggle");
  var menu = $("#mobile-menu");

  function setMenu(open) {
    menuOpen = open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      nav.classList.remove("is-hidden");
      if (hasGsap) {
        gsap.fromTo($$("a", menu),
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6, ease: "expo.out", stagger: 0.05 }
        );
      }
      var first = $("a", menu);
      if (first) first.focus();
    }
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () { setMenu(!menuOpen); });
    $$("a", menu).forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menuOpen) {
        setMenu(false);
        toggle.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (menuOpen && window.innerWidth >= 900) setMenu(false);
    });
  }

  /* ------------------------------------------------- status clocks */

  function pad(n) { return n < 10 ? "0" + n : String(n); }
  var clock = $("[data-clock]");
  var session = $("[data-session]");
  var startedAt = Date.now();

  function tick() {
    var now = new Date();
    if (clock) clock.textContent = pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
    if (session) {
      var s = Math.floor((Date.now() - startedAt) / 1000);
      session.textContent = pad(Math.floor(s / 3600)) + ":" + pad(Math.floor(s / 60) % 60) + ":" + pad(s % 60);
    }
  }
  tick();
  setInterval(tick, 1000);

  /* ------------------------------------------- without GSAP: finish */

  if (!hasGsap) {
    $$(".stage").forEach(function (s) { s.classList.add("is-on"); });
    return;
  }

  /* -------------------------------------------------- scroll reveals */

  gsap.set("[data-reveal]", { opacity: 0, y: 40 });
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 88%",
    once: true,
    onEnter: function (batch) {
      gsap.to(batch, { opacity: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.09, overwrite: true });
    }
  });

  // Pipeline: the connector fills with scroll, and each stage lights as the
  // fill reaches it.
  var pipeline = $("[data-pipeline]");
  if (pipeline) {
    var stages = $$(".stage", pipeline);
    gsap.set(stages, { opacity: 0, y: 40 });
    ScrollTrigger.batch(stages, {
      start: "top 90%",
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.08 });
      }
    });

    gsap.set(pipeline, { "--progress": 0 });
    gsap.to(pipeline, {
      "--progress": 1,
      ease: "none",
      scrollTrigger: {
        trigger: pipeline,
        start: "top 78%",
        end: "bottom 55%",
        scrub: 0.6,
        onUpdate: function (self) {
          stages.forEach(function (stage, i) {
            stage.classList.toggle("is-on", self.progress >= (i + 0.35) / stages.length);
          });
        }
      }
    });
  }

  // Timeline spine draws down as you read.
  var timeline = $("[data-timeline]");
  if (timeline) {
    gsap.set(timeline, { "--progress": 0 });
    gsap.to(timeline, {
      "--progress": 1,
      ease: "none",
      scrollTrigger: { trigger: timeline, start: "top 70%", end: "bottom 60%", scrub: 0.6 }
    });
  }

  // Hero: drift the copy up and dim the background network as you leave it.
  gsap.to(".hero__inner", {
    y: -80,
    opacity: 0.25,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });
  gsap.to(".net", {
    opacity: 0.28,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });

  // Section titles: a slight horizontal settle as they arrive.
  $$(".section-title").forEach(function (title) {
    gsap.from(title, {
      x: -24,
      duration: 1.2,
      ease: "expo.out",
      scrollTrigger: { trigger: title, start: "top 88%", once: true }
    });
  });

  /* --------------------------------------------------------- counters */

  $$("[data-count]").forEach(function (el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var state = { v: 0 };
    el.textContent = "0" + suffix;
    ScrollTrigger.create({
      trigger: el,
      start: "top 92%",
      once: true,
      onEnter: function () {
        gsap.to(state, {
          v: target,
          duration: 1.8,
          ease: "power2.out",
          onUpdate: function () { el.textContent = Math.round(state.v) + suffix; }
        });
      }
    });
  });

  /* ------------------------------------------- tilt and magnetic hover */

  if (finePointer) {
    $$("[data-tilt]").forEach(function (card) {
      var rx = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3.out" });
      var ry = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3.out" });
      gsap.set(card, { transformPerspective: 900 });

      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        ry((px - 0.5) * 9);
        rx((0.5 - py) * 9);
        card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
      });
      card.addEventListener("pointerleave", function () { rx(0); ry(0); });
    });

    $$("[data-magnetic]").forEach(function (btn) {
      var mx = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3.out" });
      var my = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3.out" });
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        mx((e.clientX - (r.left + r.width / 2)) * 0.25);
        my((e.clientY - (r.top + r.height / 2)) * 0.35);
      });
      btn.addEventListener("pointerleave", function () { mx(0); my(0); });
    });
  }

  // Web fonts change line lengths; re-measure once they land.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
})();
