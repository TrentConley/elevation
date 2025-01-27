import { fromArrayBuffer } from 'geotiff';

export const loadElevationData = async (tiffUrl) => {
  try {
    const response = await fetch(tiffUrl);
    const arrayBuffer = await response.arrayBuffer();
    const tiff = await fromArrayBuffer(arrayBuffer);
    const image = await tiff.getImage();
    const data = await image.readRasters();
    
    const width = image.getWidth();
    const height = image.getHeight();
    const elevationData = data[0]; // Get the first band
    
    // Increase sampling rate significantly for better performance
    // Target around 100x100 points for smooth performance
    const targetSize = 100;
    const samplingRate = Math.max(
      Math.floor(Math.max(width, height) / targetSize),
      10 // Ensure we take at least every 10th point
    );
    
    // Pre-calculate array size for better memory management
    const sampledWidth = Math.floor(width / samplingRate);
    const sampledHeight = Math.floor(height / samplingRate);
    const sampledData = new Float32Array(sampledWidth * sampledHeight);
    
    // Track min/max while sampling to avoid extra array iterations
    let minElevation = Infinity;
    let maxElevation = -Infinity;
    
    let index = 0;
    for (let y = 0; y < height; y += samplingRate) {
      for (let x = 0; x < width; x += samplingRate) {
        const elevation = elevationData[y * width + x];
        sampledData[index++] = elevation;
        
        minElevation = Math.min(minElevation, elevation);
        maxElevation = Math.max(maxElevation, elevation);
      }
    }
    
    return {
      data: sampledData,
      width: sampledWidth,
      height: sampledHeight,
      minElevation,
      maxElevation,
      originalWidth: width,
      originalHeight: height
    };
  } catch (error) {
    console.error('Error loading elevation data:', error);
    throw error;
  }
}; 