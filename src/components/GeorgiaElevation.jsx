import { useEffect, useRef, useMemo, useState } from 'react'
import * as THREE from 'three'
import { loadElevationData } from '../utils/loadElevationData'

function GeorgiaElevation() {
  const meshRef = useRef()
  const [elevationData, setElevationData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadElevationData('/USGS_13_n34w085_20230215.tif')
      .then(data => {
        setElevationData(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Failed to load elevation data:', error)
        setLoading(false)
      })
  }, [])

  const geometry = useMemo(() => {
    if (!elevationData) return null

    const { data, width, height, minElevation, maxElevation } = elevationData
    
    // Create a plane geometry with the same dimensions as our data
    const geo = new THREE.PlaneGeometry(
      10, // width in world units
      10 * (height / width), // maintain aspect ratio
      width - 1,
      height - 1
    )
    
    // Update vertices based on elevation data
    const vertices = geo.attributes.position.array
    const colors = new Float32Array(vertices.length)
    const colorAttribute = new THREE.BufferAttribute(colors, 3)
    
    for (let i = 0; i < data.length; i++) {
      // Update Z coordinate (elevation)
      const elevation = data[i]
      const normalizedElevation = (elevation - minElevation) / (maxElevation - minElevation)
      vertices[i * 3 + 2] = normalizedElevation * 2 // Scale the elevation

      // Create color gradient based on elevation
      const color = new THREE.Color()
      if (normalizedElevation < 0.2) {
        color.setHSL(0.33, 0.8, 0.3) // Dark green for low elevation
      } else if (normalizedElevation < 0.4) {
        color.setHSL(0.33, 0.8, 0.4) // Medium green
      } else if (normalizedElevation < 0.6) {
        color.setHSL(0.33, 0.7, 0.5) // Light green
      } else if (normalizedElevation < 0.8) {
        color.setHSL(0.08, 0.6, 0.5) // Brown
      } else {
        color.setHSL(0.08, 0.5, 0.7) // Light brown for peaks
      }

      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    
    geo.setAttribute('color', colorAttribute)
    geo.computeVertexNormals()
    
    return geo
  }, [elevationData])

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = -Math.PI / 2
    }
  }, [])

  if (loading || !geometry) {
    return null
  }

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial
        vertexColors={true}
        roughness={0.8}
        metalness={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export default GeorgiaElevation 