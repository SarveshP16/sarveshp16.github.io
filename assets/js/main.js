/* Theme toggle, cursor spotlight, scroll-linked nav, reveal-on-scroll. */

(function () {
  "use strict";

  var root = document.documentElement;
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------- theme */

  var toggle = document.querySelector(".theme-toggle");

  function syncToggleLabel() {
    if (!toggle) return;
    var isLight = root.getAttribute("data-theme") === "light";
    toggle.querySelector(".theme-toggle__label").textContent =
      isLight ? "Dark mode" : "Light mode";
  }

  if (toggle) {
    syncToggleLabel();
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      syncToggleLabel();
      try {
        localStorage.setItem("theme", next);
      } catch (e) {
        /* private mode, blocked storage — the choice just won't persist */
      }
    });
  }

  /* --------------------------------------------------------- spotlight */

  var spotlight = document.querySelector(".spotlight");

  if (spotlight && !prefersReduced && window.matchMedia("(pointer: fine)").matches) {
    var pending = false;
    var lastX = 0;
    var lastY = 0;

    window.addEventListener("pointermove", function (event) {
      lastX = event.clientX;
      lastY = event.clientY;
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        spotlight.style.setProperty("--mx", lastX + "px");
        spotlight.style.setProperty("--my", lastY + "px");
        spotlight.classList.add("is-lit");
        pending = false;
      });
    }, { passive: true });

    document.addEventListener("pointerleave", function () {
      spotlight.classList.remove("is-lit");
    });
  }

  /* --------------------------------------------------- scroll-spy nav */

  var links = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));
  var targets = links
    .map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    })
    .filter(Boolean);

  function updateActiveLink() {
    if (!targets.length) return;
    var mark = window.innerHeight * 0.35;
    var active = targets[0];

    targets.forEach(function (section) {
      if (section.getBoundingClientRect().top <= mark) active = section;
    });

    links.forEach(function (link) {
      var isActive = link.getAttribute("href") === "#" + active.id;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  var scrollQueued = false;
  function onScroll() {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(function () {
      updateActiveLink();
      scrollQueued = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateActiveLink();

  /* ------------------------------------------------ reveal on scroll */

  var revealables = document.querySelectorAll(".reveal");

  if (prefersReduced || !("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(revealables, function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    // threshold 0 so tall blocks still reveal on short screens, where 10% of
    // the element may never be on screen at once.
    { rootMargin: "0px 0px -8% 0px", threshold: 0 }
  );

  Array.prototype.forEach.call(revealables, function (el) {
    observer.observe(el);
  });
})();
