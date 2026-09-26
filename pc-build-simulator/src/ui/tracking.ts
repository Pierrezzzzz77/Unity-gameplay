// Telas de fila e montagem: consulta o backend a cada segundo e
// atualiza os dois painéis com o status da build atual.

import { api, errorMessage } from "../api";
import { byId, el } from "../dom";
import { formatBuildNumber, formatEta, pad } from "../format";
import type { BuildStatus, Category, Phase } from "../types";
import { CHECK_ICON } from "./icons";

const POLL_MS = 1000;

const STAGES = [
  { now: "Instalando processador", done: "Processador instalado no socket" },
  { now: "Encaixando memória RAM", done: "Memória RAM encaixada" },
  { now: "Instalando placa de vídeo", done: "Placa de vídeo instalada" },
  { now: "Finalizando: SSD, cabos e testes", done: "SSD, cabos, térmica e testes finais" },
];

export type PhaseChange = (status: BuildStatus, previous: Phase) => void;

export class Tracker {
  private status: BuildStatus | null = null;
  private timer: number | undefined;
  /** Incrementado a cada nova build, para descartar respostas atrasadas. */
  private generation = 0;

  constructor(
    private readonly catalog: Category[],
    private readonly onPhaseChange: PhaseChange,
  ) {}

  current(): BuildStatus | null {
    return this.status;
  }

  /** Começa a acompanhar uma build recém-enviada. */
  start(status: BuildStatus): void {
    this.stop();
    this.generation++;
    this.status = status;
    this.renderSummary(status);
    this.renderChecklist();
    this.resetMontage();
    this.render(status);
    this.schedule();
  }

  stop(): void {
    window.clearTimeout(this.timer);
    this.timer = undefined;
  }

  private schedule(): void {
    this.timer = window.setTimeout(() => void this.poll(), POLL_MS);
  }

  private async poll(): Promise<void> {
    const prev = this.status;
    if (!prev) return;
    const gen = this.generation;
    try {
      const next = await api.buildStatus(prev.id);
      if (gen !== this.generation) return;
      this.status = next;
      this.render(next);
      if (next.phase !== prev.phase) this.onPhaseChange(next, prev.phase);
    } catch (err) {
      if (gen !== this.generation) return;
      console.error("Falha ao consultar a build:", errorMessage(err));
    }
    if (gen === this.generation && this.status?.phase !== "done") this.schedule();
  }

  /* ---------------------------------------------------------------- */

  private renderSummary(status: BuildStatus): void {
    const rows = status.parts.map((part) => {
      const cat = this.catalog.find((c) => c.id === part.category);
      return el(
        "p",
        "summary__row",
        el("span", "summary__k", cat?.summaryLabel ?? part.category),
        el("span", "summary__v", part.label),
      );
    });
    byId("summary-rows").replaceChildren(...rows);
  }

  private renderChecklist(): void {
    const items = STAGES.map((stage) => {
      const mark = el("span", "checklist__mark");
      mark.setAttribute("aria-hidden", "true");
      mark.innerHTML = CHECK_ICON;
      return el("li", "checklist__item", mark, stage.done);
    });
    byId("checklist").replaceChildren(...items);
  }

  private resetMontage(): void {
    byId("screen-montage").classList.remove("is-done");
    byId("mount-eyebrow").textContent = "Montagem em andamento";
    byId("mount-title").replaceChildren("Sua build está ", el("span", "accent", "sendo montada!"));
    byId("mount-note").textContent = "Não feche esta tela — você será avisado assim que a build for concluída.";
    byId("btn-new-build").hidden = true;
    // Zera a barra sem animar a volta
    const fill = byId("build-progress-fill");
    fill.style.transition = "none";
    fill.style.width = "0%";
    void fill.offsetWidth;
    fill.style.transition = "";
  }

  private render(s: BuildStatus): void {
    this.renderQueue(s);
    this.renderMontage(s);
  }

  private renderQueue(s: BuildStatus): void {
    const queued = s.phase === "queued";
    byId("build-number").textContent = formatBuildNumber(s.number);
    byId("queue-position").textContent = pad(s.queuePosition, 2);
    byId("queue-total").textContent = String(s.queueTotal);

    byId("queue-eta-label").textContent = queued ? "Previsão de início:" : "Situação:";
    byId("queue-eta").textContent = queued
      ? formatEta(s.etaSeconds)
      : s.phase === "assembling"
        ? "em montagem"
        : "concluída";

    const waiting = byId("waiting");
    waiting.classList.toggle("is-ready", !queued);
    byId("waiting-text").textContent = queued
      ? "Aguarde sua vez"
      : s.phase === "assembling"
        ? "Sua vez chegou!"
        : "Build concluída!";

    const btn = byId<HTMLAnchorElement>("btn-montage");
    btn.classList.toggle("is-disabled", queued);
    btn.setAttribute("aria-disabled", String(queued));
    btn.tabIndex = queued ? -1 : 0;
  }

  private renderMontage(s: BuildStatus): void {
    byId("mount-build-number").textContent = formatBuildNumber(s.number);

    const progress = Math.max(0, Math.min(100, s.progress));
    byId("build-progress-fill").style.width = `${progress}%`;
    byId("build-progress").setAttribute("aria-valuenow", String(Math.round(progress)));

    const stage = byId("mount-stage");
    const eta = byId("mount-eta");
    if (s.phase === "queued") {
      stage.textContent = "Aguardando na fila";
      eta.textContent = `início ${formatEta(s.etaSeconds)}`;
    } else if (s.phase === "assembling") {
      stage.textContent = STAGES[s.stageIndex]?.now ?? "Montando";
      eta.textContent = `${formatEta(s.etaSeconds)} restantes`;
    } else {
      stage.textContent = "Build concluída";
      eta.textContent = "100%";
    }

    byId("checklist")
      .querySelectorAll<HTMLElement>(".checklist__item")
      .forEach((item, i) => {
        item.classList.toggle("is-done", i < s.stageIndex);
        item.classList.toggle("is-now", s.phase === "assembling" && i === s.stageIndex);
      });

    if (s.phase === "done") {
      byId("screen-montage").classList.add("is-done");
      byId("mount-eyebrow").textContent = "Montagem concluída";
      byId("mount-title").replaceChildren("Sua build está ", el("span", "accent", "pronta!"));
      byId("mount-note").textContent = "Todas as etapas foram conferidas. Obrigado por usar o PC Build Simulator!";
      byId("btn-new-build").hidden = false;
    }
  }
}
