// Navegação entre telas. Uma tela visível por vez (classe .active);
// o hash da URL (#screen-X) acompanha, então links <a href="#screen-X">
// e o botão voltar do histórico continuam funcionando.

export type ScreenId = "screen-home" | "screen-components" | "screen-status" | "screen-montage";

const DEFAULT_SCREEN: ScreenId = "screen-home";

type Guard = (target: ScreenId) => ScreenId;
type Listener = (screen: ScreenId) => void;

let guard: Guard = (target) => target;
const listeners: Listener[] = [];
let current: ScreenId | null = null;

function isScreenId(id: string): id is ScreenId {
  return document.getElementById(id)?.classList.contains("screen") ?? false;
}

function screenFromHash(): ScreenId {
  const id = location.hash.slice(1);
  return isScreenId(id) ? id : DEFAULT_SCREEN;
}

function render(): void {
  const requested = screenFromHash();
  const target = guard(requested);
  if (target !== requested) {
    // Redireciona sem empilhar uma entrada no histórico
    history.replaceState(null, "", `#${target}`);
  }
  if (target === current) return;
  current = target;

  document.querySelectorAll<HTMLElement>(".screen").forEach((el) => {
    el.classList.toggle("active", el.id === target);
  });
  window.scrollTo(0, 0);
  listeners.forEach((fn) => fn(target));
}

/** Troca de tela a partir da lógica (ex.: showScreen("screen-status")). */
export function showScreen(id: ScreenId): void {
  if (location.hash === `#${id}`) render();
  else location.hash = id; // dispara hashchange → render()
}

export function currentScreen(): ScreenId | null {
  return current;
}

/** Permite redirecionar telas que ainda não fazem sentido (ex.: fila sem build). */
export function setGuard(fn: Guard): void {
  guard = fn;
}

export function onScreenChange(fn: Listener): void {
  listeners.push(fn);
}

export function startRouter(): void {
  window.addEventListener("hashchange", render);
  render();
}
