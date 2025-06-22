import * as THREE from "three"

const boxCount = 1000

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
    <>
      {Array.from({ length: boxCount }).map((_, index) => (
        <mesh
          key={index}
          position={getRandomPosition()}
          scale={getRandomScale()}
        >
          <boxGeometry />
          <meshBasicMaterial color={getRandomColor()} />
        </mesh>
      ))}
    </>
  )
}
