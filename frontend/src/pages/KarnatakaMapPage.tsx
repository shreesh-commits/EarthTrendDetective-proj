import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Thermometer,
  Waves,
  Droplets,
  Trees,
  CloudRain,
  Layers,
  Info
} from 'lucide-react';

import { api } from '../services/api';
import { MonitoringPoint } from '../types';
import { TrendBadge } from '../components/TrendBadge';

// Fix Leaflet marker icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored SVG pin markers with organic drop shadow
const createCustomMarker = (color: string) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `<div style="
      background-color: ${color};
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid #FAF8F2;
      box-shadow: 0 2px 6px rgba(52, 58, 50, 0.28);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

export const KarnatakaMapPage: React.FC = () => {
  const [selectedParam, setSelectedParam] = useState<string>('air_temperature');
  const [points, setPoints] = useState<MonitoringPoint[]>([]);
  const [districtsGeoJson, setDistrictsGeoJson] = useState<any>(null);
  const [selectedPoint, setSelectedPoint] = useState<MonitoringPoint | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const parameterTabs = [
    { id: 'air_temperature', label: 'Air Temperature', icon: Thermometer, color: '#C06C54' },
    { id: 'water_temperature', label: 'Water Temp (SST/LSWT)', icon: Waves, color: '#5A8F8E' },
    { id: 'water_level', label: 'Water Level (Reservoirs)', icon: Droplets, color: '#789BA6' },
    { id: 'vegetation', label: 'Vegetation (NDVI)', icon: Trees, color: '#355E3B' },
    { id: 'soil_moisture', label: 'Soil Moisture', icon: Layers, color: '#8A7155' },
    { id: 'rainfall', label: 'Rainfall (GPM/POWER)', icon: CloudRain, color: '#658296' },
  ];

  useEffect(() => {
    async function loadBoundaries() {
      try {
        const geoData = await api.getDistrictsBoundary();
        setDistrictsGeoJson(geoData);
      } catch (err) {
        console.error('Failed to load district boundaries:', err);
      }
    }
    loadBoundaries();
  }, []);

  useEffect(() => {
    async function loadPoints() {
      try {
        setLoading(true);
        const pts = await api.getMonitoringPoints(selectedParam);
        setPoints(pts);
        if (pts.length > 0) {
          setSelectedPoint(pts[0]);
        }
      } catch (err) {
        console.error('Failed to load points for parameter:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPoints();
  }, [selectedParam]);

  const activeParamMeta = parameterTabs.find((p) => p.id === selectedParam) || parameterTabs[0];

  const geoJsonStyle = {
    fillColor: '#A3B18A',
    fillOpacity: 0.18,
    color: '#355E3B',
    weight: 1.2,
    opacity: 0.85,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Parameter Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-[#E5DEC9] gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#343A32] font-serif flex items-center space-x-2">
            <MapPin className="w-6 h-6 text-[#355E3B]" />
            <span>Karnataka Environmental Observation Map</span>
          </h1>
          <p className="text-sm text-[#6B7367] mt-1">
            Geospatial visualization strictly clipped to official Karnataka administrative boundaries (30 districts).
          </p>
        </div>

        {/* Parameter Selector Pills */}
        <div className="flex flex-wrap gap-1.5 bg-[#FAF8F2] p-1.5 rounded-xl border border-[#E2DAC9]">
          {parameterTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedParam === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedParam(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isSelected
                    ? 'bg-[#355E3B] text-[#F7F5ED] font-semibold shadow-sm'
                    : 'text-[#6B7367] hover:text-[#343A32] hover:bg-[#EFECE1]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#F7F5ED]' : 'text-[#8A7155]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Map + Detail Side Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Leaflet Map Container with CARTO Voyager Clean Basemap */}
        <div className="lg:col-span-2 bg-[#FAF8F2] border border-[#E2DAC9] rounded-2xl overflow-hidden shadow-sm h-[580px] relative">
          <MapContainer
            center={[15.0, 75.8]}
            zoom={7}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            {/* Karnataka Districts Polygons */}
            {districtsGeoJson && (
              <GeoJSON
                data={districtsGeoJson}
                style={() => geoJsonStyle}
                onEachFeature={(feature, layer) => {
                  const distName = feature.properties?.district || 'Karnataka District';
                  layer.bindTooltip(distName, { sticky: true, className: 'map-tooltip' });
                }}
              />
            )}

            {/* Environmental Monitoring Points */}
            {points.map((pt) => (
              <Marker
                key={pt.id}
                position={[pt.latitude, pt.longitude]}
                icon={createCustomMarker(activeParamMeta.color)}
                eventHandlers={{
                  click: () => setSelectedPoint(pt),
                }}
              >
                <Popup>
                  <div className="p-2 space-y-1.5">
                    <p className="font-bold text-[#343A32] text-xs font-serif">{pt.name}</p>
                    <p className="text-[11px] text-[#355E3B] font-semibold">{pt.type}</p>
                    <div className="text-[11px] text-[#4A5247]">
                      <span>Value: </span>
                      <strong className="text-[#343A32]">{pt.value} {pt.unit}</strong>
                    </div>
                    <div className="text-[10px] text-[#6B7367]">
                      <span>District: </span>{pt.district}
                    </div>
                    <div className="text-[10px] text-[#6B7367]">
                      <span>Coords: </span>{pt.latitude}°N, {pt.longitude}°E
                    </div>
                    <div className="pt-1.5 text-[10px] text-[#8A7155] border-t border-[#EDE7D9]">
                      <span>Source: </span>{pt.source}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Map Overlay Badge */}
          <div className="absolute bottom-3 left-3 z-[1000] bg-[#FAF8F2]/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-[#D5CDBE] text-xs text-[#343A32] shadow-sm flex items-center space-x-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: activeParamMeta.color }}
            ></span>
            <span className="font-medium">{activeParamMeta.label} ({points.length} Stations Active)</span>
          </div>
        </div>

        {/* Selected Station / Regional Detail Card */}
        <div className="bg-[#FAF8F2] border border-[#E2DAC9] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#355E3B] uppercase tracking-wider mb-2">
              <Info className="w-4 h-4 text-[#355E3B]" />
              <span>Station Profile</span>
            </div>

            {selectedPoint ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-[#343A32] font-serif">{selectedPoint.name}</h3>
                  <p className="text-xs text-[#6B7367] mt-0.5">{selectedPoint.type}</p>
                </div>

                <div className="p-4 rounded-xl bg-[#F4EFE6] border border-[#DDD6C5] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8A7155] uppercase font-semibold">Current / Baseline Mean</span>
                    <span className="text-lg font-bold text-[#343A32]">
                      {selectedPoint.value} <span className="text-xs text-[#355E3B] font-medium">{selectedPoint.unit}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E0D8C8] text-xs">
                    <span className="text-[#6B7367]">Trend Assessment</span>
                    <TrendBadge trend={selectedPoint.trend} />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E0D8C8] text-xs">
                    <span className="text-[#6B7367]">District Boundary</span>
                    <span className="text-[#343A32] font-semibold">{selectedPoint.district}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E0D8C8] text-xs">
                    <span className="text-[#6B7367]">Agro-Climatic Zone</span>
                    <span className="text-[#343A32] font-medium">{selectedPoint.zone}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E0D8C8] text-xs">
                    <span className="text-[#6B7367]">Coordinates (WGS84)</span>
                    <span className="text-[#343A32] font-medium text-[11px]">
                      {selectedPoint.latitude}° N, {selectedPoint.longitude}° E
                    </span>
                  </div>
                </div>

                <div className="text-xs text-[#6B7367] space-y-1.5">
                  <p className="font-semibold text-[#343A32]">Data Provenance:</p>
                  <p className="text-[11px] text-[#355E3B] font-medium">{selectedPoint.source}</p>
                  <p className="text-[11px] text-[#8A7155] leading-relaxed">
                    Verified through exact point-in-polygon clipping against official Karnataka Survey of India geometry.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#6B7367]">Select any station or reservoir pin on the map to inspect its profile.</p>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[#EDE7D9] text-[11px] text-[#8A7155]">
            CRS: EPSG:4326 (WGS84) • Survey of India Karnataka Boundary Layer
          </div>
        </div>
      </div>
    </div>
  );
};
