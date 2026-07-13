import type { CoreOption } from './types.d.ts'

// Defaults tuned for the experimental WASM interpreter (ENABLE_GENERIC) build.
export const dolphinOptions: CoreOption[] = [
  {
    defaultOption: '5',
    name: 'dolphin_cpu_core',
    options: ['0', '5'],
    title: 'CPU Core (0=Interpreter, 5=Cached Interpreter)',
  },
  {
    defaultOption: 'Hardware',
    name: 'dolphin_renderer',
    options: ['Hardware'],
    title: 'Graphics Backend',
  },
  {
    defaultOption: '1',
    name: 'dolphin_efb_scale',
    options: ['1', '2', '3', '4'],
    title: 'Internal Resolution',
  },
  {
    defaultOption: 'disabled',
    name: 'dolphin_widescreen_hack',
    options: ['disabled', 'enabled'],
    title: 'Widescreen Hack',
  },
]
