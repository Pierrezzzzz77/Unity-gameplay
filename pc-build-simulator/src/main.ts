import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/space-grotesk/latin-500.css";
import "@fontsource/space-grotesk/latin-600.css";
import "@fontsource/space-grotesk/latin-700.css";
import "./styles.css";

import { api, errorMessage } from "./api";
import { byId } from "./dom";
import { currentScreen, setGuard, showScreen, startRouter } from "./router";
import type { Category } from "./types";
import { readSelection, refreshPicks, renderCatalog, renderCatalogMessage } from "./ui/components";
import { Tracker } from "./ui/tracking";

let catalog: Category[] = [];
let tracker: Tracker | null = null;

const catalogEl = byId("catalog");
const submitBtn = byId<HTMLButtonElement>("btn-submit");
const errorEl = byId("submit-error");

// Fila e montagem só fazem sentido depois de enviar uma build.
setGuard((target) => {
  const build = tracker?.current();
  if (target === "screen-status" && !build) return "screen-components";
  if (target === "screen-montage") {
    if (!build) return "screen-components";
    if (build.phase === "queued") return "screen-status";
  }
  return target;
});

startRouter();

function refreshNote(): void {
  errorEl.hidden = true;
  submitBtn.disabled = !refreshPicks(catalog);
}

function showError(message: string): void {
  errorEl.textContent = message;
  errorEl.hidden = false;
}

catalogEl.addEventListener("change", refreshNote);

submitBtn.addEventListener("click", async () => {
  submitBtn.disabled = true;
  try {
    const previous = tracker?.current();
    if (previous && previous.phase !== "done") {
      tracker?.stop();
      void api.cancelBuild(previous.id).catch(() => {});
    }
    const status = await api.submitBuild(readSelection(catalog));
    tracker?.start(status);
    refreshNote();
    showScreen("screen-status");
  } catch (err) {
    showError(errorMessage(err));
    submitBtn.disabled = false;
  }
});

async function loadCatalog(): Promise<void> {
  renderCatalogMessage(catalogEl, "Carregando catálogo…");
  try {
    catalog = await api.getCatalog();
  } catch (err) {
    renderCatalogMessage(catalogEl, `Não foi possível carregar o catálogo: ${errorMessage(err)}`);
    return;
  }

  renderCatalog(catalogEl, catalog);
  byId("chip-categories").textContent = `${catalog.length} categorias de peças`;
  refreshNote();

  tracker = new Tracker(catalog, (status, previous) => {
    // Chegou a vez: quem está olhando a fila vai direto para a montagem
    if (previous === "queued" && status.phase !== "queued" && currentScreen() === "screen-status") {
      showScreen("screen-montage");
    }
  });
}

void loadCatalog();
