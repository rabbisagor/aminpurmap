import { useState, useEffect, useCallback, useRef } from 'react';

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null; // meters
  heading: number | null;
  speed: number | null;
  timestamp: number | null;
  loading: boolean;
  error_bn: string | null;
  permissionGranted: boolean;
}

export function useGeolocation(autoWatch: boolean = false, highAccuracy: boolean = true) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    heading: null,
    speed: null,
    timestamp: null,
    loading: false,
    error_bn: null,
    permissionGranted: false,
  });

  const watchIdRef = useRef<number | null>(null);

  const getCurrentPosition = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error_bn: 'আপনার ব্রাউজার বা ডিভাইসে GPS অবস্থান নির্ধারণ সমর্থিত নয়।',
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error_bn: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
          timestamp: pos.timestamp,
          loading: false,
          error_bn: null,
          permissionGranted: true,
        });
      },
      (err) => {
        let errorMsg = 'অবস্থান পাওয়া যায়নি। অনুগ্রহ করে GPS চালু করুন।';
        if (err.code === err.PERMISSION_DENIED) {
          errorMsg = 'ব্রাউজারে অবস্থানের অনুমতি দেওয়া হয়নি। অনুগ্রহ করে সাইট সেটিংসে লোকেশন পারমিশন চালু করুন।';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errorMsg = 'ডিভাইসের GPS সিগন্যাল পাওয়া যাচ্ছে না। খোলা স্থানে এসে পুনরায় চেষ্টা করুন।';
        } else if (err.code === err.TIMEOUT) {
          errorMsg = 'অবস্থান প্রাপ্তির সময় শেষ হয়েছে। পুনরায় চেষ্টা করুন।';
        }

        setState((prev) => ({
          ...prev,
          loading: false,
          error_bn: errorMsg,
          permissionGranted: false,
        }));
      },
      {
        enableHighAccuracy: highAccuracy,
        timeout: 12000,
        maximumAge: 10000,
      }
    );
  }, [highAccuracy]);

  const startWatching = useCallback(() => {
    if (!('geolocation' in navigator)) return;

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setState({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
          timestamp: pos.timestamp,
          loading: false,
          error_bn: null,
          permissionGranted: true,
        });
      },
      (err) => {
        console.warn('Geolocation watch error:', err);
      },
      {
        enableHighAccuracy: highAccuracy,
        timeout: 15000,
        maximumAge: 5000,
      }
    );
  }, [highAccuracy]);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (autoWatch) {
      startWatching();
    }
    return () => {
      stopWatching();
    };
  }, [autoWatch, startWatching, stopWatching]);

  return {
    ...state,
    getCurrentPosition,
    startWatching,
    stopWatching,
  };
}
