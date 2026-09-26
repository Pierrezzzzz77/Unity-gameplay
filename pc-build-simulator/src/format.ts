export function pad(n: number, width: number): string {
  return String(n).padStart(width, "0");
}

export function formatBuildNumber(n: number): string {
  return `#${pad(n, 3)}`;
}

/** Segundos → "~45 s" / "~3 min" */
export function formatEta(seconds: number): string {
  if (seconds <= 0) return "agora";
  if (seconds < 60) return `~${seconds} s`;
  return `~${Math.ceil(seconds / 60)} min`;
}
