import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useThree, useFrame } from '@react-three/fiber'
import { getElevationData, LEVELS } from '../utils/loadElevationData'
import PropTypes from 'prop-types'

function GeorgiaElevation({ onLoadingChange }) {
  const meshRef = useRef(null)
  const geometryCacheRef = useRef({})
  const dataCacheRef = useRef({})

  // We'll keep a local piece of state for current resolution
  const [currentResolution, setCurrentResolution] = useState(LEVELS.PREVIEW)
  const [activeGeometry, setActiveGeometry] = useState(null)

  const { camera } = useThree()

  // We'll store resolution last loaded, so we can do hysteresis
  // and avoid toggling back and forth.
  const [lastDistance, setLastDistance] = useState(0)

  // Throttle variables
  const throttleRef = useRef(0)
  const throttleDelay = 0.5 // half-second

  const buildGeometry = (elevationData) => {
    // same as your existing approach
    const { data, width, height, minElevation, maxElevation } = elevationData
    const planeWidth = 10
    const planeHeight = 10 * (height / width)

    const geometry = new THREE.PlaneGeometry(
      planeWidth,
      planeHeight,
      width - 1,
      height - 1
    )
    const vertices = geometry.attributes.position.array
    const colors = new Float32Array(vertices.length)
    const colorAttribute = new THREE.BufferAttribute(colors, 3)

    const range = maxElevation - minElevation
    for (let i = 0; i < data.length; i++) {
      const elevation = data[i]
      const normalized = (elevation - minElevation) / range
      vertices[i*3 + 2] = normalized * 2

      // color stops (same as previous example)
      const color = new THREE.Color()
      if (normalized < 0.05) {
        color.setHSL(0.55, 0.8, 0.4)
      } else if (normalized < 0.15) {
        color.setHSL(0.33, 0.8, 0.3)
      } else if (normalized < 0.35) {
        color.setHSL(0.33, 0.8, 0.4)
      } else if (normalized < 0.5) {
        color.setHSL(0.33, 0.7, 0.5)
      } else if (normalized < 0.65) {
        color.setHSL(0.16, 0.6, 0.45)
      } else if (normalized < 0.75) {
        color.setHSL(0.08, 0.6, 0.50)
      } else if (normalized < 0.85) {
        color.setHSL(0.08, 0.6, 0.62)
      } else if (normalized < 0.95) {
        color.setHSL(0.08, 0.5, 0.75)
      } else {
        color.setHSL(0, 0, 0.9)
      }

      colors[i*3] = color.r
      colors[i*3+1] = color.g
      colors[i*3+2] = color.b
    }

    geometry.setAttribute('color', colorAttribute)
    geometry.computeVertexNormals()
    return geometry
  }

  const loadResolution = async (resolution) => {
    onLoadingChange(true)
    try {
      if (!dataCacheRef.current[resolution]) {
        console.log('Loading elevation data for resolution:', resolution)
        const elevationData = await getElevationData(
          '/USGS_13_n34w085_20230215.tif',
          resolution
        )
        dataCacheRef.current[resolution] = elevationData
      }
      if (!geometryCacheRef.current[resolution]) {
        const geometry = buildGeometry(dataCacheRef.current[resolution])
        geometryCacheRef.current[resolution] = geometry
      }
      onLoadingChange(false)
      return geometryCacheRef.current[resolution]
    } catch (err) {
      console.error('Error loading resolution:', resolution, err)
      onLoadingChange(false)
      return null
    }
  }

  useEffect(() => {
    // Load the initial preview
    loadResolution(LEVELS.PREVIEW).then(geometry => {
      if (geometry) {
        setActiveGeometry(geometry)
        setCurrentResolution(LEVELS.PREVIEW)
      }
    })
  }, []) // once on mount

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = -Math.PI / 2
    }
  }, [])

  // We'll define threshold ranges
  // We'll interpret them such that:
  // - distance < 5 => HIGH
  // - distance < 10 => MEDIUM
  // - distance < 20 => LOW
  // - else => PREVIEW
  //
  // But we'll add some hysteresis. For instance, to drop from MEDIUM to LOW, 
  // maybe we need distance > 12, not just 10, so that if we hover around 10-11, 
  // it doesn't keep toggling.

  function decideResolution(distance) {
    if (distance < 5) return LEVELS.LOW
    if (distance < 10) return LEVELS.MEDIUM
    if (distance < 20) return LEVELS.HIGH
    return LEVELS.PREVIEW
  }

  useFrame((_, delta) => {
    throttleRef.current += delta
    if (throttleRef.current < throttleDelay) return
    throttleRef.current = 0

    if (!meshRef.current) return

    // 1) measure actual 3D distance from [0,0,0]
    const distance = camera.position.length()
    setLastDistance(distance)

    // 2) figure out what resolution we want
    const target = decideResolution(distance)

    // Add logging for debugging
    console.log(`Camera distance: ${distance.toFixed(2)}, Current resolution: ${currentResolution}, Target resolution: ${target}`)

    // 3) if it's different from current, let's load it
    if (target !== currentResolution) {
      console.log(`Switching resolution from ${currentResolution} to ${target}`)
      setCurrentResolution(target)
      loadResolution(target).then(geometry => {
        if (geometry) {
          console.log(`Successfully loaded geometry for resolution: ${target}`)
          setActiveGeometry(geometry)
        } else {
          console.log(`Failed to load geometry for resolution: ${target}`)
        }
      })
    }
  })

  if (!activeGeometry) return null

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <primitive object={activeGeometry} attach="geometry" />
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
  onLoadingChange: PropTypes.func.isRequired,
}

export default GeorgiaElevation