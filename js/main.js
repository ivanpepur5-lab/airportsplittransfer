/* ==========================================================================
   PREMIUM TRANSFER — Shared UI behavior
   Sticky header blur, mobile nav, scroll reveal.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
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

  // Mobile swipe carousels (Reviews, Journal) — native scroll-snap for touch,
  // this just adds autoplay + synced dot pagination. Desktop keeps the
  // original static grid untouched (autoplay only runs under the mobile
  // media query, and dots are hidden above it).
  function initCarousel(trackSelector, itemSelector, dotsId, autoplayMs) {
    const track = document.querySelector(trackSelector);
    if (!track) return;
    const items = track.querySelectorAll(itemSelector);
    if (items.length < 2) return;
    const dotsWrap = document.getElementById(dotsId);
    const mq = window.matchMedia("(max-width:640px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let dots = [];
    let activeIndex = 0;
    let timer = null;

    function updateDots() {
      dots.forEach((d, i) => d.classList.toggle("active", i === activeIndex));
    }

    function scrollToIndex(i) {
      activeIndex = (i + items.length) % items.length;
      items[activeIndex].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      updateDots();
    }

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      dots = Array.from(items).map((_, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Go to slide " + (i + 1));
        b.addEventListener("click", () => { stopAutoplay(); scrollToIndex(i); });
        dotsWrap.appendChild(b);
        return b;
      });
      updateDots();
    }

    function syncActiveFromScroll() {
      const trackRect = track.getBoundingClientRect();
      const centerX = trackRect.left + trackRect.width / 2;
      let closest = 0, closestDist = Infinity;
      items.forEach((item, i) => {
        const r = item.getBoundingClientRect();
        const dist = Math.abs((r.left + r.width / 2) - centerX);
        if (dist < closestDist) { closestDist = dist; closest = i; }
      });
      if (closest !== activeIndex) { activeIndex = closest; updateDots(); }
    }

    let scrollTimeout;
    track.addEventListener("scroll", () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(syncActiveFromScroll, 80);
    }, { passive: true });

    track.addEventListener("touchstart", stopAutoplay, { passive: true });

    function startAutoplay() {
      if (reducedMotion || !mq.matches) return;
      stopAutoplay();
      timer = setInterval(() => scrollToIndex(activeIndex + 1), autoplayMs);
    }
    function stopAutoplay() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    buildDots();
    startAutoplay();
    mq.addEventListener("change", (e) => { if (e.matches) startAutoplay(); else stopAutoplay(); });
  }

  initCarousel(".testi-grid", ".testi-card", "testi-dots", 5000);
  initCarousel(".blog-grid-carousel", ".blog-card", "blog-dots", 6000);
});
