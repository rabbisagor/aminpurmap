/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Place, MapLayerId, RouteResult, AppSettings, SavedPlace, TravelMode, PlaceCategory } from './types';
import { PLACES_DATA } from './data/placesData';
import {
  getSavedPlaces,
  savePlaceToBookmarks,
  removeSavedPlace,
  getCustomPlaces,
} from './offline/db';
import { useGeolocation } from './hooks/useGeolocation';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { calculateRoute } from './routing/routingEngine';

// Components & Pages
import { Header } from './components/Header';
import { BottomNav, ActiveTab } from './components/BottomNav';
import { MapPage } from './pages/MapPage';
import { SearchPage } from './pages/SearchPage';
import { NearbyPage } from './pages/NearbyPage';
import { OfflinePage } from './pages/OfflinePage';
import { SavedPlacesPage } from './pages/SavedPlacesPage';
import { SettingsPage } from './pages/SettingsPage';

// Modals
import { PlaceDetailsModal } from './components/PlaceDetailsModal';
import { RoutePlanner } from './components/RoutePlanner';
import { LayerControl } from './components/LayerControl';
import { DataContributionModal } from './components/DataContributionModal';

const DEFAULT_SETTINGS: AppSettings = {
  useBengaliNumerals: true,
  distanceUnit: 'km',
  autoFollowLocation: false,
  highAccuracyGps: true,
  showBoundaries: true,
  showWaterways: true,
  showRoadLabels: true,
  activePoiFilter: 'all',
  theme: 'light',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('map');
  const [places, setPlaces] = useState<Place[]>(PLACES_DATA);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // ম্যাপ স্তর ও সেটিংস
  const [activeLayer, setActiveLayer] = useState<MapLayerId>('osm');
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('aminpur_map_settings');
      if (cached) {
        try {
          return { ...DEFAULT_SETTINGS, ...JSON.parse(cached) };
        } catch {}
      }
    }
    return DEFAULT_SETTINGS;
  });

  // মোডাল ও ড্রয়ার স্টেট
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [isContributionOpen, setIsContributionOpen] = useState(false);
  const [editTargetPlace, setEditTargetPlace] = useState<Place | null>(null);

  // রাউটিং স্টেট
  const [activeRoute, setActiveRoute] = useState<RouteResult | null>(null);
  const [travelMode, setTravelMode] = useState<TravelMode>('bike');

  // ব্রাউজার অনলাইন স্ট্যাটাস ও জিওলোকেশন
  const isOnline = useOnlineStatus();
  const {
    latitude: userLat,
    longitude: userLng,
    accuracy: userAccuracy,
    loading: isLocating,
    getCurrentPosition,
    error_bn: geoError,
  } = useGeolocation(false, settings.highAccuracyGps);

  // থিম ক্লাস সিঙ্ক
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('aminpur_map_settings', JSON.stringify(settings));
  }, [settings]);

  // IndexedDB থেকে সংরক্ষিত স্থান ও কাস্টম স্থান লোড
  useEffect(() => {
    async function loadData() {
      try {
        const bookmarks = await getSavedPlaces();
        setSavedPlaces(bookmarks);

        const custom = await getCustomPlaces();
        if (custom.length > 0) {
          // ইউনিক আইডি দিয়ে মার্জ করা
          const existingIds = new Set(PLACES_DATA.map((p) => p.id));
          const newCustom = custom.filter((p) => !existingIds.has(p.id));
          setPlaces([...PLACES_DATA, ...newCustom]);
        }
      } catch (err) {
        console.warn('Failed to load storage data:', err);
      }
    }
    loadData();
  }, []);

  // সেটিংস পরিবর্তন হ্যান্ডলার
  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleToggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  // বুকমার্ক টগল
  const handleToggleSave = async (place: Place) => {
    const isAlreadySaved = savedPlaces.some((sp) => sp.placeId === place.id);
    if (isAlreadySaved) {
      const target = savedPlaces.find((sp) => sp.placeId === place.id);
      if (target) {
        await removeSavedPlace(target.id);
        setSavedPlaces((prev) => prev.filter((sp) => sp.id !== target.id));
      }
    } else {
      const newBookmark: SavedPlace = {
        id: `saved-${Date.now()}`,
        placeId: place.id,
        name_bn: place.name_bn,
        category: place.category,
        latitude: place.latitude,
        longitude: place.longitude,
        savedAt: new Date().toISOString(),
      };
      await savePlaceToBookmarks(newBookmark);
      setSavedPlaces((prev) => [newBookmark, ...prev]);
    }
  };

  const handleRemoveSaved = async (id: string) => {
    await removeSavedPlace(id);
    setSavedPlaces((prev) => prev.filter((sp) => sp.id !== id));
  };

  // রুট শুরু করা
  const handleStartRoute = async (destinationPlace: Place, mode: TravelMode = travelMode) => {
    let startLat = userLat;
    let startLng = userLng;
    let sourceName = 'আমার অবস্থান';

    // যদি ব্যবহারকারীর লোকেশন না থাকে, তবে আমিনপুর সেন্ট্রাল বাজার থেকে রুট
    if (!startLat || !startLng) {
      const defaultStart = PLACES_DATA[0]; // আমিনপুর থানা
      startLat = defaultStart.latitude;
      startLng = defaultStart.longitude;
      sourceName = defaultStart.name_bn;
    }

    try {
      const route = await calculateRoute(
        startLat,
        startLng,
        destinationPlace.latitude,
        destinationPlace.longitude,
        mode,
        sourceName,
        destinationPlace.name_bn
      );
      setActiveRoute(route);
      setActiveTab('map');
      setSelectedPlace(null);
    } catch (err: any) {
      alert(err.message || 'রুট নির্ধারণ করা সম্ভব হয়নি');
    }
  };

  const handleModeChange = async (mode: TravelMode) => {
    setTravelMode(mode);
    if (activeRoute) {
      const destCoords = activeRoute.coordinates[activeRoute.coordinates.length - 1];
      const startCoords = activeRoute.coordinates[0];
      const newRoute = await calculateRoute(
        startCoords[0],
        startCoords[1],
        destCoords[0],
        destCoords[1],
        mode,
        activeRoute.source_bn,
        activeRoute.destination_bn
      );
      setActiveRoute(newRoute);
    }
  };

  // নতুন স্থান যোগ
  const handlePlaceAdded = (newPlace: Place) => {
    setPlaces((prev) => [newPlace, ...prev]);
    setSelectedPlace(newPlace);
    setActiveTab('map');
  };

  // ক্যাশ মুছে ফেলা
  const handleClearCache = () => {
    if (window.confirm('আপনি কি ব্রাউজার ক্যাশ ও সেটিংস রিসেট করতে চান?')) {
      localStorage.removeItem('aminpur_map_settings');
      setSettings(DEFAULT_SETTINGS);
      alert('ক্যাশ সফলভাবে রিসেট করা হয়েছে!');
    }
  };

  const userCoords = userLat && userLng ? { latitude: userLat, longitude: userLng, accuracy: userAccuracy } : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* হেডার */}
      <Header
        isOnline={isOnline}
        onOpenLayers={() => setIsLayersOpen(true)}
        onOpenAddPlace={() => {
          setEditTargetPlace(null);
          setIsContributionOpen(true);
        }}
        settings={settings}
        onToggleTheme={handleToggleTheme}
      />

      {/* মূল কন্টেন্ট স্ক্রিন (ট্যাব অনুযায়ী) */}
      <main className="flex-1 w-full">
        {activeTab === 'map' && (
          <MapPage
            places={places}
            onSelectPlace={(p) => setSelectedPlace(p)}
            selectedPlace={selectedPlace}
            activeLayer={activeLayer}
            onOpenLayers={() => setIsLayersOpen(true)}
            userCoords={userCoords}
            onLocateUser={getCurrentPosition}
            isLocating={isLocating}
            activeRoute={activeRoute}
            settings={settings}
            onCategoryFilterChange={(cat) => handleUpdateSettings({ activePoiFilter: cat })}
          />
        )}

        {activeTab === 'search' && (
          <SearchPage
            places={places}
            onSelectPlace={(p) => {
              setSelectedPlace(p);
              setActiveTab('map');
            }}
            userCoords={userCoords}
            settings={settings}
            onStartRoute={handleStartRoute}
          />
        )}

        {activeTab === 'nearby' && (
          <NearbyPage
            places={places}
            userCoords={userCoords}
            onSelectPlace={(p) => {
              setSelectedPlace(p);
              setActiveTab('map');
            }}
            onStartRoute={handleStartRoute}
            onRefreshLocation={getCurrentPosition}
            isLocating={isLocating}
            settings={settings}
          />
        )}

        {activeTab === 'offline' && <OfflinePage settings={settings} />}

        {activeTab === 'saved' && (
          <SavedPlacesPage
            savedPlaces={savedPlaces}
            places={places}
            onSelectPlace={(p) => {
              setSelectedPlace(p);
              setActiveTab('map');
            }}
            onStartRoute={handleStartRoute}
            onRemoveSaved={handleRemoveSaved}
            settings={settings}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPage
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onClearCache={handleClearCache}
          />
        )}
      </main>

      {/* নির্বাচিত স্থানের বিস্তারিত পপআপ / বটম শিট */}
      <PlaceDetailsModal
        place={selectedPlace}
        onClose={() => setSelectedPlace(null)}
        userLocation={userCoords}
        isSaved={selectedPlace ? savedPlaces.some((sp) => sp.placeId === selectedPlace.id) : false}
        onToggleSave={handleToggleSave}
        onStartRoute={handleStartRoute}
        onOpenEditModal={(p) => {
          setEditTargetPlace(p);
          setIsContributionOpen(true);
        }}
        settings={settings}
      />

      {/* রাউটিং ও নেভিগেশন প্যানেল */}
      <RoutePlanner
        route={activeRoute}
        onClose={() => setActiveRoute(null)}
        onModeChange={handleModeChange}
        settings={settings}
      />

      {/* লেয়ার নির্বাচন মোডাল */}
      <LayerControl
        activeLayer={activeLayer}
        onLayerChange={(layer) => {
          setActiveLayer(layer);
          setIsLayersOpen(false);
        }}
        settings={settings}
        onSettingsChange={handleUpdateSettings}
        isOpen={isLayersOpen}
        onClose={() => setIsLayersOpen(false)}
      />

      {/* নতুন স্থান বা সংশোধন ডেটা মোডাল */}
      <DataContributionModal
        isOpen={isContributionOpen}
        onClose={() => setIsContributionOpen(false)}
        onPlaceAdded={handlePlaceAdded}
        initialPlace={editTargetPlace}
        userCoords={userCoords}
      />

      {/* নিচে ফিক্সড নেভিগেশন বার */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        savedCount={savedPlaces.length}
        isOffline={!isOnline}
      />
    </div>
  );
}
