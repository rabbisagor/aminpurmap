import React from 'react';
import { Layers, Map as MapIcon, Globe2, Mountain, Eye, EyeOff, X } from 'lucide-react';
import { MapLayerId, AppSettings } from '../types';

interface Props {
  activeLayer: MapLayerId;
  onLayerChange: (layer: MapLayerId) => void;
  settings: AppSettings;
  onSettingsChange: (newSettings: Partial<AppSettings>) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const LayerControl: React.FC<Props> = ({
  activeLayer,
  onLayerChange,
  settings,
  onSettingsChange,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const baseLayers: { id: MapLayerId; title_bn: string; desc_bn: string; icon: React.ComponentType<{ className?: string }> }[] = [
    {
      id: 'osm',
      title_bn: 'সাধারণ রাস্তার মানচিত্র',
      desc_bn: 'OpenStreetMap স্ট্যান্ডার্ড ভিউ',
      icon: MapIcon,
    },
    {
      id: 'satellite',
      title_bn: 'স্যাটেলাইট বা এরিয়াল স্তর',
      desc_bn: 'বাস্তব উপগ্রহ চিত্র (Esri World Imagery)',
      icon: Globe2,
    },
    {
      id: 'topo',
      title_bn: 'ভূপ্রকৃতি (টপোগ্রাফিক)',
      desc_bn: 'উচ্চতা ও প্রাকৃতিক অবয়ব (OpenTopoMap)',
      icon: Mountain,
    },
    {
      id: 'offline_vector',
      title_bn: 'অফলাইন ভেক্টর মানচিত্র',
      desc_bn: 'ইন্টারনেট ছাড়াই ১০০% কাজ করে (কোর ডেটা)',
      icon: Layers,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">মানচিত্রের স্তর নির্বাচন (Layers)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* বেস ম্যাপ অপশন */}
        <div className="mt-4 space-y-2.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            বেস মানচিত্র
          </label>
          <div className="grid grid-cols-1 gap-2">
            {baseLayers.map((layer) => {
              const Icon = layer.icon;
              const isSelected = activeLayer === layer.id;

              return (
                <button
                  key={layer.id}
                  onClick={() => onLayerChange(layer.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-left transition ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm flex items-center justify-between">
                      <span>{layer.title_bn}</span>
                      {isSelected && (
                        <span className="text-[10px] font-semibold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                          সক্রিয়
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{layer.desc_bn}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* অতিরিক্ত ভৌগোলিক ওভারলে স্তর */}
        <div className="mt-5 space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            ভৌগোলিক ওভারলে
          </label>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">ইউনিয়ন ও প্রশাসনিক সীমানা</span>
              <button
                onClick={() => onSettingsChange({ showBoundaries: !settings.showBoundaries })}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                  settings.showBoundaries
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {settings.showBoundaries ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{settings.showBoundaries ? 'দৃশ্যমান' : 'লুকানো'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">পদ্মা, যমুনা ও নদী জলাশয়</span>
              <button
                onClick={() => onSettingsChange({ showWaterways: !settings.showWaterways })}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                  settings.showWaterways
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {settings.showWaterways ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{settings.showWaterways ? 'দৃশ্যমান' : 'লুকানো'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">রাস্তার নাম ও লেবেল</span>
              <button
                onClick={() => onSettingsChange({ showRoadLabels: !settings.showRoadLabels })}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                  settings.showRoadLabels
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {settings.showRoadLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{settings.showRoadLabels ? 'দৃশ্যমান' : 'লুকানো'}</span>
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 bg-slate-800 dark:bg-slate-700 text-white rounded-xl text-xs font-bold transition hover:bg-slate-900"
        >
          সম্পন্ন
        </button>
      </div>
    </div>
  );
};
