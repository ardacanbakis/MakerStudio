import { Canvas } from '@react-three/fiber'
import {
  OrbitControls, Grid, Environment, ContactShadows,
  GizmoHelper, GizmoViewport, Stats,
} from '@react-three/drei'
import { useStore } from '../store/useStore'
import ShelfUnit from './scene/ShelfUnit'
import DeskUnit from './scene/DeskUnit'
import CabinetUnit from './scene/CabinetUnit'
import DiningTable from './scene/DiningTable'
import BedFrame from './scene/BedFrame'
import FloatingShelf from './scene/FloatingShelf'
import DimensionLabels from './scene/DimensionLabels'
import CameraController from './scene/CameraController'
import ScreenshotTrigger from './scene/ScreenshotTrigger'
import ExportTrigger from './scene/ExportTrigger'
import ViewportToolbar from './ViewportToolbar'
import ExplodePanel from './ExplodePanel'

function FurnitureModel() {
  const furnitureType = useStore((s) => s.furnitureType)
  if (furnitureType === 'desk')      return <DeskUnit />
  if (furnitureType === 'cabinet')   return <CabinetUnit />
  if (furnitureType === 'table')     return <DiningTable />
  if (furnitureType === 'bed')       return <BedFrame />
  if (furnitureType === 'wallshelf') return <FloatingShelf />
  return <ShelfUnit />
}

function Scene() {
  const { showGrid, showDimensions, showShadows } = useStore()

  return (
    <>
      <CameraController />
      <ScreenshotTrigger />
      <ExportTrigger />

      {/* Lighting rig */}
      <ambientLight intensity={0.45} color="#fff8f0" />
      <directionalLight
        position={[8, 12, 6]}
        intensity={2.0}
        color="#fff5e0"
        castShadow={showShadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={600}
        shadow-camera-left={-200}
        shadow-camera-right={200}
        shadow-camera-top={300}
        shadow-camera-bottom={-100}
        shadow-bias={-0.001}
      />
      <directionalLight position={[-4, 6, -4]} intensity={0.5} color="#ddeeff" />
      <pointLight position={[0, 8, 4]} intensity={0.8} color="#fff8f0" distance={600} />

      <Environment preset="studio" background={false} />

      <FurnitureModel />

      {showDimensions && <DimensionLabels />}

      {showShadows && (
        <ContactShadows
          position={[0, -0.5, 0]}
          opacity={0.45}
          scale={200}
          blur={3}
          far={60}
        />
      )}

      {showGrid && (
        <Grid
          args={[1000, 1000]}
          position={[0, -0.5, 0]}
          cellSize={10} cellThickness={0.4} cellColor="#1e1e1e"
          sectionSize={50} sectionThickness={0.7} sectionColor="#2d2d2d"
          fadeDistance={400} fadeStrength={1}
          infiniteGrid
        />
      )}

      <OrbitControls
        makeDefault
        minDistance={40} maxDistance={600}
        minPolarAngle={0.05} maxPolarAngle={Math.PI / 2 - 0.02}
        enableDamping dampingFactor={0.07}
        rotateSpeed={0.55} panSpeed={0.8} zoomSpeed={0.75}
      />
    </>
  )
}

export default function Viewport() {
  const showShadows = useStore((s) => s.showShadows)

  return (
    <div className="flex-1 relative bg-studio-bg overflow-hidden">
      <ViewportToolbar />
      <ExplodePanel />

      <Canvas
        shadows={showShadows}
        camera={{ position: [120, 90, 120], fov: 45, near: 0.5, far: 3000 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false, stencil: false, depth: true,
          preserveDrawingBuffer: true,  // required for toBlob screenshot
        }}
        dpr={[1, Math.min(window.devicePixelRatio, 2)]}
        performance={{ min: 0.5 }}
        className="w-full h-full"
      >
        <color attach="background" args={['#0f0f0f']} />
        <fog attach="fog" args={['#0f0f0f', 400, 1200]} />

        <Scene />

        <GizmoHelper alignment="bottom-right" margin={[64, 64]}>
          <GizmoViewport
            axisColors={['#ef4444', '#22c55e', '#3b82f6']}
            labelColor="#ffffff"
          />
        </GizmoHelper>

        {import.meta.env.DEV && <Stats />}
      </Canvas>
    </div>
  )
}
