import { useCallback, useEffect, useMemo } from "react"
import * as THREE from "three"
import type { RenderTargetOptions } from "three"

// TODO create vanilla versions

// export type DoubleFBO<TTexture extends THREE.Texture | THREE.Texture[] = THREE.Texture> = {
//   read: THREE.WebGLRenderTarget<TTexture>
//   write: THREE.WebGLRenderTarget<TTexture>
//   swap: () => void
//   dispose: () => void
//   resize: (width: number, height: number) => void
// }

class DoubleFBO<TTexture extends THREE.Texture | THREE.Texture[] = THREE.Texture> {

  public read: THREE.WebGLRenderTarget<TTexture>
  public write: THREE.WebGLRenderTarget<TTexture>

  constructor(width: number, height: number, options: RenderTargetOptions) {
    this.read = new THREE.WebGLRenderTarget<TTexture>(width, height, options)
    this.write = new THREE.WebGLRenderTarget<TTexture>(width, height, options)
  }

  get texture(): THREE.Texture {
    return this.read.texture as THREE.Texture
  }

  get textures(): TTexture {
    return this.read.textures as any as TTexture
  }

  swap() {
    const temp = this.read
    this.read = this.write
    this.write = temp
  }

  dispose() {
    this.read.dispose()
    this.write.dispose()
  }

  setSize(width: number, height: number) {
    this.read.setSize(width, height)
    this.write.setSize(width, height)
  }
}

export function useDoubleFBO<TTexture extends THREE.Texture | THREE.Texture[] = THREE.Texture>(
  width: number,
  height: number,
  options: RenderTargetOptions
): DoubleFBO<TTexture> {
  const fbo = useMemo(() => new DoubleFBO<TTexture>(width, height, options), [])

  useEffect(() => {
    fbo.setSize(width, height)
  }, [width, height, fbo])

  return fbo
}

// export function useDoubleFBO<TTexture extends THREE.Texture | THREE.Texture[] = THREE.Texture>(
//   width: number,
//   height: number,
//   options: RenderTargetOptions
// ): DoubleFBO<TTexture> {
//   const read = useMemo(() => {
//     const fbo = new THREE.WebGLRenderTarget<TTexture>(width, height, options)
//     return fbo
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [])

//   const write = useMemo(() => {
//     const fbo = new THREE.WebGLRenderTarget<TTexture>(width, height, options)
//     return fbo
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [])

//   const resize = useCallback((width: number, height: number) => {
//     read.setSize(width, height)
//     write.setSize(width, height
//   }, [read, write])

//   useEffect(() => {
//     resize(width, height)
//   }, [width, height, resize])

//   useEffect(() => {
//     // dispose on unmount
//     return () => {
//       read.dispose()
//       write.dispose()
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [])

//   const fbo = useMemo<DoubleFBO<TTexture>>(
//     () => ({
//       read,
//       write,
//       resize,
//       swap: () => {
//         const temp = fbo.read
//         fbo.read = fbo.write
//         fbo.write = temp
//       },
//       dispose: () => {
//         read.dispose()
//         write.dispose()
//       }
//     }),
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     []
//   )

//   return fbo
// }
