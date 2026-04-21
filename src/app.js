import { gsap } from "gsap";
import { getContent } from "./content/index.js";
import { portfolioAssets, projects } from "./data/projects.js";

const SECTION_ORDER = ["resume", "portfolio"];
const DEFAULT_ACTIVE_PROJECT_ID = null;
const DEFAULT_NAME_WEIGHT = 500;
const DEFAULT_NAME_OPSZ = 411;
const DEFAULT_NAME_TRACK = 0.015;
const MIN_NAME_WEIGHT = 400;
const MAX_NAME_WEIGHT = 900;
const MIN_NAME_OPSZ = 411;
const MAX_NAME_OPSZ = 1200;
const VIEWER_THUMB_HEIGHT = 64;
const VIEWER_CONTENT_MAX_HEIGHT_RATIO = 0.88;
const VIEWER_SINGLE_CONTENT_MAX_HEIGHT_RATIO = 0.96;
const VIEWER_LONG_IMAGE_HEIGHT_THRESHOLD = 2500;
const PROJECT_DETAIL_DURATION = 0.52;
const PROJECT_DETAIL_INNER_DURATION = 0.42;
const PROJECT_SCROLL_DURATION = 0.44;
const CASE_STUDY_TRANSITION_DURATION = 0.72;
const LIGHT_EFFECTS_STORAGE_KEY = "portfolio:light-effects";

export function createPortfolioApp(root, { locale, deferEntranceMotion = false }) {
  const content = getContent(locale);
  const projectLookup = new Map(projects.map((project) => [project.id, project]));
  const previewState = getPreviewState(window.location.search, projectLookup);
  const supportsFinePointer = window.matchMedia("(pointer: fine)").matches;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pointerPosition = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  };
  const state = {
    activeProjectId: previewState.activeProjectId ?? DEFAULT_ACTIVE_PROJECT_ID,
    openSection: previewState.openSection,
    heroInteractive: false,
    viewerOpen: false,
    viewerProjectId: null,
    viewerImageIndex: null,
    caseStudyOpen: Boolean(previewState.caseStudyProjectId),
    caseStudyProjectId: previewState.caseStudyProjectId,
    lightEffectsEnabled: getStoredLightEffectsPreference({ prefersReducedMotion })
  };
  let activeCursorElement = null;
  let cursorHidden = true;
  const preloadedImages = new Map();
  let viewerItems = [];
  let viewerRenderKey = "";
  let viewerShowSwitcher = true;
  let viewerSource = null;
  let viewerTimeline = null;
  let viewerImageTimeline = null;
  let viewerAnimating = false;
  let caseStudyTimeline = null;
  let caseStudyAnimating = false;
  let pendingViewerImageRequest = 0;
  let hiddenOriginTrigger = null;
  let pendingProjectActivationRequest = 0;
  let caseStudyHistoryMode = state.caseStudyOpen ? "loaded" : "none";
  let entranceMotionStarted = false;
  let pendingPointerFrame = 0;
  let latestPointerTarget = null;

  root.innerHTML = renderApp(content, state);

  const refs = {
    appShell: root.querySelector("[data-app-shell]"),
    homeScene: root.querySelector("[data-home-scene]"),
    heroLayer: root.querySelector("[data-hero-layer]"),
    heroLockup: root.querySelector("[data-hero-lockup]"),
    heroName: root.querySelector("[data-hero-name]"),
    heroTagline: root.querySelector("[data-hero-tagline]"),
    lightEffectsToggle: root.querySelector("[data-light-effects-toggle]"),
    sectionCursor: root.querySelector("[data-section-cursor]"),
    sectionCursorLabel: root.querySelector("[data-section-cursor-label]"),
    projectList: root.querySelector("[data-project-list]"),
    projectCards: Array.from(root.querySelectorAll("[data-project-card]")),
    viewer: root.querySelector("[data-image-viewer]"),
    viewerMask: root.querySelector("[data-image-viewer-mask]"),
    viewerFrame: root.querySelector("[data-image-viewer-frame]"),
    viewerMedia: root.querySelector("[data-image-viewer-media]"),
    viewerSwitcher: root.querySelector("[data-image-viewer-switcher]"),
    viewerThumbs: root.querySelector("[data-image-viewer-thumbs]"),
    caseStudy: root.querySelector("[data-case-study]"),
    caseStudySheet: root.querySelector("[data-case-study-sheet]"),
    caseStudyPages: Array.from(root.querySelectorAll("[data-case-study-page]"))
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
    gradient: card.querySelector("[data-project-gradient]"),
    detail: card.querySelector("[data-project-detail]"),
    detailInner: card.querySelector("[data-project-detail-inner]")
  }));
  const caseStudyRefs = refs.caseStudyPages.map((page) => ({
    page,
    projectId: page.dataset.caseStudyPage,
    scroll: page.querySelector("[data-case-study-scroll]"),
    backTrigger: page.querySelector("[data-case-study-back]")
  }));

  applyHeroVariables();
  gsap.set(refs.sectionCursor, {
    xPercent: -50,
    yPercent: -50,
    autoAlpha: 0,
    scale: 0.35
  });
  gsap.set(refs.viewer, { autoAlpha: 0 });
  gsap.set(refs.viewerMask, { autoAlpha: 0 });
  gsap.set(refs.viewerSwitcher, { autoAlpha: 0, y: prefersReducedMotion ? 0 : 18 });
  gsap.set(refs.homeScene, { x: state.caseStudyOpen ? -window.innerWidth : 0 });
  gsap.set(refs.caseStudy, {
    autoAlpha: state.caseStudyOpen ? 1 : 0,
    x: state.caseStudyOpen ? 0 : window.innerWidth
  });
  refs.viewer.setAttribute("aria-hidden", "true");
  refs.caseStudy.setAttribute("aria-hidden", String(!state.caseStudyOpen));

  if ("inert" in refs.viewer) {
    refs.viewer.inert = true;
  }

  if ("inert" in refs.caseStudy) {
    refs.caseStudy.inert = !state.caseStudyOpen;
  }

  window.history.replaceState({ caseStudyProjectId: state.caseStudyProjectId }, "", window.location.href);

  syncPanels(true);
  syncActiveProject(true);
  syncCaseStudy(true);
  syncLightEffects(false);
  bindEvents();
  scheduleImagePreload();
  if (!deferEntranceMotion) {
    startEntranceMotion();
  }
  syncPortfolioBarBorder();

  return {
    startEntranceMotion
  };

  function bindEvents() {
    SECTION_ORDER.forEach((key) => {
      panels[key].bar.addEventListener("click", () => {
        pulseCursor();
        state.openSection = state.openSection === key ? null : key;
        syncPanels(false);
        refreshCursorFromLastPointer();
      });
    });

    refs.lightEffectsToggle.addEventListener("click", () => {
      state.lightEffectsEnabled = !state.lightEffectsEnabled;
      syncLightEffects(true);
    });

    panels.resume.body.addEventListener("click", handleResumeClick);
    panels.portfolio.body.addEventListener("scroll", syncPortfolioBarBorder, { passive: true });

    refs.projectList.addEventListener("click", (event) => {
      const learnMoreTrigger = event.target.closest("[data-project-learn-more]");
      if (learnMoreTrigger) {
        event.preventDefault();
        openCaseStudy(learnMoreTrigger.closest("[data-project-card]")?.dataset.projectId);
        return;
      }

      const galleryTrigger = event.target.closest("[data-project-gallery-trigger]");
      if (galleryTrigger) {
        event.preventDefault();
        openImageViewer(galleryTrigger);
        return;
      }

      const trigger = event.target.closest("[data-project-trigger]");
      if (trigger) {
        void activateProject(trigger.closest("[data-project-card]").dataset.projectId);
      }
    });

    refs.viewer.addEventListener("click", handleViewerClick);
    refs.caseStudy.addEventListener("click", handleCaseStudyClick);

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerout", (event) => {
      if (!event.relatedTarget) {
        latestPointerTarget = null;

        if (pendingPointerFrame) {
          window.cancelAnimationFrame(pendingPointerFrame);
          pendingPointerFrame = 0;
        }

        hideCursor();
      }

      if (state.heroInteractive && !event.relatedTarget) {
        resetHeroVariables();
      }
    });

    window.addEventListener("resize", () => {
      hideCursor();
      syncPanels(true);
      syncPortfolioBarBorder();

      if (state.viewerOpen) {
        syncImageViewer(true);
        refreshCursorFromLastPointer();
      }

      if (state.caseStudyOpen) {
        syncCaseStudy(true);
        refreshCursorFromLastPointer();
      }
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && state.viewerOpen) {
        event.preventDefault();
        closeImageViewer();
        return;
      }

      if (event.key === "Escape" && state.caseStudyOpen) {
        event.preventDefault();
        requestCloseCaseStudy();
        return;
      }

      if (event.key === "Escape" && state.openSection) {
        state.openSection = null;
        syncPanels(false);
        refreshCursorFromLastPointer();
      }
    });

    window.addEventListener("popstate", handlePopState);
  }

  function handlePointerMove(event) {
    pointerPosition.x = event.clientX;
    pointerPosition.y = event.clientY;
    latestPointerTarget = event.target;

    if (pendingPointerFrame) {
      return;
    }

    pendingPointerFrame = window.requestAnimationFrame(flushPointerMove);
  }

  function flushPointerMove() {
    pendingPointerFrame = 0;

    if (supportsFinePointer && state.heroInteractive && !state.caseStudyOpen && !prefersReducedMotion) {
      const { weight, opsz } = getHeroVariation(pointerPosition.x, pointerPosition.y);

      animateNameWeight(weight);
      animateNameOpsz(opsz);
    }

    if (supportsFinePointer && latestPointerTarget) {
      syncCursorFromTarget(latestPointerTarget, pointerPosition.x, pointerPosition.y);
    }
  }

  function handleViewerClick(event) {
    if (!state.viewerOpen || viewerAnimating) {
      return;
    }

    const thumbTrigger = event.target.closest("[data-image-viewer-thumb-trigger]");
    if (thumbTrigger) {
      const nextIndex = Number.parseInt(thumbTrigger.dataset.imageViewerIndex ?? "", 10);
      if (!Number.isNaN(nextIndex)) {
        setViewerImage(nextIndex);
      }
      return;
    }

    if (!event.target.closest("[data-image-viewer-frame]")) {
      closeImageViewer();
    }
  }

  function handleResumeClick(event) {
    const featuredProjectTrigger = event.target.closest("[data-resume-featured-project]");
    if (!featuredProjectTrigger) {
      return;
    }

    event.preventDefault();
    void openPortfolioProject(featuredProjectTrigger.dataset.resumeFeaturedProject);
  }

  function handleCaseStudyClick(event) {
    if (!state.caseStudyOpen || caseStudyAnimating) {
      return;
    }

    const mediaTrigger = event.target.closest("[data-case-study-media-trigger]");
    if (mediaTrigger) {
      event.preventDefault();
      openImageViewer(mediaTrigger);
      return;
    }

    const backTrigger = event.target.closest("[data-case-study-back]");
    if (backTrigger) {
      event.preventDefault();
      requestCloseCaseStudy();
    }
  }

  function syncCursorFromTarget(target, x, y) {
    const cursorState = getCursorState(target);
    if (!cursorState) {
      moveCursor(x, y);
      hideCursor();
      return;
    }

    setActiveCursorElement(cursorState.cursorElement ?? null);
    refs.sectionCursorLabel.textContent = cursorState.label;
    moveCursor(x, y);
    showCursor();
  }

  function getCursorState(target) {
    if (!(target instanceof Element)) {
      return null;
    }

    if (state.caseStudyOpen && refs.caseStudy.contains(target)) {
      const mediaTrigger = target.closest("[data-case-study-media-trigger]");
      if (mediaTrigger) {
        return {
          label: content.cursor.viewLabel,
          cursorElement: mediaTrigger
        };
      }

      const backTrigger = target.closest("[data-case-study-back]");
      if (backTrigger) {
        return {
          label: content.cursor.backLabel,
          cursorElement: backTrigger
        };
      }

      return null;
    }

    if (state.viewerOpen && refs.viewer.contains(target)) {
      const viewerFrame = target.closest("[data-image-viewer-frame]");
      const viewerSwitcher = target.closest("[data-image-viewer-switcher]");
      if (viewerFrame || viewerSwitcher) {
        return null;
      }

      return {
        label: content.cursor.closeLabel,
        cursorElement: refs.viewer
      };
    }

    const sectionBar = target.closest("[data-section-toggle]");
    if (sectionBar) {
      const panel = sectionBar.closest("[data-section-panel]");
      const sectionKey = panel?.dataset.sectionPanel;
      return {
        label: state.openSection === sectionKey ? content.cursor.closeLabel : content.cursor.viewLabel,
        cursorElement: sectionBar
      };
    }

    const galleryTrigger = target.closest("[data-project-gallery-trigger]");
    if (galleryTrigger) {
      return {
        label: content.cursor.viewLabel,
        cursorElement: galleryTrigger
      };
    }

    return null;
  }

  function setActiveCursorElement(element) {
    if (activeCursorElement === element) {
      return;
    }

    activeCursorElement?.classList.remove("is-cursor-active");
    activeCursorElement = element;
    activeCursorElement?.classList.add("is-cursor-active");
  }

  function moveCursor(x, y) {
    gsap.set(refs.sectionCursor, { x, y });
  }

  function pulseCursor() {
    if (!supportsFinePointer) {
      return;
    }

    cursorHidden = false;
    gsap.killTweensOf(refs.sectionCursor);

    gsap.timeline()
      .to(refs.sectionCursor, {
        scale: 0.92,
        duration: prefersReducedMotion ? 0 : 0.08,
        ease: "power2.out"
      })
      .to(refs.sectionCursor, {
        scale: 1,
        duration: prefersReducedMotion ? 0 : 0.18,
        ease: "power3.out"
      });
  }

  function hideCursor() {
    setActiveCursorElement(null);

    if (cursorHidden) {
      return;
    }

    cursorHidden = true;
    gsap.killTweensOf(refs.sectionCursor);

    gsap.to(refs.sectionCursor, {
      autoAlpha: 0,
      scale: 0.28,
      duration: prefersReducedMotion ? 0 : 0.15,
      ease: "power2.out",
      overwrite: "auto"
    });
  }

  function showCursor() {
    if (!cursorHidden) {
      return;
    }

    cursorHidden = false;
    gsap.killTweensOf(refs.sectionCursor);
    gsap.to(refs.sectionCursor, {
      autoAlpha: 1,
      scale: 1,
      duration: prefersReducedMotion ? 0 : 0.14,
      ease: "power3.out",
      overwrite: "auto"
    });
  }

  function refreshCursorFromLastPointer() {
    if (!supportsFinePointer) {
      return;
    }

    const target = document.elementFromPoint(pointerPosition.x, pointerPosition.y);
    if (!target) {
      hideCursor();
      return;
    }

    syncCursorFromTarget(target, pointerPosition.x, pointerPosition.y);
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
      panel.node.dataset.openSettled = String(isOpen && (immediate || prefersReducedMotion));
      panel.bar.setAttribute("aria-expanded", String(isOpen));
      panel.body.setAttribute("aria-hidden", String(!isOpen));

      if ("inert" in panel.body) {
        panel.body.inert = !isOpen;
      }

      gsap.to(panel.node, {
        y: isOpen ? 0 : getClosedOffset(key),
        duration,
        ease: "expo.inOut",
        onComplete: () => {
          if (key !== "portfolio") {
            return;
          }

          const isSettledOpen = state.openSection === key;
          panel.node.dataset.openSettled = String(isSettledOpen);
          syncProjectGradients(false, isSettledOpen ? "afterPanel" : "default");
        },
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

    syncPortfolioBarBorder();
    syncProjectGradients(immediate);
  }

  function syncPortfolioBarBorder() {
    const isScrolled = (panels.portfolio.body?.scrollTop ?? 0) > 1;
    panels.portfolio.node.classList.toggle("is-body-scrolled", isScrolled);
  }

  function syncLightEffects(persist) {
    refs.appShell.dataset.lightEffects = state.lightEffectsEnabled ? "on" : "off";
    refs.lightEffectsToggle.setAttribute("aria-pressed", String(state.lightEffectsEnabled));
    refs.lightEffectsToggle.setAttribute(
      "aria-label",
      state.lightEffectsEnabled ? content.site.lightEffectsOnAriaLabel : content.site.lightEffectsOffAriaLabel
    );

    if (persist) {
      storeLightEffectsPreference(state.lightEffectsEnabled);
    }
  }

  async function openPortfolioProject(projectId) {
    if (!projectId || !projectLookup.has(projectId)) {
      return;
    }

    if (state.openSection !== "portfolio") {
      state.openSection = "portfolio";
      syncPanels(false);
    }

    if (state.activeProjectId === projectId) {
      syncActiveProject(false);
      await scrollProjectIntoViewBeforeExpand(projectId);
      refreshCursorFromLastPointer();
      return;
    }

    await activateProject(projectId);
  }

  async function activateProject(projectId) {
    if (!projectId || !projectLookup.has(projectId)) {
      return;
    }

    const requestId = ++pendingProjectActivationRequest;
    const nextProjectId = state.activeProjectId === projectId ? null : projectId;
    clearProjectScrollBuffer();

    if (!nextProjectId) {
      state.activeProjectId = null;
      syncActiveProject(false);
      refreshCursorFromLastPointer();
      return;
    }

    preloadProjectImages(nextProjectId);

    if (state.activeProjectId && state.activeProjectId !== nextProjectId) {
      state.activeProjectId = null;
      syncActiveProject(false);
      await wait(getProjectToggleWaitDuration());
      if (requestId !== pendingProjectActivationRequest) {
        return;
      }
    }

    await scrollProjectIntoViewBeforeExpand(nextProjectId);
    if (requestId !== pendingProjectActivationRequest) {
      return;
    }

    state.activeProjectId = nextProjectId;
    syncActiveProject(false);
    refreshCursorFromLastPointer();

    await wait(getProjectToggleWaitDuration());
    if (requestId !== pendingProjectActivationRequest) {
      return;
    }

    clearProjectScrollBuffer();
  }

  function getProjectRef(projectId) {
    return projectRefs.find(({ card }) => card.dataset.projectId === projectId) ?? null;
  }

  function getElementTopWithinContainer(element, container) {
    const elementRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    return container.scrollTop + elementRect.top - containerRect.top;
  }

  function getCollapsedProjectRowHeight(projectRef) {
    return projectRef?.trigger?.offsetHeight || projectRef?.card?.offsetHeight || 120;
  }

  function getExpandedProjectDetailHeight(projectRef) {
    return projectRef?.detailInner?.scrollHeight || 0;
  }

  function getDesiredProjectScrollTop(projectRef, scrollContainer) {
    const collapsedHeight = getCollapsedProjectRowHeight(projectRef);
    const detailHeight = getExpandedProjectDetailHeight(projectRef);
    const expandedHeight = collapsedHeight + detailHeight;
    const viewportHeight = scrollContainer.clientHeight;
    const targetTop = getElementTopWithinContainer(projectRef.card, scrollContainer);
    const targetCenter = targetTop + expandedHeight / 2;
    const projectedMaxScrollTop = Math.max(0, scrollContainer.scrollHeight + detailHeight - viewportHeight);

    return Math.min(projectedMaxScrollTop, Math.max(0, targetCenter - viewportHeight / 2));
  }

  function wait(ms) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }

  function getProjectToggleWaitDuration() {
    return prefersReducedMotion ? 0 : Math.max(PROJECT_DETAIL_DURATION, PROJECT_DETAIL_INNER_DURATION) * 1000;
  }

  function waitForNextFrame() {
    return new Promise((resolve) => {
      window.requestAnimationFrame(() => resolve());
    });
  }

  function getProjectMaxScrollTop(scrollContainer) {
    return Math.max(0, scrollContainer.scrollHeight - scrollContainer.clientHeight);
  }

  function clearProjectScrollBuffer() {
    refs.projectList?.style.removeProperty("padding-bottom");
  }

  function ensureProjectScrollBuffer(scrollContainer, desiredScrollTop) {
    const currentMaxScrollTop = getProjectMaxScrollTop(scrollContainer);
    const extraScrollSpace = Math.max(0, desiredScrollTop - currentMaxScrollTop);

    if (extraScrollSpace <= 1) {
      clearProjectScrollBuffer();
      return;
    }

    refs.projectList.style.paddingBottom = `${Math.ceil(extraScrollSpace)}px`;
  }

  function tweenScrollTop(container, scrollTop) {
    return new Promise((resolve) => {
      const tweenState = {
        scrollTop: container.scrollTop
      };

      gsap.killTweensOf(tweenState);
      gsap.to(tweenState, {
        scrollTop,
        duration: prefersReducedMotion ? 0 : PROJECT_SCROLL_DURATION,
        ease: "power2.inOut",
        overwrite: "auto",
        onUpdate: () => {
          container.scrollTop = tweenState.scrollTop;
        },
        onComplete: resolve,
        onInterrupt: resolve
      });
    });
  }

  async function scrollProjectIntoViewBeforeExpand(projectId) {
    const scrollContainer = panels.portfolio.body;
    const projectRef = getProjectRef(projectId);

    if (!scrollContainer || !projectRef || state.openSection !== "portfolio") {
      return;
    }

    const desiredScrollTop = getDesiredProjectScrollTop(projectRef, scrollContainer);
    ensureProjectScrollBuffer(scrollContainer, desiredScrollTop);
    await waitForNextFrame();

    const reachableScrollTop = Math.min(desiredScrollTop, getProjectMaxScrollTop(scrollContainer));

    if (Math.abs(scrollContainer.scrollTop - reachableScrollTop) >= 2) {
      await tweenScrollTop(scrollContainer, reachableScrollTop);
    }
  }

  function syncActiveProject(immediate) {
    projectRefs.forEach(({ card, trigger, detail, detailInner }) => {
      const isActive = card.dataset.projectId === state.activeProjectId;

      card.classList.toggle("is-active", isActive);
      trigger.setAttribute("aria-pressed", String(isActive));
      trigger.setAttribute("aria-expanded", String(isActive));

      if (!detail || !detailInner) {
        return;
      }

      detail.setAttribute("aria-hidden", String(!isActive));

      gsap.to(detail, {
        height: isActive ? "auto" : 0,
        autoAlpha: isActive ? 1 : 0,
        duration: immediate || prefersReducedMotion ? 0 : PROJECT_DETAIL_DURATION,
        ease: "power2.out",
        overwrite: "auto"
      });

      gsap.to(detailInner, {
        autoAlpha: isActive ? 1 : 0,
        y: isActive ? 0 : 20,
        duration: immediate || prefersReducedMotion ? 0 : PROJECT_DETAIL_INNER_DURATION,
        ease: "power3.out",
        overwrite: "auto"
      });
    });

    syncProjectGradients(immediate, "afterDetail");
  }

  function syncProjectGradients(immediate, mode = "default") {
    const isPortfolioSettled = panels.portfolio.node.dataset.openSettled === "true";
    const duration = immediate || prefersReducedMotion ? 0 : 0.38;
    const detailDelay = immediate || prefersReducedMotion ? 0 : 0.48;
    const panelDelay = immediate || prefersReducedMotion ? 0 : 0.08;

    projectRefs.forEach(({ card, gradient }) => {
      if (!gradient) {
        return;
      }

      const isActive = card.dataset.projectId === state.activeProjectId;
      const shouldShow = isActive && state.openSection === "portfolio" && isPortfolioSettled;
      const delay = shouldShow ? (mode === "afterDetail" ? detailDelay : mode === "afterPanel" ? panelDelay : 0) : 0;

      gsap.to(gradient, {
        autoAlpha: shouldShow ? 1 : 0,
        duration,
        delay,
        ease: "power2.out",
        overwrite: "auto"
      });
    });
  }

  function getCaseStudyRef(projectId) {
    return caseStudyRefs.find((pageRef) => pageRef.projectId === projectId) ?? null;
  }

  function handlePopState() {
    const nextProjectId = getCaseStudyProjectIdFromSearch(window.location.search, projectLookup);

    if (nextProjectId) {
      openCaseStudy(nextProjectId, {
        immediate: false,
        updateHistory: false,
        historyMode: "history"
      });
      return;
    }

    closeCaseStudy({
      immediate: false,
      historyMode: "none"
    });
  }

  function requestCloseCaseStudy() {
    if (!state.caseStudyOpen || caseStudyAnimating) {
      return;
    }

    if (caseStudyHistoryMode === "loaded") {
      updateCaseStudyHistory(null, { replace: true });
      closeCaseStudy({
        immediate: false,
        historyMode: "none"
      });
      return;
    }

    window.history.back();
  }

  function openCaseStudy(projectId, { immediate = false, updateHistory = true, historyMode = "pushed" } = {}) {
    if (!projectId || !projectLookup.has(projectId) || !hasProjectCaseStudy(projectLookup.get(projectId)) || state.viewerOpen) {
      return;
    }

    if (state.caseStudyOpen && state.caseStudyProjectId === projectId) {
      return;
    }

    const wasOpen = state.caseStudyOpen;
    const caseStudyRef = getCaseStudyRef(projectId);

    if (state.openSection !== "portfolio") {
      state.openSection = "portfolio";
      syncPanels(true);
    }

    if (state.activeProjectId !== projectId) {
      state.activeProjectId = projectId;
      syncActiveProject(true);
    }

    state.caseStudyOpen = true;
    state.caseStudyProjectId = projectId;
    caseStudyHistoryMode = historyMode;
    syncCaseStudyPage(projectId);

    if (caseStudyRef?.scroll) {
      caseStudyRef.scroll.scrollTop = 0;
    }

    if (updateHistory) {
      updateCaseStudyHistory(projectId);
      caseStudyHistoryMode = "pushed";
    }

    if (wasOpen) {
      syncCaseStudy(true);
      refreshCursorFromLastPointer();
      return;
    }

    animateCaseStudyOpen(immediate);
  }

  function closeCaseStudy({ immediate = false, historyMode = "none" } = {}) {
    if (!state.caseStudyOpen && !caseStudyAnimating) {
      caseStudyHistoryMode = historyMode;
      return;
    }

    state.caseStudyOpen = false;
    animateCaseStudyClose(immediate, historyMode);
  }

  function updateCaseStudyHistory(projectId, { replace = false } = {}) {
    const url = new URL(window.location.href);

    if (projectId) {
      url.searchParams.set("case-study", projectId);
    } else {
      url.searchParams.delete("case-study");
    }

    const method = replace ? "replaceState" : "pushState";
    window.history[method]({ caseStudyProjectId: projectId }, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function syncCaseStudyPage(projectId) {
    caseStudyRefs.forEach(({ page }) => {
      const isActive = page.dataset.caseStudyPage === projectId;
      page.hidden = !isActive;
      page.classList.toggle("is-active", isActive);
      page.setAttribute("aria-hidden", String(!isActive));
    });
  }

  function syncCaseStudy(immediate) {
    refs.appShell.dataset.caseStudyOpen = String(state.caseStudyOpen);
    refs.caseStudy.classList.toggle("is-open", state.caseStudyOpen);
    refs.caseStudy.setAttribute("aria-hidden", String(!state.caseStudyOpen));

    if ("inert" in refs.caseStudy) {
      refs.caseStudy.inert = !state.caseStudyOpen;
    }

    if (state.caseStudyOpen) {
      syncCaseStudyPage(state.caseStudyProjectId);
      gsap.set(refs.caseStudy, { autoAlpha: 1, pointerEvents: "auto" });
      if (immediate) {
        gsap.set(refs.homeScene, { x: -window.innerWidth });
        gsap.set(refs.caseStudy, { x: 0 });
      }
      return;
    }

    if (immediate) {
      syncCaseStudyPage(null);
      gsap.set(refs.caseStudy, { autoAlpha: 0, pointerEvents: "none" });
      gsap.set(refs.homeScene, { x: 0 });
      gsap.set(refs.caseStudy, { x: window.innerWidth });
    }
  }

  function animateCaseStudyOpen(immediate) {
    syncCaseStudy(true);
    caseStudyTimeline?.kill();
    gsap.killTweensOf([refs.homeScene, refs.caseStudy]);

    if (immediate || prefersReducedMotion) {
      caseStudyAnimating = false;
      gsap.set(refs.homeScene, { x: -window.innerWidth });
      gsap.set(refs.caseStudy, { x: 0 });
      refreshCursorFromLastPointer();
      return;
    }

    caseStudyAnimating = true;
    gsap.set(refs.caseStudy, { autoAlpha: 1, pointerEvents: "auto" });
    gsap.set(refs.homeScene, { x: 0 });
    gsap.set(refs.caseStudy, { x: window.innerWidth });

    caseStudyTimeline = gsap.timeline({
      defaults: { overwrite: "auto" },
      onComplete: () => {
        caseStudyAnimating = false;
        refreshCursorFromLastPointer();
      }
    });

    caseStudyTimeline.to(
      refs.homeScene,
      {
        x: -window.innerWidth,
        duration: CASE_STUDY_TRANSITION_DURATION,
        ease: "expo.inOut"
      },
      0
    );

    caseStudyTimeline.to(
      refs.caseStudy,
      {
        x: 0,
        duration: CASE_STUDY_TRANSITION_DURATION,
        ease: "expo.inOut"
      },
      0
    );
  }

  function animateCaseStudyClose(immediate, historyMode) {
    caseStudyTimeline?.kill();
    gsap.killTweensOf([refs.homeScene, refs.caseStudy]);

    const finishClose = () => {
      caseStudyAnimating = false;
      state.caseStudyProjectId = null;
      caseStudyHistoryMode = historyMode;
      syncCaseStudy(true);
      syncCaseStudyPage(null);
      refs.caseStudy.classList.remove("is-open");
      gsap.set(refs.caseStudy, { autoAlpha: 0, pointerEvents: "none" });
      gsap.set(refs.homeScene, { x: 0 });
      gsap.set(refs.caseStudy, { x: window.innerWidth });
      refreshCursorFromLastPointer();
    };

    if (immediate || prefersReducedMotion) {
      finishClose();
      return;
    }

    caseStudyAnimating = true;
    refs.caseStudy.classList.add("is-open");
    gsap.set(refs.caseStudy, { autoAlpha: 1, pointerEvents: "auto" });
    gsap.set(refs.homeScene, { x: -window.innerWidth });
    gsap.set(refs.caseStudy, { x: 0 });

    caseStudyTimeline = gsap.timeline({
      defaults: { overwrite: "auto" },
      onComplete: finishClose
    });

    caseStudyTimeline.to(
      refs.homeScene,
      {
        x: 0,
        duration: CASE_STUDY_TRANSITION_DURATION,
        ease: "expo.inOut"
      },
      0
    );

    caseStudyTimeline.to(
      refs.caseStudy,
      {
        x: window.innerWidth,
        duration: CASE_STUDY_TRANSITION_DURATION,
        ease: "expo.inOut"
      },
      0
    );
  }

  function scheduleImagePreload() {
    const preload = () => {
      projects.forEach((project) => {
        preloadProjectImages(project.id);
      });
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(preload, { timeout: 1200 });
      return;
    }

    window.setTimeout(preload, 120);
  }

  function preloadImage(src) {
    if (!src) {
      return Promise.resolve();
    }

    const existingEntry = preloadedImages.get(src);
    if (existingEntry) {
      return existingEntry.promise;
    }

    const image = new window.Image();
    image.decoding = "async";
    const entry = {
      image,
      promise: null
    };

    let settled = false;
    const resolveOnce = (resolve) => () => {
      if (!settled) {
        settled = true;
        resolve(image);
      }
    };

    entry.promise = new Promise((resolve) => {
      const finish = resolveOnce(resolve);
      image.addEventListener("load", finish, { once: true });
      image.addEventListener("error", finish, { once: true });
      image.src = src;

      if (image.complete) {
        finish();
        return;
      }

      if (typeof image.decode === "function") {
        image.decode().then(finish).catch(() => {});
      }
    });

    preloadedImages.set(src, entry);
    return entry.promise;
  }

  function preloadProjectImages(projectId) {
    return Promise.all(getProjectMediaItems(projectId).map((item) => preloadImage(item.src)));
  }

  function getPreloadedImageClone(src) {
    const cachedImage = preloadedImages.get(src)?.image;
    const image = cachedImage ? cachedImage.cloneNode(false) : document.createElement("img");
    image.src = cachedImage?.currentSrc || cachedImage?.src || src;
    image.decoding = "async";
    return image;
  }

  function getImageDimensions(item, variant = "gallery") {
    if (variant !== "viewer") {
      return {
        width: Math.max(item.width || 1, 1),
        height: Math.max(item.height || 1, 1)
      };
    }

    const cachedImage = preloadedImages.get(item.src)?.image;
    const width = cachedImage?.naturalWidth || cachedImage?.width || item.width || 1;
    const height = cachedImage?.naturalHeight || cachedImage?.height || item.height || 1;

    return {
      width: Math.max(width, 1),
      height: Math.max(height, 1)
    };
  }

  function getProjectGalleryItems(projectId) {
    return (projectLookup.get(projectId)?.gallery ?? [])
      .map((item, index) => ({ ...item, index }))
      .filter((item) => Boolean(item.src));
  }

  function getProjectCaseStudyItems(projectId) {
    const project = projectLookup.get(projectId);
    if (!project || !hasProjectCaseStudy(project)) {
      return [];
    }

    return getCaseStudyBlocks(project, content.locale)
      .flatMap((block, blockIndex) =>
        [block.media, block.afterMedia].map((media, mediaIndex) => ({ media, mediaIndex, blockIndex }))
      )
      .filter(({ media }) => Boolean(media?.src))
      .map(({ media, mediaIndex, blockIndex }) => ({ ...media, index: blockIndex * 10 + mediaIndex }));
  }

  function getProjectMediaItems(projectId) {
    return [...getProjectGalleryItems(projectId), ...getProjectCaseStudyItems(projectId)];
  }

  function getCurrentViewerItem(items = viewerItems) {
    if (!items.length) {
      return null;
    }

    return items.find((item) => item.index === state.viewerImageIndex) ?? items[0];
  }

  function getGalleryTrigger(projectId, imageIndex) {
    return root.querySelector(
      `[data-project-card][data-project-id="${projectId}"] [data-project-gallery-trigger][data-project-gallery-index="${imageIndex}"]`
    );
  }

  function getCaseStudyMediaTrigger(triggerKey) {
    if (!triggerKey) {
      return null;
    }

    return root.querySelector(`[data-case-study-media-trigger="${triggerKey}"]`);
  }

  function resolveViewerPayload(trigger) {
    const caseStudyTriggerKey = trigger.dataset.caseStudyMediaTrigger;
    if (caseStudyTriggerKey) {
      const width = Number.parseInt(trigger.dataset.viewerWidth ?? "", 10);
      const height = Number.parseInt(trigger.dataset.viewerHeight ?? "", 10);
      const item = {
        src: trigger.dataset.viewerSrc ?? "",
        alt: trigger.dataset.viewerAlt ?? "",
        width: Number.isNaN(width) ? 1 : width,
        height: Number.isNaN(height) ? 1 : height,
        index: 0
      };

      if (!item.src) {
        return null;
      }

      return {
        projectId: trigger.dataset.projectId ?? null,
        items: [item],
        activeIndex: 0,
        showSwitcher: false,
        renderKey: `case-study:${caseStudyTriggerKey}`,
        source: {
          type: "case-study",
          triggerKey: caseStudyTriggerKey
        }
      };
    }

    const projectCard = trigger.closest("[data-project-card]");
    const projectId = projectCard?.dataset.projectId;
    const nextIndex = Number.parseInt(trigger.dataset.projectGalleryIndex ?? "", 10);

    if (!projectId || Number.isNaN(nextIndex)) {
      return null;
    }

    const items = getProjectGalleryItems(projectId);
    const nextItem = items.find((item) => item.index === nextIndex);

    if (!nextItem) {
      return null;
    }

    return {
      projectId,
      items,
      activeIndex: nextItem.index,
      showSwitcher: items.length > 1,
      renderKey: `gallery:${projectId}`,
      source: {
        type: "gallery",
        projectId
      }
    };
  }

  function createProjectMediaNode(item, variant) {
    const hasOverflowCrop = variant !== "viewer" && item.className?.includes("overflow");
    const variantMap = {
      viewer: {
        frameClass: "image-viewer__frame-inner",
        mediaClass: "image-viewer__media",
        imageClass: "image-viewer__image",
        overflowClass: "",
        alt: item.alt ?? ""
      },
      thumb: {
        frameClass: "image-viewer__thumb-frame",
        mediaClass: "image-viewer__thumb-media",
        imageClass: "image-viewer__thumb-image",
        overflowClass: "image-viewer__thumb-image--overflow",
        alt: ""
      }
    };
    const config = variantMap[variant];
    const frame = document.createElement("span");
    const media = document.createElement("span");
    const image = getPreloadedImageClone(item.src);
    const dimensions = getImageDimensions(item, variant);

    frame.className = config.frameClass;
    media.className = config.mediaClass;
    image.className = hasOverflowCrop ? `${config.imageClass} ${config.overflowClass}` : config.imageClass;
    image.alt = config.alt;
    image.width = dimensions.width;
    image.height = dimensions.height;

    media.append(image);
    frame.append(media);
    return frame;
  }

  function createViewerThumbElement(item, isActive) {
    const thumbWidth =
      item.width && item.height ? Math.round(item.width * (VIEWER_THUMB_HEIGHT / item.height)) : VIEWER_THUMB_HEIGHT;
    const fallbackLabel = `Image ${item.index + 1}`;
    const accessibleLabel = `${content.cursor.viewLabel} ${item.alt ?? fallbackLabel}`;
    const button = document.createElement("button");

    button.className = `image-viewer__thumb${isActive ? " is-active" : ""}`;
    button.type = "button";
    button.dataset.imageViewerThumbTrigger = "";
    button.dataset.imageViewerIndex = String(item.index);
    button.setAttribute("aria-pressed", String(isActive));
    button.setAttribute("aria-label", accessibleLabel);
    button.style.width = `${thumbWidth}px`;
    button.style.height = `${VIEWER_THUMB_HEIGHT}px`;
    button.append(createProjectMediaNode(item, "thumb"));

    return button;
  }

  function buildViewerNodes(items, activeIndex) {
    const slideFragment = document.createDocumentFragment();
    const thumbFragment = document.createDocumentFragment();

    items.forEach((item) => {
      const slide = document.createElement("div");
      slide.className = "image-viewer__slide";
      slide.dataset.imageViewerSlide = "";
      slide.dataset.imageViewerIndex = String(item.index);
      slide.setAttribute("aria-hidden", String(item.index !== activeIndex));
      slide.append(createProjectMediaNode(item, "viewer"));
      slideFragment.append(slide);

      if (viewerShowSwitcher) {
        thumbFragment.append(createViewerThumbElement(item, item.index === activeIndex));
      }
    });

    refs.viewerMedia.replaceChildren(slideFragment);
    refs.viewerThumbs.replaceChildren(thumbFragment);
    refs.viewerMedia.dataset.viewerKey = viewerRenderKey;
    refs.viewerThumbs.dataset.viewerKey = viewerRenderKey;
  }

  function syncViewerMediaState(activeIndex, immediate) {
    const slides = Array.from(refs.viewerMedia.querySelectorAll("[data-image-viewer-slide]"));
    const activeSlide =
      slides.find((slide) => Number.parseInt(slide.dataset.imageViewerIndex ?? "", 10) === activeIndex) ?? null;

    slides.forEach((slide) => {
      const isActive = slide === activeSlide;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));

      if (!isActive) {
        gsap.set(slide, { autoAlpha: 0 });
      }
    });

    if (!activeSlide) {
      return;
    }

    if (immediate || prefersReducedMotion) {
      gsap.set(activeSlide, { autoAlpha: 1 });
      return;
    }

    viewerImageTimeline?.kill();
    viewerImageTimeline = gsap.fromTo(
      activeSlide,
      { autoAlpha: 0.38 },
      { autoAlpha: 1, duration: 0.18, ease: "power2.out", overwrite: "auto" }
    );
  }

  function syncViewerThumbState(activeIndex) {
    if (!viewerShowSwitcher) {
      return;
    }

    refs.viewerThumbs.querySelectorAll("[data-image-viewer-thumb-trigger]").forEach((button) => {
      const isActive = Number.parseInt(button.dataset.imageViewerIndex ?? "", 10) === activeIndex;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function syncImageViewer(immediate) {
    const items = viewerItems;
    const activeItem = getCurrentViewerItem(items);

    refs.viewer.classList.toggle("is-single", !viewerShowSwitcher);
    refs.viewerSwitcher.setAttribute("aria-hidden", String(!viewerShowSwitcher));

    if (!activeItem) {
      refs.viewerMedia.replaceChildren();
      refs.viewerThumbs.replaceChildren();
      delete refs.viewerMedia.dataset.viewerKey;
      delete refs.viewerThumbs.dataset.viewerKey;
      refs.viewerFrame.removeAttribute("aria-label");
      refs.viewerFrame.style.removeProperty("width");
      refs.viewerFrame.style.removeProperty("height");
      refs.viewerFrame.removeAttribute("data-viewer-active-item");
      refs.viewerFrame.classList.remove("is-long-image");
      refs.viewerFrame.scrollTop = 0;
      refs.viewerMedia.style.removeProperty("width");
      refs.viewerMedia.style.removeProperty("height");
      return;
    }

    state.viewerImageIndex = activeItem.index;
    const activeItemKey = `${viewerRenderKey}:${activeItem.index}`;
    const shouldResetFrameScroll = refs.viewerFrame.dataset.viewerActiveItem !== activeItemKey;
    refs.viewerFrame.dataset.viewerActiveItem = activeItemKey;
    syncViewerFrameSize(activeItem, immediate);
    if (shouldResetFrameScroll) {
      refs.viewerFrame.scrollTop = 0;
    }
    if (
      refs.viewerMedia.dataset.viewerKey !== viewerRenderKey ||
      refs.viewerMedia.querySelectorAll("[data-image-viewer-slide]").length !== items.length
    ) {
      buildViewerNodes(items, activeItem.index);
    }

    if (!viewerShowSwitcher) {
      refs.viewerThumbs.replaceChildren();
    }

    syncViewerMediaState(activeItem.index, immediate);
    syncViewerThumbState(activeItem.index);
    refs.viewerFrame.setAttribute(
      "aria-label",
      activeItem.alt ?? `${projectLookup.get(state.viewerProjectId)?.name ?? "Project"} image`
    );
  }

  function syncViewerFrameSize(item, immediate) {
    const size = getViewerFrameSize(item);

    refs.viewerMedia.style.width = `${size.width}px`;
    refs.viewerMedia.style.height = `${size.mediaHeight}px`;
    refs.viewerFrame.classList.toggle("is-long-image", size.isLongImage);

    if (immediate || !state.viewerOpen || prefersReducedMotion) {
      gsap.set(refs.viewerFrame, {
        width: size.width,
        height: size.height
      });
      return;
    }

    gsap.to(refs.viewerFrame, {
      width: size.width,
      height: size.height,
      duration: 0.22,
      ease: "power3.out",
      overwrite: "auto"
    });
  }

  function getViewerFrameSize(item) {
    const rootStyles = getComputedStyle(document.documentElement);
    const inlinePad = Number.parseFloat(rootStyles.getPropertyValue("--viewer-inline-pad")) || 32;
    const topPad = Number.parseFloat(rootStyles.getPropertyValue("--viewer-top-pad")) || 28;
    const bottomPad = Number.parseFloat(rootStyles.getPropertyValue("--viewer-bottom-pad")) || 28;
    const gap = viewerShowSwitcher ? Number.parseFloat(rootStyles.getPropertyValue("--viewer-gap")) || 18 : 0;
    const thumbLimit = viewerShowSwitcher
      ? Number.parseFloat(rootStyles.getPropertyValue("--viewer-thumb-limit")) || VIEWER_THUMB_HEIGHT
      : 0;
    const maxHeightRatio = viewerShowSwitcher ? VIEWER_CONTENT_MAX_HEIGHT_RATIO : VIEWER_SINGLE_CONTENT_MAX_HEIGHT_RATIO;
    const availableWidth = Math.max(window.innerWidth - inlinePad * 2, 1);
    const paddedViewportHeight = window.innerHeight - topPad - bottomPad - gap - thumbLimit;
    const maxContentHeight = window.innerHeight * maxHeightRatio - gap - thumbLimit;
    const availableHeight = Math.max(Math.min(paddedViewportHeight, maxContentHeight), 1);
    const { width: baseWidth, height: baseHeight } = getImageDimensions(item, "viewer");
    const widthScale = availableWidth / baseWidth;
    const mediaHeightAtFullWidth = baseHeight * widthScale;
    const isLongImage =
      baseHeight > VIEWER_LONG_IMAGE_HEIGHT_THRESHOLD && mediaHeightAtFullWidth > availableHeight;
    const scale = isLongImage ? widthScale : Math.min(widthScale, availableHeight / baseHeight);
    const width = Math.max(1, baseWidth * scale);
    const mediaHeight = Math.max(1, baseHeight * scale);
    const height = Math.min(mediaHeight, availableHeight);

    return {
      width: Number.parseFloat(width.toFixed(3)),
      height: Number.parseFloat(height.toFixed(3)),
      mediaHeight: Number.parseFloat(mediaHeight.toFixed(3)),
      isLongImage
    };
  }

  function setHiddenOriginTrigger(trigger) {
    if (hiddenOriginTrigger === trigger) {
      return;
    }

    hiddenOriginTrigger?.classList.remove("is-viewer-origin-hidden");
    hiddenOriginTrigger = trigger;
    hiddenOriginTrigger?.classList.add("is-viewer-origin-hidden");
  }

  function clearHiddenOriginTrigger() {
    setHiddenOriginTrigger(null);
  }

  async function openImageViewer(trigger, { immediate = false } = {}) {
    if (viewerAnimating) {
      return;
    }

    const payload = resolveViewerPayload(trigger);
    if (!payload) {
      return;
    }

    const requestId = pendingViewerImageRequest + 1;
    pendingViewerImageRequest = requestId;
    viewerAnimating = true;
    await Promise.all(payload.items.map((item) => preloadImage(item.src)));

    if (requestId !== pendingViewerImageRequest) {
      clearHiddenOriginTrigger();
      viewerAnimating = false;
      return;
    }

    state.viewerOpen = true;
    state.viewerProjectId = payload.projectId;
    state.viewerImageIndex = payload.activeIndex;
    viewerItems = payload.items;
    viewerRenderKey = payload.renderKey;
    viewerShowSwitcher = payload.showSwitcher;
    viewerSource = payload.source;
    refs.appShell.dataset.viewerOpen = "true";
    refs.viewer.classList.add("is-open");
    refs.viewer.setAttribute("aria-hidden", "false");

    if ("inert" in refs.viewer) {
      refs.viewer.inert = false;
    }

    syncImageViewer(true);
    refs.viewer.focus({ preventScroll: true });

    const destinationRect = refs.viewerFrame.getBoundingClientRect();
    const originRect = trigger.getBoundingClientRect();
    const transform = getRelativeTransform(originRect, destinationRect);
    const transitionDisabled = immediate || prefersReducedMotion;
    setHiddenOriginTrigger(trigger);

    viewerTimeline?.kill();
    viewerImageTimeline?.kill();
    gsap.killTweensOf([refs.viewer, refs.viewerMask, refs.viewerFrame, refs.viewerSwitcher]);
    gsap.set(refs.viewer, { autoAlpha: 1, pointerEvents: "auto" });
    gsap.set(refs.viewerMask, { autoAlpha: 0 });
    gsap.set(refs.viewerFrame, {
      autoAlpha: 1,
      x: transform.x,
      y: transform.y,
      scaleX: transform.scaleX,
      scaleY: transform.scaleY,
      transformOrigin: "top left"
    });
    gsap.set(refs.viewerSwitcher, {
      autoAlpha: 0,
      y: prefersReducedMotion ? 0 : 18
    });

    viewerTimeline = gsap.timeline({
      defaults: { overwrite: "auto" },
      onComplete: () => {
        viewerAnimating = false;
        refreshCursorFromLastPointer();
      }
    });

    viewerTimeline.to(
      refs.viewerMask,
      {
        autoAlpha: 1,
        duration: transitionDisabled ? 0 : 0.24,
        ease: "power2.out"
      },
      0
    );

    viewerTimeline.to(
      refs.viewerFrame,
      {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        duration: transitionDisabled ? 0 : 0.72,
        ease: "expo.inOut"
      },
      0
    );

    if (viewerShowSwitcher) {
      viewerTimeline.to(
        refs.viewerSwitcher,
        {
          autoAlpha: 1,
          y: 0,
          duration: transitionDisabled ? 0 : 0.24,
          ease: "power2.out"
        },
        transitionDisabled ? 0 : 0.62
      );
    }
  }

  function closeImageViewer() {
    if (!state.viewerOpen || viewerAnimating) {
      return;
    }

    pendingViewerImageRequest += 1;

    const hadSwitcher = viewerShowSwitcher;
    const currentRect = refs.viewerFrame.getBoundingClientRect();
    const destinationTrigger =
      viewerSource?.type === "gallery"
        ? getGalleryTrigger(state.viewerProjectId, state.viewerImageIndex)
        : getCaseStudyMediaTrigger(viewerSource?.triggerKey);
    const destinationRect = destinationTrigger?.getBoundingClientRect() ?? getFallbackViewerTarget(currentRect);
    const transform = getRelativeTransform(destinationRect, currentRect);
    setHiddenOriginTrigger(destinationTrigger);

    viewerAnimating = true;
    viewerTimeline?.kill();
    viewerImageTimeline?.kill();
    gsap.killTweensOf([refs.viewer, refs.viewerMask, refs.viewerFrame, refs.viewerSwitcher]);

    viewerTimeline = gsap.timeline({
      defaults: { overwrite: "auto" },
      onComplete: () => {
        viewerAnimating = false;
        state.viewerOpen = false;
        state.viewerProjectId = null;
        state.viewerImageIndex = null;
        viewerItems = [];
        viewerRenderKey = "";
        viewerShowSwitcher = true;
        viewerSource = null;
        clearHiddenOriginTrigger();
        refs.appShell.dataset.viewerOpen = "false";
        refs.viewer.classList.remove("is-open", "is-single");
        refs.viewer.setAttribute("aria-hidden", "true");

        if ("inert" in refs.viewer) {
          refs.viewer.inert = true;
        }

        refs.viewerMedia.replaceChildren();
        refs.viewerThumbs.replaceChildren();
        delete refs.viewerMedia.dataset.viewerKey;
        delete refs.viewerThumbs.dataset.viewerKey;
        refs.viewerFrame.removeAttribute("aria-label");
        refs.viewerFrame.removeAttribute("data-viewer-active-item");
        refs.viewerFrame.classList.remove("is-long-image");
        refs.viewerMedia.style.removeProperty("width");
        refs.viewerMedia.style.removeProperty("height");
        refs.viewerFrame.scrollTop = 0;
        gsap.set(refs.viewer, { autoAlpha: 0, pointerEvents: "none" });
        gsap.set(refs.viewerFrame, { clearProps: "x,y,scaleX,scaleY,transformOrigin,autoAlpha,width,height" });
        gsap.set(refs.viewerMask, { clearProps: "autoAlpha" });
        gsap.set(refs.viewerSwitcher, { clearProps: "autoAlpha,y" });
        refreshCursorFromLastPointer();
      }
    });

    if (hadSwitcher) {
      viewerTimeline.to(
        refs.viewerSwitcher,
        {
          autoAlpha: 0,
          y: prefersReducedMotion ? 0 : 16,
          duration: prefersReducedMotion ? 0 : 0.16,
          ease: "power2.in"
        },
        0
      );
    }

    viewerTimeline.to(
      refs.viewerFrame,
      {
        x: transform.x,
        y: transform.y,
        scaleX: transform.scaleX,
        scaleY: transform.scaleY,
        duration: prefersReducedMotion ? 0 : 0.72,
        ease: "expo.inOut"
      },
      prefersReducedMotion ? 0 : 0.16
    );

    viewerTimeline.to(
      refs.viewerMask,
      {
        autoAlpha: 0,
        duration: prefersReducedMotion ? 0 : 0.22,
        ease: "power2.inOut"
      },
      prefersReducedMotion ? 0 : 0.16
    );
  }

  function setViewerImage(nextIndex) {
    if (nextIndex === state.viewerImageIndex) {
      return;
    }

    const nextItem = viewerItems.find((item) => item.index === nextIndex);
    if (!nextItem) {
      return;
    }

    const requestId = pendingViewerImageRequest + 1;
    pendingViewerImageRequest = requestId;

    preloadImage(nextItem.src).finally(() => {
      if (requestId !== pendingViewerImageRequest || !state.viewerOpen) {
        return;
      }

      state.viewerImageIndex = nextIndex;
      syncImageViewer(false);
      refreshCursorFromLastPointer();
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

  function startEntranceMotion() {
    if (entranceMotionStarted) {
      return;
    }

    entranceMotionStarted = true;
    runEntranceMotion();
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

function getRelativeTransform(fromRect, toRect) {
  return {
    x: fromRect.left - toRect.left,
    y: fromRect.top - toRect.top,
    scaleX: fromRect.width / Math.max(toRect.width, 1),
    scaleY: fromRect.height / Math.max(toRect.height, 1)
  };
}

function getFallbackViewerTarget(currentRect) {
  const scale = 0.22;
  const width = currentRect.width * scale;
  const height = currentRect.height * scale;

  return {
    left: currentRect.left + (currentRect.width - width) / 2,
    top: currentRect.top + (currentRect.height - height) / 2,
    width,
    height
  };
}

function renderApp(content, state) {
  return `
    <div
      class="app-shell"
      data-app-shell
      data-open-section=""
      data-viewer-open="false"
      data-case-study-open="false"
      data-light-effects="${state.lightEffectsEnabled ? "on" : "off"}"
    >
      <div class="section-cursor" data-section-cursor aria-hidden="true">
        <span class="section-cursor__label" data-section-cursor-label>${content.cursor.viewLabel}</span>
      </div>

      ${renderAmbientLightField()}
      <div class="paper-grain" aria-hidden="true"></div>

      <div class="home-scene" data-home-scene>
        <header class="site-header">
          <button
            class="light-effects-toggle"
            type="button"
            data-light-effects-toggle
            aria-pressed="${state.lightEffectsEnabled}"
            aria-label="${state.lightEffectsEnabled ? content.site.lightEffectsOnAriaLabel : content.site.lightEffectsOffAriaLabel}"
          >
            <img
              class="light-effects-toggle__icon"
              src="/icons/circle-half-stroke-solid-full.svg"
              alt=""
              aria-hidden="true"
            />
          </button>

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
            ${renderHeroDesktopHint(content.hero.desktopHint)}
          </div>
        </main>

        <div class="section-panels">
          ${renderResumePanel(content)}
          ${renderPortfolioPanel(content)}
        </div>
      </div>

      ${renderCaseStudyLayer(content)}
      ${renderImageViewer(content)}
    </div>
  `;
}

function renderAmbientLightField() {
  return `
    <div class="ambient-light-field" aria-hidden="true">
      <div class="ambient-light-field__plane ambient-light-field__plane--shadow">
        <span class="ambient-light-field__mass ambient-light-field__mass--shadow-a"></span>
        <span class="ambient-light-field__mass ambient-light-field__mass--shadow-b"></span>
        <span class="ambient-light-field__mass ambient-light-field__mass--shadow-c"></span>
        <span class="ambient-light-field__mass ambient-light-field__mass--shadow-d"></span>
      </div>

      <div class="ambient-light-field__plane ambient-light-field__plane--light">
        <span class="ambient-light-field__mass ambient-light-field__mass--light-a"></span>
        <span class="ambient-light-field__mass ambient-light-field__mass--light-b"></span>
        <span class="ambient-light-field__mass ambient-light-field__mass--light-c"></span>
      </div>

      <div class="ambient-light-field__veil"></div>
    </div>
  `;
}

function renderHeroDesktopHint(label) {
  if (!label) {
    return "";
  }

  return `<p class="hero-desktop-hint">${escapeHtml(label)}</p>`;
}

function renderImageViewer(content) {
  return `
    <div
      class="image-viewer"
      data-image-viewer
      aria-hidden="true"
      aria-label="${escapeHtml(`${content.portfolio.label} image viewer`)}"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <div class="image-viewer__mask" data-image-viewer-mask></div>
      <div class="image-viewer__layout">
        <div class="image-viewer__frame" data-image-viewer-frame data-viewer-image-hit>
          <div class="image-viewer__media-layer" data-image-viewer-media></div>
        </div>
        <div class="image-viewer__switcher" data-image-viewer-switcher>
          <div class="image-viewer__thumbs" data-image-viewer-thumbs></div>
        </div>
      </div>
    </div>
  `;
}

function renderCaseStudyLayer(content) {
  return `
    <div
      class="case-study"
      data-case-study
      aria-hidden="true"
      aria-label="${escapeHtml(content.caseStudy.ariaLabel)}"
    >
      <div class="case-study__sheet" data-case-study-sheet>
        <div class="case-study__grain" aria-hidden="true"></div>
        ${projects.filter(hasProjectCaseStudy).map((project) => renderCaseStudyPage(project, content)).join("")}
      </div>
    </div>
  `;
}

function getPreviewState(search, projectLookup) {
  const params = new URLSearchParams(search);
  const previewValue = params.get("preview");
  const caseStudyProjectId = getCaseStudyProjectIdFromSearch(search, projectLookup);
  if (!previewValue) {
    return {
      activeProjectId: caseStudyProjectId,
      openSection: caseStudyProjectId ? "portfolio" : null,
      caseStudyProjectId
    };
  }

  const [sectionCandidate, projectCandidate] = previewValue.split(":");
  const previewOpenSection = SECTION_ORDER.includes(sectionCandidate) ? sectionCandidate : null;
  const previewActiveProjectId = projectCandidate && projectLookup.has(projectCandidate) ? projectCandidate : null;
  const activeProjectId = caseStudyProjectId ?? previewActiveProjectId;
  const openSection = caseStudyProjectId ? "portfolio" : previewOpenSection;

  return {
    activeProjectId,
    openSection,
    caseStudyProjectId
  };
}

function getStoredLightEffectsPreference({ prefersReducedMotion } = {}) {
  try {
    const storedPreference = window.localStorage.getItem(LIGHT_EFFECTS_STORAGE_KEY);

    if (storedPreference === "off") {
      return false;
    }

    if (storedPreference === "on") {
      return true;
    }
  } catch {
    // Fall through to the device-aware default below.
  }

  return shouldEnableLightEffectsByDefault({ prefersReducedMotion });
}

function storeLightEffectsPreference(enabled) {
  try {
    window.localStorage.setItem(LIGHT_EFFECTS_STORAGE_KEY, enabled ? "on" : "off");
  } catch {
    // localStorage can be unavailable in strict privacy contexts.
  }
}

function shouldEnableLightEffectsByDefault({ prefersReducedMotion } = {}) {
  if (prefersReducedMotion) {
    return false;
  }

  if (isAppleMobileDevice()) {
    return true;
  }

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  if (connection?.saveData) {
    return false;
  }

  const deviceMemory = Number(navigator.deviceMemory);
  if (Number.isFinite(deviceMemory) && deviceMemory <= 4) {
    return false;
  }

  const hardwareConcurrency = Number(navigator.hardwareConcurrency);
  if (Number.isFinite(hardwareConcurrency) && hardwareConcurrency <= 4) {
    return false;
  }

  if (window.matchMedia?.("(pointer: coarse)")?.matches) {
    return false;
  }

  if (window.matchMedia?.("(update: slow)")?.matches) {
    return false;
  }

  return true;
}

function isAppleMobileDevice() {
  const platform = navigator.userAgentData?.platform ?? navigator.platform ?? "";
  const userAgent = navigator.userAgent ?? "";
  const maxTouchPoints = Number(navigator.maxTouchPoints) || 0;

  if (/iPhone|iPad|iPod/i.test(userAgent) || /iPhone|iPad|iPod/i.test(platform)) {
    return true;
  }

  return /Mac/i.test(platform) && maxTouchPoints > 1;
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
  const { resume } = content;

  return `
    <section class="section-panel section-panel--resume" data-section-panel="resume">
      <button
        class="section-bar"
        type="button"
        data-section-toggle
        aria-expanded="false"
        aria-controls="resume-content"
      >
        <span class="section-bar__title">${escapeHtml(resume.label)}</span>
        <span class="section-bar__arrow" data-section-arrow>↓</span>
      </button>

      <div class="section-panel__body" id="resume-content" data-section-body aria-hidden="true">
        <div class="section-panel__inner section-panel__inner--resume">
          <div class="resume-sheet">
            <div class="resume-column resume-column--left">
              <section class="resume-cell resume-cell--profile">
                <div class="resume-profile">
                  <h2 class="resume-section-title">${escapeHtml(resume.profile.name)}</h2>
                  <p class="resume-profile__summary">${escapeHtml(resume.profile.summary)}</p>
                </div>

                <div class="resume-actions">
                  ${resume.profile.actions.map(renderResumeAction).join("")}
                </div>
              </section>

              <section class="resume-cell resume-cell--scrollable">
                <div class="resume-cell__scroll">
                  <h2 class="resume-section-title">${escapeHtml(resume.skillsTitle)}</h2>
                  <div class="resume-skill-groups">
                    ${resume.skillGroups.map(renderResumeSkillGroup).join("")}
                  </div>
                </div>
              </section>
            </div>

            <div class="resume-column resume-column--right">
              <section class="resume-cell resume-cell--scrollable resume-cell--experiences">
                <div class="resume-cell__scroll">
                  <h2 class="resume-section-title">${escapeHtml(resume.experiencesTitle)}</h2>
                  <div class="resume-experience-list">
                    ${resume.experiences.map(renderResumeExperience).join("")}
                  </div>
                </div>
              </section>

              <section class="resume-cell resume-cell--footer">
                <div class="resume-featured">
                  <p class="resume-featured__label">
                    <span>${escapeHtml(resume.featuredLabel)}</span>
                    <span aria-hidden="true">→</span>
                  </p>

                  <div class="resume-featured__actions">
                    ${resume.featuredProjects.map(renderResumeFeaturedProject).join("")}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderResumeAction(action) {
  const href = escapeHtml(action.href ?? "#");
  const downloadAttribute = action.download ? ` download="${escapeHtml(action.download)}"` : "";

  return `
    <a class="resume-pill-button" href="${href}"${downloadAttribute}>
      ${escapeHtml(action.label)}
    </a>
  `;
}

function renderResumeSkillGroup(group) {
  const accent = group.accent ?? "#34c759";

  return `
    <section class="resume-skill-group">
      <h3 class="resume-skill-group__title">${escapeHtml(group.title)}</h3>
      <div class="resume-skill-group__items">
        ${group.items
          .map(
            (item) => `
              <span class="resume-skill-tag">
                <span>${escapeHtml(item)}</span>
                <span class="resume-skill-tag__dot" style="${escapeHtml(`--resume-skill-accent: ${accent};`)}" aria-hidden="true"></span>
              </span>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderResumeExperience(experience) {
  return `
    <article class="resume-experience">
      <header class="resume-experience__header">
        <h3 class="resume-experience__title">${escapeHtml(experience.title)}</h3>
        <p class="resume-experience__period">${escapeHtml(experience.period)}</p>
      </header>

      <div class="resume-experience__body">
        ${experience.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
      </div>
    </article>
  `;
}

function renderResumeFeaturedProject(project) {
  return `
    <button
      class="resume-pill-button"
      type="button"
      data-resume-featured-project="${escapeHtml(project.projectId)}"
    >
      ${escapeHtml(project.label)}
    </button>
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

function renderCaseStudyPage(project, content) {
  const locale = content.locale;
  const blocks = getCaseStudyBlocks(project, locale);
  const primaryBlocks = blocks.filter((block) => (block.column ?? "primary") !== "secondary");
  const secondaryBlocks = blocks.filter((block) => (block.column ?? "primary") === "secondary");

  return `
    <article
      class="case-study-page"
      data-case-study-page="${project.id}"
      style="${escapeHtml(getProjectThemeVars(project))}"
      aria-hidden="true"
      hidden
    >
      <button
        class="case-study-header"
        type="button"
        data-case-study-back
        aria-label="${escapeHtml(content.caseStudy.backAriaLabel)}"
      >
        <span class="case-study-header__arrow" aria-hidden="true">↑</span>
        <span class="case-study-header__brand">
          ${renderProjectLogo(project, escapeHtml(project.name))}
        </span>
        <span class="case-study-header__spacer" aria-hidden="true"></span>
        <span class="case-study-header__tags">
          ${renderCaseStudyTags(project, locale)}
        </span>
      </button>

      <div class="case-study-page__body" data-case-study-scroll>
        <div class="case-study-grid">
          <div class="case-study-grid__column case-study-grid__column--primary">
            ${primaryBlocks.map((block) => renderCaseStudyBlock(project, block)).join("")}
          </div>
          <div class="case-study-grid__column case-study-grid__column--secondary">
            ${secondaryBlocks.map((block) => renderCaseStudyBlock(project, block)).join("")}
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderCaseStudyTags(project, locale) {
  return getProjectTags(project, locale)
    .map((tag) => {
      const dot = tag.showDot ? '<span class="case-study-header__tag-dot" aria-hidden="true"></span>' : "";

      return `
        <span class="case-study-header__tag">
          <span>${escapeHtml(tag.label)}</span>
          ${dot}
        </span>
      `;
    })
    .join("");
}

function renderCaseStudyBlock(project, block) {
  return `
    <section class="case-study-cell" data-case-study-block>
      ${block.media ? renderCaseStudyMedia(project, block, block.media, "primary") : ""}
      <div class="case-study-cell__markdown">
        ${renderMarkdown(block.markdown)}
      </div>
      ${block.afterMedia ? renderCaseStudyMedia(project, block, block.afterMedia, "after") : ""}
    </section>
  `;
}

function renderCaseStudyMedia(project, block, media, position = "primary") {
  const triggerKey = `${project.id}--${block.id}--${position}`;
  const isLongPreview = media.height > VIEWER_LONG_IMAGE_HEIGHT_THRESHOLD;
  const triggerClassNames = ["case-study-cell__media-trigger"];
  const previewWidth = Number.isFinite(media.previewWidth) ? media.previewWidth : media.width;
  const previewHeight = Number.isFinite(media.previewHeight) ? media.previewHeight : Math.min(media.height, 2048);
  const previewStyle = isLongPreview
    ? ` style="--case-study-media-preview-width: ${previewWidth}; --case-study-media-preview-height: ${previewHeight};"`
    : "";

  if (isLongPreview) {
    triggerClassNames.push("case-study-cell__media-trigger--long");
  }

  if (media.presentation) {
    triggerClassNames.push(`case-study-cell__media-trigger--${media.presentation}`);
  }

  return `
    <button
      class="${triggerClassNames.join(" ")}"
      type="button"
      data-case-study-media-trigger="${triggerKey}"
      data-project-id="${project.id}"
      data-viewer-src="${media.src}"
      data-viewer-alt="${escapeHtml(media.alt ?? "")}"
      data-viewer-width="${media.width}"
      data-viewer-height="${media.height}"
      aria-label="${escapeHtml(`${project.name} image`)}"
      ${previewStyle}
    >
      <figure class="case-study-cell__media">
        <img
          src="${media.src}"
          alt="${escapeHtml(media.alt ?? "")}"
          width="${media.width}"
          height="${media.height}"
          loading="lazy"
        />
      </figure>
    </button>
  `;
}

function renderProject(project, content) {
  const locale = content.locale;
  const name = escapeHtml(project.name);
  const detailId = `${project.id}-detail`;
  const summaryLabel = escapeHtml(getProjectSummaryLabel(project, locale));

  return `
    <li
      class="project-card"
      data-project-card
      data-project-id="${project.id}"
      style="${escapeHtml(getProjectThemeVars(project))}"
    >
      <span class="project-card__gradient" data-project-gradient aria-hidden="true"></span>
      <button
        class="project-card__summary"
        type="button"
        data-project-trigger
        aria-pressed="false"
        aria-expanded="false"
        aria-label="${summaryLabel}"
        aria-controls="${detailId}"
      >
        <span class="project-card__logo">
          ${renderProjectLogo(project, name)}
        </span>
        <span class="project-card__tags">
          ${renderProjectTags(project, locale)}
        </span>
      </button>

      <div class="project-card__detail" id="${detailId}" data-project-detail aria-hidden="true">
        <div class="project-card__detail-inner" data-project-detail-inner>
          <div class="project-card__gallery">
            ${renderProjectGallery(project, content)}
          </div>
          <div class="project-card__description">
            ${renderProjectDescription(project, locale)}
          </div>
          ${renderProjectLearnMore(project, content)}
        </div>
      </div>
    </li>
  `;
}

function renderProjectLearnMore(project, content) {
  if (!hasProjectCaseStudy(project)) {
    return "";
  }

  return `
    <button
      class="project-card__learn-more"
      type="button"
      data-project-learn-more
      aria-label="${escapeHtml(`${content.portfolio.learnMoreAriaLabel} ${project.name}`)}"
    >
      <span>${escapeHtml(content.portfolio.learnMoreLabel)}</span>
      <span class="project-card__learn-more-arrow" aria-hidden="true">→</span>
    </button>
  `;
}

function renderProjectLogo(project, label) {
  if (project.logo?.kind === "abmac") {
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

  if (project.logo?.kind === "image" && project.logo.src) {
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

  const placeholderWidth = project.logo?.width ?? 200;
  const placeholderHeight = project.logo?.height ?? 82;

  return `
    <span
      class="project-logo project-logo--placeholder"
      aria-hidden="true"
      style="width: ${placeholderWidth}px; aspect-ratio: ${placeholderWidth} / ${placeholderHeight};"
    >
      <span class="project-logo__placeholder-text">LOGO</span>
    </span>
  `;
}

function renderProjectDescription(project, locale) {
  const lines = project.description?.[locale] ?? project.description?.en ?? [];
  const fallbackLines =
    locale === "zh"
      ? ["项目内容整理中，完整案例与说明稍后补充。"]
      : ["Project details are being prepared. Full case study coming soon."];
  const resolvedLines = lines.length ? lines : fallbackLines;

  return resolvedLines.map((line) => `<p>${escapeHtml(line)}</p>`).join("");
}

function renderProjectTags(project, locale) {
  const tags = getProjectTags(project, locale);

  return tags
    .map((tag) => {
      const dot = tag.showDot ? '<span class="project-card__tag-dot" aria-hidden="true"></span>' : "";
      return `
        <span class="project-card__tag">
          <span class="project-card__tag-label">${escapeHtml(tag.label)}</span>
          ${dot}
        </span>
      `;
    })
    .join("");
}

function getProjectTags(project, locale) {
  if (!Array.isArray(project.tags) || project.tags.length === 0) {
    return [];
  }

  return project.tags
    .map((tag) => ({
      label:
        typeof tag.label === "string"
          ? tag.label
          : tag.label?.[locale] ?? tag.label?.en ?? "",
      showDot: Boolean(tag.showDot)
    }))
    .filter((tag) => tag.label);
}

function hasProjectCaseStudy(project) {
  return project?.caseStudy !== false;
}

function getProjectSummaryLabel(project, locale) {
  const tagsText = getProjectTags(project, locale)
    .map((tag) => tag.label)
    .join(", ");

  return [project.name, tagsText].filter(Boolean).join(", ");
}

function getProjectThemeVars(project) {
  const accent = project.theme?.accent ?? "#1a1a1a";
  const accentRgb = project.theme?.accentRgb ?? "26 26 26";
  return `--project-accent: ${accent}; --project-accent-rgb: ${accentRgb};`;
}

function renderProjectGallery(project, content) {
  const items = project.gallery?.length
    ? project.gallery
    : [
        { width: 300, height: 169 },
        { width: 238, height: 169 },
        { width: 238, height: 169 }
      ];

  return items
    .map((item, index) => {
      if (!item.src) {
        return `
          <figure
            class="project-gallery__item project-gallery__item--placeholder"
            style="width: ${item.width}px; height: ${item.height}px;"
          >
            <span class="project-gallery__placeholder" aria-hidden="true"></span>
          </figure>
        `;
      }

      const fallbackLabel = `${project.name} image ${index + 1}`;
      const accessibleLabel = `${content.cursor.viewLabel} ${item.alt ?? fallbackLabel}`;

      return `
        <button
          class="project-gallery__trigger"
          type="button"
          data-project-gallery-trigger
          data-project-gallery-index="${index}"
          aria-label="${escapeHtml(accessibleLabel)}"
          style="width: ${item.width}px; height: ${item.height}px;"
        >
          ${renderProjectMedia(item, "gallery")}
        </button>
      `;
    })
    .join("");
}

function renderProjectMedia(item, variant) {
  const hasOverflowCrop = variant !== "viewer" && item.className?.includes("overflow");
  const hasFirstScreenPreview = variant !== "viewer" && item.className?.includes("first-screen");
  const variantMap = {
    gallery: {
      frameClass: "project-gallery__item",
      mediaClass: "project-gallery__media",
      imageClass: "project-gallery__image",
      overflowClass: "project-gallery__image--overflow",
      alt: ""
    },
    viewer: {
      frameClass: "image-viewer__frame-inner",
      mediaClass: "image-viewer__media",
      imageClass: "image-viewer__image",
      overflowClass: "",
      alt: escapeHtml(item.alt ?? "")
    },
    thumb: {
      frameClass: "image-viewer__thumb-frame",
      mediaClass: "image-viewer__thumb-media",
      imageClass: "image-viewer__thumb-image",
      overflowClass: "image-viewer__thumb-image--overflow",
      alt: ""
    }
  };
  const config = variantMap[variant];
  const imageClassNames = [config.imageClass];

  if (hasOverflowCrop) {
    imageClassNames.push(config.overflowClass);
  }

  if (hasFirstScreenPreview) {
    imageClassNames.push(`${config.imageClass}--first-screen`);
  }

  const imageClass = imageClassNames.join(" ");

  return `
    <span class="${config.frameClass}">
      <span class="${config.mediaClass}">
        <img
          class="${imageClass}"
          src="${item.src}"
          alt="${config.alt}"
          width="${item.width}"
          height="${item.height}"
          loading="lazy"
        />
      </span>
    </span>
  `;
}

function renderViewerThumb(item, isActive, content) {
  const thumbWidth =
    item.width && item.height ? Math.round(item.width * (VIEWER_THUMB_HEIGHT / item.height)) : VIEWER_THUMB_HEIGHT;
  const fallbackLabel = `Image ${item.index + 1}`;
  const accessibleLabel = `${content.cursor.viewLabel} ${item.alt ?? fallbackLabel}`;

  return `
    <button
      class="image-viewer__thumb${isActive ? " is-active" : ""}"
      type="button"
      data-image-viewer-thumb-trigger
      data-image-viewer-index="${item.index}"
      data-viewer-image-hit
      aria-pressed="${String(isActive)}"
      aria-label="${escapeHtml(accessibleLabel)}"
      style="width: ${thumbWidth}px; height: ${VIEWER_THUMB_HEIGHT}px;"
    >
      ${renderProjectMedia(item, "thumb")}
    </button>
  `;
}

function getCaseStudyBlocks(project, locale) {
  if (!hasProjectCaseStudy(project)) {
    return [];
  }

  const localizedBlocks = project.caseStudy?.blocks?.[locale] ?? project.caseStudy?.blocks?.en;

  if (Array.isArray(localizedBlocks) && localizedBlocks.length) {
    return localizedBlocks;
  }

  return getFallbackCaseStudyBlocks(project, locale);
}

function getFallbackCaseStudyBlocks(project, locale) {
  const galleryItems = (project.gallery ?? []).filter((item) => Boolean(item.src));
  const descriptionLines = project.description?.[locale] ?? project.description?.en ?? [];
  const fallbackBody =
    descriptionLines.length > 0
      ? descriptionLines.join("\n\n")
      : locale === "zh"
        ? "项目内容整理中，完整案例与说明稍后补充。"
        : "Project details are being prepared. Full case study coming soon.";
  const secondaryMarkdown =
    locale === "zh" ? `## ${project.name}\n\n更多背景与过程整理中。` : `## ${project.name}\n\nMore process notes are being prepared.`;

  return [
    {
      id: `${project.id}-overview`,
      column: "primary",
      media: galleryItems[0] ?? null,
      markdown: fallbackBody
    },
    {
      id: `${project.id}-notes`,
      column: "secondary",
      media: galleryItems[1] ?? null,
      markdown: secondaryMarkdown
    }
  ];
}

function renderMarkdown(markdown) {
  const source = String(markdown ?? "").replace(/\r/g, "").trim();
  if (!source) {
    return "";
  }

  const blocks = [];
  const lines = source.split("\n");
  let paragraphLines = [];
  let listItems = [];

  const flushParagraph = () => {
    if (!paragraphLines.length) {
      return;
    }

    blocks.push(`<p>${renderInlineMarkdown(paragraphLines.join(" "))}</p>`);
    paragraphLines = [];
  };

  const flushList = () => {
    if (!listItems.length) {
      return;
    }

    blocks.push(`<ul>${listItems.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ul>`);
    listItems = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      const tagName = headingMatch[1].length === 1 ? "h1" : headingMatch[1].length === 2 ? "h2" : "h3";
      blocks.push(`<${tagName}>${renderInlineMarkdown(headingMatch[2])}</${tagName}>`);
      return;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph();
      listItems.push(trimmed.replace(/^[-*]\s+/, ""));
      return;
    }

    paragraphLines.push(trimmed);
  });

  flushParagraph();
  flushList();

  return blocks.join("");
}

function renderInlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_match, label, url) => {
      return `<a href="${url}" target="_blank" rel="noreferrer">${label}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function getCaseStudyProjectIdFromSearch(search, projectLookup) {
  const projectId = new URLSearchParams(search).get("case-study");
  const project = projectId ? projectLookup.get(projectId) : null;
  return project && hasProjectCaseStudy(project) ? projectId : null;
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
