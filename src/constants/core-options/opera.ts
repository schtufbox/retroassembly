import type { CoreOption } from './types.d.ts'

export const operaOptions: CoreOption[] = [
  {
    defaultOption: '1.0x (12.50Mhz)',
    name: 'opera_cpu_overclock',
    options: [
      '1.0x (12.50Mhz)',
      '1.1x (13.75Mhz)',
      '1.2x (15.00Mhz)',
      '1.5x (18.75Mhz)',
      '1.6x (20.00Mhz)',
      '1.8x (22.50Mhz)',
      '2.0x (25.00Mhz)',
    ],
    title: 'CPU Overclock',
  },
  {
    defaultOption: 'disabled',
    name: 'opera_high_resolution',
    options: ['disabled', 'enabled'],
    title: 'High Resolution',
  },
  {
    defaultOption: 'per game',
    name: 'opera_nvram_storage',
    options: ['per game', 'shared'],
    title: 'NVRAM Storage',
  },
]
