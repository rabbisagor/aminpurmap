/**
 * আমিনপুর ম্যাপ — কোর টাইপ ডেফিনিশন
 */

export type PlaceCategory =
  | 'admin'       // প্রশাসনিক ও সরকারি অফিস
  | 'education'   // স্কুল, কলেজ, মাদ্রাসা
  | 'health'      // হাসপাতাল, ক্লিনিক, ফার্মেসি
  | 'religious'   // মসজিদ, মন্দির
  | 'market'      // বাজার, হাট, শপিং
  | 'transport'   // বাসস্ট্যান্ড, ফেরিঘাট, নৌঘাট
  | 'emergency'   // পুলিশ, ফায়ার সার্ভিস
  | 'water'       // নদী, ঘাট, জলাশয়
  | 'bridge'      // ব্রিজ ও কালভার্ট
  | 'other';      // অন্যান্য স্থান

export interface Place {
  id: string;
  name_bn: string;
  name_en?: string;
  category: PlaceCategory;
  subCategory_bn?: string;
  latitude: number;
  longitude: number;
  address_bn?: string;
  union_bn?: string;
  phone?: string;
  website?: string;
  details_bn?: string;
  source: 'osm' | 'local_survey' | 'user_contributed';
  verified: boolean;
  openingHours_bn?: string;
}

export type RoadType =
  | 'national'    // জাতীয় মহাসড়ক (N5)
  | 'regional'    // আঞ্চলিক মহাসড়ক (R540)
  | 'tertiary'    // প্রধান সংযোগ সড়ক
  | 'paved'       // পাকা গ্রামীণ রাস্তা
  | 'unpaved'     // কাঁচা রাস্তা
  | 'path'        // হাঁটার পথ
  | 'waterway'    // নদী/ফেরিপথ
  | 'bridge';     // সেতু

export interface RoadFeature {
  id: string;
  name_bn: string;
  name_en?: string;
  roadType: RoadType;
  coordinates: [number, number][]; // [lat, lng][]
  surface_bn?: string;
  length_km?: number;
  description_bn?: string;
}

export interface BoundaryFeature {
  id: string;
  name_bn: string;
  level_bn: 'থানা' | 'ইউনিয়ন' | 'মৌজা' | 'গ্রাম';
  coordinates: [number, number][][]; // Polygon rings [lat, lng][]
  center: [number, number];
  area_sqkm?: number;
  unions_count?: number;
}

export interface WaterwayFeature {
  id: string;
  name_bn: string;
  type_bn: 'নদী' | 'খাল' | 'জলাশয়';
  coordinates: [number, number][];
}

export interface RouteInstruction {
  instruction_bn: string;
  distance_m: number;
  duration_s: number;
  coordinate: [number, number];
  modifier?: 'straight' | 'left' | 'right' | 'slight_left' | 'slight_right' | 'destination';
}

export interface RouteResult {
  coordinates: [number, number][];
  distance_km: number;
  duration_min: number;
  instructions: RouteInstruction[];
  source_bn: string;
  destination_bn: string;
  mode: TravelMode;
}

export type TravelMode = 'car' | 'bike' | 'bicycle' | 'walk';

export type MapLayerId = 'osm' | 'satellite' | 'topo' | 'offline_vector';

export interface AppSettings {
  useBengaliNumerals: boolean;
  distanceUnit: 'km' | 'm';
  autoFollowLocation: boolean;
  highAccuracyGps: boolean;
  showBoundaries: boolean;
  showWaterways: boolean;
  showRoadLabels: boolean;
  activePoiFilter: PlaceCategory | 'all';
  theme: 'light' | 'dark';
}

export interface SavedPlace {
  id: string;
  placeId: string;
  name_bn: string;
  category: PlaceCategory;
  latitude: number;
  longitude: number;
  savedAt: string;
  note_bn?: string;
}
