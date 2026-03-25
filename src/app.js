import { gsap } from "gsap";
import { getContent } from "./content/index.js";
import { portfolioAssets, projects } from "./data/projects.js";

const SECTION_ORDER = ["resume", "portfolio"];
const DEFAULT_NAME_WEIGHT = 500;
const DEFAULT_NAME_OPSZ = 411;
const DEFAULT_NAME_TRACK = 0.015;
const MIN_NAME_WEIGHT = 400;
const MAX_NAME_WEIGHT = 900;
const MIN_NAME_OPSZ = 411;
const MAX_NAME_OPSZ = 1200;

export function createPortfolioApp(root, { locale }) {
  const content = getContent(locale);
  const projectLookup = new Map(projects.map((project) => [project.id, project]));
  const supportsFinePointer = window.matchMedia("(pointer: fine)").matches;

  root.innerHTML = renderApp(content);

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const state = {
    activeProjectId: projects.find((project) => project.gallery?.length)?.id ?? projects[0]?.id ?? null,
    openSection: null,
    heroInteractive: false
  };

  const refs = {
    appShell: root.querySelector("[data-app-shell]"),
    heroLayer: root.querySelector("[data-hero-layer]"),
    heroLockup: root.querySelector("[data-hero-lockup]"),
    heroName: root.querySelector("[data-hero-name]"),
    heroTagline: root.querySelector("[data-hero-tagline]"),
    sectionCursor: root.querySelector("[data-section-cursor]"),
    sectionCursorLabel: root.querySelector("[data-section-cursor-label]"),
    projectList: root.querySelector("[data-project-list]"),
    projectCards: Array.from(root.querySelectorAll("[data-project-card]"))
  };

  const panels = SECTION_ORDER.reduce((accumulator, key) => {
    const node = root.querySelector(`[data-section-panel="${key}"]`);
    accumulator[key] = {
      node,
      bar: node.querySelector("[data-section-toggle]"),
      body: node.querySelector("[data-section-body]"),
      arrow: node.querySelector("[data-section-arrow]")
    };
    return accumulator;
  }, {});

  const heroVariableState = {
    wght: DEFAULT_NAME_WEIGHT,
    opsz: DEFAULT_NAME_OPSZ,
    track: DEFAULT_NAME_TRACK
  };

  const applyHeroVariables = () => {
    refs.heroName.style.setProperty("--hero-weight", heroVariableState.wght.toFixed(0));
    refs.heroName.style.setProperty("--hero-opsz", heroVariableState.opsz.toFixed(1));
    refs.heroName.style.setProperty("--hero-track", `${heroVariableState.track.toFixed(3)}em`);
  };

  const animateNameWeight = gsap.quickTo(heroVariableState, "wght", {
    duration: prefersReducedMotion ? 0 : 0.65,
    ease: "power3.out",
    onUpdate: applyHeroVariables
  });

  const animateNameOpsz = gsap.quickTo(heroVariableState, "opsz", {
    duration: prefersReducedMotion ? 0 : 0.65,
    ease: "power3.out",
    onUpdate: applyHeroVariables
  });

  const projectRefs = refs.projectCards.map((card) => ({
    card,
    trigger: card.querySelector("[data-project-trigger]"),
    detail: card.querySelector("[data-project-detail]"),
    detailInner: card.querySelector("[data-project-detail-inner]")
  }));

  applyHeroVariables();
  gsap.set(refs.sectionCursor, {
    xPercent: -50,
    yPercent: -50,
    autoAlpha: 0,
    scale: 0.35
  });
  syncPanels(true);
  syncActiveProject(true);
  bindEvents();
  runEntranceMotion();

  function bindEvents() {
    SECTION_ORDER.forEach((key) => {
      panels[key].bar.addEventListener("click", () => {
        pulseSectionCursor();
        state.openSection = state.openSection === key ? null : key;
        syncPanels(false);
        updateSectionCursorLabel(key);
      });

      if (supportsFinePointer) {
        panels[key].bar.addEventListener("pointerenter", (event) => handleSectionBarPointerEnter(event, key));
        panels[key].bar.addEventListener("pointermove", (event) => handleSectionBarPointerMove(event, key));
        panels[key].bar.addEventListener("pointerleave", handleSectionBarPointerLeave);
        panels[key].bar.addEventListener("pointercancel", handleSectionBarPointerLeave);
      }
    });

    refs.projectList.addEventListener("pointermove", (event) => {
      if (!supportsFinePointer || state.openSection !== "portfolio") {
        return;
      }

      const card = event.target.closest("[data-project-card]");
      if (card) {
        activateProject(card.dataset.projectId);
      }
    });

    refs.projectList.addEventListener("focusin", (event) => {
      const card = event.target.closest("[data-project-card]");
      if (card) {
        activateProject(card.dataset.projectId);
      }
    });

    refs.projectList.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-project-trigger]");
      if (trigger) {
        activateProject(trigger.closest("[data-project-card]").dataset.projectId);
      }
    });

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerout", (event) => {
      if (!event.relatedTarget) {
        hideSectionCursor();
      }

      if (state.heroInteractive && !event.relatedTarget) {
        resetHeroVariables();
      }
    });

    window.addEventListener("resize", () => {
      hideSectionCursor();
      syncPanels(true);
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && state.openSection) {
        state.openSection = null;
        syncPanels(false);
      }
    });
  }

  function handlePointerMove(event) {
    if (!state.heroInteractive) {
      return;
    }

    const { weight, opsz } = getHeroVariation(event.clientX, event.clientY);

    animateNameWeight(weight);
    animateNameOpsz(opsz);
  }

  function handleSectionBarPointerEnter(event, sectionKey) {
    event.currentTarget.classList.add("is-cursor-active");
    updateSectionCursorLabel(sectionKey);
    moveSectionCursor(event.clientX, event.clientY);

    gsap.to(refs.sectionCursor, {
      autoAlpha: 1,
      scale: 1,
      duration: prefersReducedMotion ? 0 : 0.22,
      ease: "power3.out",
      overwrite: "auto"
    });
  }

  function handleSectionBarPointerMove(event, sectionKey) {
    updateSectionCursorLabel(sectionKey);
    moveSectionCursor(event.clientX, event.clientY);
  }

  function handleSectionBarPointerLeave(event) {
    event.currentTarget.classList.remove("is-cursor-active");
    hideSectionCursor();
  }

  function moveSectionCursor(x, y) {
    gsap.set(refs.sectionCursor, { x, y });
  }

  function updateSectionCursorLabel(sectionKey) {
    refs.sectionCursorLabel.textContent =
      state.openSection === sectionKey ? content.cursor.closeLabel : content.cursor.viewLabel;
  }

  function pulseSectionCursor() {
    if (!supportsFinePointer) {
      return;
    }

    gsap.killTweensOf(refs.sectionCursor);

    gsap.timeline().to(refs.sectionCursor, {
      scale: 0.92,
      duration: prefersReducedMotion ? 0 : 0.08,
      ease: "power2.out"
    }).to(refs.sectionCursor, {
      scale: 1,
      duration: prefersReducedMotion ? 0 : 0.18,
      ease: "power3.out"
    });
  }

  function hideSectionCursor() {
    SECTION_ORDER.forEach((key) => {
      panels[key].bar.classList.remove("is-cursor-active");
    });

    gsap.to(refs.sectionCursor, {
      autoAlpha: 0,
      scale: 0.35,
      duration: prefersReducedMotion ? 0 : 0.16,
      ease: "power2.in",
      overwrite: "auto"
    });
  }

  function resetHeroVariables() {
    animateNameWeight(DEFAULT_NAME_WEIGHT);
    animateNameOpsz(DEFAULT_NAME_OPSZ);
  }

  function getClosedOffset(sectionKey) {
    const barHeight = getSectionBarHeight();
    const index = SECTION_ORDER.indexOf(sectionKey);
    return Math.max(window.innerHeight - barHeight * (SECTION_ORDER.length - index), 0);
  }

  function getSectionBarHeight() {
    const rawValue = getComputedStyle(document.documentElement)
      .getPropertyValue("--section-bar-height")
      .trim();
    const parsedValue = Number.parseFloat(rawValue);

    return parsedValue || 120;
  }

  function syncPanels(immediate) {
    const duration = immediate || prefersReducedMotion ? 0 : 0.82;

    refs.appShell.dataset.openSection = state.openSection || "";

    SECTION_ORDER.forEach((key) => {
      const panel = panels[key];
      const isOpen = state.openSection === key;

      panel.node.classList.toggle("is-open", isOpen);
      panel.bar.setAttribute("aria-expanded", String(isOpen));
      panel.body.setAttribute("aria-hidden", String(!isOpen));

      if ("inert" in panel.body) {
        panel.body.inert = !isOpen;
      }

      gsap.to(panel.node, {
        y: isOpen ? 0 : getClosedOffset(key),
        duration,
        ease: "expo.inOut",
        overwrite: "auto"
      });

      gsap.to(panel.body, {
        autoAlpha: isOpen ? 1 : 0,
        duration: immediate || prefersReducedMotion ? 0 : 0.38,
        ease: "power2.out",
        delay: isOpen && !prefersReducedMotion ? 0.12 : 0,
        overwrite: "auto"
      });

      gsap.to(panel.arrow, {
        rotate: isOpen ? 180 : 0,
        duration,
        ease: "power3.out",
        overwrite: "auto"
      });
    });

  }

  function activateProject(projectId) {
    const project = projectLookup.get(projectId);

    if (!projectId || !project?.gallery?.length || state.activeProjectId === projectId) {
      return;
    }

    state.activeProjectId = projectId;
    syncActiveProject(false);
  }

  function syncActiveProject(immediate) {
    projectRefs.forEach(({ card, trigger, detail, detailInner }) => {
      const project = projectLookup.get(card.dataset.projectId);
      const isExpandable = Boolean(project?.gallery?.length);
      const isActive = isExpandable && card.dataset.projectId === state.activeProjectId;

      card.classList.toggle("is-expandable", isExpandable);
      card.classList.toggle("is-active", isActive);
      card.classList.toggle("is-dimmed", !isActive);
      trigger.setAttribute("aria-expanded", String(isActive));
      trigger.setAttribute("aria-disabled", String(!isExpandable));

      gsap.to(card, {
        opacity: isActive ? 1 : 0.3,
        duration: immediate || prefersReducedMotion ? 0 : 0.48,
        ease: "power3.out",
        overwrite: "auto"
      });

      if (!detail || !detailInner) {
        return;
      }

      gsap.to(detail, {
        height: isActive ? "auto" : 0,
        autoAlpha: isActive ? 1 : 0,
        duration: immediate || prefersReducedMotion ? 0 : 0.52,
        ease: "power2.out",
        overwrite: "auto"
      });

      gsap.to(detailInner, {
        autoAlpha: isActive ? 1 : 0,
        y: isActive ? 0 : 20,
        duration: immediate || prefersReducedMotion ? 0 : 0.42,
        ease: "power3.out",
        overwrite: "auto"
      });
    });
  }

  function runEntranceMotion() {
    if (prefersReducedMotion) {
      state.heroInteractive = true;
      return;
    }

    gsap.set(refs.heroName, { autoAlpha: 0 });
    gsap.set(refs.heroTagline, { autoAlpha: 0 });
    gsap.set(SECTION_ORDER.map((key) => panels[key].bar), { autoAlpha: 0, y: 24 });
    gsap.set(heroVariableState, {
      wght: MAX_NAME_WEIGHT,
      opsz: DEFAULT_NAME_OPSZ,
      track: DEFAULT_NAME_TRACK
    });
    applyHeroVariables();

    const sectionIntroOrder = [panels.portfolio.bar, panels.resume.bar];

    const timeline = gsap.timeline({
      onComplete: () => {
        state.heroInteractive = true;
      }
    });

    timeline.to(refs.heroName, {
      autoAlpha: 1,
      duration: 0.3,
      ease: "power1.out"
    });

    timeline.to(
      heroVariableState,
      {
        wght: DEFAULT_NAME_WEIGHT,
        duration: 0.9,
        ease: "power3.out",
        onUpdate: applyHeroVariables
      },
      0
    );

    timeline.to(
      refs.heroTagline,
      {
        autoAlpha: 1,
        duration: 0.28,
        ease: "power2.out"
      },
      0.5
    );

    timeline.to(
      sectionIntroOrder,
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.42,
        ease: "power3.out",
        stagger: 0.14
      },
      0.9
    );

    timeline.from(
      root.querySelector("[data-locale-link]"),
      {
        autoAlpha: 0,
        duration: 0.28,
        ease: "power2.out"
      },
      1.02
    );
  }
}

function getHeroVariation(x, y) {
  const viewportWidth = Math.max(window.innerWidth || 0, 1);
  const viewportHeight = Math.max(window.innerHeight || 0, 1);
  const normalizedX = gsap.utils.clamp(0, 1, x / viewportWidth);
  const normalizedY = gsap.utils.clamp(0, 1, y / viewportHeight);
  const weight = gsap.utils.mapRange(0, 1, MIN_NAME_WEIGHT, MAX_NAME_WEIGHT, normalizedY);
  const opsz = gsap.utils.mapRange(0, 1, MIN_NAME_OPSZ, MAX_NAME_OPSZ, normalizedX);

  return {
    weight,
    opsz
  };
}

function renderApp(content) {
  return `
    <div class="app-shell" data-app-shell data-open-section="">
      <div class="section-cursor" data-section-cursor aria-hidden="true">
        <span class="section-cursor__label" data-section-cursor-label>${content.cursor.viewLabel}</span>
      </div>

      <header class="site-header">
        <a
          class="locale-link"
          data-locale-link
          href="${content.site.switchHref}"
          lang="${content.site.switchLang}"
          aria-label="${content.site.switchAriaLabel}"
        >
          ${content.site.switchLabel}
        </a>
      </header>

      <main class="hero-layer" data-hero-layer>
        <div class="hero-lockup" data-hero-lockup>
          <h1 class="hero-name" data-hero-name>${renderSmallCapsName(content.hero.name)}</h1>
          <p class="hero-tagline" data-hero-tagline lang="${content.hero.taglineLang}">${content.hero.tagline}</p>
        </div>
      </main>

      <div class="section-panels">
        ${renderResumePanel(content)}
        ${renderPortfolioPanel(content)}
      </div>
    </div>
  `;
}

function renderSmallCapsName(name) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const [initial, ...restChars] = word;
      const rest = restChars.join("");

      return `
        <span class="hero-name__word">
          <span class="hero-name__initial">${escapeHtml(initial)}</span>
          <span class="hero-name__rest">${escapeHtml(rest)}</span>
        </span>
      `;
    })
    .join("");
}

function renderResumePanel(content) {
  return `
    <section class="section-panel section-panel--resume" data-section-panel="resume">
      <button
        class="section-bar"
        type="button"
        data-section-toggle
        aria-expanded="false"
        aria-controls="resume-content"
      >
        <span class="section-bar__title">${content.resume.label}</span>
        <span class="section-bar__arrow" data-section-arrow>↓</span>
      </button>

      <div class="section-panel__body" id="resume-content" data-section-body aria-hidden="true">
        <div class="section-panel__inner resume-layout">
          <div class="section-copy">
            <p class="section-copy__eyebrow">${content.resume.overline}</p>
            <p class="section-copy__body">${content.resume.intro}</p>
          </div>

          <div class="resume-groups">
            ${content.resume.blocks
              .map(
                (block) => `
                  <section class="resume-group">
                    <p class="resume-group__title">${block.title}</p>
                    <div class="resume-group__lines">
                      ${block.lines.map((line) => `<p>${line}</p>`).join("")}
                    </div>
                  </section>
                `
              )
              .join("")}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderPortfolioPanel(content) {
  return `
    <section class="section-panel section-panel--portfolio" data-section-panel="portfolio">
      <button
        class="section-bar"
        type="button"
        data-section-toggle
        aria-expanded="false"
        aria-controls="portfolio-content"
      >
        <span class="section-bar__title">${content.portfolio.label}</span>
        <span class="section-bar__arrow" data-section-arrow>↓</span>
      </button>

      <div class="section-panel__body" id="portfolio-content" data-section-body aria-hidden="true">
        <div class="section-panel__inner section-panel__inner--portfolio portfolio-layout">
          <ol class="project-list" data-project-list>
            ${projects.map((project) => renderProject(project, content)).join("")}
          </ol>
        </div>
      </div>
    </section>
  `;
}

function renderProject(project, content) {
  const locale = content.locale;
  const meta = escapeHtml(project.meta[locale] ?? project.meta.en);
  const name = escapeHtml(project.name);
  const hasDetail = Boolean(project.gallery?.length);
  const detailId = `${project.id}-detail`;

  return `
    <li class="project-card" data-project-card data-project-id="${project.id}">
      <button
        class="project-card__summary"
        type="button"
        data-project-trigger
        aria-expanded="false"
        aria-label="${escapeHtml(`${project.name}, ${project.meta[locale] ?? project.meta.en}`)}"
        ${hasDetail ? `aria-controls="${detailId}"` : ""}
      >
        <span class="project-card__logo">
          ${renderProjectLogo(project, name)}
        </span>
        <span class="project-card__meta">${meta}</span>
      </button>

      ${
        hasDetail
          ? `
            <div class="project-card__detail" id="${detailId}" data-project-detail>
              <div class="project-card__detail-inner" data-project-detail-inner>
                <div class="project-card__description">
                  ${renderProjectDescription(project, locale)}
                </div>
                <div class="project-card__gallery">
                  ${renderProjectGallery(project)}
                </div>
              </div>
            </div>
          `
          : ""
      }
    </li>
  `;
}

function renderProjectLogo(project, label) {
  if (project.logo.kind === "abmac") {
    return `
      <span class="project-logo project-logo--abmac" aria-hidden="true">
        <span class="project-logo__part project-logo__part--vector-a">
          <img src="${portfolioAssets.abmac.vector}" alt="" loading="lazy" />
        </span>
        <span class="project-logo__part project-logo__part--vector-b">
          <img src="${portfolioAssets.abmac.vector1}" alt="" loading="lazy" />
        </span>
        <span class="project-logo__part project-logo__part--vector-c">
          <img src="${portfolioAssets.abmac.vector2}" alt="" loading="lazy" />
        </span>
        <span class="project-logo__part project-logo__part--vector-d">
          <img src="${portfolioAssets.abmac.vector3}" alt="" loading="lazy" />
        </span>
        <span class="project-logo__part project-logo__part--vector-e">
          <img src="${portfolioAssets.abmac.vector1}" alt="" loading="lazy" />
        </span>
        <span class="project-logo__part project-logo__part--vector-f">
          <img src="${portfolioAssets.abmac.vector2Stroke}" alt="" loading="lazy" />
        </span>
      </span>
    `;
  }

  return `
    <span class="project-logo">
      <img
        class="project-logo__image ${escapeHtml(project.logo.className || "")}"
        src="${project.logo.src}"
        alt="${label}"
        width="${project.logo.width}"
        height="${project.logo.height}"
        loading="lazy"
      />
    </span>
  `;
}

function renderProjectDescription(project, locale) {
  const lines = project.description?.[locale] ?? project.description?.en ?? [];

  return lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("");
}

function renderProjectGallery(project) {
  return project.gallery
    .map(
      (item) => `
        <figure
          class="project-gallery__item"
          style="width: ${item.width}px; height: ${item.height}px;"
        >
          <img
            class="${escapeHtml(item.className || "project-gallery__image")}"
            src="${item.src}"
            alt="${escapeHtml(item.alt)}"
            width="${item.width}"
            height="${item.height}"
            loading="lazy"
          />
        </figure>
      `
    )
    .join("");
}

function getEscapeMap() {
  return {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };
}

function escapeHtml(value) {
  const escapeMap = getEscapeMap();
  return String(value).replace(/[&<>"']/g, (match) => escapeMap[match]);
}
