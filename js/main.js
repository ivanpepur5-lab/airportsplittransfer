/* ==========================================================================
   PREMIUM TRANSFER — Shared UI behavior
   Sticky header blur, mobile nav, scroll reveal.
   ========================================================================== */

// Shared GA4 "lead" event helper for forms other than the main booking
// widget, which has its own richer trackQualifyLead() in booking-widget.js
// (same event name and dataLayer/gtag pattern — see the comment there for
// why gtag() is also called directly with no GTM container installed yet).
// Used by the day-trip forms and the contact form, both of which load this
// file but not booking-widget.js.
function trackLeadEvent(params) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(Object.assign({ event: "qualify_lead" }, params));
  if (typeof gtag === "function") {
    gtag("event", "qualify_lead", params);
  }
}

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

  // Scroll reveal. Elements that come into view in the same batch (a row of
  // cards, a FAQ list) get a short staggered delay so they cascade in rather
  // than appearing on one frame. The delay is removed once the reveal has
  // played, so it never slows down the cards' own hover transitions later.
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      let batch = 0;
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        io.unobserve(el);
        // Leave elements with their own CSS delay (the hero sequence) alone.
        if (!el.style.transitionDelay && getComputedStyle(el).transitionDelay.split(",")[0].trim() === "0s") {
          const delay = Math.min(batch, 5) * 70;
          if (delay) {
            el.style.transitionDelay = delay + "ms";
            setTimeout(() => { el.style.transitionDelay = ""; }, delay + 900);
          }
          batch++;
        }
        el.classList.add("in");
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add("in"));
  }

  initMotionLayer(reduceMotion);

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
      const item = items[activeIndex];
      // Scroll only the carousel's own scrollLeft — never scrollIntoView(),
      // which walks up to the document and yanks the whole page's vertical
      // scroll position toward this section even when it's off-screen.
      const target = item.offsetLeft - (track.clientWidth - item.clientWidth) / 2;
      track.scrollTo({ left: target, behavior: "smooth" });
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

    let isVisible = false;

    function startAutoplay() {
      if (reducedMotion || !mq.matches || !isVisible) return;
      stopAutoplay();
      timer = setInterval(() => scrollToIndex(activeIndex + 1), autoplayMs);
    }
    function stopAutoplay() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    buildDots();

    // Only autoplay while the carousel is actually on screen — besides being
    // the sane behavior, this also guarantees the very first automatic
    // advance can never happen before the visitor has scrolled anywhere near it.
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isVisible = entry.isIntersecting;
          if (isVisible) startAutoplay(); else stopAutoplay();
        });
      }, { threshold: 0.4 }).observe(track);
    } else {
      isVisible = true;
      startAutoplay();
    }

    mq.addEventListener("change", (e) => { if (e.matches) startAutoplay(); else stopAutoplay(); });
  }

  initCarousel(".testi-grid", ".testi-card", "testi-dots", 5000);
  initCarousel(".blog-grid-carousel", ".blog-card", "blog-dots", 6000);

  // Count up numeric stats (ratings, review counts, distances) the first
  // time they scroll into view, instead of just displaying the final value.
  const countEls = document.querySelectorAll(".count-up");
  if ("IntersectionObserver" in window && countEls.length) {
    const countIo = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        countIo.unobserve(entry.target);
        const el = entry.target;
        const text = el.textContent;
        const match = text.match(/[\d.]+/);
        if (!match) return;
        const target = parseFloat(match[0]);
        const decimals = (match[0].split(".")[1] || "").length;
        const prefix = text.slice(0, match.index);
        const suffix = text.slice(match.index + match[0].length);
        const duration = 900;
        const start = performance.now();
        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    countEls.forEach((el) => countIo.observe(el));
  }

  // Blog category filter pills
  const catPills = document.querySelectorAll(".blog-categories .cat-pill");
  const blogCards = document.querySelectorAll(".blog-grid .blog-card");
  if (catPills.length && blogCards.length) {
    catPills.forEach((pill) => {
      pill.addEventListener("click", (e) => {
        e.preventDefault();
        catPills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        const cat = pill.dataset.cat;
        blogCards.forEach((card) => {
          const cardCat = card.querySelector(".blog-cat")?.textContent.trim();
          card.style.display = (cat === "all" || cardCat === cat) ? "" : "none";
        });
      });
    });
  }

  // Destinations page: live filter over the dest-card grids
  const destSearchInput = document.getElementById("dest-search-input");
  const destCards = document.querySelectorAll(".dest-grid .dest-card");
  if (destSearchInput && destCards.length) {
    const destGrids = document.querySelectorAll(".dest-grid");
    const destEmptyMsg = document.getElementById("dest-search-empty");
    const normalize = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    destSearchInput.addEventListener("input", () => {
      const q = normalize(destSearchInput.value.trim());
      let anyVisible = false;
      destGrids.forEach((grid) => {
        let gridHasMatch = false;
        grid.querySelectorAll(".dest-card").forEach((card) => {
          const name = normalize(card.querySelector("h3")?.textContent || "");
          const match = !q || name.includes(q);
          card.style.display = match ? "" : "none";
          if (match) gridHasMatch = true;
        });
        anyVisible = anyVisible || gridHasMatch;
        // Hide the section heading (and its intro paragraph) above an empty grid.
        let heading = grid.previousElementSibling;
        if (heading && !heading.classList.contains("section-head")) heading = null;
        if (heading) heading.style.display = gridHasMatch ? "" : "none";
      });
      if (destEmptyMsg) destEmptyMsg.style.display = anyVisible ? "none" : "block";
    });
  }
});

// --------------------------------------------------------------------------
// Motion layer — presentation only (see "MOTION LAYER" in css/style.css).
// Never touches form values, prices or booking state: it only reads what the
// booking scripts render and adds/removes CSS classes and a CSS variable.
// --------------------------------------------------------------------------
function initMotionLayer(reduceMotion) {
  // Sticky navbar: .is-scrolled once the page leaves the very top.
  const header = document.querySelector("header");
  if (header) {
    let ticking = false;
    const update = () => {
      ticking = false;
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  if (reduceMotion) return;

  // Parallax on destination photos. Only frames currently on screen are
  // updated, once per animation frame, via a CSS variable the stylesheet
  // turns into a transform (compositor-only, no layout).
  const frames = Array.from(document.querySelectorAll(".trip-hero picture, .trip-media picture, .custom-tour-bg"));
  if (frames.length && "IntersectionObserver" in window) {
    const live = new Set();
    let queued = false;
    const MAX_SHIFT = 0.05; // fraction of the frame height; CSS scale(1.12) leaves 6% headroom
    const render = () => {
      queued = false;
      const vh = window.innerHeight;
      live.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        // -1 when the frame's centre is at the bottom of the viewport, +1 at the top.
        const progress = Math.max(-1, Math.min(1, ((vh / 2) - (r.top + r.height / 2)) / (vh / 2 + r.height / 2)));
        el.style.setProperty("--parallax-y", (progress * MAX_SHIFT * r.height).toFixed(1) + "px");
      });
    };
    const queue = () => { if (!queued && live.size) { queued = true; requestAnimationFrame(render); } };
    const pio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { live.add(entry.target); entry.target.classList.add("parallax-live"); }
        else { live.delete(entry.target); entry.target.classList.remove("parallax-live"); }
      });
      queue();
    }, { rootMargin: "10% 0px" });
    frames.forEach((el) => pio.observe(el));
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue, { passive: true });
  }

  // Booking forms: a small "bump" when a price that is already showing
  // changes (switching one way / return, or a new route), so the change is
  // noticed. The booking widget is injected after load, so watch its mount.
  const lastText = new WeakMap();
  const bump = (el) => {
    el.classList.remove("is-bumped");
    void el.offsetWidth; // restart the animation
    el.classList.add("is-bumped");
  };
  const check = (el) => {
    const now = el.textContent.trim();
    const before = lastText.get(el);
    lastText.set(el, now);
    if (before && now && before !== now) bump(el);
  };
  const watchPrices = (root) => {
    const scan = () => root.querySelectorAll(".vopt-price[id], #submit-price").forEach(check);
    scan();
    new MutationObserver(scan).observe(root, { childList: true, characterData: true, subtree: true });
  };
  document.addEventListener("animationend", (e) => {
    if (e.animationName === "price-bump") e.target.classList.remove("is-bumped");
  });
  const mount = document.getElementById("booking-widget-mount");
  if (mount && "MutationObserver" in window) watchPrices(mount);
}

// Block past dates on every booking form (the EN widget is injected after
// load, so this works via delegation rather than a one-time query).
(function () {
  function today() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function applyMin(input) {
    let min = today();
    if (input.name === "return_date" && input.form) {
      const out = input.form.querySelector('input[name="date"]');
      if (out && out.value > min) min = out.value;
    }
    input.min = min;
  }
  function applyAll(root) {
    root.querySelectorAll('input[type="date"]').forEach(applyMin);
  }
  document.addEventListener("DOMContentLoaded", () => applyAll(document));
  document.addEventListener("focusin", (e) => {
    if (e.target.matches && e.target.matches('input[type="date"]')) applyMin(e.target);
  });
  // Runs before native validation, so an untouched or prefilled date is still checked.
  document.addEventListener("click", (e) => {
    const btn = e.target.closest && e.target.closest('button[type="submit"]');
    if (btn && btn.form) applyAll(btn.form);
  }, true);
})();

// Form validation messages in the page's language (browsers otherwise use
// their own UI language, so a Swedish page could show English errors).
(function () {
  const lang = (document.documentElement.lang || "en").slice(0, 2);
  const M = {
    en: { required: "Please fill in this field.", select: "Please select an option.", email: "Please enter a valid email address.",
          pastDate: "Please choose today or a later date.", returnDate: "The return date can't be before the outbound date." },
    de: { required: "Bitte füllen Sie dieses Feld aus.", select: "Bitte wählen Sie eine Option aus.", email: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
          pastDate: "Bitte wählen Sie heute oder ein späteres Datum.", returnDate: "Das Rückfahrtdatum darf nicht vor dem Hinfahrtdatum liegen." },
    sv: { required: "Fyll i det här fältet.", select: "Välj ett alternativ.", email: "Ange en giltig e-postadress.",
          pastDate: "Välj dagens datum eller ett senare datum.", returnDate: "Returdatumet kan inte vara före utresedatumet." },
  }[lang] || null;
  if (!M) return;
  document.addEventListener("invalid", (e) => {
    const el = e.target;
    if (!el.validity || !el.setCustomValidity) return;
    el.setCustomValidity("");
    let msg = "";
    if (el.validity.valueMissing) msg = el.tagName === "SELECT" ? M.select : M.required;
    else if (el.validity.typeMismatch && el.type === "email") msg = M.email;
    else if (el.validity.rangeUnderflow && el.type === "date") msg = el.name === "return_date" ? M.returnDate : M.pastDate;
    if (msg) el.setCustomValidity(msg);
  }, true);
  const clear = (e) => { if (e.target && e.target.setCustomValidity) e.target.setCustomValidity(""); };
  document.addEventListener("input", clear, true);
  document.addEventListener("change", clear, true);
})();

// Contact page form (contact.html / de/contact.html / sv/contact.html).
// Submitted via fetch to Netlify Forms, the same pattern the booking widget
// uses — a plain HTML POST would also work (Netlify redirects to a success
// page), but fetch keeps the visitor on this page and lets it show its own
// confirm panel instead of a generic Netlify one.
function submitContactForm(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const lang = (document.documentElement.lang || "en").slice(0, 2);
  const T = {
    en: { sending: "Sending…", submit: "Send Message", error: "Something went wrong sending your message. Please try again, or email us directly at info@airportsplittransfer.com." },
    de: { sending: "Wird gesendet…", submit: "Nachricht Senden", error: "Beim Senden Ihrer Nachricht ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut, oder schreiben Sie uns direkt an info@airportsplittransfer.com." },
    sv: { sending: "Skickar…", submit: "Skicka Meddelande", error: "Något gick fel när meddelandet skulle skickas. Försök igen, eller mejla oss direkt på info@airportsplittransfer.com." },
  }[lang] || { sending: "Sending…", submit: "Send Message", error: "Something went wrong sending your message. Please try again, or email us directly at info@airportsplittransfer.com." };
  const formData = new FormData(form);
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = T.sending; }
  fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(formData).toString(),
  })
    .then((response) => {
      // See the equivalent check in booking-widget.js: fetch() only rejects
      // on a network failure, not an HTTP error status, so this still has
      // to be checked explicitly or a rejected submission would show success.
      if (!response.ok) throw new Error("Netlify Forms submission failed with status " + response.status);
      form.style.display = "none";
      trackLeadEvent({ form_name: "contact" });
      const confirmPanel = document.getElementById("contact-confirm");
      if (confirmPanel) {
        confirmPanel.classList.add("show");
        confirmPanel.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    })
    .catch((error) => {
      alert(T.error);
      console.error(error);
    })
    .finally(() => {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = T.submit; }
    });
  return false;
}
