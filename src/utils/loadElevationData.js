import { fromArrayBuffer } from 'geotiff';

const RESOLUTION_LEVELS = {
  PREVIEW: 400,    // Very low res for initial load
  LOW: 200,        // Low res for distant viewing
  MEDIUM: 100,     // Medium res for medium distance
  HIGH: 50         // High res for close-up viewing
};

export const loadElevationData = async (tiffUrl, resolution = RESOLUTION_LEVELS.PREVIEW) => {
  try {
    const response = await fetch(tiffUrl);
    const arrayBuffer = await response.arrayBuffer();
    const tiff = await fromArrayBuffer(arrayBuffer);
    const image = await tiff.getImage();
    const data = await image.readRasters();
    
    const width = image.getWidth();
    const height = image.getHeight();
    const elevationData = data[0];
    
    const samplingRate = Math.max(
      Math.floor(Math.max(width, height) / resolution),
      1
    );
    
    const sampledWidth = Math.floor(width / samplingRate);
    const sampledHeight = Math.floor(height / samplingRate);
    const sampledData = new Float32Array(sampledWidth * sampledHeight);
    
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
      originalHeight: height,
      resolution
    };
  } catch (error) {
    console.error('Error loading elevation data:', error);
    throw error;
  }
};

// Cache for storing different resolution levels
const dataCache = new Map();

export const getElevationData = async (tiffUrl, resolution) => {
  const cacheKey = `${tiffUrl}-${resolution}`;
  
  if (dataCache.has(cacheKey)) {
    return dataCache.get(cacheKey);
  }
  
  const data = await loadElevationData(tiffUrl, resolution);
  dataCache.set(cacheKey, data);
  return data;
};

export const LEVELS = RESOLUTION_LEVELS; 