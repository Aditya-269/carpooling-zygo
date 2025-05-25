import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import useFetch from "@/hooks/useFetch";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

const apiUri = import.meta.env.VITE_REACT_API_URI;

const RideComplete = () => {
  const { rideId } = useParams();
  const { data: rideData } = useFetch(`rides/${rideId}`);
  const [rating, setRating] = useState(0);

  const handleRating = async () => {
    try {
      await axios.post(
        `${apiUri}/rides/${rideId}/rate`,
        { rating },
        { withCredentials: true }
      );
      toast.success("Rating submitted successfully");
    } catch (err) {
      toast.error("Failed to submit rating");
      console.error(err);
    }
  };

  return (
    <main className="container max-w-md mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Thanks for riding with {rideData?.creator?.name}!</h1>
          <p className="text-muted-foreground">Hope you enjoyed your ride</p>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="text-center">
              <p className="font-medium text-lg mb-2">Total Fare</p>
              <p className="text-3xl font-bold">₹{rideData?.price}</p>
            </div>

            <div className="border-t pt-4">
              <p className="text-center font-medium mb-4">Rate your experience</p>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`p-1 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    <Star className="w-8 h-8" fill={rating >= star ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleRating}
              disabled={rating === 0}
            >
              Submit Rating
            </Button>
          </div>
        </Card>

        <Link to="/">
          <Button variant="outline" className="w-full">Back to Home</Button>
        </Link>
      </div>
    </main>
  );
};

export default RideComplete;