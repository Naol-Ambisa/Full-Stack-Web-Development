/* ==========================================================
   Naol Takele Portfolio — script.js
   Edit CONFIG and PROJECTS below; everything else can stay.
   ========================================================== */
"use strict";

/* ---------- EDIT ME: contact + form settings ---------- */
const CONFIG = {
  email: "naolambisa21@gmail.com",
  phone: "+251 951 311 159",
  github: "Naol-Ambisa",
  linkedin: "naol-takele12",
  formEndpoint: ""
};

/* Project categories: "frontend", "backend", or "fullstack".
   Leave liveUrl and repoUrl empty until those URLs are available. */
const PROJECTS = [
  {
    title: "NT Music Player",
    description: "A music player web application designed to help users explore, organize, upload, and play music through an intuitive interface.",
    image: "assets/images/project-1.svg",
    alt: "Illustration for the NT Music Player project",
    tags: ["HTML", "CSS", "JavaScript", "Java", "Spring Boot", "MongoDB"],
    categories: ["backend", "fullstack"],
    liveUrl: "",
    repoUrl: ""
  },
  {
    title: "BMI Calculator",
    description: "A responsive calculator that estimates body mass index from a user's height and weight.",
    image: "assets/images/project-2.svg",
    alt: "Illustration for the BMI Calculator project",
    tags: ["HTML", "CSS", "JavaScript"],
    categories: ["frontend"],
    liveUrl: "",
    repoUrl: ""
  },
  {
    title: "Personal Portfolio",
    description: "A responsive portfolio website showcasing my skills, projects, professional profile, and contact information.",
    image: "assets/images/project-3.svg",
    alt: "Illustration for the Personal Portfolio project",
    tags: ["HTML5", "CSS3", "JavaScript ES6+"],
    categories: ["frontend"],
    liveUrl: "",
    repoUrl: ""
  }
];

/* ---------- Helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const isPlaceholder = (v) => !v || /^YOUR_/i.test(v);
const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function safeStorage(action, key, value) {
  try {
    return action === "get" ? localStorage.getItem(key) : localStorage.setItem(key, value);
  } catch {
    return null;
  }
}

/* ---------- Theme ---------- */
function initTheme() {
  const root = document.documentElement;
  const btn = $("#theme-toggle");
  const meta = $('meta[name="theme-color"]');

  const apply = (theme) => {
    root.setAttribute("data-theme", theme);
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0A0F1C" : "#F8FAFC");
    if (btn) btn.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
  };

  const saved = safeStorage("get", "theme");
  apply(saved === "light" ? "light" : "dark");
  requestAnimationFrame(() => root.classList.add("theme-ready")); // enable transitions after first paint

  if (!btn) return;
  btn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    apply(next);
    safeStorage("set", "theme", next);
  });
}

/* ---------- Navigation ---------- */
function initNav() {
  const menuBtn = $("#menu-toggle");
  const links = $("#nav-links");
  if (!menuBtn || !links) return;

  const setOpen = (open) => {
    links.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  menuBtn.addEventListener("click", () => setOpen(menuBtn.getAttribute("aria-expanded") !== "true"));
  links.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && links.classList.contains("is-open")) {
      setOpen(false);
      menuBtn.focus();
    }
  });
  window.matchMedia("(min-width: 900px)").addEventListener("change", (event) => {
    if (event.matches) setOpen(false);
  });

  // Active link on scroll
  const navLinks = $$(".nav-link");
  const sections = navLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  if (!("IntersectionObserver" in window) || !sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => {
        const active = a.getAttribute("href") === "#" + entry.target.id;
        a.classList.toggle("is-active", active);
        if (active) {
          a.setAttribute("aria-current", "location");
        } else {
          a.removeAttribute("aria-current");
        }
      });
    });
  }, {
    rootMargin: "-45% 0px -50% 0px",
    threshold: 0
  });
  sections.forEach((section) => observer.observe(section));
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const items = $$(".reveal");
  if (!items.length) return;
  if (!("IntersectionObserver" in window) || prefersReducedMotion()) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: "0px 0px -40px 0px"
  });
  items.forEach((el) => observer.observe(el));
}

/* ---------- Projects + filters ---------- */
function createProjectCard(p) {
  const card = document.createElement("article");
  card.className = "project-card reveal";
  card.dataset.categories = p.categories.join(" ");

  const labels = { frontend: "Frontend", backend: "Backend", fullstack: "Full-Stack" };
  const meta = p.categories.map((c) => labels[c] || c).join(" · ");

  const img = document.createElement("img");
  img.src = p.image;
  img.alt = p.alt;
  img.width = 800;
  img.height = 500;
  img.loading = "lazy";

  const body = document.createElement("div");
  body.className = "project-body";

  const metaEl = Object.assign(document.createElement("p"), { className: "project-meta", textContent: meta });
  const title = Object.assign(document.createElement("h3"), { textContent: p.title });
  const desc = Object.assign(document.createElement("p"), { textContent: p.description });

  const tags = document.createElement("ul");
  tags.className = "chips";
  tags.setAttribute("aria-label", "Technologies used");
  p.tags.forEach((t) => tags.appendChild(Object.assign(document.createElement("li"), { textContent: t })));

  const actions = document.createElement("div");
  actions.className = "project-actions";
  actions.append(
    createProjectButton("Live Demo", p.liveUrl, "btn-primary", p.title),
    createProjectButton("Source Code", p.repoUrl, "btn-secondary", p.title)
  );

  body.append(metaEl, title, desc, tags, actions);
  card.append(img, body);
  return card;
}

function createProjectButton(label, url, variant, projectTitle) {
  const hasUrl = Boolean(url);
  const el = document.createElement(hasUrl ? "a" : "button");
  el.className = `btn btn-sm ${variant}`;
  el.textContent = label;
  if (hasUrl) {
    el.href = url;
    el.target = "_blank";
    el.rel = "noopener noreferrer";
    el.setAttribute("aria-label", `${label} for ${projectTitle} (opens in a new tab)`);
  } else {
    el.type = "button";
    el.disabled = true;
    el.title = `Add the ${label.toLowerCase()} URL in script.js (PROJECTS)`;
    el.setAttribute("aria-label", `${label} for ${projectTitle} is not available yet`);
  }
  return el;
}

function initProjects() {
  const grid = $("#project-grid");
  const empty = $("#project-empty");
  const filters = $$(".filter");
  if (!grid) return;

  PROJECTS.forEach((p) => grid.appendChild(createProjectCard(p)));
  const cards = $$(".project-card", grid);

  const applyFilter = (value) => {
    let visible = 0;
    cards.forEach((card) => {
      const show = value === "all" || card.dataset.categories.split(" ").includes(value);
      card.hidden = !show;
      if (show) {
        visible++;
        card.classList.add("is-visible");
      }
    });
    if (empty) empty.hidden = visible > 0;
    filters.forEach((btn) => {
      const active = btn.dataset.filter === value;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
  };

  filters.forEach((btn) => btn.addEventListener("click", () => applyFilter(btn.dataset.filter)));
}

/* ---------- Contact links ---------- */
function initContactLinks() {
  const toUrl = (kind, value) => {
    if (/^https?:\/\//i.test(value)) return value;
    if (kind === "github") return `https://github.com/${value}`;
    if (kind === "linkedin") return `https://www.linkedin.com/in/${value}`;
    return value;
  };

  $$("[data-contact]").forEach((el) => {
    const kind = el.dataset.contact;
    const value = CONFIG[kind];
    const label = $(".contact-value", el);

    if (isPlaceholder(value)) {
      el.classList.add("is-placeholder");
      el.title = "Placeholder: set this in script.js (CONFIG)";
      return;
    }
    if (label) label.textContent = value.replace(/^https?:\/\/(www\.)?/i, "");
    if (kind === "email") {
      el.href = `mailto:${value}`;
    } else if (kind === "phone") {
      el.href = `tel:${value.replace(/\s/g, "")}`;
    } else {
      el.href = toUrl(kind, value);
      el.target = "_blank";
      el.rel = "noopener noreferrer";
    }
  });
}

/* ---------- Contact form ---------- */
function initContactForm() {
  const form = $("#contact-form");
  if (!form) return;
  const status = $("#form-status");
  const submitBtn = $("#submit-btn");
  const fields = ["name", "email", "subject", "message"];
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  let submitting = false;

  const validators = {
    name: (value) => value.trim().length < 2 ? "Enter your full name." : "",
    email: (value) => {
      const email = value.trim();
      if (!email) return "Enter your email address.";
      return emailRe.test(email) ? "" : "Enter a valid email address, like name@example.com.";
    },
    subject: (value) => value.trim().length < 3 ? "Enter a subject (at least 3 characters)." : "",
    message: (value) => value.trim().length < 10 ? "Write a message of at least 10 characters." : ""
  };

  const setError = (id, msg) => {
    const input = $("#" + id);
    const out = $(`#${id}-error`);
    if (!input || !out) return;
    out.textContent = msg;
    if (msg) {
      input.setAttribute("aria-invalid", "true");
    } else {
      input.removeAttribute("aria-invalid");
    }
  };

  const validateField = (id) => {
    const input = $("#" + id);
    const msg = input ? validators[id](input.value) : "";
    setError(id, msg);
    return !msg;
  };

  const showStatus = (type, text) => {
    status.className = `form-status is-${type}`;
    status.textContent = text;
  };

  fields.forEach((id) => {
    const input = $("#" + id);
    if (!input) return;
    input.addEventListener("blur", () => validateField(id));
    input.addEventListener("input", () => { if (input.hasAttribute("aria-invalid")) validateField(id); });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (submitting) return;
    showStatus("info", "");

    const results = fields.map(validateField);
    if (results.includes(false)) {
      const firstBad = fields.find((id) => $("#" + id).hasAttribute("aria-invalid"));
      if (firstBad) {
        $("#" + firstBad).focus();
      }
      showStatus("error", "Please fix the highlighted fields and try again.");
      return;
    }

    if (!CONFIG.formEndpoint) {
      showStatus("info", "Your message was not sent: form delivery is not configured yet. Add a form endpoint in script.js (see README), or email me directly.");
      return;
    }

    submitting = true;
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    try {
      const data = Object.fromEntries(
        fields.map((id) => [id, $("#" + id).value.trim()])
      );
      const res = await fetch(CONFIG.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      form.reset();
      showStatus("success", "Thanks! Your message was sent.");
    } catch {
      showStatus("error", "Your message could not be sent. Please try again later or email me directly.");
    } finally {
      submitting = false;
      submitBtn.disabled = false;
      submitBtn.textContent = "Send Message";
    }
  });
}

/* ---------- Boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNav();
  initProjects();
  initReveal();
  initContactLinks();
  initContactForm();
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();
});
