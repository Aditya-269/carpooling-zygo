import { Button } from "@/components/ui/button";
import { Car, MapPin } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const RideConfirmed = () => {
  const { state } = useLocation();
  const { rideData } = state || {};

  return (
    <main className="container max-w-md mx-auto py-12 px-4">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
          <Car className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold">Booked! Your ride has been confirmed!</h1>
        <p className="text-muted-foreground">Your driver will be waiting at the pickup location.</p>
        
        <div className="w-full space-y-4 mt-6">
          <div className="flex items-center space-x-4 p-4 border rounded-lg">
            <MapPin className="w-6 h-6 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">Meet your driver at</p>
              <p className="text-muted-foreground">{rideData?.origin?.place || "Loading..."}</p>
            </div>
          </div>
        </div>

        <div className="w-full space-y-4 mt-6">
          <Link to={`/ride/${rideData?._id}/meet-driver`}>
            <Button className="w-full">Meet Driver</Button>
          </Link>
          <Link to="/">
            <Button variant="outline" className="w-full">Back to Home</Button>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default RideConfirmed;