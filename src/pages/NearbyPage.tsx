import React, { useState, useMemo } from 'react';
import { Place, PlaceCategory, AppSettings } from '../types';
import { calculateDistanceMeters, AMINPUR_CENTER } from '../utils/geo';
import { formatDistance, formatNumber } from '../utils/bangla';
import {
  Compass,
  Navigation,
  MapPin,
  RefreshCw,
  LocateFixed,
  AlertCircle,
} from 'lucide-react';

interface Props {
  places: Place[];
  userCoords: { latitude: number; longitude: number } | null;
  onSelectPlace: (place: Place) => void;
  onStartRoute: (place: Place) => void;
  onRefreshLocation: () => void;
  isLocating: boolean;
  settings: AppSettings;
}

export const NearbyPage: React.FC<Props> = ({
  places,
  userCoords,
  onSelectPlace,
  onStartRoute,
  onRefreshLocation,
  isLocating,
  settings,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | 'all'>('all');

  const referenceLat = userCoords?.latitude ?? AMINPUR_CENTER[0];
  const referenceLng = userCoords?.longitude ?? AMINPUR_CENTER[1];

  const sortedNearby = useMemo(() => {
    return places
      .filter((p) => selectedCategory === 'all' || p.category === selectedCategory)
      .map((p) => {
        const dist = calculateDistanceMeters(referenceLat, referenceLng, p.latitude, p.longitude);
        return { place: p, distance: dist };
      })
      .sort((a, b) => a.distance - b.distance);
  }, [places, referenceLat, referenceLng, selectedCategory]);

  return (
    <div className="min-h-screen pt-14 pb-20 px-3 sm:px-6 max-w-4xl mx-auto space-y-4">
      {/* হেডার ও জিপিএস স্ট্যাটাস */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-600" />
              কাছাকাছি গুরুত্বপূর্ণ স্থান
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {userCoords
                ? 'আপনার বর্তমান GPS অবস্থান অনুযায়ী নিকটবর্তী স্থানসমূহ।'
                : 'আমিনপুর থানা কেন্দ্র ধরে দূরত্বের ক্রমানুসারে স্থানসমূহ দেখানো হচ্ছে।'}
            </p>
          </div>

          <button
            onClick={onRefreshLocation}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition flex-shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'খোঁজা হচ্ছে...' : 'GPS রিফ্রেশ'}</span>
          </button>
        </div>

        {!userCoords && (
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span>সঠিক দূরত্বের জন্য ব্রাউজারে লোকেশন পারমিশন দিন ও GPS চালু রাখুন।</span>
            </div>
          </div>
        )}

        {/* ক্যাটাগরি ফিল্টার */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
          {[
            { id: 'all', label: 'সকল' },
            { id: 'market', label: 'বাজার' },
            { id: 'health', label: 'স্বাস্থ্য' },
            { id: 'religious', label: 'মসজিদ' },
            { id: 'transport', label: 'ঘাট ও স্ট্যান্ড' },
            { id: 'education', label: 'শিক্ষা' },
            { id: 'emergency', label: 'জরুরি' },
            { id: 'admin', label: 'ইউনিয়ন অফিস' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`flex-shrink-0 px-3 py-1 rounded-full font-semibold transition ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* তালিকা */}
      <div className="space-y-2.5">
        {sortedNearby.map(({ place, distance }) => (
          <div
            key={place.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3 hover:border-emerald-500/40 transition"
          >
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  {place.subCategory_bn || place.category}
                </span>
                {place.union_bn && (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {place.union_bn} ইউনিয়ন
                  </span>
                )}
              </div>

              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                {place.name_bn}
              </h4>

              {place.address_bn && (
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-md">
                  {place.address_bn}
                </p>
              )}
            </div>

            <div className="text-right flex flex-col items-end gap-1.5 flex-shrink-0">
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/70 px-2.5 py-1 rounded-lg">
                {formatDistance(distance, settings.useBengaliNumerals)}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onSelectPlace(place)}
                  title="ম্যাপে দেখুন"
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition"
                >
                  <MapPin className="w-4 h-4 text-emerald-600" />
                </button>
                <button
                  onClick={() => onStartRoute(place)}
                  title="নেভিগেশন শুরু করুন"
                  className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
                >
                  <Navigation className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
