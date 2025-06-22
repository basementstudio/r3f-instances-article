import { createInstances, Instance, Instances } from "@react-three/drei"
import * as THREE from "three"

const boxCount = 1000
const sphereCount = 1000

const [CubeInstances, Cube] = createInstances()
const [SphereInstances, Sphere] = createInstances()

function InstancesProvider({ children }: { children: React.ReactNode }) {
  return (
    <CubeInstances limit={boxCount}>
      <boxGeometry />
      <meshBasicMaterial />
      <SphereInstances limit={sphereCount}>
        <sphereGeometry />
        <meshBasicMaterial />
        {children}
      </SphereInstances>
    </CubeInstances>
  )
}

const getRandomPosition = () => {
  return [
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10
  ] as const
}

const getRandomColor = () => {
  return new THREE.Color(Math.random(), Math.random(), Math.random())
}

const getRandomScale = () =>
  new THREE.Vector3(0.4, 0.4, 0.4).multiplyScalar(Math.random() + 0.1)

export function Scene() {
  return (
    <InstancesProvider>
      {Array.from({ length: boxCount }).map((_, index) => (
        <Cube
          key={index}
          position={getRandomPosition()}
          color={getRandomColor()}
          scale={getRandomScale()}
        />
      ))}

      {Array.from({ length: sphereCount }).map((_, index) => (
        <Sphere
          key={index}
          position={getRandomPosition()}
          color={getRandomColor()}
          scale={getRandomScale()}
        />
      ))}
    </InstancesProvider>
  )
}
