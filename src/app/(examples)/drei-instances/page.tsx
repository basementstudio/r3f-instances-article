"use client"

import { Canvas } from "@react-three/fiber"
import { Scene } from "./scene"
import { eventManagerFactory } from "./scene/event-manager"
import { Perf } from "r3f-perf"
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"

export default function Home() {
  return (
    <div className="grow relative w-full h-full">
      <Canvas
        events={eventManagerFactory}
        dpr={[1, 1.5]}
        className="!absolute top-0 left-0 !w-full !h-full"
      >
        <Scene />
        <PerspectiveCamera makeDefault position={[0, 0, 20]} />
        <OrbitControls />
        <Perf />
      </Canvas>
    </div>
  )
}
