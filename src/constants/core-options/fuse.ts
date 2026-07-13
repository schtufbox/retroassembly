import type { CoreOption } from './types.d.ts'

export const fuseOptions: CoreOption[] = [
  {
    defaultOption: 'Spectrum 48K',
    name: 'fuse_machine',
    options: [
      'Spectrum 16K',
      'Spectrum 48K',
      'Spectrum 48K (NTSC)',
      'Spectrum 128K',
      'Spectrum +2',
      'Spectrum +2A',
      'Spectrum +3',
      'Spectrum +3e',
      'Spectrum SE',
      'Timex TC2048',
      'Timex TC2068',
      'Timex TS2068',
      'Pentagon 128K',
      'Pentagon 512K',
      'Pentagon 1024',
      'Scorpion 256K',
    ],
    title: 'Model',
  },
  {
    defaultOption: 'auto',
    name: 'fuse_hide_border',
    options: ['auto', 'always hide', 'never hide'],
    title: 'Hide Border',
  },
  {
    defaultOption: 'auto',
    name: 'fuse_load_sound',
    options: ['auto', 'disabled', 'enabled'],
    title: 'Tape Load Sound',
  },
  {
    defaultOption: 'auto',
    name: 'fuse_fast_load',
    options: ['auto', 'disabled', 'enabled'],
    title: 'Fast Tape Load',
  },
]
