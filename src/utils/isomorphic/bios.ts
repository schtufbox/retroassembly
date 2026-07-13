import type { Platform } from '#@/constants/platform.ts'

type ExpectedBios = NonNullable<Platform['bioses']>[number]
interface UploadedBios {
  fileName: string
}

/**
 * Returns expected BIOS files that still block launch.
 * - Default: every `required: true` entry must be present.
 * - `biosRequirement: 'any'`: at least one required entry must be present.
 */
export function getMissingRequiredBioses(platform: Platform, uploaded: UploadedBios[] | undefined) {
  const expected = platform.bioses?.filter((bios) => bios.required) ?? []
  if (!expected.length) {
    return [] as ExpectedBios[]
  }

  function isUploaded(bios: ExpectedBios) {
    return Boolean(uploaded?.some((b) => b.fileName === bios.name))
  }

  if (platform.biosRequirement === 'any') {
    if (expected.some((bios) => isUploaded(bios))) {
      return [] as ExpectedBios[]
    }
    return expected
  }

  return expected.filter((bios) => !isUploaded(bios))
}
