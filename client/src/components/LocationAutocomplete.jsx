import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { loadGoogleMapsScript } from '@/utils/loadGoogleMaps';

const LocationAutocomplete = ({ 
  label, 
  value, 
  onChange, 
  onPlaceSelect, 
  error,
  placeholder = 'Enter location',
  country = 'in' // Default to India, can be changed as needed
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [scriptError, setScriptError] = useState(null);
  const [mounted, setMounted] = useState(true);
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const initializeGoogleMaps = async () => {
      try {
        await loadGoogleMapsScript();
        if (!mounted) return;

        if (!window.google || !window.google.maps) {
          throw new Error('Google Maps API not loaded');
        }

        if (!inputRef.current) return;

        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['geocode'],
          componentRestrictions: { country },
          fields: ['formatted_address', 'geometry', 'name']
        });

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          
          // Safely check if place and required properties exist
          if (!place || !place.geometry || !place.geometry.location) {
            console.warn('Selected place is missing required data:', place);
            return;
          }

          const location = {
            name: place.name || place.formatted_address,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address
          };

          setSelectedPlace(location);
          setInputValue(location.name);
          onPlaceSelect(location);
        });

      } catch (error) {
        console.error('Error initializing Google Maps:', error);
        if (mounted) {
          setScriptError('Failed to load location suggestions. Please try again later.');
        }
      }
    };

    initializeGoogleMaps();

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onPlaceSelect, mounted]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (!e.target.value) {
      setSelectedPlace(null);
      onPlaceSelect(null);
    }
  };

  if (scriptError) {
    return (
      <div className="text-red-500 text-sm">
        {scriptError}
      </div>
    );
  }

  return (
    <FormItem className="flex flex-col space-y-1.5">
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div className="relative">
          <Input
            ref={inputRef}
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            required
            disabled={!mounted}
            className="w-full"
          />
          {selectedPlace && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span className="text-green-500">✓</span>
            </div>
          )}
        </div>
      </FormControl>
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  );
};

export default LocationAutocomplete; 