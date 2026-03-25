import "./styles.css";
import { createPortfolioApp } from "./app.js";

const root = document.querySelector("#app");
const locale = document.body.dataset.locale || "en";

createPortfolioApp(root, { locale });
