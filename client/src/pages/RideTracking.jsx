import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, MessageCircle, MapPin } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import useFetch from "@/hooks/useFetch";
import GoogleMap from "@/components/GoogleMap";
import { useEffect, useState } from "react";
import axios from "axios";

// Assuming the optimization backend is running on a specific URL
const OPTIMIZER_API_URL = "http://localhost:5000/optimize-route"; // Replace with your actual optimization backend URL

const RideTracking = () => {
  const apiUri = import.meta.env.VITE_REACT_API_URI; // Moved inside component
  const { rideId } = useParams();
  const { data: rideData, loading: rideLoading, error: rideError } = useFetch(`rides/${rideId}`);
  const [optimizedRoute, setOptimizedRoute] = useState([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState(null);
  const [routeSegments, setRouteSegments] = useState([]); // State to store route segments

  // Fetch optimized route when rideData is available
  useEffect(() => {
    if (rideData && rideData.origin && rideData.destination) {
      setRouteLoading(true);
      setRouteError(null);

      // *** Placeholder Logic to Prepare Data for Optimizer API ***
      // You will need to adjust this based on your actual rideData structure
      const start = { name: rideData.origin.place, lat: rideData.origin.coordinates[1], lng: rideData.origin.coordinates[0] };
      const locations = [];
      const pairs = [];

      // Example: Assuming rideData.passengers is an array of passenger objects
      // where each passenger has pickupLocation and dropoffLocation with coordinates
      if (rideData.passengers && Array.isArray(rideData.passengers)) {
        rideData.passengers.forEach(passenger => {
          if (passenger.pickupLocation && passenger.pickupLocation.coordinates) {
            locations.push({ name: passenger.pickupLocation.place, lat: passenger.pickupLocation.coordinates[1], lng: passenger.pickupLocation.coordinates[0] });
            // Assuming pickup and dropoff locations are linked to a passenger implicitly by order or a passenger ID field
            if (passenger.dropoffLocation && passenger.dropoffLocation.coordinates) {
                 pairs.push({ pickup: passenger.pickupLocation.place, drop: passenger.dropoffLocation.place });
            }
          }
          if (passenger.dropoffLocation && passenger.dropoffLocation.coordinates) {
             // Add dropoff as a location to be visited as well
             locations.push({ name: passenger.dropoffLocation.place, lat: passenger.dropoffLocation.coordinates[1], lng: passenger.dropoffLocation.coordinates[0] });
          }
        });
        // Also include the final destination of the ride as a location if it's not already added as a passenger dropoff
        // This logic might need refinement based on how your rides are structured
         const finalDestination = { name: rideData.destination.place, lat: rideData.destination.coordinates[1], lng: rideData.destination.coordinates[0] };
         if (!locations.some(loc => loc.name === finalDestination.name)) {
             locations.push(finalDestination);
         }


      }
      // *** End Placeholder Logic ***

      axios.post(OPTIMIZER_API_URL, { start, locations, pairs })
        .then(res => {
          // The optimized route from the optimizer backend is an array of location objects
          // We need to convert it to an array of {lat, lng} for the GoogleMap component
          const routeCoords = res.data?.optimized_route?.map(location => ({ lat: location.lat, lng: location.lng })) || [];
          setOptimizedRoute(routeCoords);
          setRouteSegments(res.data?.segments || []); // Store the segments
        })
        .catch(err => {
          console.error("Error fetching optimized route:", err);
          setRouteError("Failed to load optimized route.");
        })
        .finally(() => {
          setRouteLoading(false);
        });
    }
  }, [rideData]); // Re-run effect when rideData changes

  // Prepare markers for the map
  const markers = [];
  if (rideData?.origin?.coordinates) {
    markers.push({ lat: rideData.origin.coordinates[1], lng: rideData.origin.coordinates[0], title: "Origin" });
  }
   if (rideData?.destination?.coordinates) {
    markers.push({ lat: rideData.destination.coordinates[1], lng: rideData.destination.coordinates[0], title: "Final Destination" });
  }
  // Add driver location marker if available in rideData (assuming a field like driverLocation)
  if (rideData?.driverLocation?.coordinates) {
     markers.push({ lat: rideData.driverLocation.coordinates[1], lng: rideData.driverLocation.coordinates[0], title: "Driver Location" });
  }
   // Add passenger pickup and dropoff markers from optimizedRoute if available
  if (optimizedRoute.length > 0 && rideData?.passengers && Array.isArray(rideData.passengers)) {
      // This part might need refinement based on how you want to represent pickup/dropoff markers
      // For simplicity, let's add markers for all points in the optimized route except the start
      optimizedRoute.slice(1).forEach(coord => {
          // Attempt to find the place name from the original rideData locations or a lookup
          // This is a simple example, a more robust solution might involve matching coords back to passenger data
          const originalLocation = rideData.passengers.find(p => 
              (p.pickupLocation?.coordinates[1] === coord.lat && p.pickupLocation?.coordinates[0] === coord.lng) ||
              (p.dropoffLocation?.coordinates[1] === coord.lat && p.dropoffLocation?.coordinates[0] === coord.lng)
          );
          let title = 'Stop';
          if(originalLocation) {
               if(originalLocation.pickupLocation?.coordinates[1] === coord.lat && originalLocation.pickupLocation?.coordinates[0] === coord.lng) {
                   title = `Pickup: ${originalLocation.pickupLocation.place}`;
               } else if (originalLocation.dropoffLocation?.coordinates[1] === coord.lat && originalLocation.dropoffLocation?.coordinates[0] === coord.lng) {
                    title = `Dropoff: ${originalLocation.dropoffLocation.place}`;
               }
          }
         // Check if a marker already exists at this location to avoid duplicates (e.g., origin/destination)
         const markerExists = markers.some(marker => marker.lat === coord.lat && marker.lng === coord.lng);
         if (!markerExists) {
             markers.push({ lat: coord.lat, lng: coord.lng, title: title });
         }
      });
  }

  if (rideLoading) {
    return <div className="text-center text-muted-foreground">Loading ride data...</div>;
  }

  if (rideError) {
    return <div className="text-center text-red-500">Error loading ride data.</div>;
  }

  return (
    <main className="container max-w-md mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">On the way</h1>
          <p className="text-muted-foreground">Track your ride in real-time</p>
        </div>

        <div className="h-96 bg-muted rounded-lg mb-6 overflow-hidden">
          {/* Google Map Integration */}
          {(markers.length > 0 || optimizedRoute.length > 0) ? (
             <GoogleMap
              markers={markers}
              routeCoords={optimizedRoute}
              zoom={10} // Adjust zoom as needed
              style={{ width: '100%', height: '100%' }}
            />
          ) : (routeLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">Optimizing route...</div>
              </div>
            ) : routeError ? (
              <div className="w-full h-full flex items-center justify-center">
                 <div className="text-center text-red-500">{routeError}</div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-muted-foreground">Map not available</p>
              </div>
            )
          )}
        </div>

        <Card className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="w-16 h-16">
              <AvatarImage src={rideData?.creator?.profilePicture} />
              <AvatarFallback>{rideData?.creator?.name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{rideData?.creator?.name}</h2>
              <p className="text-muted-foreground">{rideData?.vehicleDetails?.model}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Destination</p>
                <p className="text-muted-foreground">{rideData?.destination?.place}</p>
              </div>
            </div>
            {/* Call and Message buttons removed */}
             {/* Optional: Display ETAs or next stop information here */}
             {routeLoading && <div className="text-muted-foreground">Calculating route ETAs...</div>}
             {routeSegments.length > 0 && ( // Display if segments data is available
                 <div className="text-muted-foreground">
                     {/* Display Total Distance and Time */}
                     {routeSegments.length > 0 && (
                        <div>
                            Total Distance: {routeSegments.reduce((sum, segment) => sum + segment.distance_km, 0).toFixed(2)} km
                            <br/>
                            Estimated Total Time: {routeSegments.reduce((sum, segment) => sum + segment.eta_min, 0).toFixed(0)} min
                        </div>
                     )}
                     {/* Display details for the next segment (optional, can be expanded) */}
                     {/* If you want to show step-by-step ETAs, you'd loop through segments */}
                 </div>
             )}
          </div>
        </Card>

        <Button
          className="w-full"
          onClick={() => {
            window.location.href = `/ride/${rideId}/payment`;
          }}
        >Payment</Button>
      </div>
    </main>
  );
};

export default RideTracking;