/* Anniversary site for Ale — vanilla JS (ES6+) */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

function pad2(n) {
  return String(n).padStart(2, "0");
}

function isAnniversaryDateLocal() {
  const now = new Date();
  return now.getFullYear() === 2026 && now.getMonth() === 2 && now.getDate() === 30; // Month is 0-based; 2 = March
}

function safeConfetti(opts = {}) {
  if (typeof window.confetti === "function") {
    window.confetti(opts);
    return true;
  }
  return false;
}

function createObserver() {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("isVisible");
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.15 }
  );
  $$(".reveal").forEach((el) => io.observe(el));
}

function initTypewriter() {
  const target = $("#typeTarget");
  if (!target) return;

  const lines = [
    "te amo con calma y con locura.",
    "gracias por existir, mi Ale.",
    "siempre te elijo.",
    "eres mi lugar favorito.",
    "lo mejor de mi año has sido tú.",
  ];
  let lineIdx = 0;
  let i = 0;
  let deleting = false;

  const tick = () => {
    const text = lines[lineIdx];
    if (!deleting) {
      i = Math.min(text.length, i + 1);
      target.textContent = text.slice(0, i);
      if (i === text.length) {
        deleting = true;
        setTimeout(tick, 1200);
        return;
      }
      setTimeout(tick, 42 + Math.random() * 40);
      return;
    }

    i = Math.max(0, i - 1);
    target.textContent = text.slice(0, i);
    if (i === 0) {
      deleting = false;
      lineIdx = (lineIdx + 1) % lines.length;
      setTimeout(tick, 260);
      return;
    }
    setTimeout(tick, 20 + Math.random() * 30);
  };

  tick();
}

function initCountdown() {
  const d = $("#cdDays");
  const h = $("#cdHours");
  const m = $("#cdMins");
  const s = $("#cdSecs");
  if (!d || !h || !m || !s) return;

  const target = new Date(2026, 2, 30, 0, 0, 0); // March 30, 2026 local midnight

  const update = () => {
    const now = new Date();
    let diff = target.getTime() - now.getTime();

    if (diff <= 0) {
      d.textContent = "00";
      h.textContent = "00";
      m.textContent = "00";
      s.textContent = "00";
      return;
    }

    const sec = Math.floor(diff / 1000);
    const days = Math.floor(sec / 86400);
    const hours = Math.floor((sec % 86400) / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;

    d.textContent = String(days);
    h.textContent = pad2(hours);
    m.textContent = pad2(mins);
    s.textContent = pad2(secs);
  };

  update();
  setInterval(update, 1000);
}

function initCountUps() {
  const els = $$(".countUp");
  if (!els.length) return;

  const animate = (el) => {
    const to = Number(el.dataset.count ?? "0");
    const suffix = el.dataset.suffix ?? "";
    const dur = 1200;
    const start = performance.now();

    const step = (t) => {
      const p = clamp((t - start) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.floor(eased * to);
      el.textContent = `${val}${suffix}`;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = `${to}${suffix}`;
    };

    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target;
        if (!el.dataset.didCount) {
          el.dataset.didCount = "1";
          animate(el);
        }
        io.unobserve(el);
      }
    },
    { threshold: 0.35 }
  );

  els.forEach((el) => io.observe(el));
}

function initPetals() {
  const wrap = $("#petals");
  if (!wrap || prefersReducedMotion) return;

  const count = window.matchMedia?.("(max-width: 520px)")?.matches ? 16 : 26;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.className = "petal";
    const s = 10 + Math.random() * 18;
    const x = Math.random() * 100;
    const dx = (Math.random() * 22 - 11).toFixed(2);
    const r = (Math.random() * 360).toFixed(1);
    const dr = (220 + Math.random() * 380).toFixed(1);
    const d = (8 + Math.random() * 10).toFixed(2);
    const o = (0.42 + Math.random() * 0.5).toFixed(2);
    const delay = (-Math.random() * d).toFixed(2);
    p.style.setProperty("--s", `${s}px`);
    p.style.setProperty("--x", `${x}vw`);
    p.style.setProperty("--dx", `${dx}vw`);
    p.style.setProperty("--r", `${r}deg`);
    p.style.setProperty("--dr", `${dr}deg`);
    p.style.setProperty("--d", `${d}s`);
    p.style.setProperty("--o", `${o}`);
    p.style.animationDelay = `${delay}s`;
    frag.appendChild(p);
  }
  wrap.appendChild(frag);
}

function initLightbox() {
  const box = $("#lightbox");
  const img = $("#lightboxImg");
  const cap = $("#lightboxCap");
  if (!box || !img || !cap) return;

  const open = (src, caption = "") => {
    img.src = src;
    cap.textContent = caption;
    box.hidden = false;
    document.body.style.overflow = "hidden";
  };

  const close = () => {
    box.hidden = true;
    img.removeAttribute("src");
    document.body.style.overflow = "";
  };

  $$(".photoCard").forEach((fig) => {
    fig.tabIndex = 0;
    fig.addEventListener("click", () => {
      const im = $("img", fig);
      if (!im) return;
      open(im.getAttribute("src") || "", fig.dataset.caption || $("figcaption", fig)?.textContent || "");
    });
    fig.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fig.click();
      }
    });
  });

  box.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    if (t.dataset.close === "true" || t.closest("[data-close='true']")) close();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !box.hidden) close();
  });
}

function initReasons() {
  const grid = $("#reasonsGrid");
  if (!grid) return;

  const cards = $$(".reasonCard", grid);
  cards.forEach((c) => {
    c.addEventListener("click", () => {
      c.classList.toggle("isOpen");
    });
  });

  $("#revealAll")?.addEventListener("click", () => {
    cards.forEach((c) => c.classList.add("isOpen"));
    burstConfetti();
  });

  $("#hideAll")?.addEventListener("click", () => {
    cards.forEach((c) => c.classList.remove("isOpen"));
  });
}

function burstConfetti() {
  const ok = safeConfetti({
    particleCount: 160,
    spread: 85,
    origin: { y: 0.72 },
    colors: ["#F0D080", "#F7CAC9", "#6B0F1A", "#FFF8F0"],
  });
  if (!ok) {
    // no-op fallback
  }
}

function initMusic() {
  const btn = $("#musicToggle");
  const audio = $("#bgMusic");
  if (!btn || !audio) return;

  const setPressed = (v) => {
    btn.setAttribute("aria-pressed", v ? "true" : "false");
    btn.classList.toggle("isOn", v);
  };

  const tryPlay = async () => {
    try {
      await audio.play();
      setPressed(true);
    } catch {
      // Autoplay blocked; keep off until user interacts again.
      setPressed(false);
    }
  };

  btn.addEventListener("click", async () => {
    if (audio.paused) {
      await tryPlay();
    } else {
      audio.pause();
      setPressed(false);
    }
  });
}

function initBackToTop() {
  $("#backToTop")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });
}

function initFlipCards() {
  $$(".flipCard").forEach((btn) => {
    btn.addEventListener("click", () => btn.classList.toggle("isFlipped"));
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        btn.click();
      }
    });
  });
}

function initEnvelopeOpenOnScroll() {
  const env = document.querySelector("[data-envelope]");
  if (!env) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          env.classList.add("isOpen");
          io.disconnect();
          break;
        }
      }
    },
    { threshold: 0.3 }
  );
  io.observe(env);
}

function initLetterSparkles() {
  const wrap = $(".sparkles");
  if (!wrap || prefersReducedMotion) return;

  const make = () => {
    wrap.innerHTML = "";
    const count = 10;
    for (let i = 0; i < count; i++) {
      const s = document.createElement("span");
      s.className = "sparkle";
      s.style.left = `${Math.random() * 100}%`;
      s.style.top = `${10 + Math.random() * 70}%`;
      s.style.animationDelay = `${(Math.random() * 2.4).toFixed(2)}s`;
      s.style.animationDuration = `${(2.2 + Math.random() * 1.8).toFixed(2)}s`;
      wrap.appendChild(s);
    }
  };

  make();
  window.addEventListener("resize", () => {
    clearTimeout(initLetterSparkles._t);
    initLetterSparkles._t = setTimeout(make, 200);
  });
}
initLetterSparkles._t = 0;

function initReadAloud() {
  const readBtn = $("#readAloud");
  const stopBtn = $("#stopRead");
  const textEl = $("#letterText");
  if (!readBtn || !stopBtn || !textEl) return;

  const synth = window.speechSynthesis;
  if (!synth) {
    readBtn.disabled = true;
    stopBtn.disabled = true;
    return;
  }

  const getSpanishVoice = () => {
    const voices = synth.getVoices?.() ?? [];
    return (
      voices.find((v) => /es/i.test(v.lang) && /mex|mx/i.test(v.lang)) ||
      voices.find((v) => /es/i.test(v.lang)) ||
      null
    );
  };

  let current = null;

  const speak = () => {
    const raw = textEl.innerText || textEl.textContent || "";
    const cleaned = raw.replace(/\[[^\]]+]/g, "").replace(/\s+/g, " ").trim();
    if (!cleaned) return;

    synth.cancel();
    const u = new SpeechSynthesisUtterance(cleaned);
    u.lang = "es-MX";
    const v = getSpanishVoice();
    if (v) u.voice = v;
    u.rate = 1.0;
    u.pitch = 1.0;
    current = u;
    synth.speak(u);
  };

  readBtn.addEventListener("click", () => speak());
  stopBtn.addEventListener("click", () => synth.cancel());

  // Ensure voices list is loaded on some browsers
  window.speechSynthesis.onvoiceschanged = () => void 0;
}

function initAnniversaryBanner() {
  const banner = $("#anniversaryBanner");
  if (!banner) return;
  if (isAnniversaryDateLocal()) {
    banner.hidden = false;
    setTimeout(() => {
      burstConfetti();
      safeConfetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.2 },
        colors: ["#F0D080", "#F7CAC9", "#FFF8F0"],
      });
    }, 400);
  }
}

function initOneMinuteSurprise() {
  const modal = $("#surpriseModal");
  if (!modal) return;

  const open = () => {
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    safeConfetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#F7CAC9", "#F0D080"],
    });
  };
  const close = () => {
    modal.hidden = true;
    document.body.style.overflow = "";
  };

  modal.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    if (t.dataset.close === "true" || t.closest("[data-close='true']")) close();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) close();
  });

  setTimeout(() => {
    if (modal.hidden) open();
  }, 60_000);
}

function initLongPressSecret() {
  const title = $("#mainTitle");
  const toast = $("#secretLinkToast");
  if (!title || !toast) return;

  let timer = 0;
  let active = false;
  const show = () => {
    toast.hidden = false;
    setTimeout(() => (toast.hidden = true), 4500);
  };

  const start = (e) => {
    if (active) return;
    active = true;
    timer = window.setTimeout(() => {
      show();
      safeConfetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.25 },
        colors: ["#F0D080", "#F7CAC9"],
      });
    }, 3000);
  };
  const end = () => {
    active = false;
    clearTimeout(timer);
  };

  title.addEventListener("pointerdown", start);
  title.addEventListener("pointerup", end);
  title.addEventListener("pointercancel", end);
  title.addEventListener("pointerleave", end);
}

function initHeart10ClickSlideshow() {
  const heart = $("#mainHeart");
  const dlg = $("#slideshow");
  const img = $("#slideImg");
  if (!heart || !dlg || !img) return;

  const slides = [
    "photos/secret-01.jpg",
    "photos/secret-02.jpg",
    "photos/secret-03.jpg",
    "photos/secret-04.jpg",
    "photos/secret-05.jpg",
  ];

  let clickCount = 0;
  let clickTimer = 0;
  let idx = 0;

  const open = () => {
    idx = 0;
    img.src = slides[idx];
    dlg.hidden = false;
    document.body.style.overflow = "hidden";
    burstConfetti();
  };
  const close = () => {
    dlg.hidden = true;
    document.body.style.overflow = "";
  };
  const showIdx = (n) => {
    idx = (n + slides.length) % slides.length;
    img.src = slides[idx];
  };

  $("#prevSlide")?.addEventListener("click", () => showIdx(idx - 1));
  $("#nextSlide")?.addEventListener("click", () => showIdx(idx + 1));

  dlg.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    if (t.dataset.close === "true" || t.closest("[data-close='true']")) close();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !dlg.hidden) close();
    if (dlg.hidden) return;
    if (e.key === "ArrowLeft") showIdx(idx - 1);
    if (e.key === "ArrowRight") showIdx(idx + 1);
  });

  heart.addEventListener("click", () => {
    clickCount += 1;
    clearTimeout(clickTimer);
    clickTimer = window.setTimeout(() => (clickCount = 0), 900);
    if (clickCount === 10) {
      clickCount = 0;
      open();
    }
  });
}

function initMemoryJar() {
  const btn = $("#memoryJar");
  if (!btn) return;

  const notes = [
    "Eres el tipo de paz que se queda.",
    "Tu risa es mi canción favorita.",
    "Gracias por elegirme, aunque no soy perfecto.",
    "Tus ojos: mi lugar seguro.",
    "Si el mundo se apaga, contigo tengo luz.",
    "Te amo en lo simple y en lo infinito.",
    "Eres mi mejor casualidad.",
    "Mi guapAle… siempre tú.",
  ];

  btn.addEventListener("click", () => {
    const note = notes[Math.floor(Math.random() * notes.length)];
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
      <div class="toast__inner glass" role="status" aria-live="polite">
        <div class="toast__title">Nota del frasco</div>
        <div class="toast__text">${note}</div>
      </div>
    `;
    document.body.appendChild(toast);
    safeConfetti({
      particleCount: 40,
      spread: 45,
      origin: { y: 0.78 },
      colors: ["#F0D080", "#F7CAC9"],
    });
    setTimeout(() => toast.remove(), 4200);
  });
}


/* Cursor heart trail (desktop) */
function initCursorHearts() {
  if (prefersReducedMotion) return;
  const fine = window.matchMedia?.("(pointer: fine)")?.matches ?? false;
  if (!fine) return;

  let last = 0;
  const spawn = (x, y) => {
    const el = document.createElement("div");
    el.style.position = "fixed";
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.width = "10px";
    el.style.height = "10px";
    el.style.pointerEvents = "none";
    el.style.zIndex = "80";
    el.style.opacity = "0.9";
    el.style.transform = `translate3d(-50%, -50%, 0) rotate(45deg)`;
    el.style.background = "rgba(247, 202, 201, 0.55)";
    el.style.borderRadius = "2px";
    el.style.willChange = "transform, opacity";

    const b1 = document.createElement("span");
    const b2 = document.createElement("span");
    for (const b of [b1, b2]) {
      b.style.position = "absolute";
      b.style.width = "10px";
      b.style.height = "10px";
      b.style.background = "inherit";
      b.style.borderRadius = "50%";
    }
    b1.style.left = "-5px";
    b1.style.top = "0";
    b2.style.left = "0";
    b2.style.top = "-5px";
    el.appendChild(b1);
    el.appendChild(b2);

    document.body.appendChild(el);

    const dur = 780 + Math.random() * 420;
    const dx = (Math.random() * 28 - 14);
    const dy = -18 - Math.random() * 28;
    const start = performance.now();

    const tick = (t) => {
      const p = clamp((t - start) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - p, 2);
      el.style.opacity = String((1 - eased) * 0.9);
      el.style.transform = `translate3d(calc(-50% + ${dx * eased}px), calc(-50% + ${dy * eased}px), 0) rotate(45deg) scale(${1 - eased * 0.15})`;
      if (p < 1) requestAnimationFrame(tick);
      else el.remove();
    };
    requestAnimationFrame(tick);
  };

  window.addEventListener("pointermove", (e) => {
    const now = performance.now();
    if (now - last < 38) return;
    last = now;
    spawn(e.clientX, e.clientY);
  });
}

/* Starfield canvas */
function initStarfield() {
  const canvas = $("#starfield");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w = 0;
  let h = 0;
  let dpr = 1;
  let raf = 0;
  let stars = [];
  let last = performance.now();

  const makeStars = () => {
    const n = Math.floor((w * h) / 18000);
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.4 + Math.random() * 1.4,
      a: 0.15 + Math.random() * 0.65,
      tw: 0.5 + Math.random() * 1.4,
      sp: 2 + Math.random() * 7,
    }));
  };

  const resize = () => {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makeStars();
  };

  const step = (t) => {
    const dt = Math.min(0.033, (t - last) / 1000);
    last = t;

    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";

    for (const s of stars) {
      s.y += s.sp * dt;
      if (s.y > h + 10) {
        s.y = -10;
        s.x = Math.random() * w;
      }
      const tw = 0.6 + 0.4 * Math.sin((t / 1000) * s.tw + s.x * 0.02);
      ctx.globalAlpha = s.a * tw;
      ctx.fillStyle = "rgba(255,248,240,1)";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    raf = requestAnimationFrame(step);
  };

  resize();
  raf = requestAnimationFrame(step);
  window.addEventListener("resize", () => {
    resize();
  });

  // Safety: stop anim if tab hidden
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(step);
    }
  });
}

function initModalCloseEsc() {
  // placeholder to ensure consistent ESC behavior is covered in each init
}

function initHeroHeartTapBurst() {
  const heart = $("#mainHeart");
  if (!heart) return;
  heart.addEventListener("click", () => {
    safeConfetti({
      particleCount: 26,
      spread: 40,
      origin: { y: 0.5 },
      colors: ["#F7CAC9", "#F0D080"],
    });
  });
}

/* Wire up close-by-click for dialogs */
function initGenericDialogClose() {
  const closeOn = (id) => {
    const dlg = $(id);
    if (!dlg) return;
    dlg.addEventListener("click", (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      if (t.dataset.close === "true" || t.closest("[data-close='true']")) {
        dlg.hidden = true;
        document.body.style.overflow = "";
      }
    });
  };
  closeOn("#surpriseModal");
  closeOn("#slideshow");
  closeOn("#lightbox");
}

function boot() {
  initStarfield();
  createObserver();
  initPetals();
  initTypewriter();
  initCountdown();
  initCountUps();
  initLightbox();
  initReasons();
  initMusic();
  initBackToTop();
  initFlipCards();
  initEnvelopeOpenOnScroll();
  initLetterSparkles();
  initReadAloud();
  initAnniversaryBanner();
  initOneMinuteSurprise();
  initLongPressSecret();
  initHeart10ClickSlideshow();
  initMemoryJar();
  initCursorHearts();
  initHeroHeartTapBurst();
  initGenericDialogClose();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}

