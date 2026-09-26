// Ícones das categorias (SVG estático, traço = currentColor).

const ICONS: Record<string, string> = {
  cpu: `<rect x="6" y="6" width="12" height="12" rx="2"/>
    <rect x="9.5" y="9.5" width="5" height="5" rx="1"/>
    <path d="M9 2.5v3.5M15 2.5v3.5M9 18v3.5M15 18v3.5M2.5 9H6M2.5 15H6M18 9h3.5M18 15h3.5"/>`,
  gpu: `<rect x="2.5" y="7" width="19" height="10" rx="2"/>
    <path d="M8 7v2.5M16 7v2.5"/>
    <circle cx="8.2" cy="12" r="2.2"/>
    <circle cx="15.8" cy="12" r="2.2"/>
    <path d="M12 9.5v2.5"/>`,
  ram: `<path d="M8 3.5h8V21H8z"/>
    <path d="M10 3.5v3M14 3.5v3M10 14.5h4M10 18.5h4"/>
    <path d="M4.5 7h3.5M4.5 11h3.5M4.5 15h3.5"/>`,
  ssd: `<rect x="2.5" y="8.5" width="19" height="7" rx="1.5"/>
    <path d="M12 8.5v1.5M12 14.5V16"/>
    <path d="M7 12h.01M10.5 12h.01M17 10.8v2.4"/>
    <path d="M7.5 8.5V6.5h2v2"/>`,
};

// Peça genérica, para categorias novas adicionadas ao catálogo
const FALLBACK = `<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 9h6v6H9z"/>`;

export function categoryIcon(categoryId: string): string {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${
    ICONS[categoryId] ?? FALLBACK
  }</svg>`;
}

export const CHECK_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 8"/></svg>`;
