import { QiblaData, Location } from '../types';

// Kaaba coordinates
const KAABA_LAT = 21.4225;
const KAABA_LON = 39.8262;

export const qiblaService = {
  // Calculate Qibla direction and distance
  calculateQibla: (userLocation: Location): QiblaData => {
    try {
      const { latitude, longitude } = userLocation;
      
      // Calculate bearing to Kaaba
      const bearing = calculateBearing(latitude, longitude, KAABA_LAT, KAABA_LON);
      
      // Calculate distance to Kaaba
      const distance = calculateDistance(latitude, longitude, KAABA_LAT, KAABA_LON);
      
      return {
        direction: bearing,
        distance: distance,
        latitude: KAABA_LAT,
        longitude: KAABA_LON,
      };
    } catch (error) {
      console.error('Error calculating Qibla:', error);
      return {
        direction: 0,
        distance: 0,
        latitude: KAABA_LAT,
        longitude: KAABA_LON,
      };
    }
  },

  // Get Qibla direction as compass direction
  getCompassDirection: (bearing: number): string => {
    const directions = [
      'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
    ];
    
    const index = Math.round(bearing / 22.5) % 16;
    return directions[index];
  },

  // Get Qibla direction in degrees
  getDirectionDegrees: (bearing: number): number => {
    return Math.round(bearing);
  },

  // Format distance
  formatDistance: (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    } else if (distance < 100) {
      return `${distance.toFixed(1)}km`;
    } else {
      return `${Math.round(distance)}km`;
    }
  },

  // Get Qibla status message
  getQiblaStatus: (qiblaData: QiblaData): string => {
    const direction = qiblaService.getCompassDirection(qiblaData.direction);
    const distance = qiblaService.formatDistance(qiblaData.distance);
    
    return `Qibla: ${direction} (${qiblaData.direction.toFixed(0)}°) - ${distance} to Kaaba`;
  },

  // Check if user is facing Qibla (within 5 degrees)
  isFacingQibla: (userBearing: number, qiblaBearing: number, tolerance: number = 5): boolean => {
    const diff = Math.abs(userBearing - qiblaBearing);
    return diff <= tolerance || diff >= (360 - tolerance);
  },

  // Get Qibla accuracy percentage
  getQiblaAccuracy: (userBearing: number, qiblaBearing: number): number => {
    const diff = Math.abs(userBearing - qiblaBearing);
    const accuracy = Math.max(0, 100 - (diff * 100 / 180));
    return Math.round(accuracy);
  },
};

// Helper function to calculate bearing between two points
function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;
  
  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
  
  let bearing = Math.atan2(y, x) * 180 / Math.PI;
  bearing = (bearing + 360) % 360;
  
  return bearing;
}

// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}
