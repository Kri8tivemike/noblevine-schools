(() => {
  const menuBtn = document.getElementById("menuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const year = document.getElementById("year");
  const form = document.getElementById("inquiryForm");
  const formStatus = document.getElementById("formStatus");
  const filters = document.querySelectorAll(".gallery-filter");
  const items = document.querySelectorAll(".gallery-item");

  if (year) year.textContent = String(new Date().getFullYear());

  const setMenuOpen = (open) => {
    if (!menuBtn || !mobileMenu) return;
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileMenu.setAttribute("aria-hidden", open ? "false" : "true");

    if (open) {
      mobileMenu.hidden = false;
      requestAnimationFrame(() => {
        mobileMenu.classList.add("is-open");
      });
    } else {
      mobileMenu.classList.remove("is-open");
      window.setTimeout(() => {
        if (menuBtn.getAttribute("aria-expanded") !== "true") {
          mobileMenu.hidden = true;
        }
      }, 380);
    }
  };

  menuBtn?.addEventListener("click", () => {
    const open = menuBtn.getAttribute("aria-expanded") !== "true";
    setMenuOpen(open);
  });

  document.querySelectorAll("[data-close-menu]").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenuOpen(false);
  });

  const setActiveFilter = (active) => {
    filters.forEach((btn) => {
      const on = btn === active;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    active?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter || "all";
      setActiveFilter(btn);
      items.forEach((item) => {
        const category = item.dataset.category || "";
        const show = filter === "all" || category === filter;
        item.classList.toggle("is-hidden", !show);
      });
    });
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    console.info("Admission inquiry submitted", data);

    if (formStatus) {
      formStatus.textContent =
        "Thank you. Your inquiry has been recorded. Our admissions team will contact you shortly.";
      formStatus.classList.remove("hidden");
    }

    form.reset();
  });

  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  const sections = ["top", "why", "divisions", "portals", "news", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const navLinks = document.querySelectorAll('nav[aria-label="Primary"] a.nav-link');

  const syncNav = () => {
    const y = window.scrollY + 120;
    let current = "top";
    sections.forEach((section) => {
      if (section.offsetTop <= y) current = section.id;
    });
    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      const id = href.replace("#", "");
      if (id === current) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  };

  window.addEventListener("scroll", syncNav, { passive: true });
  syncNav();

  /* Hero smart slider — crossfade + gentle Ken Burns */
  const hero = document.getElementById("hero");
  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dotsRoot = document.getElementById("heroDots");
  const prevBtn = document.getElementById("heroPrev");
  const nextBtn = document.getElementById("heroNext");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const AUTO_MS = reduceMotion ? 9000 : 6500;
  let index = Math.max(0, slides.findIndex((s) => s.classList.contains("is-active")));
  let timer = null;
  let locked = false;

  if (hero && slides.length > 1 && dotsRoot) {
    const dots = slides.map((_, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "hero-dot" + (i === index ? " is-active" : "");
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-label", `Go to slide ${i + 1}`);
      btn.setAttribute("aria-selected", i === index ? "true" : "false");
      btn.addEventListener("click", () => goTo(i, true));
      dotsRoot.appendChild(btn);
      return btn;
    });

    const render = () => {
      slides.forEach((slide, i) => {
        const on = i === index;
        slide.classList.toggle("is-active", on);
        slide.setAttribute("aria-hidden", on ? "false" : "true");
      });
      dots.forEach((dot, i) => {
        const on = i === index;
        dot.classList.toggle("is-active", on);
        dot.setAttribute("aria-selected", on ? "true" : "false");
      });
    };

    const goTo = (next, user = false) => {
      if (locked && !user) return;
      index = (next + slides.length) % slides.length;
      render();
      if (user) restart();
    };

    const next = () => goTo(index + 1);
    const prev = () => goTo(index - 1, true);

    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    const start = () => {
      stop();
      timer = window.setInterval(next, AUTO_MS);
    };

    const restart = () => {
      stop();
      start();
    };

    nextBtn?.addEventListener("click", () => {
      goTo(index + 1, true);
    });
    prevBtn?.addEventListener("click", prev);

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    hero.addEventListener("focusin", stop);
    hero.addEventListener("focusout", (e) => {
      if (!hero.contains(e.relatedTarget)) start();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });

    hero.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(index + 1, true);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    });

    // Touch swipe
    let touchX = null;
    hero.addEventListener(
      "touchstart",
      (e) => {
        touchX = e.changedTouches[0]?.clientX ?? null;
      },
      { passive: true }
    );
    hero.addEventListener(
      "touchend",
      (e) => {
        if (touchX == null) return;
        const dx = (e.changedTouches[0]?.clientX ?? touchX) - touchX;
        if (Math.abs(dx) > 48) {
          if (dx < 0) goTo(index + 1, true);
          else prev();
        }
        touchX = null;
      },
      { passive: true }
    );

    // Brief lock during fade to avoid rapid stacking
    slides[0]?.addEventListener("transitionstart", () => {
      locked = true;
    });
    slides[0]?.addEventListener("transitionend", () => {
      locked = false;
    });

    render();
    start();
  }

  /* Mobile stats carousel — swipe / auto-advance, no dots */
  const statsCarousel = document.getElementById("statsCarousel");
  if (statsCarousel) {
    const cards = Array.from(statsCarousel.querySelectorAll(".stats-card"));
    let statsIndex = 0;
    let statsTimer = null;
    const STATS_MS = 3800;

    const goStats = (next) => {
      statsIndex = (next + cards.length) % cards.length;
      const card = cards[statsIndex];
      if (card) {
        statsCarousel.scrollTo({
          left: card.offsetLeft - 4,
          behavior: "smooth",
        });
      }
    };

    const onScroll = () => {
      const left = statsCarousel.scrollLeft;
      let closest = 0;
      let best = Infinity;
      cards.forEach((card, i) => {
        const dist = Math.abs(card.offsetLeft - left);
        if (dist < best) {
          best = dist;
          closest = i;
        }
      });
      statsIndex = closest;
    };

    const stopStats = () => {
      if (statsTimer) {
        clearInterval(statsTimer);
        statsTimer = null;
      }
    };

    const startStats = () => {
      stopStats();
      if (window.matchMedia("(max-width: 767px)").matches) {
        statsTimer = window.setInterval(() => goStats(statsIndex + 1), STATS_MS);
      }
    };

    statsCarousel.addEventListener("scroll", onScroll, { passive: true });
    statsCarousel.addEventListener("pointerdown", stopStats, { passive: true });
    statsCarousel.addEventListener("touchstart", stopStats, { passive: true });
    statsCarousel.addEventListener("touchend", startStats, { passive: true });
    window.addEventListener("resize", () => {
      stopStats();
      startStats();
    });

    startStats();
  }

  /* Footer accordion — collapsed by default on mobile; always open on md+ */
  const footerAccordions = Array.from(document.querySelectorAll("[data-footer-acc]"));
  const isDesktopFooter = () => window.matchMedia("(min-width: 768px)").matches;

  const setFooterAccOpen = (acc, open, exclusive = true) => {
    const btn = acc.querySelector(".footer-acc-btn");
    if (!btn) return;
    if (exclusive && open) {
      footerAccordions.forEach((other) => {
        if (other !== acc) setFooterAccOpen(other, false, false);
      });
    }
    acc.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  };

  const syncFooterAccordions = () => {
    const desktop = isDesktopFooter();
    footerAccordions.forEach((acc) => {
      const btn = acc.querySelector(".footer-acc-btn");
      if (desktop) {
        acc.classList.add("is-open");
        btn?.setAttribute("aria-expanded", "true");
      } else if (!acc.dataset.userToggled) {
        acc.classList.remove("is-open");
        btn?.setAttribute("aria-expanded", "false");
      }
    });
  };

  footerAccordions.forEach((acc) => {
    const btn = acc.querySelector(".footer-acc-btn");
    btn?.addEventListener("click", () => {
      if (isDesktopFooter()) return;
      const next = btn.getAttribute("aria-expanded") !== "true";
      acc.dataset.userToggled = "1";
      setFooterAccOpen(acc, next, true);
    });
  });

  syncFooterAccordions();
  window.addEventListener("resize", syncFooterAccordions);
})();
