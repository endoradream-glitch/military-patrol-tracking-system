'use client';

import { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Next.js - only run on client
if (typeof window !== 'undefined') {
  // @ts-ignore
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

interface PatrolMapProps {
  currentLocation?: { lat: number; lng: number } | null;
  locationHistory?: Array<{ latitude: number; longitude: number; timestamp: string }>;
  center?: { lat: number; lng: number };
  zoom?: number;
  showTrail?: boolean;
  className?: string;
  readonly?: boolean;
}

type MapView = 'street' | 'satellite' | 'terrain' | 'dark';

export function PatrolMap({
  currentLocation,
  locationHistory = [],
  center,
  zoom = 15,
  showTrail = true,
  className = '',
  readonly = false
}: PatrolMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<MapView>('street');
  const markersRef = useRef<L.LayerGroup | null>(null);
  const trailRef = useRef<L.Polyline | null>(null);
  const currentMarkerRef = useRef<L.Marker | null>(null);

  // Map layer configurations
  const mapLayers: Record<MapView, L.TileLayer> = {
    street: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }),
    satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '© Esri'
    }),
    terrain: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenTopoMap'
    }),
    dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© CartoDB'
    })
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: center || [23.8103, 90.4125], // Default: Dhaka, Bangladesh
      zoom: zoom
    });

    // Add default layer
    mapLayers[view].addTo(map);
    mapRef.current = map;

    // Create layer groups
    markersRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update map view
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove all tile layers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapRef.current?.removeLayer(layer);
      }
    });

    // Add new tile layer
    mapLayers[view].addTo(mapRef.current);
  }, [view]);

  // Update center
  useEffect(() => {
    if (!mapRef.current || !center) return;
    mapRef.current.setView([center.lat, center.lng], zoom);
  }, [center, zoom]);

  // Update current location marker
  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return;

    // Remove old current marker
    if (currentMarkerRef.current) {
      markersRef.current.removeLayer(currentMarkerRef.current);
    }

    // Add new current marker if location exists
    if (currentLocation) {
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="
            background: linear-gradient(135deg, #10b981, #059669);
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              background: white;
              width: 10px;
              height: 10px;
              border-radius: 50%;
            "></div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      currentMarkerRef.current = L.marker([currentLocation.lat, currentLocation.lng], {
        icon: customIcon
      }).addTo(markersRef.current);

      // Pan to current location
      if (!readonly) {
        mapRef.current.panTo([currentLocation.lat, currentLocation.lng]);
      }
    }
  }, [currentLocation, readonly]);

  // Update trail
  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return;

    // Remove old trail
    if (trailRef.current) {
      markersRef.current.removeLayer(trailRef.current);
    }

    // Add new trail if showTrail is enabled and we have history
    if (showTrail && locationHistory.length > 1) {
      const trailPoints = locationHistory.map(loc => [loc.latitude, loc.longitude] as [number, number]);

      trailRef.current = L.polyline(trailPoints, {
        color: '#10b981',
        weight: 3,
        opacity: 0.7,
        smoothFactor: 1
      }).addTo(markersRef.current);

      // Fit map to show entire trail
      if (!readonly && trailRef.current.getBounds().isValid()) {
        mapRef.current.fitBounds(trailRef.current.getBounds(), { padding: [50, 50] });
      }
    }
  }, [locationHistory, showTrail, readonly]);

  const handleViewChange = (newView: MapView) => {
    setView(newView);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Map container */}
      <div
        ref={mapContainerRef}
        className="w-full h-full rounded-lg"
        style={{ minHeight: '300px' }}
      />

      {/* Map view controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => handleViewChange('street')}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            view === 'street'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'bg-white/90 backdrop-blur-sm text-slate-700 hover:bg-white shadow'
          }`}
        >
          Street
        </button>
        <button
          onClick={() => handleViewChange('satellite')}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            view === 'satellite'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'bg-white/90 backdrop-blur-sm text-slate-700 hover:bg-white shadow'
          }`}
        >
          Satellite
        </button>
        <button
          onClick={() => handleViewChange('terrain')}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            view === 'terrain'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'bg-white/90 backdrop-blur-sm text-slate-700 hover:bg-white shadow'
          }`}
        >
          Terrain
        </button>
        <button
          onClick={() => handleViewChange('dark')}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            view === 'dark'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'bg-white/90 backdrop-blur-sm text-slate-700 hover:bg-white shadow'
          }`}
        >
          Dark
        </button>
      </div>

      {/* Legend */}
      {showTrail && locationHistory.length > 0 && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 text-xs">
            <div
              className="w-4 h-4 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            ></div>
            <span className="text-slate-700 font-medium">Your Position</span>
          </div>
          <div className="flex items-center gap-2 text-xs mt-1">
            <div
              className="w-8 h-1 rounded"
              style={{ background: '#10b981', opacity: 0.7 }}
            ></div>
            <span className="text-slate-700">Patrol Trail</span>
          </div>
        </div>
      )}
    </div>
  );
}
