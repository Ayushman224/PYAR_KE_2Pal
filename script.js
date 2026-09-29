/* =============================================================================
   Pyar Ke 2 Pal — frontend interactions
   DEMO ONLY. All submissions stay in the browser (console + success modal).

   Later connect:
   - Backend API for bookings, event leads and contact enquiries
   - Database / CRM for lead storage, status and follow-up
   - Real booking availability / venue calendar
   - Admin dashboard for the owner to view and assign leads
   - WhatsApp Business API for alerts and guest replies
   - Payment gateway for deposits and event retainers
   ============================================================================= */

(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* REPLACE: WhatsApp business number, digits only with country code.
     Example: 9198XXXXXXXX */
  const WHATSAPP_NUMBER = "919000000000";
  const WHATSAPP_TEXT = encodeURIComponent(
    "Hi, I would like to enquire about dining/events at Pyar Ke 2 Pal."
  );
  const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_TEXT}`;

  /* --------------------------------------------------------------------------
     Utilities
  -------------------------------------------------------------------------- */
  const todayISO = () => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
  };

  const restrictPastDates = () => {
    const min = todayISO();
    $$('input[type="date"]').forEach((input) => {
      input.min = min;
    });
  };

  const leadRef = () => {
    const n = Math.floor(1000 + Math.random() * 9000);
    return `PK2P-${new Date().getFullYear()}-${n}`;
  };

  const indianPhone = (value) => {
    const digits = value.replace(/\D/g, "");
    return /^(?:91)?[6-9]\d{9}$/.test(digits);
  };

  const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const lockBody = (on) => document.body.classList.toggle("is-locked", on);

  /* --------------------------------------------------------------------------
     Loader
  -------------------------------------------------------------------------- */
  window.addEventListener("load", () => {
    setTimeout(() => {
      $("#loader")?.classList.add("is-done");
      $("#loader")?.setAttribute("aria-hidden", "true");
    }, 1600);
  });

  /* --------------------------------------------------------------------------
     Header, mobile nav, smooth scroll
  -------------------------------------------------------------------------- */
  const header = $("#header");
  const nav = $("#nav");
  const toggle = $("#navToggle");

  const onScrollHeader = () => {
    header?.classList.toggle("is-solid", window.scrollY > 40);
    $("#toTop")?.classList.toggle("is-visible", window.scrollY > 700);
  };

  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  toggle?.addEventListener("click", () => {
    const open = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", open);
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    lockBody(open);
  });

  const closeNav = () => {
    nav?.classList.remove("is-open");
    toggle?.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
    lockBody(false);
  };

  $$(".nav a").forEach((a) => a.addEventListener("click", closeNav));

  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute("href");
    if (id.length < 2) return;
    const target = $(id);
    if (!target) return;
    e.preventDefault();
    closeNav();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* Active nav section */
  const sections = ["home", "experience", "menu", "celebrations", "events", "gallery", "about", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        $$(".nav__list a").forEach((a) => {
          a.classList.toggle("is-active", a.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-45% 0px -45% 0px" }
  );
  sections.forEach((sec) => navObserver.observe(sec));

  /* --------------------------------------------------------------------------
     Hero particles + subtle parallax
  -------------------------------------------------------------------------- */
  const particles = $("#heroParticles");
  if (particles) {
    for (let i = 0; i < 16; i += 1) {
      const s = document.createElement("span");
      s.style.left = `${Math.random() * 100}%`;
      s.style.bottom = `${Math.random() * 30}%`;
      s.style.animationDelay = `${Math.random() * 8}s`;
      s.style.animationDuration = `${7 + Math.random() * 6}s`;
      particles.appendChild(s);
    }
  }

  const heroImage = $(".hero__image");
  window.addEventListener(
    "scroll",
    () => {
      if (!heroImage || window.scrollY > window.innerHeight) return;
      heroImage.style.translate = `0 ${window.scrollY * 0.18}px`;
    },
    { passive: true }
  );

  /* --------------------------------------------------------------------------
     Scroll reveals + counters
  -------------------------------------------------------------------------- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );

  $$(".fade-up, .slide-in, .reveal-image, .xp-card, .event-cat, .offer-card").forEach((el) => {
    el.classList.add("fade-up");
    revealObserver.observe(el);
  });

  const animateCount = (el, to) => {
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(to * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const stats = $("#stats");
  if (stats) {
    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          $$("[data-count]", stats).forEach((el) => animateCount(el, Number(el.dataset.count)));
          statsObserver.disconnect();
        });
      },
      { threshold: 0.4 }
    );
    statsObserver.observe(stats);
  }

  /* --------------------------------------------------------------------------
     Modals
  -------------------------------------------------------------------------- */
  const modal = $("#modal");
  const modalBody = $("#modalBody");
  const eventModal = $("#eventModal");

  const openOverlay = (el) => {
    if (!el) return;
    el.hidden = false;
    lockBody(true);
  };

  const closeOverlay = (el) => {
    if (!el) return;
    el.hidden = true;
    if (modal.hidden && eventModal.hidden && $("#lightbox").hidden) lockBody(false);
  };

  const successHTML = (title, message, ref) => `
    <div class="success">
      <div class="success-mark" aria-hidden="true">✓</div>
      <h2 id="modalTitle">${title}</h2>
      <p>${message}</p>
      ${ref ? `<p class="ref">Enquiry ${ref}</p>` : ""}
      <p class="muted">Demo capture — later this writes to CRM / database / WhatsApp alerts.</p>
    </div>
  `;

  const showSuccess = (title, message, ref) => {
    modalBody.innerHTML = successHTML(title, message, ref);
    openOverlay(modal);
  };

  $$(".modal__close").forEach((btn) => {
    btn.addEventListener("click", () => closeOverlay(btn.closest(".modal")));
  });

  [modal, eventModal, $("#lightbox")].forEach((el) => {
    el?.addEventListener("click", (e) => {
      if (e.target === el) closeOverlay(el);
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeOverlay(modal);
    closeOverlay(eventModal);
    closeLightbox();
    closeNav();
  });

  /* --------------------------------------------------------------------------
     Booking form
     CONNECT: POST /api/bookings → availability calendar → CRM
  -------------------------------------------------------------------------- */
  const validateField = (input) => {
    const wrap = input.closest(".field");
    let ok = true;
    if (input.required && !String(input.value).trim()) ok = false;
    if (input.type === "email" && input.value && !validEmail(input.value)) ok = false;
    if (input.type === "tel" && input.value && !indianPhone(input.value)) ok = false;
    if (input.type === "date" && input.value && input.value < todayISO()) ok = false;
    wrap?.classList.toggle("is-invalid", !ok);
    return ok;
  };

  $("#bookingForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fields = $$("input, select", form);
    const valid = fields.every(validateField);
    if (!valid) return;

    const data = Object.fromEntries(new FormData(form).entries());
    const ref = leadRef();
    /* CONNECT: send `data` + `ref` to booking API / Google Sheet / CRM */
    console.info("[demo booking]", { ref, ...data });
    showSuccess(
      "Thank you! Our team will contact you shortly.",
      `We have received your ${data.intent.toLowerCase()} request for ${data.guests} guests on ${data.date}.`,
      ref
    );
    form.reset();
  });

  /* --------------------------------------------------------------------------
     Event enquiry multi-step
     CONNECT: POST /api/event-leads → admin dashboard → follow-up automation
  -------------------------------------------------------------------------- */
  const eventForm = $("#eventForm");
  const steps = $$(".event-step", eventForm);
  const progress = $$("#eventProgress li");
  let stepIndex = 0;

  const setStep = (index) => {
    stepIndex = index;
    steps.forEach((step, i) => {
      const active = i === index;
      step.classList.toggle("is-active", active);
      step.hidden = !active;
    });
    progress.forEach((item, i) => {
      item.classList.toggle("is-active", i === index);
      item.classList.toggle("is-done", i < index);
    });
  };

  const validateStep = (index) => {
    const step = steps[index];
    const required = $$("input[required], select[required]", step);
    if (!required.length) return true;
    if (required[0].type === "radio") {
      return required.some((r) => r.checked);
    }
    return required.every(validateField);
  };

  const openEventModal = (presetType) => {
    eventForm.reset();
    setStep(0);
    if (presetType) {
      const radio = eventForm.querySelector(`input[name="plan"][value="${presetType}"]`);
      if (radio) radio.checked = true;
    }
    openOverlay(eventModal);
  };

  $$("[data-open-event]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      openEventModal(el.dataset.eventType || "");
    });
  });

  eventForm?.addEventListener("click", (e) => {
    if (e.target.matches("[data-next]")) {
      if (!validateStep(stepIndex)) return;
      setStep(Math.min(stepIndex + 1, steps.length - 1));
    }
    if (e.target.matches("[data-prev]")) {
      setStep(Math.max(stepIndex - 1, 0));
    }
  });

  eventForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;
    const data = Object.fromEntries(new FormData(eventForm).entries());
    const ref = leadRef();
    /* CONNECT: persist lead, trigger WhatsApp/email notification, assign to sales */
    console.info("[demo event lead]", { ref, ...data });
    closeOverlay(eventModal);
    showSuccess(
      "Your event enquiry has been received. Our team will contact you shortly.",
      `Planning a ${data.plan.toLowerCase()} for ${data.count} guests.`,
      ref
    );
  });

  /* --------------------------------------------------------------------------
     Contact form
     CONNECT: CRM + email + customer database
  -------------------------------------------------------------------------- */
  $("#contactForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const valid = $$("input, select, textarea", form).every(validateField);
    if (!valid) return;
    const data = Object.fromEntries(new FormData(form).entries());
    const ref = leadRef();
    /* CONNECT: POST /api/enquiries */
    console.info("[demo contact]", { ref, ...data });
    showSuccess(
      "Enquiry sent.",
      "Thank you. Our team will help you shape the right experience.",
      ref
    );
    form.reset();
  });

  $$("input, select, textarea").forEach((el) => {
    el.addEventListener("blur", () => validateField(el));
  });

  /* --------------------------------------------------------------------------
     Menu tabs
  -------------------------------------------------------------------------- */
  const tabs = $$(".menu-tabs button");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.toggle("is-active", t === tab);
        t.setAttribute("aria-selected", String(t === tab));
      });
      $$(".menu-panel").forEach((panel) => {
        const match = panel.id === `panel-${tab.dataset.tab}`;
        panel.classList.toggle("is-active", match);
        panel.hidden = !match;
      });
    });
  });

  /* --------------------------------------------------------------------------
     Testimonials
  -------------------------------------------------------------------------- */
  const quotes = $$(".quote");
  const dotsWrap = $("#quoteDots");
  let quoteIndex = 0;
  let quoteTimer;

  quotes.forEach((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", `Show review ${i + 1}`);
    b.addEventListener("click", () => showQuote(i));
    dotsWrap?.appendChild(b);
  });

  const showQuote = (index) => {
    quoteIndex = (index + quotes.length) % quotes.length;
    quotes.forEach((q, i) => q.classList.toggle("is-active", i === quoteIndex));
    $$("button", dotsWrap).forEach((d, i) => d.classList.toggle("is-active", i === quoteIndex));
    restartQuotes();
  };

  const restartQuotes = () => {
    clearInterval(quoteTimer);
    quoteTimer = setInterval(() => showQuote(quoteIndex + 1), 4500);
  };

  $(".quote-nav--prev")?.addEventListener("click", () => showQuote(quoteIndex - 1));
  $(".quote-nav--next")?.addEventListener("click", () => showQuote(quoteIndex + 1));
  $(".quote-wrap")?.addEventListener("mouseenter", () => clearInterval(quoteTimer));
  $(".quote-wrap")?.addEventListener("mouseleave", restartQuotes);
  showQuote(0);

  /* --------------------------------------------------------------------------
     Gallery lightbox
  -------------------------------------------------------------------------- */
  const items = $$(".masonry__item");
  const lightbox = $("#lightbox");
  const lightboxImage = $("#lightboxImage");
  const lightboxCaption = $("#lightboxCaption");
  let lbIndex = 0;

  const openLightbox = (index) => {
    lbIndex = index;
    const btn = items[lbIndex];
    const img = $("img", btn);
    lightboxImage.src = img.src.replace("w=900", "w=1600").replace("w=1200", "w=1600");
    lightboxImage.alt = img.alt;
    lightboxCaption.textContent = $("span", btn)?.textContent || "";
    openOverlay(lightbox);
  };

  const closeLightbox = () => closeOverlay(lightbox);

  items.forEach((btn, i) => btn.addEventListener("click", () => openLightbox(i)));
  $(".lightbox__close")?.addEventListener("click", closeLightbox);
  $(".lightbox__prev")?.addEventListener("click", () => openLightbox((lbIndex - 1 + items.length) % items.length));
  $(".lightbox__next")?.addEventListener("click", () => openLightbox((lbIndex + 1) % items.length));

  document.addEventListener("keydown", (e) => {
    if (lightbox.hidden) return;
    if (e.key === "ArrowLeft") openLightbox((lbIndex - 1 + items.length) % items.length);
    if (e.key === "ArrowRight") openLightbox((lbIndex + 1) % items.length);
  });

  /* --------------------------------------------------------------------------
     WhatsApp, back to top
     CONNECT: WhatsApp Business API / Meta Cloud API for automated replies
  -------------------------------------------------------------------------- */
  const bindWhatsApp = (el) => {
    if (!el) return;
    el.href = WHATSAPP_URL;
  };
  bindWhatsApp($("#whatsappBtn"));
  bindWhatsApp($("#footerWhatsApp"));

  $("#toTop")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  restrictPastDates();
})();
