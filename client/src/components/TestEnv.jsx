import { useEffect } from 'react';

const TestEnv = () => {
  useEffect(() => {
    console.log('Environment Variables:', {
      VITE_GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      VITE_REACT_API_URI: import.meta.env.VITE_REACT_API_URI,
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD,
    });
  }, []);

  return null;
};

export default TestEnv; 