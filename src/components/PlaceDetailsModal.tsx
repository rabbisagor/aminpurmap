import React from 'react';
import { Place, AppSettings } from '../types';
import {
  Navigation,
  Bookmark,
  BookmarkCheck,
  Share2,
  Phone,
  Globe,
  MapPin,
  Clock,
  Info,
  X,
  ExternalLink,
  Edit3,
} from 'lucide-react';
import { formatDistance, formatNumber } from '../utils/bangla';
import { calculateDistanceMeters } from '../utils/geo';

interface Props {
  place: Place | null;
  onClose: () => void;
  userLocation: { latitude: number; longitude: number } | null;
  isSaved: boolean;
  onToggleSave: (place: Place) => void;
  onStartRoute: (place: Place) => void;
  onOpenEditModal: (place: Place) => void;
  settings: AppSettings;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; label_bn: string }> = {
  admin: { bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300', text: 'প্রশাসনিক অফিস', label_bn: 'প্রশাসনিক' },
  education: { bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300', text: 'শিক্ষা প্রতিষ্ঠান', label_bn: 'শিক্ষা' },
  health: { bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300', text: 'স্বাস্থ্যসেবা', label_bn: 'স্বাস্থ্য' },
  religious: { bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300', text: 'ধর্মীয় প্রতিষ্ঠান', label_bn: 'ধর্মীয়' },
  market: { bg: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300', text: 'বাজার ও হাট', label_bn: 'বাজার' },
  transport: { bg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300', text: 'পরিবহন ও ঘাট', label_bn: 'পরিবহন' },
  emergency: { bg: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300', text: 'জরুরি সেবা', label_bn: 'জরুরি' },
  bridge: { bg: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300', text: 'সেতু ও সংযোগ', label_bn: 'সেতু' },
  water: { bg: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300', text: 'নদী ও ঘাট', label_bn: 'জলপথ' },
  other: { bg: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300', text: 'অন্যান্য স্থান', label_bn: 'স্থান' },
};

export const PlaceDetailsModal: React.FC<Props> = ({
  place,
  onClose,
  userLocation,
  isSaved,
  onToggleSave,
  onStartRoute,
  onOpenEditModal,
  settings,
}) => {
  if (!place) return null;

  const style = CATEGORY_STYLES[place.category] || CATEGORY_STYLES.other;

  let distanceFromUser: number | null = null;
  if (userLocation) {
    distanceFromUser = calculateDistanceMeters(
      userLocation.latitude,
      userLocation.longitude,
      place.latitude,
      place.longitude
    );
  }

  const handleShare = () => {
    const text = `${place.name_bn}\nআমিনপুর ম্যাপ: https://www.google.com/maps?q=${place.latitude},${place.longitude}`;
    if (navigator.share) {
      navigator.share({
        title: place.name_bn,
        text,
        url: `https://www.google.com/maps?q=${place.latitude},${place.longitude}`,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text);
      alert('স্থানের তথ্য ও লিংক ক্লিপবোর্ডে কপি হয়েছে!');
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-14 z-50 p-2 sm:p-4 max-w-lg mx-auto pointer-events-none">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 pointer-events-auto transition-all animate-in fade-in slide-in-from-bottom-6">
        {/* উপরের হেডার */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${style.bg}`}>
                {place.subCategory_bn || style.label_bn}
              </span>
              {place.union_bn && (
                <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                  {place.union_bn} ইউনিয়ন
                </span>
              )}
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
              {place.name_bn}
            </h3>
            {place.name_en && (
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {place.name_en}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* তথ্য তালিকা */}
        <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/80 pt-3">
          {place.address_bn && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{place.address_bn}</span>
            </div>
          )}

          {distanceFromUser !== null && (
            <div className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-400">
              <Navigation className="w-4 h-4 flex-shrink-0" />
              <span>
                আপনার অবস্থান থেকে দূরত্ব: <strong>{formatDistance(distanceFromUser, settings.useBengaliNumerals)}</strong>
              </span>
            </div>
          )}

          {place.details_bn && (
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">{place.details_bn}</p>
            </div>
          )}

          {place.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <a href={`tel:${place.phone}`} className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline">
                {formatNumber(place.phone, settings.useBengaliNumerals)}
              </a>
            </div>
          )}

          {place.openingHours_bn && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>{place.openingHours_bn}</span>
            </div>
          )}

          {/* স্থানাঙ্ক */}
          <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-between">
            <span>
              স্থানাঙ্ক: {formatNumber(place.latitude.toFixed(5), settings.useBengaliNumerals)},{' '}
              {formatNumber(place.longitude.toFixed(5), settings.useBengaliNumerals)}
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
              উৎস: {place.source === 'osm' ? 'OpenStreetMap' : 'স্থানীয় ডেটাসেট'}
            </span>
          </div>
        </div>

        {/* অ্যাকশন বাটনসমূহ */}
        <div className="mt-4 grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => onStartRoute(place)}
            className="col-span-2 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs shadow-sm transition"
          >
            <Navigation className="w-4 h-4" />
            <span>রুট দেখুন</span>
          </button>

          <button
            onClick={() => onToggleSave(place)}
            className={`flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl text-xs font-semibold border transition active:scale-95 ${
              isSaved
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
            }`}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4 text-amber-600" /> : <Bookmark className="w-4 h-4" />}
            <span>{isSaved ? 'সংরক্ষিত' : 'সংরক্ষণ'}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-1 py-2.5 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold transition active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>শেয়ার</span>
          </button>
        </div>
      </div>
    </div>
  );
};
