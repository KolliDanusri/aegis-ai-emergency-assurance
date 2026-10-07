import React, { useState } from 'react';
import { Shelter, SafeRoute, AlertSeverity } from '../types';
import { MapPin, Navigation, Shield, AlertTriangle, CheckCircle, Radio, Info } from 'lucide-react';

interface Props {
  severity?: AlertSeverity;
  affectedDistrict?: string;
  zones?: string[];
  shelters: Shelter[];
  routes: SafeRoute[];
  onSelectShelter?: (shelter: Shelter) => void;
  onSelectRoute?: (route: SafeRoute) => void;
}

export const InteractiveMap: React.FC<Props> = ({
  severity = 'critical',
  affectedDistrict = 'Kollam',
  zones = ['Asramam Lowlands', 'Mundakkal Coastal Basin', 'Iravipuram Ward 12'],
  shelters,
  routes,
  onSelectShelter,
  onSelectRoute,
}) => {
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'shelter' | 'route' | 'zone';
    data: any;
  } | null>(null);

  const getSeverityColor = (sev: AlertSeverity) => {
    switch (sev) {
      case 'critical':
        return { stroke: '#ef4444', fill: 'rgba(239, 68, 68, 0.25)', label: 'CRITICAL INUNDATION ZONE' };
      case 'warning':
        return { stroke: '#f97316', fill: 'rgba(249, 115, 22, 0.25)', label: 'WARNING / EVACUATION ZONE' };
      case 'watch':
        return { stroke: '#eab308', fill: 'rgba(234, 179, 8, 0.2)', label: 'WATCH / FLOOD BASIN' };
      default:
        return { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.15)', label: 'ELEVATED SAFE ZONE' };
    }
  };

  const zoneStyle = getSeverityColor(severity);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
      {/* Map Header / Legend */}
      <div className="bg-neutral-950 px-4 py-3 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <span className="font-extrabold uppercase tracking-wider text-neutral-200">
            Live Tactical GIS HUD — {affectedDistrict} Basin
          </span>
        </div>
        <div className="flex items-center gap-3 text-neutral-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Hazard Polygon
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Open Shelter
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-emerald-400 border border-dashed" /> Safe Route
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-amber-400" /> Caution Route
          </span>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="relative w-full h-80 sm:h-96 bg-neutral-950 flex items-center justify-center overflow-hidden select-none">
        {/* Background Grid Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#64748b" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Map Elements Layer */}
        <svg viewBox="0 0 800 500" className="w-full h-full max-h-full">
          {/* Waterway / Coastal Outline (Stylized) */}
          <path
            d="M 50 30 C 180 80, 220 180, 320 220 C 420 260, 480 380, 750 420"
            fill="none"
            stroke="#1e3a8a"
            strokeWidth="32"
            strokeLinecap="round"
            className="opacity-50"
          />
          <text x="180" y="90" fill="#3b82f6" fontSize="12" fontWeight="bold" opacity="0.6">
            Kallada River Basin (Breached Embankment)
          </text>

          {/* Hazard Polygon: Inundation Danger Zone */}
          <polygon
            points="140,110 330,160 380,310 240,360 120,260"
            fill={zoneStyle.fill}
            stroke={zoneStyle.stroke}
            strokeWidth="2.5"
            strokeDasharray="6,4"
            className="cursor-pointer transition-all hover:opacity-80"
            onClick={() =>
              setSelectedEntity({
                type: 'zone',
                data: { district: affectedDistrict, zones, severity },
              })
            }
          />
          <text x="180" y="240" fill="#fca5a5" fontSize="13" fontWeight="900" letterSpacing="1">
            ⚠ FLOOD INUNDATION CORRIDOR
          </text>

          {/* Route 1: Open Verified Route (Green) */}
          <g
            className="cursor-pointer group"
            onClick={() => {
              if (routes[0]) {
                setSelectedEntity({ type: 'route', data: routes[0] });
                onSelectRoute?.(routes[0]);
              }
            }}
          >
            <path
              d="M 280 280 Q 360 250 480 180 T 610 130"
              fill="none"
              stroke="#10b981"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <circle cx="280" cy="280" r="4" fill="#10b981" />
            <text x="360" y="210" fill="#34d399" fontSize="11" fontWeight="bold">
              NH-66 North Bypass (Open Verified)
            </text>
          </g>

          {/* Route 2: Caution Partial Route (Amber) */}
          <g
            className="cursor-pointer group"
            onClick={() => {
              if (routes[1]) {
                setSelectedEntity({ type: 'route', data: routes[1] });
                onSelectRoute?.(routes[1]);
              }
            }}
          >
            <path
              d="M 250 330 Q 380 370 510 320 T 660 310"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="4"
              strokeDasharray="6,4"
              strokeLinecap="round"
            />
            <circle cx="250" cy="330" r="4" fill="#f59e0b" />
            <text x="380" y="360" fill="#fbbf24" fontSize="11" fontWeight="bold">
              Canal Bank Road (Waterlogged 15cm)
            </text>
          </g>

          {/* Shelter Marker 1: St. Aloysius */}
          <g
            transform="translate(610, 110)"
            className="cursor-pointer group"
            onClick={() => {
              if (shelters[0]) {
                setSelectedEntity({ type: 'shelter', data: shelters[0] });
                onSelectShelter?.(shelters[0]);
              }
            }}
          >
            <circle cx="0" cy="0" r="16" fill="#10b981" className="group-hover:scale-125 transition-transform" />
            <rect x="-8" y="-8" width="16" height="16" fill="#ffffff" rx="2" />
            <path d="M -4 0 L 0 -5 L 4 0 L 4 5 L -4 5 Z" fill="#10b981" />
            <text x="22" y="4" fill="#f3f4f6" fontSize="12" fontWeight="bold">
              St. Aloysius Relief Center (Open)
            </text>
            <text x="22" y="18" fill="#9ca3af" fontSize="10">
              Capacity: 650 | Occ: 410 (63%)
            </text>
          </g>

          {/* Shelter Marker 2: SDV Centennial Hall */}
          <g
            transform="translate(660, 290)"
            className="cursor-pointer group"
            onClick={() => {
              if (shelters[1]) {
                setSelectedEntity({ type: 'shelter', data: shelters[1] });
                onSelectShelter?.(shelters[1]);
              }
            }}
          >
            <circle cx="0" cy="0" r="16" fill="#f59e0b" className="group-hover:scale-125 transition-transform" />
            <rect x="-8" y="-8" width="16" height="16" fill="#ffffff" rx="2" />
            <path d="M -4 0 L 0 -5 L 4 0 L 4 5 L -4 5 Z" fill="#f59e0b" />
            <text x="22" y="4" fill="#f3f4f6" fontSize="12" fontWeight="bold">
              SDV Centennial Hall (Nearing Full)
            </text>
            <text x="22" y="18" fill="#9ca3af" fontSize="10">
              Capacity: 450 | Occ: 390 (86%)
            </text>
          </g>

          {/* Ground Motion Seismic Sensor (Station) */}
          <g transform="translate(180, 420)" className="opacity-80">
            <circle cx="0" cy="0" r="10" fill="#3b82f6" />
            <circle cx="0" cy="0" r="18" fill="none" stroke="#60a5fa" strokeWidth="1.5" className="animate-ping" />
            <text x="22" y="4" fill="#93c5fd" fontSize="11" fontWeight="bold">
              CWC River Sensor #8 (Crest 3.8m)
            </text>
          </g>
        </svg>

        {/* Selected Entity Overlay Floating Card */}
        {selectedEntity && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-sm bg-neutral-900/95 border border-neutral-700 p-3.5 rounded-xl shadow-2xl backdrop-blur-md text-xs text-white z-20 animate-fadeIn">
            <div className="flex items-center justify-between pb-1.5 border-b border-neutral-800">
              <span className="font-extrabold uppercase tracking-wide text-neutral-300 flex items-center gap-1.5">
                {selectedEntity.type === 'shelter' && <Shield className="w-3.5 h-3.5 text-emerald-400" />}
                {selectedEntity.type === 'route' && <Navigation className="w-3.5 h-3.5 text-blue-400" />}
                {selectedEntity.type === 'zone' && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
                {selectedEntity.type.toUpperCase()} DETAILS
              </span>
              <button
                onClick={() => setSelectedEntity(null)}
                className="text-neutral-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-neutral-800"
              >
                ✕
              </button>
            </div>

            <div className="pt-2 space-y-1">
              {selectedEntity.type === 'shelter' && (
                <>
                  <p className="font-bold text-sm text-emerald-400">{selectedEntity.data.name}</p>
                  <p className="text-neutral-300">{selectedEntity.data.location?.address}</p>
                  <p className="text-neutral-400">
                    Capacity: <span className="text-white font-bold">{selectedEntity.data.capacity}</span> | Occupancy: <span className="text-white font-bold">{selectedEntity.data.occupancy}</span>
                  </p>
                  <div className="flex gap-2 pt-1">
                    <span className="bg-neutral-800 px-2 py-0.5 rounded text-[10px]">
                      Wheelchair: {selectedEntity.data.wheelchairAccessible ? '✓ Yes' : '✗ No'}
                    </span>
                    <span className="bg-neutral-800 px-2 py-0.5 rounded text-[10px]">
                      Medical: {selectedEntity.data.medicalSupport ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                </>
              )}

              {selectedEntity.type === 'route' && (
                <>
                  <p className="font-bold text-sm text-blue-400">{selectedEntity.data.name}</p>
                  <p className="text-neutral-300">
                    To: {selectedEntity.data.shelterName} ({selectedEntity.data.distanceKm} km, ~{selectedEntity.data.estimatedMinutes} min)
                  </p>
                  <p className="text-neutral-400">Status: {selectedEntity.data.status.replace('_', ' ').toUpperCase()}</p>
                </>
              )}

              {selectedEntity.type === 'zone' && (
                <>
                  <p className="font-bold text-sm text-red-400">Active Flood Risk Zone</p>
                  <p className="text-neutral-300">District: {selectedEntity.data.district}</p>
                  <p className="text-neutral-400">Zones: {selectedEntity.data.zones?.join(', ')}</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info Strip */}
      <div className="bg-neutral-950 px-4 py-2 border-t border-neutral-800 text-[11px] text-neutral-400 flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-neutral-500" />
          Tactical boundaries rendered from Tier 1 District Disaster Management GIS registry.
        </span>
        <span className="text-neutral-500">Citizen privacy preserved: exact user locations are never displayed.</span>
      </div>
    </div>
  );
};
