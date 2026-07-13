import type { CoreOption } from './types.d.ts'

export const cap32Options: CoreOption[] = [
  {
    defaultOption: '6128',
    name: 'cap32_model',
    options: ['464', '664', '6128', '6128+ (experimental)'],
    title: 'Model',
  },
  {
    defaultOption: '128',
    name: 'cap32_ram',
    options: ['64', '128', '192', '576'],
    title: 'RAM Size',
  },
  {
    defaultOption: 'enabled',
    name: 'cap32_autorun',
    options: ['enabled', 'disabled'],
    title: 'Autorun',
  },
  {
    defaultOption: 'disabled',
    name: 'cap32_scr_crop',
    options: ['disabled', 'enabled'],
    title: 'Crop Border',
  },
]
