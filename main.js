/**
 * ATYPINK — main.js
 * Modules :
 *  1. Custom Cursor
 *  2. Mobile Navigation
 *  3. Scroll Reveal (IntersectionObserver)
 *  4. Carousel (drag / swipe / buttons)
 *  5. Parallax Hero Background Text
 */

"use strict";

// ─────────────────────────────────────────────────────
// 1. CUSTOM CURSOR
// ─────────────────────────────────────────────────────

const initCursor = () => {
  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  const text = document.getElementById("cursorText");

  if (!dot || !ring || !text) return;

  // Current mouse position
  let mx = -100,
    my = -100;
  // Ring lerp position
  let rx = -100,
    ry = -100;

  // Snap dot to mouse instantly
  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = `${mx}px`;
    dot.style.top = `${my}px`;
  });

  // Smooth ring with linear interpolation
  const lerp = (a, b, t) => a + (b - a) * t;

  const animateRing = () => {
    rx = lerp(rx, mx, 0.12);
    ry = lerp(ry, my, 0.12);
    ring.style.left = `${rx}px`;
    ring.style.top = `${ry}px`;
    // Cursor label floats slightly below the ring
    text.style.left = `${rx}px`;
    text.style.top = `${ry + 30}px`;
    requestAnimationFrame(animateRing);
  };
  animateRing();

  // Expand ring & show label on interactive elements
  const interactiveSelector = "a, button, .c-item, .blog-card";
  document.querySelectorAll(interactiveSelector).forEach((el) => {
    el.addEventListener("mouseenter", () => {
      ring.classList.add("hovering");
      text.classList.add("visible");
    });
    el.addEventListener("mouseleave", () => {
      ring.classList.remove("hovering");
      text.classList.remove("visible");
    });
  });
};

// ─────────────────────────────────────────────────────
// 2. MOBILE NAVIGATION
// ─────────────────────────────────────────────────────

const initMobileNav = () => {
  const btn = document.getElementById("burgerBtn");
  const nav = document.getElementById("mobileNav");

  if (!btn || !nav) return;

  btn.addEventListener("click", () => {
    nav.classList.toggle("open");
    // Aria accessibility
    const isOpen = nav.classList.contains("open");
    btn.setAttribute("aria-expanded", isOpen);
  });
};

// Called inline from HTML anchor tags (onclick="closeMobileNav()")
window.closeMobileNav = () => {
  const nav = document.getElementById("mobileNav");
  if (nav) {
    nav.classList.remove("open");
    const btn = document.getElementById("burgerBtn");
    if (btn) btn.setAttribute("aria-expanded", "false");
  }
};

// ─────────────────────────────────────────────────────
// 3. SCROLL REVEAL
// ─────────────────────────────────────────────────────

const initScrollReveal = () => {
  const elements = document.querySelectorAll(".reveal");
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          // Unobserve after reveal to save resources
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 },
  );

  elements.forEach((el) => observer.observe(el));
};

// ─────────────────────────────────────────────────────
// 4. CAROUSEL
// ─────────────────────────────────────────────────────

const initCarousel = () => {
  const wrapper = document.getElementById("carousel");
  const track = document.getElementById("carouselTrack");
  const btnPrev = document.getElementById("cPrev");
  const btnNext = document.getElementById("cNext");

  if (!wrapper || !track) return;

  const items = track.querySelectorAll(".c-item");
  let currentIndex = 0;

  // Gap between items in px (matches CSS: gap: 2px)
  const GAP = 2;

  /** Width of a single item + gap */
  const itemWidth = () => items[0].offsetWidth + GAP;

  /** Clamp index and apply CSS transform */
  const goTo = (index) => {
    const max = items.length - 2; // show at least 2 items
    currentIndex = Math.max(0, Math.min(max, index));
    track.style.transform = `translateX(-${currentIndex * itemWidth()}px)`;
  };

  // Arrow buttons
  if (btnNext) btnNext.addEventListener("click", () => goTo(currentIndex + 1));
  if (btnPrev) btnPrev.addEventListener("click", () => goTo(currentIndex - 1));

  // ── Drag (mouse) ────────────────────────────────────
  let dragStartX = 0;
  let isDragging = false;

  wrapper.addEventListener("mousedown", (e) => {
    dragStartX = e.clientX;
    isDragging = true;
    e.preventDefault(); // prevent text selection while dragging
  });

  wrapper.addEventListener("mouseup", (e) => {
    if (!isDragging) return;
    isDragging = false;

    const delta = dragStartX - e.clientX;
    if (Math.abs(delta) > 50) {
      goTo(currentIndex + (delta > 0 ? 1 : -1));
    }
  });

  // Cancel drag if mouse leaves the wrapper mid-drag
  wrapper.addEventListener("mouseleave", () => {
    isDragging = false;
  });

  // ── Swipe (touch) ───────────────────────────────────
  wrapper.addEventListener(
    "touchstart",
    (e) => {
      dragStartX = e.touches[0].clientX;
    },
    { passive: true },
  );

  wrapper.addEventListener("touchend", (e) => {
    const delta = dragStartX - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      goTo(currentIndex + (delta > 0 ? 1 : -1));
    }
  });

  // ── Keyboard accessibility ──────────────────────────
  wrapper.setAttribute("tabindex", "0");
  wrapper.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") goTo(currentIndex + 1);
    if (e.key === "ArrowLeft") goTo(currentIndex - 1);
  });

  // Recalculate on resize
  window.addEventListener("resize", () => goTo(currentIndex), {
    passive: true,
  });
};

// ─────────────────────────────────────────────────────
// 5. PARALLAX — HERO BACKGROUND TEXT
// ─────────────────────────────────────────────────────

const initParallax = () => {
  const bgText = document.querySelector(".hero-bg-text");
  if (!bgText) return;

  // Throttle scroll handler with rAF
  let ticking = false;

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        bgText.style.transform = `translate(-50%, calc(-50% + ${y * 0.25}px))`;
        bgText.style.opacity = Math.max(0, 1 - y / 600);
        ticking = false;
      });
      ticking = true;
    },
    { passive: true },
  );
};

// ─────────────────────────────────────────────────────
// INIT — Run all modules on DOMContentLoaded
// ─────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  initCursor();
  initMobileNav();
  initScrollReveal();
  initCarousel();
  initParallax();
});
