import { useEffect, useRef, useMemo } from 'react'
import * as THREE from 'three'
import { generateSampleElevationData } from '../utils/sampleElevationData'

function GeorgiaElevation() {
  const meshRef = useRef()
  
  const geometry = useMemo(() => {
    const elevationData = generateSampleElevationData()
    const { data, width, height, minElevation, maxElevation } = elevationData
    
    // Create a plane geometry with the same dimensions as our data
    const geo = new THREE.PlaneGeometry(
      10, // width in world units
      10, // height in world units
      width - 1, // segments width
      height - 1 // segments height
    )
    
    // Update vertices based on elevation data
    const vertices = geo.attributes.position.array
    for (let i = 0; i < data.length; i++) {
      // Update Z coordinate (elevation)
      vertices[i * 3 + 2] = (data[i] - minElevation) / (maxElevation - minElevation)
    }
    
    // Update normals for proper lighting
    geo.computeVertexNormals()
    
    return geo
  }, [])

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = -Math.PI / 2
    }
  }, [])

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <primitive object={geometry} attach="geometry" />
      <meshPhongMaterial
        color="#4a8"
        shininess={0}
        flatShading={true}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export default GeorgiaElevation 