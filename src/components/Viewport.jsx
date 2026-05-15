import { useRef, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  OrbitControls,
  Grid,
  Environment,
  ContactShadows,
  GizmoHelper,
  GizmoViewport,
  Stats,
} from '@react-three/drei'
import { useStore } from '../store/useStore'
import ShelfUnit from './scene/ShelfUnit'
import DimensionLabels from './scene/DimensionLabels'
import ViewportToolbar from './ViewportToolbar'

function Scene() {
  const { showGrid, showDimensions, showShadows, renderMode } = useStore()

  return (
    <>
      {/* Lighting rig */}
      <ambientLight intensity={0.4} color="#fff8f0" />
      <directionalLight
        position={[8, 12, 6]}
        intensity={1.8}
        color="#fff5e0"
        castShadow={showShadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={80}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.001}
      />
      <directionalLight position={[-4, 6, -4]} intensity={0.4} color="#e0f0ff" />
      <pointLight position={[0, 8, 4]} intensity={0.6} color="#fff8f0" distance={40} />

      {/* Environment for reflections */}
      <Environment preset="studio" background={false} />

      {/* Main model */}
      <ShelfUnit wireframe={renderMode === 'wireframe'} xray={renderMode === 'xray'} />

      {/* Dimension annotations */}
      {showDimensions && <DimensionLabels />}

      {/* Ground */}
      {showShadows && (
        <ContactShadows
          position={[0, -0.01, 0]}
          opacity={0.5}
          scale={60}
          blur={2.5}
          far={20}
          color="#000000"
        />
      )}

      {/* Grid */}
      {showGrid && (
        <Grid
          args={[100, 100]}
          position={[0, -0.01, 0]}
          cellSize={5}
          cellThickness={0.5}
          cellColor="#2a2a2a"
          sectionSize={20}
          sectionThickness={1}
          sectionColor="#3a3a3a"
          fadeDistance={80}
          fadeStrength={1}
          infiniteGrid
        />
      )}

      {/* Controls */}
      <OrbitControls
        makeDefault
        minDistance={20}
        maxDistance={300}
        minPolarAngle={0.1}
        maxPolarAngle={Math.PI / 2 - 0.05}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        panSpeed={0.8}
        zoomSpeed={0.8}
      />
    </>
  )
}

export default function Viewport() {
  const showShadows = useStore((s) => s.showShadows)

  return (
    <div className="flex-1 relative bg-studio-bg overflow-hidden">
      {/* Toolbar overlay */}
      <ViewportToolbar />

      <Canvas
        shadows={showShadows}
        camera={{
          position: [120, 90, 120],
          fov: 45,
          near: 0.1,
          far: 2000,
        }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
        }}
        dpr={[1, Math.min(window.devicePixelRatio, 2)]}
        performance={{ min: 0.5 }}
        className="w-full h-full"
      >
        <color attach="background" args={['#0f0f0f']} />
        <fog attach="fog" args={['#0f0f0f', 200, 600]} />
        <Scene />

        {/* 3D Gizmo */}
        <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
          <GizmoViewport
            axisColors={['#ef4444', '#22c55e', '#3b82f6']}
            labelColor="#ffffff"
          />
        </GizmoHelper>

        {/* Performance monitor (dev only) */}
        {import.meta.env.DEV && <Stats className="!left-auto !right-0 !top-auto !bottom-0" />}
      </Canvas>
    </div>
  )
}
