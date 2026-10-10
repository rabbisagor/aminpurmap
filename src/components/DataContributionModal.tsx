import React, { useState } from 'react';
import { Place, PlaceCategory } from '../types';
import { X, PlusCircle, Download, Upload, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { saveCustomPlace } from '../offline/db';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onPlaceAdded: (newPlace: Place) => void;
  initialPlace?: Place | null;
  userCoords?: { latitude: number; longitude: number } | null;
}

export const DataContributionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onPlaceAdded,
  initialPlace,
  userCoords,
}) => {
  const [nameBn, setNameBn] = useState(initialPlace?.name_bn || '');
  const [nameEn, setNameEn] = useState(initialPlace?.name_en || '');
  const [category, setCategory] = useState<PlaceCategory>(initialPlace?.category || 'market');
  const [subCategory, setSubCategory] = useState(initialPlace?.subCategory_bn || '');
  const [unionBn, setUnionBn] = useState(initialPlace?.union_bn || 'জাতসাকিনী');
  const [latitude, setLatitude] = useState(
    initialPlace?.latitude?.toString() || userCoords?.latitude?.toString() || '23.9785'
  );
  const [longitude, setLongitude] = useState(
    initialPlace?.longitude?.toString() || userCoords?.longitude?.toString() || '89.6385'
  );
  const [addressBn, setAddressBn] = useState(initialPlace?.address_bn || '');
  const [detailsBn, setDetailsBn] = useState(initialPlace?.details_bn || '');
  const [phone, setPhone] = useState(initialPlace?.phone || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameBn.trim()) {
      alert('স্থানের বাংলা নাম প্রদান করুন');
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) {
      alert('সঠিক অক্ষাংশ ও দ্রাঘিমাংশ প্রদান করুন');
      return;
    }

    const newPlace: Place = {
      id: initialPlace?.id || `user-place-${Date.now()}`,
      name_bn: nameBn.trim(),
      name_en: nameEn.trim() || undefined,
      category,
      subCategory_bn: subCategory.trim() || undefined,
      union_bn: unionBn,
      latitude: lat,
      longitude: lng,
      address_bn: addressBn.trim() || undefined,
      details_bn: detailsBn.trim() || undefined,
      phone: phone.trim() || undefined,
      source: 'user_contributed',
      verified: false,
    };

    await saveCustomPlace(newPlace);
    onPlaceAdded(newPlace);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1500);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(initialPlace || {
      name_bn: nameBn,
      category,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aminpur-place-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {initialPlace ? 'স্থানের তথ্য সংশোধন' : 'নতুন স্থান যোগ করুন'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedSuccess ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
            <p className="font-bold text-slate-900 dark:text-white">স্থান সফলভাবে সংরক্ষিত হয়েছে!</p>
            <p className="text-xs text-slate-500">আপনার ডিভাইসের অফলাইন ডেটাবেসে তথ্য যুক্ত হয়েছে।</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
            {/* নোটিশ */}
            <div className="flex items-start gap-2 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 rounded-xl text-amber-900 dark:text-amber-200">
              <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                উন্মুক্ত ওপেনস্ট্রিটম্যাপ ও স্থানীয় যাচাইকরণ নীতি অনুযায়ী তথ্য প্রদান করুন। কোনো কাল্পনিক রাস্তা বা স্থান যোগ করবেন না।
              </p>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                স্থানের নাম (বাংলায়) *
              </label>
              <input
                type="text"
                required
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                placeholder="যেমন: মাসুন্দিয়া মধ্যপাড়া জামে মসজিদ"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-emerald-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  ইংরেজি নাম (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. Masundia Jame Mosque"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  শ্রেণি (Category) *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PlaceCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <option value="market">বাজার ও হাট</option>
                  <option value="religious">মসজিদ / মন্দির</option>
                  <option value="education">স্কুল / কলেজ / মাদ্রাসা</option>
                  <option value="health">হাসপাতাল / ক্লিনিক / ফার্মেসি</option>
                  <option value="transport">বাসস্ট্যান্ড / ঘাট</option>
                  <option value="admin">সরকারি ও ইউনিয়ন অফিস</option>
                  <option value="emergency">পুলিশ ও জরুরি সেবা</option>
                  <option value="bridge">সেতু ও কালভার্ট</option>
                  <option value="other">অন্যান্য গুরুত্বপূর্ণ স্থান</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  ইউনিয়ন
                </label>
                <select
                  value={unionBn}
                  onChange={(e) => setUnionBn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <option value="জাতসাকিনী">জাতসাকিনী</option>
                  <option value="মাসুন্দিয়া">মাসুন্দিয়া</option>
                  <option value="রূপপুর">রূপপুর</option>
                  <option value="ঢালচর">ঢালচর</option>
                  <option value="সাগরকান্দি">সাগরকান্দি</option>
                  <option value="রানীনগর">রানীনগর</option>
                  <option value="পুরান ভারেঙ্গা">পুরান ভারেঙ্গা</option>
                  <option value="আহমেদপুর">আহমেদপুর</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  উপ-শ্রেণি বা পরিচিতি
                </label>
                <input
                  type="text"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  placeholder="যেমন: জামে মসজিদ / ফার্মেসি"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  অক্ষাংশ (Latitude) *
                </label>
                <input
                  type="text"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  দ্রাঘিমাংশ (Longitude) *
                </label>
                <input
                  type="text"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[11px]"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                ঠিকানা ও বিবরণ
              </label>
              <textarea
                rows={2}
                value={detailsBn}
                onChange={(e) => setDetailsBn(e.target.value)}
                placeholder="স্থানের পরিচিতি, ল্যান্ডমার্ক বা বিশেষ তথ্য..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="pt-3 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleExportJson}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON ডাউনলোড</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm transition"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
