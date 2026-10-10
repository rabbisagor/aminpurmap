/**
 * ভৌগোলিক গণনা ও রূপান্তর ইউটিলিটি
 */

export const AMINPUR_CENTER: [number, number] = [23.9785, 89.6385]; // [Latitude, Longitude]
export const DEFAULT_ZOOM = 13;

export const AMINPUR_BOUNDS: {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} = {
  minLat: 23.900,
  maxLat: 24.060,
  minLng: 89.500,
  maxLng: 89.750,
};

/**
 * Haversine সূত্রে দুটি স্থানাঙ্কের মধ্যে সরলরেখায় দূরত্ব (মিটার)
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // পৃথিবীর ব্যাসার্ধ (মিটার)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * দুটি বিন্দুর মধ্যে দিক বা বিয়ারিং (ডিগ্রি ০-৩৬০)
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

/**
 * বিয়ারিংয়ের বাংলা কম্পাস দিক (উত্তর, দক্ষিণ, পূর্ব, পশ্চিম ইত্যাদি)
 */
export function getCompassDirectionBn(bearing: number): string {
  const directions = [
    'উত্তর',
    'উত্তর-পূর্ব',
    'পূর্ব',
    'দক্ষিণ-পূর্ব',
    'দক্ষিণ',
    'দক্ষিণ-পশ্চিম',
    'পশ্চিম',
    'উত্তর-পশ্চিম',
  ];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}

/**
 * স্থানাঙ্ক আমিনপুর এলাকার সীমানার ভেতরে কি না যাচাই
 */
export function isInAminpurRegion(lat: number, lng: number): boolean {
  return (
    lat >= AMINPUR_BOUNDS.minLat &&
    lat <= AMINPUR_BOUNDS.maxLat &&
    lng >= AMINPUR_BOUNDS.minLng &&
    lng <= AMINPUR_BOUNDS.maxLng
  );
}
