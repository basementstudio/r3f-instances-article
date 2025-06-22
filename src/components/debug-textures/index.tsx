import { createPortal, useFrame, useThree } from "@react-three/fiber"
import { folder as levaFolder, useControls } from "leva"
import { useEffect, useMemo } from "react"
import {
  GLSL3,
  Group,
  OrthographicCamera,
  RawShaderMaterial,
  Texture
} from "three"
import vertexShader from "./shader/index.vert"
import fragmentShader from "./shader/index.frag"
import { saveGlState } from "@/lib/save-gl-state"

export interface DebugTexturesProps {
  hitConfig?: {
    scale: number
  }
  textures: Record<string, Texture | null>
  defaultTexture?: string
}

function getInitialSelectedTexture(defaultTexture: string, textures: string[]) {
  const query =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("debugTarget") ||
        defaultTexture
      : defaultTexture

  if (textures.includes(query)) {
    return query
  }

  return defaultTexture
}

export function DebugTextures({
  hitConfig,
  textures,
  defaultTexture = "screen"
}: DebugTexturesProps) {
  const camera = useMemo(() => new OrthographicCamera(), [])
  const numTextures = Object.keys(textures).length

  const debugTextureProgram = useMemo(
    () =>
      new RawShaderMaterial({
        vertexShader,
        fragmentShader,
        glslVersion: GLSL3,
        uniforms: {
          uMap: { value: null }
        }
      }),
    []
  )

  const grid = useMemo(() => {
    const sqrt = Math.sqrt(numTextures)
    const columns = Math.ceil(sqrt)
    const rows = Math.ceil(sqrt)
    const total = columns * rows

    return {
      columns,
      rows,
      total
    }
  }, [numTextures])

  const debugScene = useMemo(() => new Group(), [])

  const { debugTarget } = useControls({
    DebugTextures: levaFolder({
      debugTarget: {
        value: getInitialSelectedTexture(defaultTexture, Object.keys(textures)),
        options: Object.keys(textures).concat("all"),
        onChange: (value) => {
          if (typeof window !== "undefined") {
            window.history.pushState(
              {},
              "",
              window.location.pathname + "?debugTarget=" + value
            )
          }
        },
        transient: false
      }
    })
  })

  const size = useThree((state) => state.size)

  const DEFAULT_SCISSOR = {
    x: 0,
    y: 0,
    width: size.width,
    height: size.height
  }

  // const saveGlState = useCallback(() => {
  //   const prevTarget = gl.getRenderTarget()
  //   const prevAutoClear = gl.autoClear
  //   return () => {
  //     gl.setRenderTarget(prevTarget)
  //     gl.autoClear = prevAutoClear
  //   }
  // }, [gl])

  useEffect(() => {
    return () => {
      if (!hitConfig) return
      hitConfig.scale = 1
    }
  }, [])

  useFrame((state) => {
    const { gl } = state

    const resetGl = saveGlState(state)

    gl.autoClear = false
    gl.setRenderTarget(null)

    // gl.clear("#000", )

    gl.setViewport(
      DEFAULT_SCISSOR.x,
      DEFAULT_SCISSOR.y,
      DEFAULT_SCISSOR.width,
      DEFAULT_SCISSOR.height
    )

    gl.setScissor(
      DEFAULT_SCISSOR.x,
      DEFAULT_SCISSOR.y,
      DEFAULT_SCISSOR.width,
      DEFAULT_SCISSOR.height
    )

    const width = size.width
    const height = size.height

    const { columns, rows } = grid

    if (debugTarget !== "all" && debugTarget in textures) {
      hitConfig && (hitConfig.scale = 1)
      debugTextureProgram.uniforms.uMap.value = textures[debugTarget]
      gl.render(debugScene, camera)
      resetGl()
      return
    }

    hitConfig && (hitConfig.scale = columns)

    for (let i = 0; i < numTextures; i++) {
      const col = i % columns
      const row = rows - Math.floor(i / columns) - 1

      const w = width / columns
      const h = height / rows
      const x = col * w
      const y = row * h

      // console.log(w, h, x, y)

      gl.setViewport(x, y, w, h)
      // gl.setScissor(x, y, w, h)

      debugTextureProgram.uniforms.uMap.value =
        textures[Object.keys(textures)[i]]

      gl.render(debugScene, camera)
    }

    // reset

    gl.setViewport(
      DEFAULT_SCISSOR.x,
      DEFAULT_SCISSOR.y,
      DEFAULT_SCISSOR.width,
      DEFAULT_SCISSOR.height
    )

    gl.setScissor(
      DEFAULT_SCISSOR.x,
      DEFAULT_SCISSOR.y,
      DEFAULT_SCISSOR.width,
      DEFAULT_SCISSOR.height
    )
    resetGl()
  }, 1)

  return (
    <>
      {createPortal(
        <mesh>
          <planeGeometry args={[2, 2]} />
          <primitive object={debugTextureProgram} />
        </mesh>,
        debugScene
      )}
    </>
  )
}
