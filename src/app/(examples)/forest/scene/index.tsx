import { createInstances, useGLTF } from "@react-three/drei"
import * as THREE from "three"
import { GLTF } from "three/examples/jsm/Addons.js"

interface TreeGltf extends GLTF {
  nodes: {
    tree_low001_StylizedTree_0: THREE.Mesh<
      THREE.BufferGeometry,
      THREE.MeshStandardMaterial
    >
  }
}

const getRandomPosition = () => {
  return [
    (Math.random() - 0.5) * 10000,
    0,
    (Math.random() - 0.5) * 10000
  ] as const
}

function getRandomScale() {
  return Math.random() * 0.7 + 0.5
}

const [TreeInstances, Tree] = createInstances()
const treeCount = 1000

export function Scene() {
  const { scene, nodes } = useGLTF(
    "/stylized_pine_tree_tree.glb"
  ) as unknown as TreeGltf

  return (
    <group>
      <TreeInstances
        limit={treeCount}
        scale={0.02}
        geometry={nodes.tree_low001_StylizedTree_0.geometry}
        material={nodes.tree_low001_StylizedTree_0.material}
      >
        {Array.from({ length: treeCount }).map((_, index) => (
          <Tree
            key={index}
            position={getRandomPosition()}
            scale={getRandomScale()}
            rotation-y={Math.random() * Math.PI * 2}
          />
        ))}
      </TreeInstances>
    </group>
  )
}
