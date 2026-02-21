'use client';

import { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

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

interface Patrol {
  id: string;
  name: string;
  unit: string;
  camp: string;
  status: string;
  currentLatitude?: number;
  currentLongitude?: number;
  trail?: Array<{ latitude: number; longitude: number; timestamp: string }>;
}

interface SOSAlert {
  id: string;
  patrolId: string;
  patrolName: string;
  latitude: number;
  longitude: number;
  status: string;
  message: string;
}

interface Camp {
  id: string;
  name: string;
  unit: string;
  latitude: number;
  longitude: number;
}

interface HQMapProps {
  patrols?: Patrol[];
  sosAlerts?: SOSAlert[];
  camps?: Camp[];
  showTrails?: boolean;
  showCamps?: boolean;
  showHeatmap?: boolean;
  className?: string;
  onPatrolClick?: (patrol: Patrol) => void;
  onSosClick?: (sos: SOSAlert) => void;
}

type MapView = 'street' | 'satellite' | 'terrain' | 'dark';

export function HQMap({
  patrols = [],
  sosAlerts = [],
  camps = [],
  showTrails = true,
  showCamps = true,
  showHeatmap = false,
  className = '',
  onPatrolClick,
  onSosClick
}: HQMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<MapView>('dark');
  const patrolMarkersRef = useRef<L.LayerGroup | null>(null);
  const sosMarkersRef = useRef<L.LayerGroup | null>(null);
  const campMarkersRef = useRef<L.LayerGroup | null>(null);
  const trailsRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerRef = useRef<any>(null);

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

  const handleViewChange = (newView: MapView) => {
    setView(newView);
  };

  const getPatrolStatusColor = (status: string) => {
    switch (status) {
      case 'patrolling':
        return { light: '#10b981', dark: '#059669' };
      case 'sos':
        return { light: '#ef4444', dark: '#dc2626' };
      case 'idle':
        return { light: '#3b82f6', dark: '#2563eb' };
      case 'offline':
        return { light: '#6b7280', dark: '#4b5563' };
      default:
        return { light: '#8b5cf6', dark: '#7c3aed' };
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [23.8103, 90.4125],
      zoom: 12,
      zoomControl: true
    });

    mapLayers[view].addTo(map);
    mapRef.current = map;

    // Create layer groups
    patrolMarkersRef.current = L.layerGroup().addTo(map);
    sosMarkersRef.current = L.layerGroup().addTo(map);
    campMarkersRef.current = L.layerGroup().addTo(map);
    trailsRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update map view
  useEffect(() => {
    if (!mapRef.current) return;

    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapRef.current?.removeLayer(layer);
      }
    });

    mapLayers[view].addTo(mapRef.current);
  }, [view]);

  // Update patrol markers
  useEffect(() => {
    if (!mapRef.current || !patrolMarkersRef.current) return;

    patrolMarkersRef.current.clearLayers();

    patrols.forEach((patrol) => {
      if (patrol.currentLatitude && patrol.currentLongitude) {
        const iconColor = getPatrolStatusColor(patrol.status);
        
        const customIcon = L.divIcon({
          className: 'custom-patrol-icon',
          html: `
            <div style="
              background: linear-gradient(135deg, ${iconColor.light}, ${iconColor.dark});
              width: 36px;
              height: 36px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: transform 0.2s;
              ${patrol.status === 'sos' ? 'animation: pulse 1s infinite;' : ''}
            " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="5"/>
              </svg>
            </div>
            ${patrol.status === 'sos' ? `
              <style>
                @keyframes pulse {
                  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                  50% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                }
              </style>
            ` : ''}
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        const marker = L.marker([patrol.currentLatitude, patrol.currentLongitude], {
          icon: customIcon
        });

        marker.bindPopup(`
          <div style="min-width: 200px;">
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px;">${patrol.name}</div>
            <div style="font-size: 12px; color: #666;">Unit: ${patrol.unit}</div>
            <div style="font-size: 12px; color: #666;">Camp: ${patrol.camp}</div>
            <div style="font-size: 12px; color: #666; margin-top: 4px;">
              Status: <span style="color: ${iconColor.dark}; font-weight: bold;">${patrol.status.toUpperCase()}</span>
            </div>
            ${patrol.trail && patrol.trail.length > 0 ? `
              <div style="font-size: 11px; color: #999; margin-top: 4px;">
                Trail points: ${patrol.trail.length}
              </div>
            ` : ''}
          </div>
        `);

        marker.on('click', () => {
          onPatrolClick?.(patrol);
        });

        marker.addTo(patrolMarkersRef.current);
      }
    });

    if (patrols.length > 0) {
      const bounds = L.latLngBounds(
        patrols
          .filter(p => p.currentLatitude && p.currentLongitude)
          .map(p => [p.currentLatitude!, p.currentLongitude!])
      );
      if (bounds.isValid() && !showTrails) {
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [patrols, onPatrolClick, showTrails]);

  // Update trails
  useEffect(() => {
    if (!mapRef.current || !trailsRef.current) return;

    trailsRef.current.clearLayers();

    if (!showTrails) return;

    patrols.forEach((patrol) => {
      if (patrol.trail && patrol.trail.length > 1) {
        const trailPoints = patrol.trail.map(loc => [loc.latitude, loc.longitude] as [number, number]);
        const iconColor = getPatrolStatusColor(patrol.status);

        const trail = L.polyline(trailPoints, {
          color: iconColor.dark,
          weight: 3,
          opacity: 0.7,
          smoothFactor: 1,
          lineCap: 'round',
          lineJoin: 'round'
        });

        trail.bindPopup(`
          <div style="min-width: 150px;">
            <div style="font-weight: bold; font-size: 12px;">${patrol.name}</div>
            <div style="font-size: 11px; color: #666;">Trail: ${trailPoints.length} points</div>
          </div>
        `);

        trail.addTo(trailsRef.current);
      }
    });

    // Fit bounds to show all trails
    if (showTrails) {
      const allPoints: [number, number][] = [];
      patrols.forEach(patrol => {
        if (patrol.trail) {
          patrol.trail.forEach(loc => {
            allPoints.push([loc.latitude, loc.longitude]);
          });
        }
      });

      if (allPoints.length > 0) {
        const bounds = L.latLngBounds(allPoints);
        if (bounds.isValid()) {
          mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    }
  }, [patrols, showTrails]);

  // Update SOS markers
  useEffect(() => {
    if (!mapRef.current || !sosMarkersRef.current) return;

    sosMarkersRef.current.clearLayers();

    sosAlerts.forEach((sos) => {
      const customIcon = L.divIcon({
        className: 'custom-sos-icon',
        html: `
          <div style="
            background: linear-gradient(135deg, #ef4444, #dc2626);
            width: 44px;
            height: 44px;
            border-radius: 50%;
            border: 4px solid white;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            animation: sos-pulse 1.5s infinite;
          ">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L19 6.5L15.5 11.5L21 14L15.5 16.5L19 21.5L13.09 19.74L12 26L10.91 19.74L5 21.5L8.5 16.5L3 14L8.5 11.5L5 6.5L10.91 8.26L12 2Z"/>
            </svg>
          </div>
          <style>
            @keyframes sos-pulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.15); opacity: 0.8; }
            }
          </style>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      const marker = L.marker([sos.latitude, sos.longitude], {
        icon: customIcon
      });

      marker.bindPopup(`
        <div style="min-width: 200px;">
          <div style="font-weight: bold; font-size: 14px; color: #dc2626; margin-bottom: 8px;">
            ⚠️ SOS ALERT
          </div>
          <div style="font-size: 12px; color: #666;">Patrol: ${sos.patrolName}</div>
          <div style="font-size: 12px; color: #666; margin: 4px 0;">${sos.message}</div>
          <div style="font-size: 11px; color: #999;">
            ${new Date().toLocaleString()}
          </div>
        </div>
      `);

      marker.on('click', () => {
        onSosClick?.(sos);
      });

      marker.addTo(sosMarkersRef.current);
    });
  }, [sosAlerts, onSosClick]);

  // Update camp markers
  useEffect(() => {
    if (!mapRef.current || !campMarkersRef.current) return;

    campMarkersRef.current.clearLayers();

    if (!showCamps) return;

    camps.forEach((camp) => {
      const customIcon = L.divIcon({
        className: 'custom-camp-icon',
        html: `
          <div style="
            background: linear-gradient(135deg, #f59e0b, #d97706);
            width: 40px;
            height: 40px;
            border-radius: 8px;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3L2 12H5V22H10V16H14V22H19V12H22L12 3Z"/>
            </svg>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker([camp.latitude, camp.longitude], {
        icon: customIcon
      });

      marker.bindPopup(`
        <div style="min-width: 180px;">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${camp.name}</div>
          <div style="font-size: 12px; color: #666;">Unit: ${camp.unit}</div>
          <div style="font-size: 12px; color: #f59e0b; font-weight: bold; margin-top: 4px;">
            🏕️ Camp Location
          </div>
        </div>
      `);

      marker.addTo(campMarkersRef.current);
    });
  }, [camps, showCamps]);

  // Update heatmap
  useEffect(() => {
    if (!mapRef.current) return;

    if (heatmapLayerRef.current) {
      mapRef.current.removeLayer(heatmapLayerRef.current);
      heatmapLayerRef.current = null;
    }

    if (showHeatmap) {
      const heatPoints: [number, number, number][] = [];
      
      patrols.forEach(patrol => {
        if (patrol.currentLatitude && patrol.currentLongitude) {
          heatPoints.push([patrol.currentLatitude, patrol.currentLongitude, 0.8]);
        }
        
        if (showTrails && patrol.trail) {
          patrol.trail.forEach(point => {
            heatPoints.push([point.latitude, point.longitude, 0.3]);
          });
        }
      });

      if (heatPoints.length > 0) {
        // @ts-ignore
        heatmapLayerRef.current = L.heatLayer(heatPoints, {
          radius: 25,
          blur: 15,
          maxZoom: 17,
          gradient: {
            0.0: '#10b981',
            0.3: '#f59e0b',
            0.5: '#ef4444',
            0.7: '#dc2626',
            1.0: '#7c3aed'
          }
        }).addTo(mapRef.current);
      }
    }
  }, [showHeatmap, patrols, showTrails]);

  const patrollingCount = patrols.filter(p => p.status === 'patrolling').length;
  const sosCount = sosAlerts.filter(s => s.status === 'active').length;

  return (
    <div className={`relative ${className}`}>
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        style={{ minHeight: '100%' }}
      />

      {/* Map view controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => handleViewChange('street')}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all shadow-md ${
            view === 'street'
              ? 'bg-emerald-600 text-white'
              : 'bg-white/95 backdrop-blur-sm text-slate-700 hover:bg-white'
          }`}
        >
          Street
        </button>
        <button
          onClick={() => handleViewChange('satellite')}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all shadow-md ${
            view === 'satellite'
              ? 'bg-emerald-600 text-white'
              : 'bg-white/95 backdrop-blur-sm text-slate-700 hover:bg-white'
          }`}
        >
          Satellite
        </button>
        <button
          onClick={() => handleViewChange('terrain')}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all shadow-md ${
            view === 'terrain'
              ? 'bg-emerald-600 text-white'
              : 'bg-white/95 backdrop-blur-sm text-slate-700 hover:bg-white'
          }`}
        >
          Terrain
        </button>
        <button
          onClick={() => handleViewChange('dark')}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all shadow-md ${
            view === 'dark'
              ? 'bg-emerald-600 text-white'
              : 'bg-white/95 backdrop-blur-sm text-slate-700 hover:bg-white'
          }`}
        >
          Dark
        </button>
      </div>

      {/* Stats overlay */}
      <div className="absolute top-4 left-4 z-[1000] bg-slate-900/95 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg">
        <div className="flex items-center gap-4 text-xs">
          <div className="text-white">
            <span className="text-emerald-500 font-bold text-lg">{patrollingCount}</span>
            <span className="text-slate-400 ml-1">Active</span>
          </div>
          <div className="text-white">
            <span className="text-red-500 font-bold text-lg">{sosCount}</span>
            <span className="text-slate-400 ml-1">SOS</span>
          </div>
          <div className="text-white">
            <span className="text-amber-500 font-bold text-lg">{camps.length}</span>
            <span className="text-slate-400 ml-1">Camps</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg">
        <div className="text-xs font-bold text-slate-700 mb-2">Legend</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            <div
              className="w-4 h-4 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            ></div>
            <span className="text-slate-700">Patrolling</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div
              className="w-4 h-4 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            ></div>
            <span className="text-slate-700">Idle</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div
              className="w-4 h-4 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            ></div>
            <span className="text-slate-700">SOS</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div
              className="w-4 h-4 rounded"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            ></div>
            <span className="text-slate-700">Camp</span>
          </div>
          {showTrails && (
            <div className="flex items-center gap-2 text-xs mt-1 pt-1 border-t border-slate-200">
              <div
                className="w-8 h-1 rounded"
                style={{ background: '#10b981', opacity: 0.7 }}
              ></div>
              <span className="text-slate-700">Patrol Trail</span>
            </div>
          )}
          {showHeatmap && (
            <div className="flex items-center gap-2 text-xs">
              <div
                className="w-4 h-4 rounded"
                style={{
                  background: 'linear-gradient(to right, #10b981, #f59e0b, #ef4444)',
                  opacity: 0.7
                }}
              ></div>
              <span className="text-slate-700">Heatmap</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
