import React, { useState, useMemo } from 'react';
import { Place, PlaceCategory, AppSettings } from '../types';
import { matchesQuery, formatDistance } from '../utils/bangla';
import { calculateDistanceMeters } from '../utils/geo';
import {
  Search,
  MapPin,
  Navigation,
  Bookmark,
  X,
  Filter,
  School,
  Hospital,
  Store,
  Building,
  Bus,
} from 'lucide-react';

interface Props {
  places: Place[];
  onSelectPlace: (place: Place) => void;
  userCoords: { latitude: number; longitude: number } | null;
  settings: AppSettings;
  onStartRoute: (place: Place) => void;
}

export const SearchPage: React.FC<Props> = ({
  places,
  onSelectPlace,
  userCoords,
  settings,
  onStartRoute,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | 'all'>('all');
  const [selectedUnion, setSelectedUnion] = useState<string>('all');

  const unions = ['জাতসাকিনী', 'মাসুন্দিয়া', 'রূপপুর', 'ঢালচর', 'সাগরকান্দি', 'রানীনগর', 'পুরান ভারেঙ্গা'];

  const filteredResults = useMemo(() => {
    return places.filter((p) => {
      // ক্যাটাগরি ফিল্টার
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      // ইউনিয়ন ফিল্টার
      if (selectedUnion !== 'all' && p.union_bn !== selectedUnion) return false;
      // পাঠ্য মিল
      if (!query.trim()) return true;
      return matchesQuery(query, p.name_bn, p.name_en, p.subCategory_bn, p.union_bn, p.address_bn, p.details_bn);
    });
  }, [places, query, selectedCategory, selectedUnion]);

  return (
    <div className="min-h-screen pt-14 pb-20 px-3 sm:px-6 max-w-4xl mx-auto space-y-4">
      {/* অনুসন্ধান হেডার */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            আমিনপুর থানা এলাকা অনুসন্ধান
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            গ্রাম, বাজার, স্কুল, কলেজ, মাদ্রাসা, মসজিদ, নদীঘাট বা ইউনিয়নের নাম লিখে খুঁজুন।
          </p>
        </div>

        {/* সার্চ ইনপুট */}
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-emerald-600 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="নাম বা স্থানের ধরন লিখুন (যেমন: মাসুন্দিয়া, কাজিরহাট, কলেজ)..."
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-emerald-600 focus:bg-white"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ফিল্টার বার */}
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1 flex-shrink-0">
              <Filter className="w-3 h-3" /> শ্রেণি:
            </span>
            {[
              { id: 'all', label: 'সকল' },
              { id: 'market', label: 'বাজার ও হাট' },
              { id: 'education', label: 'শিক্ষা' },
              { id: 'health', label: 'স্বাস্থ্য' },
              { id: 'religious', label: 'ধর্মীয়' },
              { id: 'admin', label: 'প্রশাসনিক' },
              { id: 'transport', label: 'পরিবহন' },
              { id: 'emergency', label: 'জরুরি' },
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

          {/* ইউনিয়ন ফিল্টার */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <span className="text-[11px] font-bold text-slate-400 flex-shrink-0 mr-1">
              ইউনিয়ন:
            </span>
            <button
              onClick={() => setSelectedUnion('all')}
              className={`flex-shrink-0 px-2.5 py-0.5 rounded-lg font-medium ${
                selectedUnion === 'all'
                  ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300'
              }`}
            >
              সব ইউনিয়ন
            </button>
            {unions.map((u) => (
              <button
                key={u}
                onClick={() => setSelectedUnion(u)}
                className={`flex-shrink-0 px-2.5 py-0.5 rounded-lg font-medium transition ${
                  selectedUnion === u
                    ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ফলাফল তালিকা */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>মোট পাওয়া গেছে: {filteredResults.length} টি স্থান</span>
          {selectedUnion !== 'all' && <span>ইউনিয়ন: {selectedUnion}</span>}
        </div>

        {filteredResults.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center space-y-2 border border-slate-200/80 dark:border-slate-800">
            <Search className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700 dark:text-slate-300">কোনো স্থান খুঁজে পাওয়া যায়নি</p>
            <p className="text-xs text-slate-400">
              বানান সঠিকভাবে লিখুন অথবা ফিল্টার পরিবর্তন করে দেখুন।
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredResults.map((place) => {
              let distMeters: number | null = null;
              if (userCoords) {
                distMeters = calculateDistanceMeters(
                  userCoords.latitude,
                  userCoords.longitude,
                  place.latitude,
                  place.longitude
                );
              }

              return (
                <div
                  key={place.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                          {place.subCategory_bn || place.category}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1">
                          {place.name_bn}
                        </h4>
                        {place.name_en && (
                          <p className="text-[11px] text-slate-400">{place.name_en}</p>
                        )}
                      </div>

                      {distMeters !== null && (
                        <div className="text-right flex-shrink-0">
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg block">
                            {formatDistance(distMeters, settings.useBengaliNumerals)}
                          </span>
                        </div>
                      )}
                    </div>

                    {place.address_bn && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{place.address_bn}</span>
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onSelectPlace(place)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ম্যাপে দেখুন</span>
                    </button>

                    <button
                      onClick={() => onStartRoute(place)}
                      className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>রুট</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
