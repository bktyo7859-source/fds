/**
 * Utility to safely load the official Google Maps JavaScript API with error handling,
 * timeout detection, and fallback support.
 */

let googleMapsPromise: Promise<typeof google.maps> | null = null;

export interface GoogleMapsLoadOptions {
  apiKey?: string;
  libraries?: string[];
}

export function loadGoogleMaps(options?: GoogleMapsLoadOptions): Promise<typeof google.maps> {
  if (typeof window !== 'undefined' && (window as any).google && (window as any).google.maps) {
    return Promise.resolve((window as any).google.maps);
  }

  const apiKey =
    options?.apiKey ||
    (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('HMX_GOOGLE_MAPS_API_KEY') : null) ||
    (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return Promise.reject(new Error('NO_API_KEY'));
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    // Check if script element already exists
    const existingScript = document.getElementById('google-maps-script') as HTMLScriptElement;
    if (existingScript) {
      if ((window as any).google?.maps) {
        resolve((window as any).google.maps);
        return;
      }
    }

    const callbackName = `__hmx_google_maps_callback_${Date.now()}`;
    (window as any)[callbackName] = () => {
      delete (window as any)[callbackName];
      if ((window as any).google?.maps) {
        resolve((window as any).google.maps);
      } else {
        reject(new Error('Google Maps object missing after callback'));
      }
    };

    // Google Maps authentication failure hook
    (window as any).gm_authFailure = () => {
      console.warn('Google Maps authentication failed (invalid key or referrer restrictions).');
      reject(new Error('AUTH_FAILURE'));
    };

    const libraries = (options?.libraries || ['places', 'marker']).join(',');
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.type = 'text/javascript';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey.trim()
    )}&libraries=${libraries}&callback=${callbackName}`;
    script.async = true;
    script.defer = true;

    // Timeout fallback after 10 seconds
    const timeoutId = setTimeout(() => {
      reject(new Error('TIMEOUT'));
    }, 10000);

    script.onerror = (err) => {
      clearTimeout(timeoutId);
      delete (window as any)[callbackName];
      reject(new Error('SCRIPT_LOAD_ERROR'));
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

export function resetGoogleMapsLoader() {
  googleMapsPromise = null;
  const script = document.getElementById('google-maps-script');
  if (script) {
    script.remove();
  }
}
