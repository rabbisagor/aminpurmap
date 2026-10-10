import React from 'react';
import { Place, SavedPlace, AppSettings } from '../types';
import { Bookmark, MapPin, Navigation, Trash2, Calendar, FileText } from 'lucide-react';
import { formatNumber } from '../utils/bangla';

interface Props {
  savedPlaces: SavedPlace[];
  places: Place[];
  onSelectPlace: (place: Place) => void;
  onStartRoute: (place: Place) => void;
  onRemoveSaved: (id: string) => void;
  settings: AppSettings;
}

export const SavedPlacesPage: React.FC<Props> = ({
  savedPlaces,
  places,
  onSelectPlace,
  onStartRoute,
  onRemoveSaved,
  settings,
}) => {
  return (
    <div className="min-h-screen pt-14 pb-20 px-3 sm:px-6 max-w-4xl mx-auto space-y-4">
      {/* হেডার */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-1">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-emerald-600" />
          সংরক্ষিত স্থান ও বুকমার্ক
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          আপনার সংরক্ষিত প্রিয় স্থান ও ঘন ঘন যাতায়াতের ল্যান্ডমার্ক।
        </p>
      </div>

      {/* তালিকা */}
      {savedPlaces.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center space-y-3 border border-slate-200/80 dark:border-slate-800">
          <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300">এখনো কোনো স্থান সংরক্ষণ করেননি</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            ম্যাপে যেকোনো স্থান বা বাজারে ট্যাপ করে "সংরক্ষণ" বাটনে ক্লিক করলে তা এখানে জমা থাকবে।
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {savedPlaces.map((sp) => {
            const actualPlace = places.find((p) => p.id === sp.placeId) || {
              id: sp.placeId,
              name_bn: sp.name_bn,
              category: sp.category,
              latitude: sp.latitude,
              longitude: sp.longitude,
              source: 'osm' as const,
              verified: true,
            };

            const savedDateStr = new Date(sp.savedAt).toLocaleDateString('bn-BD');

            return (
              <div
                key={sp.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                      {sp.category}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {savedDateStr}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {sp.name_bn}
                  </h4>

                  {sp.note_bn && (
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>{sp.note_bn}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => onSelectPlace(actualPlace)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ম্যাপ</span>
                  </button>

                  <button
                    onClick={() => onStartRoute(actualPlace)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>রুট</span>
                  </button>

                  <button
                    onClick={() => onRemoveSaved(sp.id)}
                    title="সংরক্ষণ বাতিল করুন"
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
