import React, { useState, useCallback } from 'react';
import {
  GoogleMap,
  LoadScript,
  DirectionsRenderer
} from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '500px'
};

const MapDisplay = ({ route }) => {
  const [directions, setDirections] = useState(null);

  const handleMapLoad = useCallback(() => {
    if (!route || route.length < 2) return;

    const origin = route[0];
    const destination = route[route.length - 1];
    const waypoints = route.slice(1, -1).map((point) => ({
      location: { lat: point.lat, lng: point.lng },
      stopover: true
    }));

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: destination.lat, lng: destination.lng },
        waypoints: waypoints,
        optimizeWaypoints: false,
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === 'OK') {
          setDirections(result);
        } else {
          console.error('Directions request failed due to', status);
        }
      }
    );
  }, [route]);

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={route?.[0]}
        zoom={13}
        onLoad={handleMapLoad}
      >
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapDisplay;













