import { Component, Suspense } from 'react'
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
import TVStand from './scene/TVStand'
import CustomBuild from './scene/CustomBuild'
import DimensionLabels from './scene/DimensionLabels'
import CameraController from './scene/CameraController'
import ScreenshotTrigger from './scene/ScreenshotTrigger'
import ExportTrigger from './scene/ExportTrigger'
import ViewportToolbar from './ViewportToolbar'
import ExplodePanel from './ExplodePanel'
import AssemblyPanel from './AssemblyPanel'
import BuilderHint from './BuilderHint'

// Keeps an HDR/CDN load failure from crashing the whole 3D scene —
// the explicit light rig already lights the model, so we just drop the IBL.
class EnvBoundary extends Component {
  constructor(props) { super(props); this.state = { failed: false } }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? null : this.props.children }
}

function FurnitureModel() {
  const furnitureType = useStore((s) => s.furnitureType)
  if (furnitureType === 'desk')      return <DeskUnit />
  if (furnitureType === 'cabinet')   return <CabinetUnit />
  if (furnitureType === 'table')     return <DiningTable />
  if (furnitureType === 'tvstand')   return <TVStand />
  if (furnitureType === 'bed')       return <BedFrame />
  if (furnitureType === 'wallshelf') return <FloatingShelf />
  if (furnitureType === 'custom')    return <CustomBuild />
  return <ShelfUnit />
}

function Scene() {
  const { showGrid, showDimensions, showShadows } = useStore()

  return (
    <>
      <CameraController />
      <ScreenshotTrigger />
      <ExportTrigger />

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

      <EnvBoundary>
        <Suspense fallback={null}>
          <Environment preset="studio" background={false} />
        </Suspense>
      </EnvBoundary>

      <FurnitureModel />

      {showDimensions && <DimensionLabels />}

      {showShadows && (
        <ContactShadows position={[0, -0.5, 0]} opacity={0.45} scale={200} blur={3} far={60} />
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
        minPolarAngle={0.02} maxPolarAngle={Math.PI - 0.04}
        enableDamping dampingFactor={0.07}
        rotateSpeed={0.55} panSpeed={0.8} zoomSpeed={0.75}
      />
    </>
  )
}

class CanvasErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { err: null } }
  static getDerivedStateFromError(err) { return { err } }
  render() {
    if (this.state.err) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center bg-studio-bg gap-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-10 h-10 text-gray-700">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-xs text-gray-600 text-center max-w-48">3D view failed to load.<br />Check network & WebGL support.</p>
          <button onClick={() => this.setState({ err: null })} className="text-xs text-amber-500 hover:text-amber-400 border border-amber-500/30 px-3 py-1 rounded-lg transition-colors">
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function Viewport() {
  const showShadows = useStore((s) => s.showShadows)
  const assemblyStep = useStore((s) => s.assemblyStep)
  const furnitureType = useStore((s) => s.furnitureType)
  const selectPart = useStore((s) => s.selectPart)
  const isCustom = furnitureType === 'custom'

  return (
    <div className="flex-1 relative bg-studio-bg overflow-hidden">
      <ViewportToolbar />

      {isCustom ? <BuilderHint /> : assemblyStep < 0 ? <ExplodePanel /> : <AssemblyPanel />}

      <CanvasErrorBoundary>
      <Canvas
        shadows={showShadows}
        camera={{ position: [120, 90, 120], fov: 45, near: 0.5, far: 3000 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false, stencil: false, depth: true,
          preserveDrawingBuffer: true,
        }}
        dpr={[1, Math.min(window.devicePixelRatio, 2)]}
        performance={{ min: 0.5 }}
        className="w-full h-full"
        onPointerMissed={() => { if (isCustom) selectPart(null) }}
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
      </CanvasErrorBoundary>
    </div>
  )
}
