// Function to calculate distance between two coordinates using Haversine formula
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

export function calculateSpeedKmH(currentIndex, routeData) {
  if (currentIndex === 0 || routeData.length <= 1) return '0.00';

  const currPoint = routeData[currentIndex];
  const prevPoint = routeData[currentIndex - 1];

  if (!prevPoint || !currPoint) return '0.00';

  const distanceKm = calculateDistanceKm(
    prevPoint.lat, prevPoint.lng,
    currPoint.lat, currPoint.lng
  );

  const timeDeltaMs = new Date(currPoint.timestamp).getTime() - new Date(prevPoint.timestamp).getTime();
  const timeDeltaHours = timeDeltaMs / (1000 * 60 * 60); // Convert ms to hours

  if (timeDeltaHours <= 0) return '0.00';

  const speed = distanceKm / timeDeltaHours; // Speed in km/h
  return speed.toFixed(2);
}

export function calculateTotalDistance(routeData) {
  if (routeData.length <= 1) return 0;
  
  let totalDistance = 0;
  for (let i = 1; i < routeData.length; i++) {
    totalDistance += calculateDistanceKm(
      routeData[i - 1].lat, routeData[i - 1].lng,
      routeData[i].lat, routeData[i].lng
    );
  }
  
  return totalDistance.toFixed(2);
}