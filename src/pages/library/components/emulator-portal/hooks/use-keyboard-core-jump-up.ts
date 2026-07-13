import { useEffect } from 'react'

// Standard layout: face X/west = 3, d-pad up = 12, left stick Y = axes[1] (up is negative).
// Keyboard computer cores bind RetroArch Up to the jump face button natively. This patch
// also ORs the real d-pad Up (and stick-up) onto that same button so original Up still works.
const defaultJumpButtonIndex = 3
const defaultUpButtonIndex = 12
const leftStickYAxisIndex = 1
const stickUpThreshold = -0.5

interface JumpUpConfig {
  enabled: boolean
  /** Face button used as RetroArch Up (usually X = 3). */
  jumpButtonIndex: number
  /** Original d-pad Up button index (usually 12). */
  upButtonIndex: number
}

const jumpUpConfig: JumpUpConfig = {
  enabled: false,
  jumpButtonIndex: defaultJumpButtonIndex,
  upButtonIndex: defaultUpButtonIndex,
}

let prototypePatched = false

function cloneButton(source: GamepadButton | undefined, overrides: Partial<GamepadButton> = {}): GamepadButton {
  return {
    pressed: overrides.pressed ?? source?.pressed ?? false,
    touched: overrides.touched ?? source?.touched ?? false,
    value: overrides.value ?? source?.value ?? 0,
  }
}

function isOriginalUpHeld(pad: Gamepad, upButtonIndex: number) {
  if (pad.buttons[upButtonIndex]?.pressed) {
    return true
  }
  const stickY = pad.axes[leftStickYAxisIndex]
  return typeof stickY === 'number' && stickY <= stickUpThreshold
}

function wrapGamepad(pad: Gamepad, jumpButtonIndex: number, upButtonIndex: number): Gamepad {
  // Only need to rewrite when original Up is held and would otherwise be lost because
  // RetroArch Up is bound to the jump button index.
  if (!isOriginalUpHeld(pad, upButtonIndex)) {
    return pad
  }

  const buttonCount = Math.max(pad.buttons.length, jumpButtonIndex + 1, upButtonIndex + 1)
  const buttons: GamepadButton[] = Array.from({ length: buttonCount }, (_, index) => {
    if (index === jumpButtonIndex) {
      return cloneButton(pad.buttons[index], { pressed: true, touched: true, value: 1 })
    }
    return cloneButton(pad.buttons[index])
  })

  return new Proxy(pad, {
    get(target, property, receiver) {
      if (property === 'buttons') {
        return buttons
      }
      const value = Reflect.get(target, property, receiver)
      return typeof value === 'function' ? value.bind(target) : value
    },
  })
}

function wrapGamepadList(list: ArrayLike<Gamepad | null>, jumpButtonIndex: number, upButtonIndex: number) {
  const { length } = list
  return Array.from({ length }, (_, index) => {
    const pad = list[index]
    return pad ? wrapGamepad(pad, jumpButtonIndex, upButtonIndex) : null
  })
}

/**
 * Patch Navigator.prototype so RetroArch/Emscripten cores that cache
 * `navigator.getGamepads` (or bind the prototype method) still go through us.
 * Must run at module load, before any core is prepared.
 */
function installGetGamepadsPatch() {
  if (prototypePatched || typeof Navigator === 'undefined' || typeof navigator?.getGamepads !== 'function') {
    return
  }

  const original = Navigator.prototype.getGamepads
  if (typeof original !== 'function') {
    return
  }

  Navigator.prototype.getGamepads = function getGamepads(this: Navigator) {
    const list = original.call(this)
    if (!jumpUpConfig.enabled) {
      return list
    }
    return wrapGamepadList(list, jumpUpConfig.jumpButtonIndex, jumpUpConfig.upButtonIndex)
  }

  try {
    navigator.getGamepads = Navigator.prototype.getGamepads.bind(navigator)
  } catch {
    // ignore non-configurable navigator in older engines
  }

  prototypePatched = true
}

installGetGamepadsPatch()

/**
 * While enabled, face-button jump is RetroArch Up (set in use-emulator config).
 * The getGamepads patch mirrors real d-pad/stick Up onto that same face button
 * so the original Up binding still works.
 */
export function useKeyboardCoreJumpUp(
  enabled: boolean,
  upButtonIndex: number = defaultUpButtonIndex,
  jumpButtonIndex: number = defaultJumpButtonIndex,
) {
  useEffect(() => {
    installGetGamepadsPatch()

    const upIndex = Number.isFinite(upButtonIndex) ? Math.trunc(upButtonIndex) : defaultUpButtonIndex
    const jumpIndex = Number.isFinite(jumpButtonIndex) ? Math.trunc(jumpButtonIndex) : defaultJumpButtonIndex

    jumpUpConfig.enabled = enabled
    jumpUpConfig.upButtonIndex = upIndex
    jumpUpConfig.jumpButtonIndex = jumpIndex

    return () => {
      jumpUpConfig.enabled = false
    }
  }, [enabled, upButtonIndex, jumpButtonIndex])
}
