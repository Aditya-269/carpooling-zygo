import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, MessageCircle, MapPin } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import useFetch from "@/hooks/useFetch";

const RideTracking = () => {
  const { rideId } = useParams();
  const { data: rideData } = useFetch(`rides/${rideId}`);

  return (
    <main className="container max-w-md mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">On the way</h1>
          <p className="text-muted-foreground">Track your ride in real-time</p>
        </div>

        <div className="h-96 bg-muted rounded-lg mb-6">
          {/* Map component will be integrated here */}
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-muted-foreground">Live Tracking Map</p>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="w-16 h-16">
              <AvatarImage src={rideData?.creator?.profilePicture} />
              <AvatarFallback>{rideData?.creator?.name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{rideData?.creator?.name}</h2>
              <p className="text-muted-foreground">Maruti Suzuki Swift (Black)</p>
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
            <div className="grid grid-cols-2 gap-4">
              <Button className="flex items-center justify-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Call</span>
              </Button>
              <Button variant="outline" className="flex items-center justify-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span>Message</span>
              </Button>
            </div>
          </div>
        </Card>

        <Link to={`/ride/${rideId}/payment`}>
          <Button className="w-full">Payment</Button>
        </Link>
      </div>
    </main>
  );
};

export default RideTracking;