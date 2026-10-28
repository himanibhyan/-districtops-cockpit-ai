import React, { useState } from 'react';
import { 
  MapPin, 
  ExternalLink, 
  AlertCircle,
  Crosshair,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WARDS } from '../../data/mockData';
import { Incident } from '../../types';

export const DistrictMap: React.FC = () => {
  const { incidents, grievances, setSelectedIncident, setActiveTab } = useApp();
  const [mapMode, setMapMode] = useState<'cartogram' | 'leaflet'>('cartogram');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CRITICAL' | 'WATER' | 'SANITATION'>('ALL');
  const [hoveredWard, setHoveredWard] = useState<string | null>(null);
  const [selectedPin, setSelectedPin] = useState<Incident | null>(null);

  const filteredIncidents = incidents.filter((inc) => {
    if (activeFilter === 'CRITICAL') return inc.severity === 'CRITICAL';
    if (activeFilter === 'WATER') return inc.department === 'WATER_SUPPLY';
    if (activeFilter === 'SANITATION') return inc.department === 'SANITATION';
    return true;
  });

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'CRITICAL': return '#dc2626'; // red
      case 'HIGH': return '#ea580c'; // orange
      case 'MEDIUM': return '#d97706'; // amber
      default: return '#0284c7'; // sky
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden flex flex-col h-[480px]">
      {/* Map Header */}
      <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-amber-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
            District Operational Geospatial Map
          </h3>
          <span className="text-[10px] bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded font-mono">
            12 Wards Monitored
          </span>
        </div>

        {/* View Switcher & Filters */}
        <div className="flex items-center space-x-2">
          {/* Quick Filters */}
          <div className="hidden sm:flex items-center bg-slate-200/70 p-0.5 rounded text-[11px] font-medium">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-2 py-0.5 rounded ${activeFilter === 'ALL' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All ({incidents.length})
            </button>
            <button
              onClick={() => setActiveFilter('CRITICAL')}
              className={`px-2 py-0.5 rounded ${activeFilter === 'CRITICAL' ? 'bg-white text-red-700 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Critical
            </button>
            <button
              onClick={() => setActiveFilter('WATER')}
              className={`px-2 py-0.5 rounded ${activeFilter === 'WATER' ? 'bg-white text-sky-700 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Water
            </button>
            <button
              onClick={() => setActiveFilter('SANITATION')}
              className={`px-2 py-0.5 rounded ${activeFilter === 'SANITATION' ? 'bg-white text-emerald-700 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Sanitation
            </button>
          </div>

          {/* Fallback vs Leaflet toggle */}
          <div className="flex items-center bg-slate-200/70 p-0.5 rounded text-[11px]">
            <button
              onClick={() => setMapMode('cartogram')}
              className={`px-2 py-0.5 rounded ${mapMode === 'cartogram' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Cartogram
            </button>
            <button
              onClick={() => setMapMode('leaflet')}
              className={`px-2 py-0.5 rounded ${mapMode === 'leaflet' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              OpenStreetMap
            </button>
          </div>
        </div>
      </div>

      {/* Map Body */}
      <div className="relative flex-1 bg-slate-950 overflow-hidden">
        {mapMode === 'cartogram' ? (
          <div className="w-full h-full relative flex items-center justify-center p-4 select-none bg-[#0a1122]">
            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:32px_32px]"></div>

            <svg viewBox="0 0 800 480" className="w-full h-full max-h-[420px]">
              <defs>
                <filter id="glow-crit" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="glow" />
                  <feComposite in="SourceGraphic" in2="glow" operator="over" />
                </filter>
              </defs>

              {/* 12 Wards layout in 4x3 grid */}
              {WARDS.map((ward, idx) => {
                const col = idx % 4;
                const row = Math.floor(idx / 4);
                const x = 50 + col * 175;
                const y = 35 + row * 125;
                const width = 160;
                const height = 105;

                const isSevere = ward.id === 'W-04';
                const isElevated = ward.id === 'W-07';
                const isHovered = hoveredWard === ward.id;

                const wardIncidents = filteredIncidents.filter(i => i.wardId === ward.id && i.status !== 'RESOLVED');
                const wardGrievances = grievances.filter(g => g.wardId === ward.id && g.status !== 'RESOLVED');

                return (
                  <g
                    key={ward.id}
                    onMouseEnter={() => setHoveredWard(ward.id)}
                    onMouseLeave={() => setHoveredWard(null)}
                    className="cursor-pointer transition-all duration-200"
                  >
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      rx={6}
                      fill={
                        isSevere
                          ? '#450a0a'
                          : isElevated
                          ? '#451a03'
                          : isHovered
                          ? '#1e293b'
                          : '#0f172a'
                      }
                      stroke={
                        isSevere
                          ? '#ef4444'
                          : isElevated
                          ? '#f59e0b'
                          : isHovered
                          ? '#38bdf8'
                          : '#1e293b'
                      }
                      strokeWidth={isSevere || isHovered ? 2 : 1}
                    />

                    {/* Ward Title & Code */}
                    <text
                      x={x + 10}
                      y={y + 20}
                      fill={isSevere ? '#fca5a5' : '#cbd5e1'}
                      fontSize="11"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      {ward.id} • {ward.name}
                    </text>

                    {/* Zone & Population */}
                    <text
                      x={x + 10}
                      y={y + 35}
                      fill="#64748b"
                      fontSize="9"
                      fontFamily="sans-serif"
                    >
                      {ward.zone} | Pop: {(ward.population / 1000).toFixed(0)}k
                    </text>

                    {/* Ward Badge */}
                    {isSevere && (
                      <g>
                        <rect x={x + 10} y={y + 44} width={138} height={18} rx={3} fill="#7f1d1d" />
                        <text x={x + 15} y={y + 57} fill="#fecaca" fontSize="9" fontWeight="bold">
                          ⚠️ CONTAMINATION SURGE
                        </text>
                      </g>
                    )}

                    {isElevated && (
                      <g>
                        <rect x={x + 10} y={y + 44} width={138} height={18} rx={3} fill="#78350f" />
                        <text x={x + 15} y={y + 57} fill="#fde68a" fontSize="9" fontWeight="bold">
                          ⚠️ SOLID WASTE BOTTLENECK
                        </text>
                      </g>
                    )}

                    {/* Stats */}
                    <g transform={`translate(${x + 10}, ${y + (isSevere || isElevated ? 72 : 55)})`}>
                      <text fill="#94a3b8" fontSize="9">
                        Incidents: <tspan fill={wardIncidents.length > 0 ? '#f87171' : '#94a3b8'} fontWeight="bold">{wardIncidents.length}</tspan>
                      </text>
                      <text x="65" y="0" fill="#94a3b8" fontSize="9">
                        Backlog: <tspan fill={wardGrievances.length > 3 ? '#fbbf24' : '#94a3b8'} fontWeight="bold">{wardGrievances.length}</tspan>
                      </text>
                    </g>

                    {/* Incident Markers */}
                    {wardIncidents.map((inc, iIdx) => {
                      const pinColor = getSeverityColor(inc.severity);
                      const pinX = x + width - 18 - (iIdx * 14);
                      const pinY = y + 16;
                      return (
                        <circle
                          key={inc.id}
                          cx={pinX}
                          cy={pinY}
                          r={inc.severity === 'CRITICAL' ? 6 : 4}
                          fill={pinColor}
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          filter={inc.severity === 'CRITICAL' ? 'url(#glow-crit)' : undefined}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPin(inc);
                          }}
                          className="cursor-pointer hover:r-8 transition-all"
                        />
                      );
                    })}
                  </g>
                );
              })}
            </svg>
          </div>
        ) : (
          <div className="w-full h-full relative bg-slate-900 flex items-center justify-center">
            <div className="text-center p-6 max-w-md">
              <Crosshair className="w-8 h-8 text-amber-500 mx-auto mb-2 animate-spin-slow" />
              <p className="text-xs font-semibold text-slate-200">OpenStreetMap Canvas View Ready</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Displaying 12 Wards centered at Indraprastha Central [28.6139° N, 77.2090° E].
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-left bg-slate-950 p-2.5 rounded border border-slate-800 text-[10px]">
                <div>
                  <span className="text-slate-400">Target Locus:</span>
                  <p className="font-mono text-slate-200">Shastri Nagar (W-04)</p>
                </div>
                <div>
                  <span className="text-slate-400">GPS Marker:</span>
                  <p className="font-mono text-red-400">28.6695° N, 77.1725° E</p>
                </div>
              </div>
              <button
                onClick={() => setMapMode('cartogram')}
                className="mt-3 text-xs bg-amber-600 hover:bg-amber-500 text-white font-semibold px-3 py-1.5 rounded"
              >
                Switch to Polygonal Cartogram
              </button>
            </div>
          </div>
        )}

        {/* Selected Incident Drawer on Map */}
        {selectedPin && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:w-96 bg-slate-900/95 backdrop-blur border border-slate-700 rounded-lg p-3.5 shadow-2xl z-30 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-[10px] bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded border border-slate-700">
                  {selectedPin.id}
                </span>
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase"
                  style={{ backgroundColor: `${getSeverityColor(selectedPin.severity)}25`, color: getSeverityColor(selectedPin.severity), border: `1px solid ${getSeverityColor(selectedPin.severity)}50` }}
                >
                  {selectedPin.severity}
                </span>
              </div>
              <button
                onClick={() => setSelectedPin(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <h4 className="text-xs font-bold text-white mt-2 leading-snug">
              {selectedPin.title}
            </h4>
            <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
              {selectedPin.description}
            </p>

            <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span>{selectedPin.wardName} ({selectedPin.wardId})</span>
              <span className="font-mono text-amber-400">{selectedPin.status}</span>
            </div>

            <div className="mt-2.5 flex items-center space-x-2">
              <button
                onClick={() => {
                  setSelectedIncident(selectedPin);
                  setActiveTab('incidents');
                }}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold py-1.5 px-3 rounded flex items-center justify-center space-x-1.5 transition"
              >
                <span>Launch Full Investigation</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur border border-slate-800 p-2 rounded text-[10px] text-slate-300 space-y-1 select-none pointer-events-none hidden sm:block">
          <p className="font-bold text-slate-400 uppercase text-[9px]">Incident Severity</p>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
            <span>Critical (Health / Contamination)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span>
            <span>High (Biohazard / Main Trunk)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
            <span>Medium (Infrastructure / Supplies)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
