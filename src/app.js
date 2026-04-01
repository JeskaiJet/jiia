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
const PROJECT_DETAIL_DURATION = 0.52;
const PROJECT_DETAIL_INNER_DURATION = 0.42;
const PROJECT_SCROLL_DURATION = 0.44;

export function createPortfolioApp(root, { locale }) {
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
    viewerImageIndex: null
  };
  let activeCursorElement = null;
  let cursorHidden = true;
  const preloadedImages = new Map();
  let viewerTimeline = null;
  let viewerImageTimeline = null;
  let viewerAnimating = false;
  let pendingViewerImageRequest = 0;
  let hiddenOriginTrigger = null;
  let pendingProjectActivationRequest = 0;

  root.innerHTML = renderApp(content);

  const refs = {
    appShell: root.querySelector("[data-app-shell]"),
    heroLayer: root.querySelector("[data-hero-layer]"),
    heroLockup: root.querySelector("[data-hero-lockup]"),
    heroName: root.querySelector("[data-hero-name]"),
    heroTagline: root.querySelector("[data-hero-tagline]"),
    sectionCursor: root.querySelector("[data-section-cursor]"),
    sectionCursorLabel: root.querySelector("[data-section-cursor-label]"),
    projectList: root.querySelector("[data-project-list]"),
    projectCards: Array.from(root.querySelectorAll("[data-project-card]")),
    viewer: root.querySelector("[data-image-viewer]"),
    viewerMask: root.querySelector("[data-image-viewer-mask]"),
    viewerFrame: root.querySelector("[data-image-viewer-frame]"),
    viewerMedia: root.querySelector("[data-image-viewer-media]"),
    viewerSwitcher: root.querySelector("[data-image-viewer-switcher]"),
    viewerThumbs: root.querySelector("[data-image-viewer-thumbs]")
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
  refs.viewer.setAttribute("aria-hidden", "true");

  if ("inert" in refs.viewer) {
    refs.viewer.inert = true;
  }

  syncPanels(true);
  syncActiveProject(true);
  bindEvents();
  scheduleImagePreload();
  runEntranceMotion();
  syncPortfolioBarBorder();

  function bindEvents() {
    SECTION_ORDER.forEach((key) => {
      panels[key].bar.addEventListener("click", () => {
        pulseCursor();
        state.openSection = state.openSection === key ? null : key;
        syncPanels(false);
        refreshCursorFromLastPointer();
      });
    });

    panels.portfolio.body.addEventListener("scroll", syncPortfolioBarBorder, { passive: true });

    refs.projectList.addEventListener("click", (event) => {
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

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerout", (event) => {
      if (!event.relatedTarget) {
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
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && state.viewerOpen) {
        event.preventDefault();
        closeImageViewer();
        return;
      }

      if (event.key === "Escape" && state.openSection) {
        state.openSection = null;
        syncPanels(false);
        refreshCursorFromLastPointer();
      }
    });
  }

  function handlePointerMove(event) {
    pointerPosition.x = event.clientX;
    pointerPosition.y = event.clientY;

    if (state.heroInteractive) {
      const { weight, opsz } = getHeroVariation(event.clientX, event.clientY);

      animateNameWeight(weight);
      animateNameOpsz(opsz);
    }

    if (supportsFinePointer) {
      syncCursorFromTarget(event.target, event.clientX, event.clientY);
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
    return Promise.all(getProjectGalleryItems(projectId).map((item) => preloadImage(item.src)));
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

  function getCurrentViewerItem(items = getProjectGalleryItems(state.viewerProjectId)) {
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
      thumbFragment.append(createViewerThumbElement(item, item.index === activeIndex));
    });

    refs.viewerMedia.replaceChildren(slideFragment);
    refs.viewerThumbs.replaceChildren(thumbFragment);
    refs.viewerMedia.dataset.projectId = state.viewerProjectId ?? "";
    refs.viewerThumbs.dataset.projectId = state.viewerProjectId ?? "";
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
    refs.viewerThumbs.querySelectorAll("[data-image-viewer-thumb-trigger]").forEach((button) => {
      const isActive = Number.parseInt(button.dataset.imageViewerIndex ?? "", 10) === activeIndex;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function syncImageViewer(immediate) {
    const items = getProjectGalleryItems(state.viewerProjectId);
    const activeItem = getCurrentViewerItem(items);

    if (!activeItem) {
      refs.viewerMedia.replaceChildren();
      refs.viewerThumbs.replaceChildren();
      delete refs.viewerMedia.dataset.projectId;
      delete refs.viewerThumbs.dataset.projectId;
      refs.viewerFrame.removeAttribute("aria-label");
      refs.viewerFrame.style.removeProperty("width");
      refs.viewerFrame.style.removeProperty("height");
      return;
    }

    state.viewerImageIndex = activeItem.index;
    syncViewerFrameSize(activeItem, immediate);
    if (
      refs.viewerMedia.dataset.projectId !== (state.viewerProjectId ?? "") ||
      refs.viewerMedia.querySelectorAll("[data-image-viewer-slide]").length !== items.length
    ) {
      buildViewerNodes(items, activeItem.index);
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
    const gap = Number.parseFloat(rootStyles.getPropertyValue("--viewer-gap")) || 18;
    const thumbLimit = Number.parseFloat(rootStyles.getPropertyValue("--viewer-thumb-limit")) || VIEWER_THUMB_HEIGHT;
    const availableWidth = Math.max(window.innerWidth - inlinePad * 2, 1);
    const paddedViewportHeight = window.innerHeight - topPad - bottomPad - gap - thumbLimit;
    const maxContentHeight = window.innerHeight * VIEWER_CONTENT_MAX_HEIGHT_RATIO - gap - thumbLimit;
    const availableHeight = Math.max(Math.min(paddedViewportHeight, maxContentHeight), 1);
    const { width: baseWidth, height: baseHeight } = getImageDimensions(item, "viewer");
    const scale = Math.min(availableWidth / baseWidth, availableHeight / baseHeight);

    return {
      width: Math.max(1, Math.round(baseWidth * scale)),
      height: Math.max(1, Math.round(baseHeight * scale))
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

    const projectCard = trigger.closest("[data-project-card]");
    const projectId = projectCard?.dataset.projectId;
    const nextIndex = Number.parseInt(trigger.dataset.projectGalleryIndex ?? "", 10);

    if (!projectId || Number.isNaN(nextIndex)) {
      return;
    }

    const items = getProjectGalleryItems(projectId);
    const nextItem = items.find((item) => item.index === nextIndex);

    if (!nextItem) {
      return;
    }

    const requestId = pendingViewerImageRequest + 1;
    pendingViewerImageRequest = requestId;
    viewerAnimating = true;
    await preloadProjectImages(projectId);

    if (requestId !== pendingViewerImageRequest) {
      clearHiddenOriginTrigger();
      viewerAnimating = false;
      return;
    }

    state.viewerOpen = true;
    state.viewerProjectId = projectId;
    state.viewerImageIndex = nextItem.index;
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

  function closeImageViewer() {
    if (!state.viewerOpen || viewerAnimating) {
      return;
    }

    pendingViewerImageRequest += 1;

    const currentRect = refs.viewerFrame.getBoundingClientRect();
    const destinationTrigger = getGalleryTrigger(state.viewerProjectId, state.viewerImageIndex);
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
        clearHiddenOriginTrigger();
        refs.appShell.dataset.viewerOpen = "false";
        refs.viewer.classList.remove("is-open");
        refs.viewer.setAttribute("aria-hidden", "true");

        if ("inert" in refs.viewer) {
          refs.viewer.inert = true;
        }

        refs.viewerMedia.replaceChildren();
        refs.viewerThumbs.replaceChildren();
        delete refs.viewerMedia.dataset.projectId;
        delete refs.viewerThumbs.dataset.projectId;
        refs.viewerFrame.removeAttribute("aria-label");
        gsap.set(refs.viewer, { autoAlpha: 0, pointerEvents: "none" });
        gsap.set(refs.viewerFrame, { clearProps: "x,y,scaleX,scaleY,transformOrigin,autoAlpha,width,height" });
        gsap.set(refs.viewerMask, { clearProps: "autoAlpha" });
        gsap.set(refs.viewerSwitcher, { clearProps: "autoAlpha,y" });
        refreshCursorFromLastPointer();
      }
    });

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

    const nextItem = getProjectGalleryItems(state.viewerProjectId).find((item) => item.index === nextIndex);
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

function renderApp(content) {
  return `
    <div class="app-shell" data-app-shell data-open-section="" data-viewer-open="false">
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

      ${renderAmbientLightField()}

      <div class="paper-grain" aria-hidden="true"></div>

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

function getPreviewState(search, projectLookup) {
  const previewValue = new URLSearchParams(search).get("preview");
  if (!previewValue) {
    return {
      activeProjectId: null,
      openSection: null
    };
  }

  const [sectionCandidate, projectCandidate] = previewValue.split(":");
  const openSection = SECTION_ORDER.includes(sectionCandidate) ? sectionCandidate : null;
  const activeProjectId = projectCandidate && projectLookup.has(projectCandidate) ? projectCandidate : null;

  return {
    activeProjectId,
    openSection
  };
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
          <div class="project-card__description">
            ${renderProjectDescription(project, locale)}
          </div>
          <button
            class="project-card__learn-more"
            type="button"
            aria-label="${escapeHtml(`${content.portfolio.learnMoreAriaLabel} ${project.name}`)}"
          >
            ${escapeHtml(content.portfolio.learnMoreLabel)}
          </button>
          <div class="project-card__gallery">
            ${renderProjectGallery(project, content)}
          </div>
        </div>
      </div>
    </li>
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
  const imageClass = hasOverflowCrop ? `${config.imageClass} ${config.overflowClass}` : config.imageClass;

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
