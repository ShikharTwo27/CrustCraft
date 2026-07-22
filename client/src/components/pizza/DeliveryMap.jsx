import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import { Clock, Info } from 'lucide-react';

// Setup custom div-based emoji icons to prevent Leaflet asset url loading issues in Vite
const storeIcon = L.divIcon({
  html: `<div style="background-color: #1c1917; border: 2px solid white; padding: 6px; borderRadius: 50%; boxShadow: 0 4px 6px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; font-size: 16px;">🏪</div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const driverIcon = L.divIcon({
  html: `<div style="background-color: #e23e20; border: 2px solid white; padding: 6px; borderRadius: 50%; boxShadow: 0 4px 6px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; font-size: 16px;" class="animate-bounce">🛵</div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const destinationIcon = L.divIcon({
  html: `<div style="background-color: #10b981; border: 2px solid white; padding: 6px; borderRadius: 50%; boxShadow: 0 4px 6px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; font-size: 16px;">📍</div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export const DeliveryMap = ({ order }) => {
  const route = order.deliveryRoute || [];
  const startPos = route[0] || [21.6030, 71.2225];
  const endPos = route[route.length - 1] || [21.6150, 71.2350];

  const hasValidPos = order.currentPosition && order.currentPosition.length === 2;
  const [driverPos, setDriverPos] = useState(hasValidPos ? order.currentPosition : startPos);
  const [eta, setEta] = useState(order.status === 'out for delivery' ? 45 : 0);

  useEffect(() => {
    // Sync initial coordinates
    if (order.currentPosition && order.currentPosition.length === 2) {
      setDriverPos(order.currentPosition);
    }
  }, [order.currentPosition]);

  useEffect(() => {
    // 1. Establish Socket.io connection for tracking updates
    const socketUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : 'http://localhost:5000';

    const socket = io(socketUrl, { withCredentials: true });

    socket.on('connect', () => {
      socket.emit('joinOrder', order._id);
    });

    // 2. Listen for driver position socket updates
    socket.on('driverPositionUpdated', (data) => {
      if (data.orderId === order._id) {
        if (data.position && data.position.length === 2) {
          setDriverPos(data.position);
        }
        setEta(data.eta);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [order._id]);

  return (
    <div className="space-y-4">
      {/* ETA and simulation notice strip */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-stone-50 border border-stone-200 p-4 rounded-2xl gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Clock className="h-4.5 w-4.5 text-[#e23e20]" />
          <span className="font-extrabold text-[#1c1917]">
            {order.status === 'delivered' ? (
              <span className="text-emerald-600">Pizza Arrived! Enjoy your slice 🍕</span>
            ) : order.status === 'out for delivery' ? (
              <span>Estimated Delivery Arrival: <span className="text-[#e23e20]">{eta} seconds</span></span>
            ) : (
              <span className="text-stone-500">Awaiting kitchen hand-off to driver...</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-stone-400 group relative cursor-help select-none">
          <Info className="h-4 w-4 shrink-0" />
          <span className="font-bold underline decoration-dotted">Telemetry Mode</span>
          
          {/* Tooltip detail block */}
          <div className="absolute right-0 bottom-6 bg-stone-900 text-white p-3 rounded-xl shadow-lg w-64 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all z-50 text-[10px] leading-relaxed">
            <strong>Simulated GPS Feed</strong>: Driver positions interpolate along road points retrieved from 
            project-osrm.org API. Ready for production client SDK tracking.
          </div>
        </div>
      </div>

      {/* React Leaflet Map Frame */}
      <div className="w-full h-80 rounded-3xl overflow-hidden border border-stone-200 shadow-sm relative z-0">
        <MapContainer
          center={driverPos}
          zoom={14}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Route path polyline */}
          {route.length > 0 && (
            <Polyline
              positions={route}
              color="#e23e20"
              weight={4}
              opacity={0.8}
              dashArray="8, 6"
            />
          )}

          {/* Fictional Store Location */}
          <Marker position={startPos} icon={storeIcon}>
            {/* Popups disabled for cleaner view */}
          </Marker>

          {/* Destination Customer Location */}
          <Marker position={endPos} icon={destinationIcon}>
            {/* Popups disabled for cleaner view */}
          </Marker>

          {/* Live Driver marker */}
          {order.status === 'out for delivery' && (
            <Marker position={driverPos} icon={driverIcon} />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default DeliveryMap;
