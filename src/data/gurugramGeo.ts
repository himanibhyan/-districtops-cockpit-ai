import gurugramBoundaryRaw from './gurugramBoundary.json';
import { GeoJsonObject } from 'geojson';

export interface GurugramLocationPreset {
  name: string;
  category: 'Urban Sector' | 'Sub-District' | 'Industrial Hub' | 'Healthcare Cluster';
  coordinates: [number, number]; // [lat, lng]
}

export const GURUGRAM_GEO = {
  districtName: 'Gurugram',
  state: 'Haryana',
  country: 'India',
  center: [28.4595, 77.0266] as [number, number], // [lat, lng]
  defaultZoom: 11,
  minZoom: 9,
  maxZoom: 18,
  // Approximate bounding box: [SouthWest, NorthEast]
  bounds: [
    [28.18, 76.65],
    [28.56, 77.16]
  ] as [[number, number], [number, number]],
  boundaryGeoJson: gurugramBoundaryRaw as GeoJsonObject,
  tileProviders: {
    cartoPositron: {
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    },
    osmStandard: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
      maxZoom: 19
    }
  },
  keyLocations: [
    { name: 'Sector 56 (Golf Course Extn)', category: 'Urban Sector', coordinates: [28.4232, 77.1065] },
    { name: 'Sector 14 (Old DLF)', category: 'Urban Sector', coordinates: [28.4727, 77.0425] },
    { name: 'Sector 4 / Subhash Nagar', category: 'Urban Sector', coordinates: [28.4735, 77.0152] },
    { name: 'Sohna Sub-Division', category: 'Sub-District', coordinates: [28.2477, 77.0620] },
    { name: 'Pataudi Sub-Division', category: 'Sub-District', coordinates: [28.3228, 76.7798] },
    { name: 'Manesar Industrial Township', category: 'Industrial Hub', coordinates: [28.3540, 76.9380] },
    { name: 'Civil Hospital Sector 10A', category: 'Healthcare Cluster', coordinates: [28.4560, 77.0010] }
  ] as GurugramLocationPreset[]
};
