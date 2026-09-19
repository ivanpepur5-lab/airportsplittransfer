/* ==========================================================================
   PREMIUM TRANSFER — Shared UI behavior
   Sticky header blur, mobile nav, scroll reveal.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  // Sticky header glass — only once scrolled past the hero, so the header
  // stays a plain flat white (cheapest paint) on first load everywhere.
  const header = document.querySelector("header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Mobile nav
  const navToggle = document.querySelector(".nav-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  const mobileClose = document.querySelector(".mobile-close");
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", () => mobileNav.classList.add("open"));
  }
  if (mobileClose && mobileNav) {
    mobileClose.addEventListener("click", () => mobileNav.classList.remove("open"));
  }
  if (mobileNav) {
    mobileNav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => mobileNav.classList.remove("open")));
  }

  // Language switcher dropdown (mobile): click-to-toggle / outside-click / Escape.
  const DROPDOWN_SELECTOR = ".lang-dropdown";
  const DROPDOWN_TOGGLE_SELECTOR = ".lang-dropdown-btn";
  document.querySelectorAll(DROPDOWN_SELECTOR).forEach((wrap) => {
    const btn = wrap.querySelector(DROPDOWN_TOGGLE_SELECTOR);
    if (!btn) return;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = wrap.classList.toggle("open");
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  });
  document.addEventListener("click", (e) => {
    document.querySelectorAll(DROPDOWN_SELECTOR + ".open").forEach((wrap) => {
      if (!wrap.contains(e.target)) {
        wrap.classList.remove("open");
        const btn = wrap.querySelector(DROPDOWN_TOGGLE_SELECTOR);
        if (btn) btn.setAttribute("aria-expanded", "false");
      }
    });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(DROPDOWN_SELECTOR + ".open").forEach((wrap) => {
        wrap.classList.remove("open");
        const btn = wrap.querySelector(DROPDOWN_TOGGLE_SELECTOR);
        if (btn) btn.setAttribute("aria-expanded", "false");
      });
    }
  });

  // Scroll reveal
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add("in"));
  }

  // FAQ schema-safe accordions are static (no JS needed — content always visible for SEO)

  // Swipe carousels (Reviews, Journal) — Embla Carousel (js/vendor/embla-
  // carousel.umd.js) drives real drag/swipe momentum under the mobile
  // breakpoint. Desktop keeps the original static grid completely
  // untouched: the slides are wrapped in a .embla-container at runtime, but
  // that wrapper is `display:contents` above 640px (see css/style.css),
  // so the cards stay direct grid children there — Embla is simply never
  // initialized at that width.
  const ICON_CHEVRON_LEFT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>';
  const ICON_CHEVRON_RIGHT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>';

  function initCarousel(viewportSelector, itemSelector, dotsId, autoplayMs) {
    const viewport = document.querySelector(viewportSelector);
    if (!viewport) return;
    const items = Array.from(viewport.querySelectorAll(itemSelector));
    if (items.length < 2) return;
    const navWrap = document.getElementById(dotsId);
    const mq = window.matchMedia("(max-width:640px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let embla = null;
    let dots = [];
    let timer = null;
    let isVisible = false;
    let prepared = false;

    // Wrap the existing cards in an Embla container without touching any
    // HTML file — display:contents (desktop) makes this wrapper invisible
    // to the grid layout, so it's safe to insert. Deferred until the
    // carousel is actually approaching the viewport (see the "approach"
    // observer below) so this DOM work never competes with the initial
    // page load on pages that have it — including desktop, which never
    // calls this at all since Embla never runs there.
    function prepare() {
      if (prepared) return;
      prepared = true;
      const container = document.createElement("div");
      container.className = "embla-container";
      items.forEach(item => { item.classList.add("embla-slide"); container.appendChild(item); });
      viewport.appendChild(container);
      viewport.classList.add("embla-viewport");

      if (typeof EmblaCarousel === "undefined") {
        // Vendor script failed to load — fall back to plain native scroll-
        // snap so the cards are still swipeable, just without dots/autoplay.
        viewport.classList.add("embla-fallback");
        if (navWrap) navWrap.style.display = "none";
      }
    }

    function updateDots() {
      if (!embla) return;
      const selected = embla.selectedScrollSnap();
      dots.forEach((d, i) => d.classList.toggle("active", i === selected));
    }

    function buildNav() {
      if (!navWrap) return;
      navWrap.classList.remove("carousel-dots");
      navWrap.classList.add("carousel-nav");
      navWrap.innerHTML = "";

      const prevBtn = document.createElement("button");
      prevBtn.type = "button";
      prevBtn.className = "carousel-arrow";
      prevBtn.setAttribute("aria-label", "Previous slide");
      prevBtn.innerHTML = ICON_CHEVRON_LEFT;
      prevBtn.addEventListener("click", () => { stopAutoplay(); embla && embla.scrollPrev(); });

      const dotsInner = document.createElement("div");
      dotsInner.className = "carousel-dots";
      dots = items.map((_, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Go to slide " + (i + 1));
        b.addEventListener("click", () => { stopAutoplay(); embla && embla.scrollTo(i); });
        dotsInner.appendChild(b);
        return b;
      });

      const nextBtn = document.createElement("button");
      nextBtn.type = "button";
      nextBtn.className = "carousel-arrow";
      nextBtn.setAttribute("aria-label", "Next slide");
      nextBtn.innerHTML = ICON_CHEVRON_RIGHT;
      nextBtn.addEventListener("click", () => { stopAutoplay(); embla && embla.scrollNext(); });

      navWrap.append(prevBtn, dotsInner, nextBtn);
    }

    function startAutoplay() {
      if (reducedMotion || !embla || !isVisible) return;
      stopAutoplay();
      timer = setInterval(() => embla.scrollNext(), autoplayMs);
    }
    function stopAutoplay() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    function setup() {
      prepare();
      if (embla || typeof EmblaCarousel === "undefined") return;
      embla = EmblaCarousel(viewport, { loop: true, align: "center" });
      buildNav();
      embla.on("select", updateDots);
      embla.on("pointerDown", stopAutoplay);
      updateDots();
      startAutoplay();
    }
    function teardown() {
      if (!embla) return;
      stopAutoplay();
      embla.destroy();
      embla = null;
    }

    // Only autoplay while the carousel is actually on screen — besides being
    // the sane behavior, this also guarantees the very first automatic
    // advance can never happen before the visitor has scrolled anywhere near it.
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isVisible = entry.isIntersecting;
          if (isVisible) startAutoplay(); else stopAutoplay();
        });
      }, { threshold: 0.4 }).observe(viewport);

      // Defer the DOM wrap + Embla init themselves until the carousel is
      // roughly a screen away — keeps this entirely off the critical
      // initial-load path instead of racing booking-widget/klaro/etc. on
      // DOMContentLoaded for a section that's below the fold anyway.
      const approach = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            approach.disconnect();
            if (mq.matches) setup();
          }
        });
      }, { rootMargin: "600px 0px" });
      approach.observe(viewport);
    } else {
      isVisible = true;
      if (mq.matches) setup();
    }

    mq.addEventListener("change", (e) => { if (e.matches) setup(); else teardown(); });
  }

  initCarousel(".testi-grid", ".testi-card", "testi-dots", 5000);
  initCarousel(".blog-grid-carousel", ".blog-card", "blog-dots", 6000);
});
