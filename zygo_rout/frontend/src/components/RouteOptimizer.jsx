import React, { useState } from 'react';
import { optimizeRoute } from '../api/api';
import MapDisplay from './MapDisplay';

const RouteOptimizer = () => {
  const [result, setResult] = useState(null);

  const sampleData = {
    start: { name: "Start", lat: 12.9352, lng: 77.6141 },
    locations: [
      { name: "Pickup 1", lat: 12.9369, lng: 77.6101 },
      { name: "Drop 1", lat: 12.9488, lng: 77.6186 }
    ],
    pairs: [{ pickup: "Pickup 1", drop: "Drop 1" }]
  };

  const handleOptimize = async () => {
    try {
      const res = await optimizeRoute(sampleData);
      console.log("API Response:", res.data); 
      setResult(res.data);
    } catch (err) {
      console.error("Error optimizing route:", err);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">ZYGO Route Optimizer</h1>
      <button
        onClick={handleOptimize}
        className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
      >
        Optimize Route
      </button>

      {result && (
        <>
          {Array.isArray(result.optimized_route) && (
            <>
              <h3 className="mt-6 text-lg font-semibold">Stops:</h3>
              <ul className="list-disc ml-6 mb-4">
                {result.optimized_route.map((stop, i) => (
                  <li key={i}>
                    {stop.name} ({stop.lat}, {stop.lng})
                  </li>
                ))}
              </ul>
              <MapDisplay route={result.optimized_route} />
            </>
          )}

          {Array.isArray(result.segments) && (
            <>
              <h4 className="mt-6 text-lg font-semibold">Time:</h4>
              <ul className="list-disc ml-6">
                {result.segments.map((seg, i) => (
                  <li key={i}>
                    {seg.from} ➜ {seg.to} – {seg.distance_km} km, {seg.eta_min} min
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default RouteOptimizer;
