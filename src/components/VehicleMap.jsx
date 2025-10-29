import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Calendar, Play, Pause, RotateCcw, MapPin, Navigation, Zap } from 'lucide-react';
import { calculateSpeedKmH } from '../utils/calculations';
import MetadataPanel from './MetadataPanel';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const INITIAL_CENTER = [17.385044, 78.486671];

// Custom icons
const humanIcon = L.divIcon({
  className: 'custom-div-icon',
  html: '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; padding: 8px; box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4); border: 3px solid white; transform: scale(1.1);"><span style="font-size: 24px;">🧍‍♂️</span></div>',
  iconSize: [48, 48],
  iconAnchor: [24, 48],
});

const vehicleIcon = L.divIcon({
  className: 'custom-div-icon',
  html: '<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 50%; padding: 10px; box-shadow: 0 12px 40px rgba(240, 147, 251, 0.5); border: 4px solid white; animation: pulse 2s infinite;"><span style="font-size: 28px;">🚗</span></div>',
  iconSize: [56, 56],
  iconAnchor: [28, 28],
});

function MapClickHandler({ onMapClick, disabled }) {
  useMapEvents({
    click: (e) => {
      if (!disabled) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
}

function VehicleMap() {
  const [routeData, setRouteData] = useState([]);
  const [startLocation, setStartLocation] = useState(null);
  const [selectedDate, setSelectedDate] = useState('2024-07-20');
  const [showRoute, setShowRoute] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // Load route data
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/dummy-route.json');
        const data = await response.json();
        setRouteData(data.map(p => ({
          lat: p.latitude,
          lng: p.longitude,
          timestamp: p.timestamp
        })));
      } catch (error) {
        console.error("Error loading route data:", error);
      }
    };
    loadData();
  }, []);

  // Vehicle movement simulation
  useEffect(() => {
    if (isPlaying && routeData.length > 0 && currentIndex < routeData.length - 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prevIndex => {
          const newIndex = prevIndex + 1;
          if (newIndex >= routeData.length - 1) {
            setIsPlaying(false);
          }
          return newIndex;
        });
      }, 2000); // Move every 2 seconds
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, currentIndex, routeData]);

  // Elapsed time tracking
  useEffect(() => {
    let timeInterval;
    if (isPlaying) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }
      timeInterval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    }
    return () => clearInterval(timeInterval);
  }, [isPlaying]);

  const handleMapClick = (latlng) => {
    setStartLocation(latlng);
    setShowRoute(false);
    resetSimulation();
  };

  const handleShowRoute = () => {
    setShowRoute(true);
    setCurrentIndex(0);
  };

  const togglePlay = () => {
    if (!isPlaying) {
      startTimeRef.current = Date.now() - (elapsedTime * 1000);
    }
    setIsPlaying(!isPlaying);
  };

  const resetSimulation = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    setElapsedTime(0);
    startTimeRef.current = null;
  };

  const currentPosition = routeData[currentIndex] || (routeData.length > 0 ? routeData[0] : null);
  const fullRouteCoords = routeData.map(p => [p.lat, p.lng]);
  const traveledRoute = routeData.slice(0, currentIndex + 1).map(p => [p.lat, p.lng]);

  const generateDates = () => {
    const dates = [];
    const baseDate = new Date('2024-07-20');
    for (let i = 0; i < 7; i++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  return (
    <div className="h-screen w-full relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <MapContainer
        center={INITIAL_CENTER}
        zoom={15}
        scrollWheelZoom={true}
        className="h-full w-full z-10 rounded-none"
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler 
          onMapClick={handleMapClick} 
          disabled={showRoute} 
        />

        {/* Human marker with popup */}
        {startLocation && !showRoute && (
          <Marker position={[startLocation.lat, startLocation.lng]} icon={humanIcon}>
            <Popup closeOnClick={false} autoClose={false} className="custom-popup" maxWidth={320}>
              <div className="p-8 min-w-[280px] bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl border-0">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Navigation className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Plan Your Journey</h3>
                  <p className="text-gray-600 text-sm">Select a date and start your adventure</p>
                </div>
                
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    Choose Travel Date
                  </label>
                  <select 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg font-medium bg-white shadow-sm hover:shadow-md"
                  >
                    {generateDates().map(date => (
                      <option key={date} value={date} className="py-2">
                        {new Date(date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleShowRoute}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 text-lg"
                >
                  <Zap className="w-6 h-6" />
                  Show Route
                </button>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route visualization */}
        {showRoute && routeData.length > 0 && (
          <>
            {/* Full route path */}
            <Polyline
              pathOptions={{ 
                color: '#E2E8F0', 
                weight: 6, 
                opacity: 0.8,
                dashArray: '15, 15'
              }}
              positions={fullRouteCoords}
            />
            
            {/* Traveled route */}
            <Polyline
              pathOptions={{ 
                color: '#F59E0B', 
                weight: 8, 
                opacity: 1,
                lineCap: 'round',
                lineJoin: 'round'
              }}
              positions={traveledRoute}
            />

            {/* Vehicle marker */}
            {currentPosition && (
              <Marker
                position={[currentPosition.lat, currentPosition.lng]}
                icon={vehicleIcon}
              />
            )}
          </>
        )}
      </MapContainer>

      {/* Control Panel */}
      {showRoute && (
        <div className="absolute top-8 right-8 z-[1000] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-96 border border-white/20">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Play className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Mission Control</h2>
            <p className="text-gray-600 text-sm">Control your vehicle's journey</p>
          </div>
          
          <div className="flex gap-4 mb-8">
            <button
              onClick={togglePlay}
              className={`flex-1 px-6 py-4 text-white font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 text-lg ${
                isPlaying 
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
              }`}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              {isPlaying ? 'Pause' : 'Start'}
            </button>
            
            <button
              onClick={resetSimulation}
              className="px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 text-lg"
            >
              <RotateCcw className="w-6 h-6" />
              Reset
            </button>
          </div>

          <MetadataPanel 
            currentPosition={currentPosition}
            currentIndex={currentIndex}
            routeData={routeData}
            elapsedTime={elapsedTime}
          />
        </div>
      )}

      {/* Instructions overlay */}
      {!startLocation && (
        <div className="absolute top-8 left-8 z-[1000] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md border border-white/20">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <MapPin className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Welcome Explorer!</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Click anywhere on the map to set your starting location and begin planning your epic journey.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span>Click to start your adventure</span>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse animation-delay-1000"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VehicleMap;