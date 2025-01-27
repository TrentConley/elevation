import { useEffect, useRef, useMemo, useState } from 'react'
import * as THREE from 'three'
import { loadElevationData } from '../utils/loadElevationData'
import PropTypes from 'prop-types'

function GeorgiaElevation({ onLoadingChange }) {
  const meshRef = useRef()
  const [elevationData, setElevationData] = useState(null)

  useEffect(() => {
    onLoadingChange(true)
    loadElevationData('/USGS_13_n34w085_20230215.tif')
      .then(data => {
        setElevationData(data)
        onLoadingChange(false)
      })
      .catch(error => {
        console.error('Failed to load elevation data:', error)
        onLoadingChange(false)
      })
  }, [onLoadingChange])

  const geometry = useMemo(() => {
    if (!elevationData) return null

    const { data, width, height, minElevation, maxElevation } = elevationData
    
    const geo = new THREE.PlaneGeometry(
      10,
      10 * (height / width),
      width - 1,
      height - 1
    )
    
    const vertices = geo.attributes.position.array
    const colors = new Float32Array(vertices.length)
    const colorAttribute = new THREE.BufferAttribute(colors, 3)
    
    // Process vertices in chunks for better performance
    const chunkSize = 1000
    for (let i = 0; i < data.length; i += chunkSize) {
      const end = Math.min(i + chunkSize, data.length)
      for (let j = i; j < end; j++) {
        const elevation = data[j]
        const normalizedElevation = (elevation - minElevation) / (maxElevation - minElevation)
        vertices[j * 3 + 2] = normalizedElevation * 2

        const color = new THREE.Color()
        if (normalizedElevation < 0.2) {
          color.setHSL(0.33, 0.8, 0.3)
        } else if (normalizedElevation < 0.4) {
          color.setHSL(0.33, 0.8, 0.4)
        } else if (normalizedElevation < 0.6) {
          color.setHSL(0.33, 0.7, 0.5)
        } else if (normalizedElevation < 0.8) {
          color.setHSL(0.08, 0.6, 0.5)
        } else {
          color.setHSL(0.08, 0.5, 0.7)
        }

        colors[j * 3] = color.r
        colors[j * 3 + 1] = color.g
        colors[j * 3 + 2] = color.b
      }
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

  if (!geometry) {
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

GeorgiaElevation.propTypes = {
  onLoadingChange: PropTypes.func.isRequired
}

export default GeorgiaElevation 