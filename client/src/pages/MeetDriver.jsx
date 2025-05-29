import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, MessageCircle, MapPin } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import useFetch from "@/hooks/useFetch";
import GoogleMap from "@/components/GoogleMap";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import RideChat from "@/components/RideChat";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

const MeetDriver = () => {
  const { rideId } = useParams();
  const { data: rideData } = useFetch(`rides/${rideId}`);
  const [open, setOpen] = useState(false);
  const { user } = useContext(AuthContext);

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
            <div className="flex items-center justify-center mt-6">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center justify-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Message</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Chat with Driver</DialogTitle>
                  </DialogHeader>
                  <RideChat rideId={rideId} user={user} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </Card>

       

        <Link to={`/ride/${rideId}/tracking`}>
          <Button className="w-full">Start Ride</Button>
        </Link>
      </div>
    </main>
  );
};

export default MeetDriver;