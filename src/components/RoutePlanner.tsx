import React, { useState } from 'react';
import { RouteResult, TravelMode, AppSettings } from '../types';
import {
  Car,
  Bike,
  Footprints,
  Navigation,
  X,
  ArrowRight,
  Clock,
  Compass,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { formatDistance, formatDuration } from '../utils/bangla';

interface Props {
  route: RouteResult | null;
  onClose: () => void;
  onModeChange: (mode: TravelMode) => void;
  settings: AppSettings;
}

export const RoutePlanner: React.FC<Props> = ({
  route,
  onClose,
  onModeChange,
  settings,
}) => {
  const [showInstructions, setShowInstructions] = useState(false);

  if (!route) return null;

  const modes: { id: TravelMode; label_bn: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'bike', label_bn: 'বাইক', icon: Bike },
    { id: 'car', label_bn: 'গাড়ি', icon: Car },
    { id: 'bicycle', label_bn: 'সাইকেল', icon: Bike },
    { id: 'walk', label_bn: 'হাঁটা', icon: Footprints },
  ];

  return (
    <div className="fixed inset-x-0 bottom-14 z-50 p-2 sm:p-4 max-w-lg mx-auto pointer-events-none">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 pointer-events-auto transition-all animate-in fade-in slide-in-from-bottom-5">
        {/* রুট হেডার */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
              রাস্তার নেভিগেশন ও দিকনির্দেশনা
            </span>
            <div className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5 flex-wrap">
              <span>{route.source_bn}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-emerald-700 dark:text-emerald-400">{route.destination_bn}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* যান নির্বাচন */}
        <div className="mt-3 flex items-center justify-between gap-1.5 bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-xl">
          {modes.map((m) => {
            const Icon = m.icon;
            const isSelected = route.mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onModeChange(m.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{m.label_bn}</span>
              </button>
            );
          })}
        </div>

        {/* সময় ও দূরত্ব পরিসংখ্যান কার্ড */}
        <div className="mt-3 grid grid-cols-2 gap-2 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 p-3 rounded-xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">আনুমানিক সময়</p>
              <p className="text-sm font-extrabold text-emerald-900 dark:text-emerald-200">
                {formatDuration(route.duration_min, settings.useBengaliNumerals)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-600 text-white rounded-lg">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">মোট দূরত্ব</p>
              <p className="text-sm font-extrabold text-emerald-900 dark:text-emerald-200">
                {formatDistance(route.distance_km * 1000, settings.useBengaliNumerals)}
              </p>
            </div>
          </div>
        </div>

        {/* টার্ন-বাই-টার্ন বিস্তারিত নির্দেশনা ড্রয়ার বা টগল */}
        <div className="mt-3">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-full flex items-center justify-between py-1.5 px-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition"
          >
            <span>ধাপে ধাপে দিকনির্দেশনা ({route.instructions.length} টি ধাপ)</span>
            {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showInstructions && (
            <div className="mt-2 max-h-48 overflow-y-auto space-y-1.5 pr-1 border-t border-slate-100 dark:border-slate-800 pt-2 text-xs">
              {route.instructions.map((inst, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-slate-800 dark:text-slate-200 font-medium leading-tight">
                      {inst.instruction_bn}
                    </p>
                    {inst.distance_m > 0 && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        দূরত্ব: {formatDistance(inst.distance_m, settings.useBengaliNumerals)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
