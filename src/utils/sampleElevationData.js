// Sample elevation data representing a 50x50 grid of elevation points
// This simulates a small region with hills and valleys

export const generateSampleElevationData = () => {
  const gridSize = 50;
  const data = new Float32Array(gridSize * gridSize);
  
  // Generate some realistic-looking terrain using multiple sine waves
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const x = i / gridSize;
      const y = j / gridSize;
      
      // Base elevation (meters)
      let elevation = 100;
      
      // Add some hills
      elevation += Math.sin(x * 5) * Math.cos(y * 5) * 50;
      elevation += Math.sin(x * 10 + y * 10) * 25;
      
      // Add some noise for texture
      elevation += Math.random() * 10;
      
      data[i * gridSize + j] = elevation;
    }
  }
  
  return {
    data,
    width: gridSize,
    height: gridSize,
    minElevation: Math.min(...data),
    maxElevation: Math.max(...data)
  };
}; 