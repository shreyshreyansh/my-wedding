import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { preloadHeroAssets } from "./heroPreload";
import "./styles.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("The application root element is missing");
}
const appRoot = rootElement;

async function mountApp() {
  await preloadHeroAssets();
  createRoot(appRoot).render(<StrictMode><App /></StrictMode>);
}

void mountApp();
