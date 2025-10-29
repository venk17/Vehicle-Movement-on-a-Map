import React from 'react';
import { MapPin, Clock, Gauge, Calendar, Activity, TrendingUp } from 'lucide-react';
import { calculateSpeedKmH } from '../utils/calculations';

function MetadataPanel({ currentPosition, currentIndex, routeData, elapsedTime }) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const speed = calculateSpeedKmH(currentIndex, routeData);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-inner border border-gray-100">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Live Telemetry</h3>
        <p className="text-gray-500 text-sm">Real-time vehicle data</p>
      </div>
      
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-semibold text-gray-700">Current Position</span>
              <div className="font-mono text-sm text-gray-800 mt-1 bg-gray-50 px-3 py-1 rounded-lg">
                {currentPosition ? (
                  <>
                    {currentPosition.lat.toFixed(6)}, {currentPosition.lng.toFixed(6)}
                  </>
                ) : 'Awaiting GPS signal...'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-semibold text-gray-700">Journey Time</span>
              <div className="text-2xl font-bold text-gray-800 mt-1">
                {formatTime(elapsedTime)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-semibold text-gray-700">Current Speed</span>
              <div className="text-2xl font-bold text-gray-800 mt-1">
                {speed} <span className="text-lg text-gray-500">km/h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-semibold text-gray-700">Timestamp</span>
              <div className="text-sm text-gray-800 mt-1 bg-gray-50 px-3 py-1 rounded-lg">
                {currentPosition?.timestamp ? 
                  new Date(currentPosition.timestamp).toLocaleString() : 'No data available'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
          <div className="flex justify-between text-sm font-semibold text-gray-700 mb-3">
            <span>Journey Progress</span>
            <span className="text-blue-600">{currentIndex + 1} / {routeData.length}</span>
          </div>
          <div className="w-full bg-white rounded-full h-3 shadow-inner">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 shadow-sm"
              style={{ 
                width: `${routeData.length > 0 ? ((currentIndex + 1) / routeData.length) * 100 : 0}%` 
              }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center">
            {routeData.length > 0 ? Math.round(((currentIndex + 1) / routeData.length) * 100) : 0}% Complete
          </div>
        </div>
      </div>
    </div>
  );
}

export default MetadataPanel;