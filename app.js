(() => {
  "use strict";

  /** Внешняя запись (Telegram / форма) — подставьте URL при необходимости */
  const EXTERNAL_SIGNUP_URL = "";

  const header = document.querySelector("[data-header]");
  const burger = document.querySelector("[data-burger]");
  const drawer = document.querySelector("[data-drawer]");
  const stickyCta = document.querySelector("[data-sticky-cta]");
  const form = document.querySelector("[data-signup-form]");
  const success = document.querySelector("[data-form-success]");
  const yearEl = document.querySelector("[data-year]");

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* Sticky header shadow */
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
    if (stickyCta) {
      const signup = document.getElementById("signup");
      const nearSignup =
        signup && signup.getBoundingClientRect().top < window.innerHeight * 0.85;
      const show = window.scrollY > 480 && !nearSignup && window.innerWidth < 960;
      stickyCta.hidden = !show;
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* Mobile menu */
  const closeDrawer = () => {
    if (!burger || !drawer) return;
    burger.setAttribute("aria-expanded", "false");
    drawer.hidden = true;
    document.body.style.overflow = "";
  };

  const openDrawer = () => {
    if (!burger || !drawer) return;
    burger.setAttribute("aria-expanded", "true");
    drawer.hidden = false;
    document.body.style.overflow = "hidden";
  };

  burger?.addEventListener("click", () => {
    const open = burger.getAttribute("aria-expanded") === "true";
    if (open) closeDrawer();
    else openDrawer();
  });

  drawer?.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", closeDrawer);
  });

  /* Smooth in-page nav (native CSS handles most; ensure close mobile) */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", id);
    });
  });

  /* Reveal on scroll */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reveals = document.querySelectorAll(".reveal");
  if (reduceMotion) {
    reveals.forEach((el) => el.classList.add("is-visible"));
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* Signup form */
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.querySelector('[name="name"]');
    const contact = form.querySelector('[name="contact"]');
    let ok = true;

    [name, contact].forEach((field) => {
      if (!field) return;
      const valid = String(field.value || "").trim().length > 1;
      field.classList.toggle("is-invalid", !valid);
      if (!valid) ok = false;
    });

    if (!ok) return;

    if (EXTERNAL_SIGNUP_URL) {
      window.open(EXTERNAL_SIGNUP_URL, "_blank", "noopener");
    }

    if (success) {
      success.hidden = false;
    }
    form.reset();
    [name, contact].forEach((field) => field?.classList.remove("is-invalid"));
  });
})();
