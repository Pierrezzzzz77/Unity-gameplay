// Tipos compartilhados com o backend Rust (src-tauri/src/*.rs, serde camelCase).

export type CategoryId = string;

export interface PartOption {
  id: string;
  /** Rótulo curto (selo do card e resumo da build) */
  label: string;
  /** Nome completo exibido na opção */
  name: string;
  /** Linha de especificações */
  meta: string;
}

export interface Category {
  id: CategoryId;
  title: string;
  hint: string;
  summaryLabel: string;
  options: PartOption[];
}

/** Categoria → id da opção escolhida */
export type Selection = Record<CategoryId, string>;

export type Phase = "queued" | "assembling" | "done";

export interface SelectedPart {
  category: CategoryId;
  label: string;
}

export interface BuildStatus {
  id: number;
  number: number;
  phase: Phase;
  /** Quantas builds ainda estão à frente (0 = é a sua vez) */
  queuePosition: number;
  queueTotal: number;
  /** Segundos até começar a montagem (fila) ou até terminar (montagem) */
  etaSeconds: number;
  /** 0–100 */
  progress: number;
  /** Etapa atual da montagem (0..STAGE_COUNT) */
  stageIndex: number;
  parts: SelectedPart[];
}
