// Camada de acesso ao backend.
//
// Dentro do app Tauri, cada função chama um comando Rust via `invoke`
// (src-tauri/src/lib.rs). Aberto num navegador comum (`npm run dev`),
// usa uma simulação local equivalente — útil para ajustar o visual sem
// compilar o Rust.

import { invoke, isTauri } from "@tauri-apps/api/core";
import catalogData from "../catalog.json";
import type { BuildStatus, Category, Selection, SelectedPart } from "./types";

export const STAGE_COUNT = 4;

export interface Api {
  getCatalog(): Promise<Category[]>;
  submitBuild(selection: Selection): Promise<BuildStatus>;
  buildStatus(id: number): Promise<BuildStatus>;
  cancelBuild(id: number): Promise<void>;
}

const tauriApi: Api = {
  getCatalog: () => invoke<Category[]>("get_catalog"),
  submitBuild: (selection) => invoke<BuildStatus>("submit_build", { selection }),
  buildStatus: (id) => invoke<BuildStatus>("build_status", { id }),
  cancelBuild: (id) => invoke<void>("cancel_build", { id }),
};

/* ------------------------------------------------------------------
   Simulação no navegador — mesmas regras de src-tauri/src/queue.rs
   ------------------------------------------------------------------ */
const SLOT_MS = 6_000;
const STAGE_MS = 5_000;

interface MockBuild {
  number: number;
  parts: SelectedPart[];
  submittedAt: number;
  ahead: number;
  behind: number;
}

function mockStatus(id: number, b: MockBuild, elapsed: number): BuildStatus {
  const wait = SLOT_MS * b.ahead;
  const assembly = STAGE_MS * STAGE_COUNT;
  const status: BuildStatus = {
    id,
    number: b.number,
    phase: "queued",
    queuePosition: 0,
    queueTotal: 1 + b.behind,
    etaSeconds: 0,
    progress: 0,
    stageIndex: 0,
    parts: b.parts,
  };

  if (elapsed < wait) {
    status.queuePosition = b.ahead - Math.floor(elapsed / SLOT_MS);
    status.queueTotal += status.queuePosition;
    status.etaSeconds = Math.ceil((wait - elapsed) / 1000);
    return status;
  }

  const t = elapsed - wait;
  if (t < assembly) {
    status.phase = "assembling";
    status.stageIndex = Math.floor(t / STAGE_MS);
    status.progress = (t / assembly) * 100;
    status.etaSeconds = Math.ceil((assembly - t) / 1000);
  } else {
    status.phase = "done";
    status.stageIndex = STAGE_COUNT;
    status.progress = 100;
  }
  return status;
}

function createMockApi(): Api {
  const catalog = catalogData as Category[];
  const builds = new Map<number, MockBuild>();
  let nextId = 1;

  return {
    async getCatalog() {
      return catalog;
    },
    async submitBuild(selection) {
      const parts = catalog.map((cat) => {
        const chosen = selection[cat.id];
        if (!chosen) throw `Escolha um item em "${cat.title}".`;
        const option = cat.options.find((o) => o.id === chosen);
        if (!option) throw `Peça inválida em "${cat.title}".`;
        return { category: cat.id, label: option.label };
      });
      const id = nextId++;
      const build: MockBuild = {
        number: id,
        parts,
        submittedAt: performance.now(),
        ahead: 2 + (id % 3),
        behind: 5 + (id % 7),
      };
      builds.set(id, build);
      return mockStatus(id, build, 0);
    },
    async buildStatus(id) {
      const build = builds.get(id);
      if (!build) throw "Build não encontrada.";
      return mockStatus(id, build, performance.now() - build.submittedAt);
    },
    async cancelBuild(id) {
      builds.delete(id);
    },
  };
}

export const api: Api = isTauri() ? tauriApi : createMockApi();

/** Erros de comandos Tauri chegam como string; normaliza para exibição. */
export function errorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  return "Erro inesperado. Tente novamente.";
}
