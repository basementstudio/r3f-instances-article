import { createInstances, InstancedAttribute } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

const sphereCount = 1000

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
    attribute mat4 instanceMatrix;

    uniform float uTime;
    uniform float uAmplitude;
    attribute float timeShift;

    vec3 movement(vec3 position) {
      vec3 pos = position;
      pos.x += sin(position.y + uTime + timeShift) * uAmplitude;
      return pos;
    }

    void main() {
      vec3 blobShift = movement(position);
      vec4 modelPosition = instanceMatrix * modelMatrix * vec4(blobShift, 1.0);
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

const getRandomPosition = () => {
  return [
    (Math.random() - 0.5) * 50,
    (Math.random() - 0.5) * 50,
    (Math.random() - 0.5) * 50
  ] as const
}

// Tell typescript about our custom attribute
const [BlobInstances, Blob] = createInstances<{ timeShift: number }>()

export function Scene() {
  useFrame((state) => {
    baseMaterial.uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <BlobInstances material={baseMaterial} limit={sphereCount}>
      {/* Declare an instanced attribute with a default value */}
      <InstancedAttribute name="timeShift" defaultValue={0} />
      <sphereGeometry args={[1, 32, 32]} />
      {Array.from({ length: sphereCount }).map((_, index) => (
        <Blob
          key={index}
          position={getRandomPosition()}
          // Set the instanced attribute value for this instance
          timeShift={Math.random() * 10}
        />
      ))}
    </BlobInstances>
  )
}
