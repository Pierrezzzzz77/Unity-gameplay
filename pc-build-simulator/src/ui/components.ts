// Tela de componentes: cards gerados a partir do catálogo.

import { byId, el } from "../dom";
import type { Category, PartOption, Selection } from "../types";
import { categoryIcon } from "./icons";

export function renderCatalog(container: HTMLElement, catalog: Category[]): void {
  container.replaceChildren(...catalog.map(partCard));
  container.removeAttribute("aria-busy");
}

export function renderCatalogMessage(container: HTMLElement, message: string): void {
  container.replaceChildren(el("p", "card-list__msg", message));
}

function partCard(cat: Category): HTMLElement {
  const icon = el("span", "part-card__icon");
  icon.setAttribute("aria-hidden", "true");
  icon.innerHTML = categoryIcon(cat.id);

  const pick = el("span", "part-card__pick", "—");
  pick.id = `pick-${cat.id}`;

  const head = el(
    "header",
    "part-card__head",
    icon,
    el("div", "part-card__text", el("h2", "part-card__title", cat.title), el("p", "part-card__hint", cat.hint)),
    pick,
  );

  const list = el("div", "option-list", ...cat.options.map((opt, i) => choice(cat, opt, i === 0)));
  list.setAttribute("role", "radiogroup");
  list.setAttribute("aria-label", cat.title);

  const card = el("article", "part-card", head, list);
  card.id = `part-${cat.id}`;
  return card;
}

function choice(cat: Category, opt: PartOption, checked: boolean): HTMLElement {
  const input = el("input", "choice__input");
  input.type = "radio";
  input.name = cat.id;
  input.value = opt.id;
  input.checked = checked;

  const radio = el("span", "choice__radio");
  radio.setAttribute("aria-hidden", "true");

  return el(
    "label",
    "choice",
    input,
    el(
      "span",
      "choice__inner",
      el("span", "choice__text", el("span", "choice__name", opt.name), el("span", "choice__meta", opt.meta)),
      radio,
    ),
  );
}

export function readSelection(catalog: Category[]): Selection {
  const selection: Selection = {};
  for (const cat of catalog) {
    const input = document.querySelector<HTMLInputElement>(`input[name="${cat.id}"]:checked`);
    if (input) selection[cat.id] = input.value;
  }
  return selection;
}

/** Atualiza os selos dos cards e o contador; devolve se todas as categorias foram escolhidas. */
export function refreshPicks(catalog: Category[]): boolean {
  const selection = readSelection(catalog);
  let chosen = 0;
  for (const cat of catalog) {
    const option = cat.options.find((o) => o.id === selection[cat.id]);
    byId(`pick-${cat.id}`).textContent = option ? option.label : "—";
    if (option) chosen++;
  }
  byId("parts-count").textContent = `${chosen}/${catalog.length}`;
  return chosen === catalog.length;
}
