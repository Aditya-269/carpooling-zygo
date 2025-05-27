import React, { useEffect, useRef } from 'react';
import { loadGoogleMapsScript } from '@/utils/loadGoogleMaps';

const GoogleMap = ({ markers = [], routeCoords = [], zoom = 15, className = '', style = {} }) => {
  const mapRef = useRef(null);
  const polylineRef = useRef(null);

  useEffect(() => {
    let mapInstance;
    let markerInstances = [];
    let isMounted = true;

    const initializeMap = async () => {
      try {
        await loadGoogleMapsScript();
        if (!isMounted || !window.google || !mapRef.current) return;

        // Set initial center - can be improved
        const initialCenter = markers.length > 0 ? markers[0] : (routeCoords.length > 0 ? routeCoords[0] : { lat: 0, lng: 0 });

        mapInstance = new window.google.maps.Map(mapRef.current, {
          center: initialCenter,
          zoom,
        });

        // Add markers
        markerInstances = markers.map(marker =>
          new window.google.maps.Marker({
            position: marker,
            map: mapInstance,
            title: marker.title || ''
          })
        );

        // Draw route polyline
        if (routeCoords.length > 1) {
          polylineRef.current = new window.google.maps.Polyline({
            path: routeCoords.map(coord => ({ lat: coord.lat, lng: coord.lng })),
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2,
          });
          polylineRef.current.setMap(mapInstance);

          // Optionally fit bounds to the polyline
          const bounds = new window.google.maps.LatLngBounds();
          routeCoords.forEach(coord => bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng)));
          mapInstance.fitBounds(bounds);

        } else if (markers.length > 0) {
             // If no route but markers, fit bounds to markers
            const bounds = new window.google.maps.LatLngBounds();
            markers.forEach(marker => bounds.extend(new window.google.maps.LatLng(marker.lat, marker.lng)));
            mapInstance.fitBounds(bounds);
        }


      } catch (error) {
        console.error('Error initializing Google Maps:', error);
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
      // Clean up markers and polyline
      markerInstances.forEach(marker => marker.setMap(null));
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
    };
  }, [markers, routeCoords, zoom]);

  return (
    <div
      ref={mapRef}
      className={className}
      style={{ width: '100%', height: '100%', ...style }}
    />
  );
};

export default GoogleMap; 