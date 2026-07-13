// WebGL2 patches ported from nasomers/flycast-wasm (patches/webgl2-compat.js).
// Flycast's GLES path + RetroArch gl2 driver need these to init video in browsers.

const patchedFlag = 'flycastWebglPatched'

let installed = false

export function installFlycastWebglPatches() {
  if (installed || typeof HTMLCanvasElement === 'undefined') {
    return
  }
  installed = true

  const originalWarn = console.warn.bind(console)
  console.warn = function warn(...args: unknown[]) {
    if (typeof args[0] === 'string') {
      const msg = args[0]
      if (msg.includes('__syscall_mprotect') || msg.includes('is not a valid value')) {
        return
      }
    }
    return originalWarn(...args)
  }

  const originalGetContext = HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = function getContext(type, attrs) {
    // @ts-expect-error canvas getContext overloads are wider than we need here
    const ctx = originalGetContext.call(this, type, attrs) as (WebGL2RenderingContext & Record<string, boolean>) | null
    if (ctx && (type === 'webgl2' || type === 'experimental-webgl2') && !ctx[patchedFlag]) {
      ctx[patchedFlag] = true

      const originalGetParameter = ctx.getParameter.bind(ctx)
      ctx.getParameter = function getParameter(pname: number) {
        if (pname === 0x1f_02 || pname === ctx.VERSION) {
          return 'OpenGL ES 3.0 WebGL 2.0'
        }
        if (pname === 0x8b_8c || pname === ctx.SHADING_LANGUAGE_VERSION) {
          return 'OpenGL ES GLSL ES 3.00'
        }
        return originalGetParameter(pname)
      }

      const originalGetError = ctx.getError.bind(ctx)
      ctx.getError = function getError() {
        let err = originalGetError()
        while (err === 0x5_00) {
          err = originalGetError()
        }
        return err
      }

      const texBindings: Record<number, number> = {
        [ctx.TEXTURE_2D]: ctx.TEXTURE_BINDING_2D,
        [ctx.TEXTURE_CUBE_MAP]: ctx.TEXTURE_BINDING_CUBE_MAP,
        [ctx.TEXTURE_3D]: ctx.TEXTURE_BINDING_3D,
        [ctx.TEXTURE_2D_ARRAY]: ctx.TEXTURE_BINDING_2D_ARRAY,
      }

      const originalTexParameteri = ctx.texParameteri.bind(ctx)
      ctx.texParameteri = function texParameteri(target: number, pname: number, param: number) {
        const binding = texBindings[target]
        if (binding && !originalGetParameter(binding)) {
          return
        }
        return originalTexParameteri(target, pname, param)
      }

      const originalTexParameterf = ctx.texParameterf.bind(ctx)
      ctx.texParameterf = function texParameterf(target: number, pname: number, param: number) {
        const binding = texBindings[target]
        if (binding && !originalGetParameter(binding)) {
          return
        }
        return originalTexParameterf(target, pname, param)
      }
    }
    return ctx
  } as typeof HTMLCanvasElement.prototype.getContext
}
