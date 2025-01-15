import { useEffect, useRef } from 'react'
import * as THREE from 'three'

function GeorgiaElevation() {
  const meshRef = useRef()
  
  // This is a placeholder for the actual elevation data
  // We'll need to replace this with real DEM data
  const generatePlaceholderGeometry = () => {
    const geometry = new THREE.PlaneGeometry(10, 10, 100, 100)
    const vertices = geometry.attributes.position.array
    
    // Create some random elevation for demonstration
    for (let i = 0; i < vertices.length; i += 3) {
      vertices[i + 2] = Math.random() * 2
    }
    
    return geometry
  }

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = -Math.PI / 2
    }
  }, [])

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <primitive object={generatePlaceholderGeometry()} attach="geometry" />
      <meshStandardMaterial
        color="#396"
        wireframe={true}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export default GeorgiaElevation 