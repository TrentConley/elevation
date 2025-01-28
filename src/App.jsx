import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense, useState } from 'react'
import './App.css'
import GeorgiaElevation from './components/GeorgiaElevation'

function LoadingMessage() {
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      color: 'white',
      background: 'rgba(0,0,0,0.7)',
      padding: '20px',
      borderRadius: '10px',
      fontFamily: 'monospace'
    }}>
      Loading elevation data...
    </div>
  )
}

function App() {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        // Start camera a bit higher to ensure we begin at lower resolution
        camera={{ position: [0, 15, 15], fov: 50 }}
        style={{ background: '#111' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <directionalLight position={[-5, 3, -5]} intensity={0.3} />
          <GeorgiaElevation onLoadingChange={setIsLoading} />
          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true}
            minDistance={3}
            maxDistance={30}
          />
        </Suspense>
      </Canvas>
      {isLoading && <LoadingMessage />}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        color: 'white',
        fontFamily: 'monospace',
        fontSize: '12px',
        background: 'rgba(0,0,0,0.7)',
        padding: '10px',
        borderRadius: '5px'
      }}>
        <div style={{ marginBottom: '5px' }}><strong>Color Legend</strong></div>
        <div>Blueish/Greenish: Very low/wet</div>
        <div>Green: Low to mid elevation</div>
        <div>Brownish: Higher elevations</div>
        <div>White-ish: Highest peaks</div>
      </div>
    </div>
  )
}

export default App