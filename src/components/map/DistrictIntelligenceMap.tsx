import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  Popup,
  useMap
} from 'react-leaflet';
import { OperationalAlert, Intervention } from '../../types';
import { GURUGRAM_GEO } from '../../data/gurugramGeo';
import { createAlertIcon, createInterventionIcon } from './mapIcons';
import { MapLegend } from './MapLegend';
import { MapFilterBar, MapFiltersState } from './MapFilterBar';
import { MarkerDetailCard } from './MarkerDetailCard';
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  Compass,
  AlertTriangle,
  Layers,
  MapPin,
  Shield
} from 'lucide-react';

interface DistrictIntelligenceMapProps {
  alerts: OperationalAlert[];
  interventions: Intervention[];
  selectedAlertId?: string | null;
  onSelectAlert?: (alert: OperationalAlert) => void;
  onNavigateToInterventions?: () => void;
  height?: string;
  isExpandedInitial?: boolean;
}

// Controller component to handle programmatic map actions via useMap
const MapController: React.FC<{
  targetCoordinate: [number, number] | null;
  resetTrigger: number;
  fitBoundsTrigger: number;
  onTileError: () => void;
  onTileSuccess: () => void;
}> = ({ targetCoordinate, resetTrigger, fitBoundsTrigger, onTileError, onTileSuccess }) => {
  const map = useMap();
  const prevTargetRef = useRef<string | null>(null);

  // Center on target coordinate when selected
  useEffect(() => {
    if (targetCoordinate) {
      const coordKey = `${targetCoordinate[0].toFixed(5)},${targetCoordinate[1].toFixed(5)}`;
      if (coordKey !== prevTargetRef.current) {
        prevTargetRef.current = coordKey;
        map.flyTo(targetCoordinate, 14, { duration: 1.0 });
      }
    }
  }, [targetCoordinate, map]);

  // Reset to Gurugram center
  useEffect(() => {
    if (resetTrigger > 0) {
      map.flyTo(GURUGRAM_GEO.center, GURUGRAM_GEO.defaultZoom, { duration: 0.8 });
    }
  }, [resetTrigger, map]);

  // Fit to Gurugram district bounds
  useEffect(() => {
    if (fitBoundsTrigger > 0) {
      map.fitBounds(GURUGRAM_GEO.bounds, { padding: [20, 20], maxZoom: 13 });
    }
  }, [fitBoundsTrigger, map]);

  // Listen for tile load and error events on the map's tilelayer
  useEffect(() => {
    const handleTileError = () => {
      onTileError();
    };
    const handleTileLoad = () => {
      onTileSuccess();
    };

    map.on('tileerror', handleTileError);
    map.on('load', handleTileLoad);

    return () => {
      map.off('tileerror', handleTileError);
      map.off('load', handleTileLoad);
    };
  }, [map, onTileError, onTileSuccess]);

  return null;
};

export const DistrictIntelligenceMap: React.FC<DistrictIntelligenceMapProps> = ({
  alerts,
  interventions,
  selectedAlertId,
  onSelectAlert,
  onNavigateToInterventions,
  height = '500px',
  isExpandedInitial = false
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(isExpandedInitial);
  const [activeTileKey, setActiveTileKey] = useState<'cartoPositron' | 'osmStandard'>('cartoPositron');
  const [tileHasError, setTileHasError] = useState<boolean>(false);
  const [resetTrigger, setResetTrigger] = useState<number>(0);
  const [fitBoundsTrigger, setFitBoundsTrigger] = useState<number>(0);
  const [activePresetName, setActivePresetName] = useState<string | null>(null);

  // Selected item on map (can be an alert or intervention)
  const [activeMapItem, setActiveMapItem] = useState<
    | { type: 'alert'; alert: OperationalAlert }
    | { type: 'intervention'; intervention: Intervention }
    | null
  >(null);

  // Map Filter State
  const [filters, setFilters] = useState<MapFiltersState>({
    department: 'All',
    severity: 'All',
    alertStatus: 'All',
    interventionStatus: 'All',
    showAlerts: true,
    showInterventions: true
  });

  const handleResetFilters = () => {
    setFilters({
      department: 'All',
      severity: 'All',
      alertStatus: 'All',
      interventionStatus: 'All',
      showAlerts: true,
      showInterventions: true
    });
  };

  // Associate interventions with alerts or default coordinates if missing
  const enrichedInterventions = useMemo(() => {
    return interventions.map((item) => {
      if (item.coordinates && item.coordinates.lat && item.coordinates.lng) {
        return item;
      }
      // If linked to an alert, borrow alert coordinates with tiny offset
      if (item.linkedAlertId) {
        const linkedAlert = alerts.find(a => a.id === item.linkedAlertId);
        if (linkedAlert?.coordinates) {
          return {
            ...item,
            coordinates: {
              lat: linkedAlert.coordinates.lat + 0.0018,
              lng: linkedAlert.coordinates.lng + 0.0018
            }
          };
        }
      }
      // Fallback coordinate in Sector 14
      return {
        ...item,
        coordinates: { lat: 28.4727, lng: 77.0425 }
      };
    });
  }, [interventions, alerts]);

  // Filtered Alerts
  const filteredAlerts = useMemo(() => {
    if (!filters.showAlerts) return [];
    return alerts.filter((alert) => {
      if (!alert.coordinates) return false;
      if (filters.department !== 'All' && alert.department.toLowerCase() !== filters.department.toLowerCase()) return false;
      if (filters.severity !== 'All' && alert.severity.toLowerCase() !== filters.severity.toLowerCase()) return false;
      if (filters.alertStatus !== 'All' && alert.status.toLowerCase() !== filters.alertStatus.toLowerCase()) return false;
      return true;
    });
  }, [alerts, filters]);

  // Filtered Interventions
  const filteredInterventions = useMemo(() => {
    if (!filters.showInterventions) return [];
    return enrichedInterventions.filter((item) => {
      if (!item.coordinates) return false;
      if (filters.department !== 'All' && item.department.toLowerCase() !== filters.department.toLowerCase()) return false;
      if (filters.interventionStatus !== 'All' && item.status.toLowerCase() !== filters.interventionStatus.toLowerCase()) return false;
      return true;
    });
  }, [enrichedInterventions, filters]);

  // Group coordinates to prevent visual overlap when multiple incidents share similar positions
  const getOffsetCoordinate = (lat: number, lng: number, id: string): [number, number] => {
    // Collect all items sharing close proximity
    const collisionList: string[] = [];
    filteredAlerts.forEach(a => {
      if (a.coordinates && Math.abs(a.coordinates.lat - lat) < 0.0006 && Math.abs(a.coordinates.lng - lng) < 0.0006) {
        collisionList.push(a.id);
      }
    });
    filteredInterventions.forEach(i => {
      if (i.coordinates && Math.abs(i.coordinates.lat - lat) < 0.0006 && Math.abs(i.coordinates.lng - lng) < 0.0006) {
        collisionList.push(i.id);
      }
    });

    const index = collisionList.indexOf(id);
    if (index <= 0 || collisionList.length <= 1) {
      return [lat, lng];
    }

    const angle = (index / collisionList.length) * 2 * Math.PI;
    const radius = 0.0022; // ~200 meters spread
    return [lat + Math.sin(angle) * radius, lng + Math.cos(angle) * radius];
  };

  // Sync selectedAlertId from parent (Early Warnings view selection)
  useEffect(() => {
    if (selectedAlertId) {
      const match = alerts.find(a => a.id === selectedAlertId);
      if (match) {
        setActiveMapItem({ type: 'alert', alert: match });
      }
    }
  }, [selectedAlertId, alerts]);

  // Coordinate target for flyTo
  const targetCoordinate = useMemo<[number, number] | null>(() => {
    if (activeMapItem?.type === 'alert' && activeMapItem.alert.coordinates) {
      return [activeMapItem.alert.coordinates.lat, activeMapItem.alert.coordinates.lng];
    }
    if (activeMapItem?.type === 'intervention' && activeMapItem.intervention.coordinates) {
      return [activeMapItem.intervention.coordinates.lat, activeMapItem.intervention.coordinates.lng];
    }
    return null;
  }, [activeMapItem]);

  // Select Quick Location Preset (Sector 56, Sector 14, Sohna, Pataudi)
  const handleSelectPreset = (preset: typeof GURUGRAM_GEO.keyLocations[0]) => {
    setActivePresetName(preset.name);
    // Find alert or intervention in this area if any
    const relatedAlert = alerts.find(a => a.affectedArea.toLowerCase().includes(preset.name.toLowerCase()));
    if (relatedAlert) {
      setActiveMapItem({ type: 'alert', alert: relatedAlert });
    } else {
      setActiveMapItem(null);
    }
    // Set flyTo target
    const [lat, lng] = preset.coordinates;
    setActiveMapItem({
      type: 'alert',
      alert: {
        id: `LOC-${preset.name.substring(0, 3).toUpperCase()}`,
        title: `${preset.name} Geographic Center`,
        department: 'Public Grievances',
        affectedArea: `${preset.name}, Gurugram`,
        severity: 'Low',
        riskScore: 40,
        status: 'Monitoring',
        evidenceSummary: `Geographic reference point for ${preset.category}. Telemetric sensors reporting baseline conditions.`,
        timestamp: 'Active Feed',
        isSyntheticDemo: true,
        metrics: [],
        recommendedActions: ['Continue standard automated telemetry monitoring.'],
        coordinates: { lat, lng }
      }
    });
  };

  const tileConfig = GURUGRAM_GEO.tileProviders[activeTileKey];

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all ${
        isExpanded
          ? 'fixed inset-4 z-50 rounded-2xl shadow-2xl border-slate-300'
          : 'relative w-full'
      }`}
      style={{ height: isExpanded ? 'calc(100vh - 32px)' : height }}
    >
      {/* Map Header Toolbar */}
      <div className="bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-600/30 border border-blue-500/40 text-blue-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm tracking-tight">
                Gurugram District Intelligence Map
              </h3>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                GMDA / MCG GIS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 hidden sm:block">
              Multi-department incident radar with official Survey of India boundary vectors
            </p>
          </div>
        </div>

        {/* Location Presets & Actions */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Quick presets pills */}
          <div className="hidden xl:flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-semibold px-1.5">Zoom To:</span>
            {GURUGRAM_GEO.keyLocations.slice(0, 4).map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleSelectPreset(preset)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  activePresetName === preset.name
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {preset.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Fit to District Bounds */}
          <button
            onClick={() => setFitBoundsTrigger((prev) => prev + 1)}
            title="Fit view to Gurugram district boundary"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>Fit District</span>
          </button>

          {/* Reset View */}
          <button
            onClick={() => {
              setActivePresetName(null);
              setResetTrigger((prev) => prev + 1);
            }}
            title="Reset to default center"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset</span>
          </button>

          {/* Basemap Toggle */}
          <button
            onClick={() => setActiveTileKey(activeTileKey === 'cartoPositron' ? 'osmStandard' : 'cartoPositron')}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
            title="Toggle between Carto Positron & OpenStreetMap tiles"
          >
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>{activeTileKey === 'cartoPositron' ? 'Carto Light' : 'OSM Map'}</span>
          </button>

          {/* Expand / Fullscreen Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Exit full investigation mode' : 'Expand map investigation mode'}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            {isExpanded ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Close</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Investigation Mode</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <MapFilterBar
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        displayedAlertsCount={filteredAlerts.length}
        displayedInterventionsCount={filteredInterventions.length}
        totalAlertsCount={alerts.length}
        totalInterventionsCount={interventions.length}
      />

      {/* Tile degradation warning notice if offline or blocked */}
      {tileHasError && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              Map tile feed currently restricted or offline. Vector district boundaries and incident markers remain fully active.
            </span>
          </div>
          <button
            onClick={() => {
              setTileHasError(false);
              setActiveTileKey(activeTileKey === 'cartoPositron' ? 'osmStandard' : 'cartoPositron');
            }}
            className="text-[11px] underline font-semibold text-amber-800"
          >
            Switch Tile Provider
          </button>
        </div>
      )}

      {/* Main Map Container */}
      <div className="relative flex-1 w-full h-full min-h-[300px]">
        <MapContainer
          center={GURUGRAM_GEO.center}
          zoom={GURUGRAM_GEO.defaultZoom}
          minZoom={GURUGRAM_GEO.minZoom}
          maxZoom={GURUGRAM_GEO.maxZoom}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
          className="z-0"
        >
          {/* Tile Layer */}
          <TileLayer
            key={activeTileKey}
            url={tileConfig.url}
            attribution={tileConfig.attribution}
            maxZoom={tileConfig.maxZoom}
          />

          {/* Official Gurugram District Boundary GeoJSON */}
          <GeoJSON
            data={GURUGRAM_GEO.boundaryGeoJson}
            style={() => ({
              color: '#2563eb',
              weight: 2,
              opacity: 0.85,
              fillColor: '#3b82f6',
              fillOpacity: 0.05,
              dashArray: '5, 5'
            })}
          />

          {/* Alert Markers */}
          {filteredAlerts.map((alert) => {
            if (!alert.coordinates) return null;
            const isSelected = activeMapItem?.type === 'alert' && activeMapItem.alert.id === alert.id;
            const [lat, lng] = getOffsetCoordinate(alert.coordinates.lat, alert.coordinates.lng, alert.id);

            return (
              <Marker
                key={alert.id}
                position={[lat, lng]}
                icon={createAlertIcon(alert.severity, isSelected)}
                eventHandlers={{
                  click: () => {
                    setActiveMapItem({ type: 'alert', alert });
                    if (onSelectAlert) {
                      onSelectAlert(alert);
                    }
                  }
                }}
              >
                <Popup>
                  <MarkerDetailCard
                    item={{ type: 'alert', alert }}
                    onOpenAlertDetail={onSelectAlert}
                  />
                </Popup>
              </Marker>
            );
          })}

          {/* Intervention Markers */}
          {filteredInterventions.map((intervention) => {
            if (!intervention.coordinates) return null;
            const isSelected = activeMapItem?.type === 'intervention' && activeMapItem.intervention.id === intervention.id;
            const [lat, lng] = getOffsetCoordinate(intervention.coordinates.lat, intervention.coordinates.lng, intervention.id);

            return (
              <Marker
                key={intervention.id}
                position={[lat, lng]}
                icon={createInterventionIcon(intervention.status, isSelected)}
                eventHandlers={{
                  click: () => {
                    setActiveMapItem({ type: 'intervention', intervention });
                  }
                }}
              >
                <Popup>
                  <MarkerDetailCard
                    item={{ type: 'intervention', intervention }}
                    onNavigateToInterventions={onNavigateToInterventions}
                  />
                </Popup>
              </Marker>
            );
          })}

          {/* Programmatic Map Controller */}
          <MapController
            targetCoordinate={targetCoordinate}
            resetTrigger={resetTrigger}
            fitBoundsTrigger={fitBoundsTrigger}
            onTileError={() => setTileHasError(true)}
            onTileSuccess={() => setTileHasError(false)}
          />
        </MapContainer>

        {/* Floating Map Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-10 max-w-xs pointer-events-auto">
          <MapLegend
            totalAlerts={filteredAlerts.length}
            totalInterventions={filteredInterventions.length}
          />
        </div>

        {/* Selected Marker Floating Card (Desktop Drawer) */}
        {activeMapItem && (
          <div className="hidden lg:block absolute top-4 right-4 z-10 w-80 bg-white rounded-xl shadow-xl border border-slate-200 pointer-events-auto animate-in fade-in duration-200">
            <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900 text-white rounded-t-xl text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                Active Focus Inspection
              </span>
              <button
                onClick={() => setActiveMapItem(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <MarkerDetailCard
              item={activeMapItem}
              onOpenAlertDetail={onSelectAlert}
              onNavigateToInterventions={onNavigateToInterventions}
            />
          </div>
        )}
      </div>

      {/* Footer Status Bar with Geospatial & Scenario Attribution */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between text-[11px] text-slate-500 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>
            <strong>Gurugram GIS Layer:</strong> Spatial coordinate projection EPSG:4326 • Datum WGS84
          </span>
        </div>
        <div className="font-mono text-slate-400">
          GIS Layer: 35 MCG Ward Boundaries (KML) • Incident Markers: Operational Scenario
        </div>
      </div>
    </div>
  );
};

export default DistrictIntelligenceMap;
