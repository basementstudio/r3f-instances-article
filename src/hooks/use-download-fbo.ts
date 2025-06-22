import { useCallback, useRef } from "react"
import { RootState, useThree } from "@react-three/fiber"
import { useControls, button } from "leva"
import * as THREE from "three"

interface UseDownloadFboProps {
  canScale?: boolean
  fbo: THREE.WebGLRenderTarget
  onDownloadRequest?: (state: RootState, delta: number, sizeMultiplier: number) => () => void
}

export function useDownloadFbo({ fbo, onDownloadRequest, canScale = true }: UseDownloadFboProps) {
  const { gl } = useThree()

  const downloadRequestRef = useRef(onDownloadRequest)
  downloadRequestRef.current = onDownloadRequest

  const state = useThree()

  const isRenderingRef = useRef(false)

  const sizeMultiplierRef = useRef(1)

  const downloadFboTexture = useCallback(() => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    isRenderingRef.current = true

    const cleanupFunction = downloadRequestRef.current?.(state, 0.001, sizeMultiplierRef.current)

    // Set canvas size to match texture
    canvas.width = fbo.texture.image.width
    canvas.height = fbo.texture.image.height

    // Read pixels from the texture
    const pixels = new Uint8Array(canvas.width * canvas.height * 4)
    gl.readRenderTargetPixels(
      fbo,
      0,
      0,
      canvas.width,
      canvas.height,
      pixels
    )

    // Create ImageData and flip Y (WebGL has origin at bottom-left, canvas at top-left)
    const imageData = ctx.createImageData(canvas.width, canvas.height)
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const srcIdx = ((canvas.height - 1 - y) * canvas.width + x) * 4
        const dstIdx = (y * canvas.width + x) * 4
        imageData.data[dstIdx] = pixels[srcIdx] // R
        imageData.data[dstIdx + 1] = pixels[srcIdx + 1] // G
        imageData.data[dstIdx + 2] = pixels[srcIdx + 2] // B
        imageData.data[dstIdx + 3] = pixels[srcIdx + 3] // A
      }
    }

    ctx.putImageData(imageData, 0, 0)

    // Create download link
    canvas.toBlob((blob) => {
      if (!blob) return

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `texture-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      cleanupFunction?.()

      isRenderingRef.current = false
    }, "image/png")
  }, [gl, fbo])

  useControls("Export", {
    download: button(() => downloadFboTexture()),
    sizeMultiplier: {
      disabled: !canScale,
      value: 1,
      min: 1,
      max: 5,
      step: 1,
      onChange: (value) => {
        sizeMultiplierRef.current = value
      }
    }
  })

  return isRenderingRef
} 