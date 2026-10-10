import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { Place, RoadFeature, MapLayerId, RouteResult, AppSettings, PlaceCategory } from '../types';
import { PLACES_DATA } from '../data/placesData';
import { ROADS_DATA } from '../data/roadsData';
import { BOUNDARIES_DATA } from '../data/boundariesData';
import { WATERWAYS_DATA } from '../data/waterwaysData';
import { AMINPUR_CENTER, DEFAULT_ZOOM } from '../utils/geo';
import { matchesQuery, formatNumber } from '../utils/bangla';
import {
  Navigation2,
  Plus,
  Minus,
  Compass,
  Search,
  X,
  Layers,
  MapPin,
  CheckCircle,
} from 'lucide-react';

interface Props {
  places: Place[];
  onSelectPlace: (place: Place) => void;
  selectedPlace: Place | null;
  activeLayer: MapLayerId;
  onOpenLayers: () => void;
  userCoords: { latitude: number; longitude: number; accuracy: number | null } | null;
  onLocateUser: () => void;
  isLocating: boolean;
  activeRoute: RouteResult | null;
  settings: AppSettings;
  onCategoryFilterChange: (cat: PlaceCategory | 'all') => void;
}

// ক্যাটাগরিভিত্তিক মার্কার কালার
const CATEGORY_COLORS: Record<string, string> = {
  admin: '#2563eb',     // নীল
  education: '#059669', // সবুজ
  health: '#dc2626',    // লাল
  religious: '#d97706', // অ্যাম্বার
  market: '#ea580c',    // কমলা
  transport: '#4f46e5', // ইন্ডিগো
  emergency: '#b91c1c', // গাঢ় লাল
  bridge: '#475569',    // স্লেট
  water: '#0891b2',     // সায়ান
  other: '#7c3aed',     // পার্পল
};

function createCategoryIcon(category: PlaceCategory, nameBn: string): L.DivIcon {
  const color = CATEGORY_COLORS[category] || '#0d9488';
  return L.divIcon({
    className: 'custom-poi-marker',
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        background-color: ${color};
        color: white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        border: 2px solid white;
        cursor: pointer;
      ">
        <div style="
          width: 9px;
          height: 9px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
  });
}

export const MapPage: React.FC<Props> = ({
  places,
  onSelectPlace,
  selectedPlace,
  activeLayer,
  onOpenLayers,
  userCoords,
  onLocateUser,
  isLocating,
  activeRoute,
  settings,
  onCategoryFilterChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const roadsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const boundariesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const waterwaysLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const routeLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);

  // কুইক সার্চ স্টেট
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // ফিল্টার করা স্থান
  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      if (settings.activePoiFilter !== 'all' && p.category !== settings.activePoiFilter) {
        return false;
      }
      return true;
    });
  }, [places, settings.activePoiFilter]);

  // সার্চ সাজেশন
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return places
      .filter((p) => matchesQuery(searchQuery, p.name_bn, p.name_en, p.subCategory_bn, p.union_bn, p.address_bn))
      .slice(0, 6);
  }, [places, searchQuery]);

  // ১. লিফলেট ম্যাপ ইনিশিয়ালাইজেশন
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: AMINPUR_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: false,
      maxBounds: [
        [23.70, 89.30],
        [24.30, 89.95],
      ],
      minZoom: 11,
      maxZoom: 18,
    });

    mapRef.current = map;

    // লেয়ার গ্রুপ ইনিশিয়ালাইজেশন
    boundariesLayerGroupRef.current = L.layerGroup().addTo(map);
    waterwaysLayerGroupRef.current = L.layerGroup().addTo(map);
    roadsLayerGroupRef.current = L.layerGroup().addTo(map);
    markersLayerGroupRef.current = L.layerGroup().addTo(map);
    routeLayerGroupRef.current = L.layerGroup().addTo(map);

    // ডিফল্ট টাইল লোড
    updateTileLayer(activeLayer, map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ২. বেস টাইল লেয়ার আপডেট ফাংশন
  const updateTileLayer = (layerId: MapLayerId, mapInstance?: L.Map) => {
    const map = mapInstance || mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }

    if (layerId === 'satellite') {
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 18,
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        }
      ).addTo(map);
    } else if (layerId === 'topo') {
      tileLayerRef.current = L.tileLayer(
        'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 17,
          attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
        }
      ).addTo(map);
    } else if (layerId === 'osm') {
      tileLayerRef.current = L.tileLayer(
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }
      ).addTo(map);
    }
    // 'offline_vector' হলে বাহ্যিক কোনো টাইল ফেচ হবে না; খাঁটি ভেক্টর ডেটা রেন্ডার হবে!
  };

  useEffect(() => {
    if (mapRef.current) {
      updateTileLayer(activeLayer);
    }
  }, [activeLayer]);

  // ৩. ইউনিয়ন সীমানা রেন্ডারিং
  useEffect(() => {
    if (!mapRef.current || !boundariesLayerGroupRef.current) return;
    boundariesLayerGroupRef.current.clearLayers();

    if (!settings.showBoundaries) return;

    BOUNDARIES_DATA.forEach((b) => {
      const isThana = b.level_bn === 'থানা';
      const poly = L.polygon(b.coordinates, {
        color: isThana ? '#0d9488' : '#0284c7',
        weight: isThana ? 2.8 : 1.4,
        dashArray: isThana ? undefined : '4, 4',
        fillColor: isThana ? '#14b8a6' : '#38bdf8',
        fillOpacity: isThana ? 0.04 : 0.06,
      });

      poly.bindTooltip(`<strong>${b.name_bn}</strong>`, {
        direction: 'center',
        permanent: false,
        className: 'bg-white/90 text-slate-800 text-xs px-2 py-0.5 rounded shadow',
      });

      boundariesLayerGroupRef.current?.addLayer(poly);
    });
  }, [settings.showBoundaries]);

  // ৪. নদী ও জলাশয় রেন্ডারিং
  useEffect(() => {
    if (!mapRef.current || !waterwaysLayerGroupRef.current) return;
    waterwaysLayerGroupRef.current.clearLayers();

    if (!settings.showWaterways) return;

    WATERWAYS_DATA.forEach((w) => {
      const polyline = L.polyline(w.coordinates, {
        color: '#0284c7',
        weight: w.id === 'river-jamuna-padma' ? 8 : 4,
        opacity: 0.6,
        lineCap: 'round',
      });

      polyline.bindTooltip(`<strong>${w.name_bn}</strong>`, {
        direction: 'top',
        className: 'bg-sky-50 text-sky-900 text-[11px] font-bold px-2 py-0.5 rounded shadow',
      });

      waterwaysLayerGroupRef.current?.addLayer(polyline);
    });
  }, [settings.showWaterways]);

  // ৫. রাস্তা ও সড়ক নেটওয়ার্ক রেন্ডারিং
  useEffect(() => {
    if (!mapRef.current || !roadsLayerGroupRef.current) return;
    roadsLayerGroupRef.current.clearLayers();

    ROADS_DATA.forEach((road) => {
      let color = '#64748b';
      let weight = 3;
      let dashArray: string | undefined = undefined;

      switch (road.roadType) {
        case 'national':
          color = '#ea580c';
          weight = 5.5;
          break;
        case 'regional':
          color = '#0d9488';
          weight = 4.5;
          break;
        case 'tertiary':
          color = '#0284c7';
          weight = 3.5;
          break;
        case 'paved':
          color = '#475569';
          weight = 2.8;
          break;
        case 'unpaved':
          color = '#b45309';
          weight = 2.2;
          dashArray = '5, 5';
          break;
        case 'waterway':
          color = '#0891b2';
          weight = 3;
          dashArray = '6, 6';
          break;
        default:
          color = '#64748b';
          weight = 2;
      }

      const polyline = L.polyline(road.coordinates, {
        color,
        weight,
        opacity: 0.85,
        dashArray,
      });

      if (settings.showRoadLabels) {
        polyline.bindTooltip(
          `<div class="text-[11px] font-bold">${road.name_bn}</div><div class="text-[9px] text-slate-500">${road.surface_bn || ''}</div>`,
          {
            sticky: true,
            className: 'bg-white text-slate-800 px-2 py-1 rounded shadow-md border border-slate-200',
          }
        );
      }

      roadsLayerGroupRef.current?.addLayer(polyline);
    });
  }, [settings.showRoadLabels]);

  // ৬. মার্কার রেন্ডারিং
  useEffect(() => {
    if (!mapRef.current || !markersLayerGroupRef.current) return;
    markersLayerGroupRef.current.clearLayers();

    filteredPlaces.forEach((place) => {
      const icon = createCategoryIcon(place.category, place.name_bn);
      const marker = L.marker([place.latitude, place.longitude], { icon });

      marker.bindTooltip(place.name_bn, {
        direction: 'top',
        offset: [0, -30],
        className: 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs font-bold px-2 py-1 rounded-lg shadow-md border border-slate-200 dark:border-slate-800',
      });

      marker.on('click', () => {
        onSelectPlace(place);
      });

      markersLayerGroupRef.current?.addLayer(marker);
    });
  }, [filteredPlaces, onSelectPlace]);

  // ৭. ব্যবহারকারীর GPS মার্কার ও নির্ভুলতার বৃত্ত
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (userCoords && userCoords.latitude && userCoords.longitude) {
      const latlng: L.LatLngExpression = [userCoords.latitude, userCoords.longitude];

      if (!userMarkerRef.current) {
        const pulseIcon = L.divIcon({
          className: 'user-location-pulse-container',
          html: `
            <div class="user-location-pulse">
              <div class="user-location-pulse-dot"></div>
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        userMarkerRef.current = L.marker(latlng, { icon: pulseIcon }).addTo(map);
      } else {
        userMarkerRef.current.setLatLng(latlng);
      }

      if (userCoords.accuracy) {
        if (!userCircleRef.current) {
          userCircleRef.current = L.circle(latlng, {
            radius: Math.min(userCoords.accuracy, 300),
            color: '#0284c7',
            weight: 1.5,
            fillColor: '#38bdf8',
            fillOpacity: 0.15,
          }).addTo(map);
        } else {
          userCircleRef.current.setLatLng(latlng);
          userCircleRef.current.setRadius(Math.min(userCoords.accuracy, 300));
        }
      }
    } else {
      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
      if (userCircleRef.current) {
        map.removeLayer(userCircleRef.current);
        userCircleRef.current = null;
      }
    }
  }, [userCoords]);

  // ৮. সক্রিয় রুট পলিলাইন আঁকা
  useEffect(() => {
    if (!mapRef.current || !routeLayerGroupRef.current) return;
    routeLayerGroupRef.current.clearLayers();

    if (activeRoute && activeRoute.coordinates.length > 0) {
      const polyline = L.polyline(activeRoute.coordinates, {
        color: '#0284c7',
        weight: 6,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      });

      // শুরু এবং শেষ মার্কার
      const startPoint = activeRoute.coordinates[0];
      const endPoint = activeRoute.coordinates[activeRoute.coordinates.length - 1];

      const startIcon = L.divIcon({
        html: `<div style="background:#059669; width:14px; height:14px; border:3px solid white; border-radius:50%; box-shadow:0 0 6px rgba(0,0,0,0.5);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const endIcon = L.divIcon({
        html: `<div style="background:#dc2626; width:16px; height:16px; border:3px solid white; border-radius:50%; box-shadow:0 0 6px rgba(0,0,0,0.5);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const startMarker = L.marker(startPoint, { icon: startIcon });
      const endMarker = L.marker(endPoint, { icon: endIcon });

      routeLayerGroupRef.current.addLayer(polyline);
      routeLayerGroupRef.current.addLayer(startMarker);
      routeLayerGroupRef.current.addLayer(endMarker);

      // রুট স্ক্রিনে ফিট করা
      mapRef.current.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    }
  }, [activeRoute]);

  // নির্বাচিত স্থানে ম্যাপ প্যান
  useEffect(() => {
    if (selectedPlace && mapRef.current) {
      mapRef.current.flyTo([selectedPlace.latitude, selectedPlace.longitude], 15, {
        duration: 1.2,
      });
    }
  }, [selectedPlace]);

  // জুম ইন / আউট
  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();

  // উত্তর দিক রিসেট
  const handleResetNorth = () => {
    if (mapRef.current) {
      mapRef.current.flyTo(AMINPUR_CENTER, DEFAULT_ZOOM, { duration: 1 });
    }
  };

  const categories: { id: PlaceCategory | 'all'; label_bn: string }[] = [
    { id: 'all', label_bn: 'সব স্থান' },
    { id: 'market', label_bn: 'বাজার' },
    { id: 'education', label_bn: 'শিক্ষা' },
    { id: 'health', label_bn: 'স্বাস্থ্য' },
    { id: 'religious', label_bn: 'মসজিদ/মন্দির' },
    { id: 'admin', label_bn: 'প্রশাসন' },
    { id: 'transport', label_bn: 'ঘাট ও বাস' },
    { id: 'emergency', label_bn: 'জরুরি' },
  ];

  return (
    <div className="relative w-full h-[calc(100vh-48px-56px)] mt-12 bg-slate-100 dark:bg-slate-950 overflow-hidden select-none">
      {/* লিফলেট কন্টেইনার */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* ভাসমান সার্চ বার */}
      <div className="absolute top-3 inset-x-3 sm:inset-x-auto sm:left-4 sm:w-96 z-30">
        <div className="relative shadow-lg rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center px-3 py-2.5 gap-2">
            <Search className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="আমিনপুরের গ্রাম, বাজার, স্কুল বা রাস্তা খুঁজুন..."
              className="w-full text-xs sm:text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* সাজেশন ড্রপডাউন */}
          {isSearchOpen && searchSuggestions.length > 0 && (
            <div className="border-t border-slate-100 dark:border-slate-800 p-2 max-h-64 overflow-y-auto space-y-1">
              {searchSuggestions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectPlace(item);
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between gap-2 transition"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                        {item.name_bn}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {item.subCategory_bn || item.category} {item.union_bn ? `• ${item.union_bn}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    দেখুন
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ফিল্টার পিলস (অনুসন্ধানের নিচে) */}
        <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((c) => {
            const isActive = settings.activePoiFilter === c.id;
            return (
              <button
                key={c.id}
                onClick={() => onCategoryFilterChange(c.id)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-bold shadow-xs transition active:scale-95 ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-emerald-700/20'
                    : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-800 backdrop-blur-xs'
                }`}
              >
                {c.label_bn}
              </button>
            );
          })}
        </div>
      </div>

      {/* ডানদিকের ভাসমান নিয়ন্ত্রণ বাটন (Zoom, Compass, Location, Layers) */}
      <div className="absolute right-3 bottom-8 sm:bottom-10 z-30 flex flex-col gap-2">
        {/* বর্তমান অবস্থান বাটন */}
        <button
          onClick={onLocateUser}
          disabled={isLocating}
          title="আমার বর্তমান অবস্থান"
          aria-label="আমার বর্তমান অবস্থান দেখুন"
          className={`p-3 rounded-2xl shadow-xl border backdrop-blur-md transition active:scale-90 ${
            userCoords
              ? 'bg-sky-600 text-white border-sky-500'
              : 'bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <Navigation2
            className={`w-5 h-5 ${isLocating ? 'animate-spin' : userCoords ? 'fill-current' : ''}`}
          />
        </button>

        {/* কেন্দ্র ও উত্তর দিক নির্দেশক (কম্পাস) */}
        <button
          onClick={handleResetNorth}
          title="আমিনপুর সেন্টারে ফিরুন"
          aria-label="আমিনপুর সেন্টারে ফিরুন"
          className="p-3 rounded-2xl shadow-xl bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 backdrop-blur-md transition active:scale-90"
        >
          <Compass className="w-5 h-5 text-emerald-600" />
        </button>

        {/* স্তর টগল বাটন */}
        <button
          onClick={onOpenLayers}
          title="মানচিত্রের স্তর পরিবর্তন"
          aria-label="মানচিত্রের স্তর পরিবর্তন"
          className="p-3 rounded-2xl shadow-xl bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 backdrop-blur-md transition active:scale-90"
        >
          <Layers className="w-5 h-5 text-teal-600" />
        </button>

        {/* জুম ইন / আউট গ্রুপ */}
        <div className="flex flex-col rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
          <button
            onClick={handleZoomIn}
            title="বড় করুন"
            aria-label="বড় করুন"
            className="p-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border-b border-slate-200 dark:border-slate-800 transition active:scale-90"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomOut}
            title="ছোট করুন"
            aria-label="ছোট করুন"
            className="p-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-90"
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* কপিরাইট ও অ্যাট্রিবিউশন ফুটার (Section 4 & 11 requirement) */}
      <div className="absolute left-3 bottom-2 z-20 pointer-events-auto">
        <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5 shadow-xs">
          <span>মানচিত্রের তথ্য ©</span>
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
          >
            OpenStreetMap অবদানকারীগণ
          </a>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span>আমিনপুর থানা, পাবনা</span>
        </div>
      </div>
    </div>
  );
};
