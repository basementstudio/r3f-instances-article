import { useMemo } from "react"
import * as THREE from "three"

export function useUniforms<T extends Record<string, THREE.IUniform>>(uniforms: T) {
  return useMemo<T>(() => uniforms, [])
}