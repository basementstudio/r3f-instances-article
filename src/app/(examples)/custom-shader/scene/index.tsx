import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

const baseMaterial = new THREE.RawShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uAmplitude: { value: 1 }
  },
  vertexShader: /*glsl*/ `
    attribute vec3 position;
    attribute vec3 instanceColor;
    attribute vec3 normal;
    attribute vec2 uv;
    uniform mat4 modelMatrix;
    uniform mat4 viewMatrix;
    uniform mat4 projectionMatrix;

    uniform float uTime;
    uniform float uAmplitude;

    vec3 movement(vec3 position) {
      vec3 pos = position;
      pos.x += sin(position.y + uTime) * uAmplitude;
      return pos;
    }

    void main() {
      vec3 blobShift = movement(position);
      vec4 modelPosition = modelMatrix * vec4(blobShift, 1.0);
      vec4 viewPosition = viewMatrix * modelPosition;
      vec4 projectionPosition = projectionMatrix * viewPosition;
      gl_Position = projectionPosition;
    }
  `,
  fragmentShader: /*glsl*/ `
    void main() {
      gl_FragColor = vec4(1, 0, 0, 1);
    }
  `
})

export function Scene() {
  useFrame((state) => {
    baseMaterial.uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <mesh material={baseMaterial}>
      <sphereGeometry args={[1, 32, 32]} />
    </mesh>
  )
}
