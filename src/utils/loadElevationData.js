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
    
    // Find min and max elevation
    const minElevation = Math.min(...elevationData);
    const maxElevation = Math.max(...elevationData);
    
    // Sample the data to reduce size (take every nth point)
    const samplingRate = Math.floor(Math.max(width, height) / 200); // Limit to ~200 points in each dimension
    const sampledData = [];
    
    for (let y = 0; y < height; y += samplingRate) {
      for (let x = 0; x < width; x += samplingRate) {
        sampledData.push(elevationData[y * width + x]);
      }
    }
    
    const sampledWidth = Math.floor(width / samplingRate);
    const sampledHeight = Math.floor(height / samplingRate);
    
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