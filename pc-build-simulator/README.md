# PC Build Simulator — Tauri + TypeScript

Projeto acadêmico da Faculdade Serra Dourada (Canaã dos Carajás/PA).
App desktop: o usuário monta um PC escolhendo as peças, envia a build para
a fila e acompanha a montagem em tempo real.

- **Frontend:** TypeScript + Vite (sem framework), mesmo visual do protótipo HTML.
- **Backend:** Rust/Tauri 2 — catálogo, validação da build e simulação da fila/montagem.

## Estrutura

```
pc-build-simulator/
├── catalog.json            ← catálogo de peças (usado pelo Rust e pelo TS)
├── index.html              ← markup das 4 telas
├── public/logo.svg         ← escudo Serra Dourada
├── src/                    ← frontend TypeScript
│   ├── main.ts             ← inicialização e fluxo entre telas
│   ├── api.ts              ← chamadas ao backend (invoke) + simulação p/ navegador
│   ├── router.ts           ← navegação (showScreen, #screen-X)
│   ├── types.ts            ← tipos compartilhados com o Rust
│   ├── format.ts, dom.ts   ← utilitários
│   ├── styles.css
│   └── ui/
│       ├── components.ts   ← tela de componentes (cards do catálogo)
│       ├── tracking.ts     ← telas de fila e montagem (consulta a cada 1 s)
│       └── icons.ts
└── src-tauri/              ← backend Rust
    ├── tauri.conf.json
    └── src/
        ├── lib.rs          ← comandos Tauri
        ├── catalog.rs      ← carrega catalog.json
        └── queue.rs        ← simulação da fila e da montagem (+ testes)
```

## Comandos Tauri (Rust → TypeScript)

| Comando          | Entrada                         | Retorno        |
| ---------------- | ------------------------------- | -------------- |
| `get_catalog`    | —                               | `Category[]`   |
| `submit_build`   | `selection: { cpu, gpu, ram, ssd }` | `BuildStatus` (erro se faltar peça ou id inválido) |
| `build_status`   | `id`                            | `BuildStatus`  |
| `cancel_build`   | `id`                            | —              |

`BuildStatus` traz `phase` (`queued` → `assembling` → `done`), posição e total
da fila, previsão em segundos, progresso (0–100) e etapa atual da montagem.
Os tempos da simulação ficam em `src-tauri/src/queue.rs` (`SLOT` e `STAGE`).

Para ligar numa API/broker de fila real, basta trocar a implementação de
`queue.rs` mantendo o formato de `BuildStatus` — o frontend não muda.

## Pré-requisitos

- Node.js 20+
- Rust (stable) — https://rustup.rs
- Dependências do sistema do Tauri: https://v2.tauri.app/start/prerequisites/
  (no Linux: `libwebkit2gtk-4.1-dev`, `libgtk-3-dev`, `librsvg2-dev`, …;
  no Windows: WebView2, já presente no Windows 10/11)

## Rodando

```bash
cd pc-build-simulator
npm install

npm run tauri dev     # app desktop com recarregamento automático
npm run tauri build   # gera o instalador em src-tauri/target/release/bundle/
```

Só o visual, direto no navegador (sem compilar o Rust):

```bash
npm run dev           # http://localhost:1420 — usa a simulação de src/api.ts
```

## Testes e verificações

```bash
npm run typecheck                        # TypeScript
cd src-tauri && cargo test               # regras da fila e do catálogo
```

## Editando o catálogo

Adicione ou altere peças em `catalog.json`. Categorias novas aparecem
automaticamente na tela de componentes (com um ícone genérico — para um
ícone próprio, adicione-o em `src/ui/icons.ts`).

## Ícones do app

Gerados a partir de `app-icon.svg`:

```bash
npx tauri icon app-icon.svg   # ou um PNG 1024×1024
```
