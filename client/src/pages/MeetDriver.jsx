import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, MessageCircle, MapPin } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import useFetch from "@/hooks/useFetch";

const MeetDriver = () => {
  const { rideId } = useParams();
  const { data: rideData } = useFetch(`rides/${rideId}`);

  return (
    <main className="container max-w-md mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Meet your driver</h1>
          <p className="text-muted-foreground">Your driver is waiting at the pickup location</p>
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
              <p>{rideData?.origin?.place}</p>
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

        <div className="h-64 bg-muted rounded-lg mb-6">
          {/* Map component will be integrated here */}
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-muted-foreground">Map View</p>
          </div>
        </div>

        <Link to={`/ride/${rideId}/tracking`}>
          <Button className="w-full">Start Ride</Button>
        </Link>
      </div>
    </main>
  );
};

export default MeetDriver;