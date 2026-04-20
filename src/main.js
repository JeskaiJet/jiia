import "./styles.css";
import { createPortfolioApp } from "./app.js";

const root = document.querySelector("#app");
const locale = document.body.dataset.locale || "en";
const loader = document.querySelector("[data-site-loader]");
const loaderImage = loader?.querySelector(".site-loader__image");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const app = createPortfolioApp(root, { locale, deferEntranceMotion: true });

revealAppWhenReady(app);

async function revealAppWhenReady(portfolioApp) {
  const startedAt = performance.now();

  await Promise.allSettled([
    withTimeout(waitForWindowLoad(), 2500),
    withTimeout(waitForPlayfairFonts(), 3500),
    withTimeout(waitForImage(loaderImage), 1200)
  ]);

  await wait(Math.max(0, 240 - (performance.now() - startedAt)));
  await nextFrame();

  document.body.dataset.loadingState = "image-out";
  await wait(prefersReducedMotion ? 0 : 380);

  portfolioApp.startEntranceMotion();
  document.body.dataset.loadingState = "app-in";
  await wait(prefersReducedMotion ? 0 : 620);

  document.body.dataset.loadingState = "done";
  loader?.setAttribute("aria-hidden", "true");
  loader?.remove();
}

function waitForWindowLoad() {
  if (document.readyState === "complete") {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    window.addEventListener("load", resolve, { once: true });
  });
}

async function waitForPlayfairFonts() {
  await Promise.allSettled([
    fetchFontFile("/fonts/PlayfairRomanVF.woff2"),
    fetchFontFile("/fonts/PlayfairItalicVF.woff2")
  ]);

  if (!document.fonts?.load) {
    return;
  }

  await Promise.allSettled([
    document.fonts.load('400 1em "Playfair Variable"'),
    document.fonts.load('500 1em "Playfair Variable"'),
    document.fonts.load('italic 500 1em "Playfair Variable"'),
    document.fonts.ready
  ]);
}

async function fetchFontFile(src) {
  const response = await window.fetch(src, { cache: "force-cache" });

  if (!response.ok) {
    return;
  }

  await response.arrayBuffer();
}

function waitForImage(image) {
  if (!image || image.complete) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    image.addEventListener("load", resolve, { once: true });
    image.addEventListener("error", resolve, { once: true });
  });
}

function withTimeout(promise, timeout) {
  return Promise.race([promise, wait(timeout)]);
}

function wait(duration) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });
}

function nextFrame() {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}
