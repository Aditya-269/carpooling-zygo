let isLoading = false;
let isLoaded = false;
let loadPromise = null;

export const loadGoogleMapsScript = () => {
  // If already loaded, return resolved promise
  if (isLoaded) {
    return Promise.resolve();
  }

  // If currently loading, return existing promise
  if (isLoading) {
    return loadPromise;
  }

  isLoading = true;
  loadPromise = new Promise((resolve, reject) => {
    // Check if script is already in the document
    if (document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
      isLoaded = true;
      isLoading = false;
      resolve();
      return;
    }

    // Debug environment variables
    console.log('Environment Variables:', {
      VITE_GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD,
    });

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      const error = new Error('Google Maps API key is not defined. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file');
      console.error('Environment Variables:', import.meta.env);
      console.error(error);
      isLoading = false;
      reject(error);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log('Google Maps script loaded successfully');
      isLoaded = true;
      isLoading = false;
      resolve();
    };

    script.onerror = (error) => {
      console.error('Failed to load Google Maps script:', error);
      isLoading = false;
      reject(new Error('Failed to load Google Maps script'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}; 