import { Card, Select } from '@radix-ui/themes'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { coreDisplayNameMap, type CoreName, coreOptionsMap } from '#@/constants/core.ts'
import { platformMap } from '#@/constants/platform.ts'
import { usePlatform } from '#@/pages/library/hooks/use-platform.ts'
import { usePreference } from '#@/pages/library/hooks/use-preference.ts'
import { getPlatformIcon } from '#@/utils/client/library.ts'
import { SettingsTitle } from '../settings-title.tsx'
import { UpdateButton } from '../update-button.tsx'
import { BIOSOptions } from './bios-options.tsx'
import { CoreOptions } from './core-options.tsx'
import { PlatformShaderSettings } from './platform-shader-settings.tsx'

export function CoresSettings() {
  const { t } = useTranslation()
  const { isLoading, preference, update } = usePreference()
  const currentPlatform = usePlatform()
  const enabledPlatforms = preference.ui.platforms.filter((name) => name in platformMap)
  const [selectedPlatform, setSelectedPlatform] = useState(
    currentPlatform?.name || enabledPlatforms[0] || Object.keys(platformMap)[0],
  )

  if (!enabledPlatforms.length) {
    return
  }

  const activePlatform =
    selectedPlatform in platformMap && enabledPlatforms.includes(selectedPlatform)
      ? selectedPlatform
      : enabledPlatforms[0]
  const platformConfig = platformMap[activePlatform]
  const { core } = preference.emulator.platform[activePlatform]
  const coreOptions = coreOptionsMap[core] || []
  const showReset = platformConfig.cores.length > 0 && coreOptions.length > 0

  async function handleValueChange(value: CoreName) {
    await update({
      emulator: {
        platform: {
          [activePlatform]: {
            core: value,
          },
        },
      },
    })
  }

  return (
    <div>
      <SettingsTitle>
        <span className='icon-[mdi--computer-classic]' />
        {t('common.emulationFor')}
        <div className='ml-2 flex flex-col gap-2'>
          <Select.Root
            onValueChange={(value: typeof activePlatform) => setSelectedPlatform(value)}
            size='3'
            value={activePlatform}
          >
            <Select.Trigger disabled={isLoading} variant='ghost'>
              <div className='flex items-center gap-2'>
                <img
                  alt={t(platformConfig.displayNameI18nKey)}
                  className='size-5 object-contain object-center'
                  loading='lazy'
                  src={getPlatformIcon(platformConfig.name)}
                />
                {t(platformConfig.displayNameI18nKey)}
              </div>
            </Select.Trigger>
            <Select.Content>
              {enabledPlatforms.map((platform) => (
                <Select.Item key={platformMap[platform].name} value={platformMap[platform].name}>
                  <div className='flex items-center gap-2'>
                    <img
                      alt={t(platformMap[platform].displayNameI18nKey)}
                      className='size-5 object-contain object-center'
                      src={getPlatformIcon(platformMap[platform].name)}
                    />
                    {t(platformMap[platform].displayNameI18nKey)}
                  </div>
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>
      </SettingsTitle>

      <Card>
        <BIOSOptions platform={activePlatform} />

        <PlatformShaderSettings platform={activePlatform} />

        <div className='mt-2'>
          <label className='mt-2 flex items-center gap-2'>
            <SettingsTitle as='h4'>
              <span className='icon-[mdi--monitor-screenshot]' /> {t('common.emulator')}
            </SettingsTitle>

            <Select.Root onValueChange={handleValueChange} size='2' value={core}>
              <Select.Trigger disabled={isLoading} />
              <Select.Content>
                {platformConfig.cores.map((coreName) => (
                  <Select.Item key={coreName} value={coreName}>
                    <div className='flex items-center gap-2'>
                      <div className='flex size-4 items-center justify-center'>
                        <span className='icon-[mdi--jigsaw] size-5' />
                      </div>
                      {coreDisplayNameMap[coreName]}
                    </div>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </label>

          {coreOptions.length > 0 ? <CoreOptions core={core} coreOptions={coreOptions} /> : null}

          {showReset ? (
            <div className='flex justify-end'>
              <UpdateButton
                preference={{
                  emulator: {
                    core: { [core]: null },
                    platform: { [activePlatform]: { core: null } },
                  },
                }}
              >
                <span className='icon-[mdi--undo]' />
                {t('emulator.resetToDefaultsDescription')}
              </UpdateButton>
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  )
}
