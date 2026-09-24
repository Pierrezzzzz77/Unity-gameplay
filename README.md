# Monta.3D — simulador 3D de montagem de computador

Simulador web em que o usuário monta, passo a passo, a parte central de um PC sobre uma
bancada 3D: **placa-mãe → socket → processador → dissipador → cooler**. Feito com React,
TypeScript, Vite, [React Three Fiber](https://r3f.docs.pmnd.rs/) + [drei](https://drei.docs.pmnd.rs/),
zustand e Tailwind CSS. Tudo é estático (sem backend) e as peças são geometria procedural,
prontas para serem trocadas por modelos GLB.

- `/` — landing page do projeto (`index.html`)
- `/montar/` — o simulador (`montar/index.html` → `src/main.tsx`)

## Como rodar

Requer Node.js 20.19+ (ou 22.12+).

```bash
npm install
npm run dev        # servidor de desenvolvimento: abra http://localhost:5173/montar/
npm run build      # checagem de tipos + build de produção em dist/
npm run preview    # serve o build de dist/ localmente
```

Outros scripts:

| Script                 | O que faz                                  |
| ---------------------- | ------------------------------------------ |
| `npm run lint`         | ESLint (TypeScript, hooks do React)        |
| `npm run typecheck`    | `tsc -b` sem gerar arquivos                |
| `npm run format`       | Prettier em todo o projeto                 |
| `npm run format:check` | Verifica a formatação sem alterar arquivos |

### Deploy

O build usa caminhos relativos (`base: './'`), então a pasta `dist/` funciona tal como está
em Vercel, Netlify ou GitHub Pages (inclusive numa subpasta como `usuario.github.io/repo/`).

## Como usar

1. Selecione uma peça na **bandeja** (painel lateral) ou clicando nela na bancada.
2. Clique no **volume azul destacado** na cena (ou em **Encaixar** / tecla `Enter`).
3. No passo do processador, gire a peça (**Girar 90°** / tecla `R`, `Shift+R` gira ao contrário)
   até o triângulo dourado ficar no mesmo canto da marca do socket.

Atalhos: `R` girar · `Enter` encaixar · `Esc` cancelar seleção. Câmera: arraste para girar,
role para dar zoom, botão direito (ou dois dedos) para mover.

Regras do fluxo:

- Só a peça da etapa atual encaixa. Tentar outra mostra "Faça o passo X primeiro".
- O processador começa girado errado; encaixar fora de orientação é recusado com erro.
- Encaixe correto → animação suave até a posição final, som, etapa concluída e avanço.
- Ao fim das 5 etapas aparece **Montagem concluída** (e o cooler começa a girar).
- **Reiniciar montagem** devolve tudo à bancada.

## Estrutura

```
index.html                 landing page (estática)
montar/index.html          entrada do simulador
src/
  main.tsx, App.tsx        bootstrap e layout (canvas + painel/drawer)
  index.css                Tailwind + tokens de tema (dark padrão / light)
  types.ts                 PartId, PartProps, Vec3
  data/
    parts.ts               dimensões, posições na bancada e alvos de encaixe
    steps.ts               etapas (id, título, instrução, peça esperada, regras de validação)
  store/
    assemblyStore.ts       máquina de estados da montagem (zustand)
    uiStore.ts             tema e som (persistidos no localStorage)
  scene/
    Scene.tsx              Canvas, luzes, Environment procedural, ContactShadows, OrbitControls
    Workbench.tsx          bancada + tapete antiestático
    PartActor.tsx          seleção/hover/animação de encaixe de cada peça
    SnapSlot.tsx           slot destacado da etapa atual
    CameraRig.tsx          enquadramento responsivo e limites do pan
    parts/                 uma peça por arquivo (Motherboard, Socket, Processor, Heatsink, Cooler)
  ui/
    StepPanel.tsx          etapa atual, instrução, progresso 1..5, ações
    PartTray.tsx           peças ainda não colocadas
    Feedback.tsx           mensagens de sucesso/erro que somem sozinhas
    CompletionBanner.tsx   selo de montagem concluída
    Toolbar.tsx            reiniciar, som, tema
  lib/sound.ts             efeitos sonoros sintetizados (Web Audio, sem arquivos)
```

### Como as etapas são validadas

Cada etapa em `src/data/steps.ts` lista `rules`, avaliadas em ordem:

```ts
{
  id: 'insert-processor',
  expectedPart: 'processor',
  rules: [requireExpectedPart, requireOrientation(0)],
}
```

`requireExpectedPart` garante a ordem; `requireOrientation(n)` exige que a peça esteja girada
`n × 90°` em relação à orientação de referência. Novas regras são só funções
`(attempt, ctx) => ValidationResult`.

## Trocando as peças placeholder por modelos GLB

Cada peça em `src/scene/parts/` é um componente isolado com a mesma interface:

```ts
interface PartProps {
  position?: Vec3
  rotation?: Vec3
  highlighted?: boolean // hover/seleção
  active?: boolean // montagem concluída (cooler gira, LED acende)
}
```

O resto do app (store, animação, cliques, slots) não conhece a geometria, então basta trocar
o conteúdo do componente. Todas as peças têm um `// TODO: trocar por modelo GLB`.

1. Coloque o arquivo em `public/models/` (ex.: `public/models/cooler.glb`).
2. Exporte o modelo respeitando a **convenção de pivô**: origem no **centro da face de baixo**,
   eixo Y para cima, marcador de pino 1 (CPU/socket) no canto **-X/-Z**, escala
   **1 unidade = 10 cm**. Se o modelo vier diferente, corrija com um `<group>` interno
   (`scale`, `position`, `rotation`).
3. Substitua a geometria do componente:

```tsx
import { useGLTF } from '@react-three/drei'
import { PROCESSOR_SIZE } from '../../data/parts'
import type { PartProps } from '../../types'
import { PartHighlight } from './PartHighlight'

const url = `${import.meta.env.BASE_URL}models/processor.glb`
const { width: W, height: H, depth: D } = PROCESSOR_SIZE

export function Processor({ position, rotation, highlighted }: PartProps) {
  const { scene } = useGLTF(url)
  return (
    <group position={position} rotation={rotation}>
      <primitive object={scene} />
      {/* mantém área de clique e contorno de destaque */}
      <PartHighlight size={[W, H, D]} highlighted={highlighted} />
    </group>
  )
}

useGLTF.preload(url)
```

Observações:

- Use `import.meta.env.BASE_URL` no caminho (em vez de `/models/...`) para funcionar em
  subpastas no deploy.
- `PartHighlight` desenha o contorno a partir de uma caixa envolvente invisível, então o
  destaque funciona igual para geometria procedural e para GLB. Ajuste `size` às medidas do
  modelo (as constantes em `src/data/parts.ts` também definem os alvos de encaixe).
- A cena já está dentro de `<Suspense>`, então o carregamento assíncrono do GLB funciona sem
  mudanças.
- Para instanciar o mesmo GLB mais de uma vez, use `scene.clone()` (ou `<Clone>` do drei).
- No cooler, anime o nó das pás (ex.: `nodes.Rotor.rotation.y`) no `useFrame` já existente.
- Modelos com compressão Draco fazem o drei baixar o decodificador de um CDN; para manter o
  deploy 100% estático, exporte sem Draco ou hospede o decodificador em `public/`.
