import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import useFetch from "@/hooks/useFetch";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

const apiUri = import.meta.env.VITE_REACT_API_URI;

const RideComplete = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const { data: rideData, error, loading } = useFetch(`rides/${rideId}`);
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If there's an error loading the ride data, redirect to home
    if (error) {
      toast.error("Failed to load ride details");
      navigate('/', { replace: true });
    }
  }, [error, navigate]);

  const handleRating = async () => {
    try {
      setIsSubmitting(true);
      await axios.post(
        `${apiUri}/api/rides/${rideId}/rate`,
        { rating },
        { withCredentials: true }
      );
      toast.success("Rating submitted successfully");
      // Navigate to home after successful rating
      navigate('/', { replace: true });
    } catch (err) {
      toast.error("Failed to submit rating");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="container max-w-md mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Loading...</h1>
          <p className="text-muted-foreground">Please wait while we load your ride details...</p>
        </div>
      </main>
    );
  }

  if (!rideData) {
    return (
      <main className="container max-w-md mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Ride Not Found</h1>
          <p className="text-muted-foreground">We couldn't find the details for this ride.</p>
          <Button 
            className="mt-4" 
            onClick={() => navigate('/', { replace: true })}
          >
            Back to Home
          </Button>
        </div>
      </main>
    );
  }

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

            {rideData?.carbonSavedRide !== undefined && (
              <div className="text-center border-t pt-4">
                <p className="font-medium text-lg mb-2">CO₂ Saved</p>
                <p className="text-xl font-bold text-green-600">{(rideData.carbonSavedRide / 1000).toFixed(2)} kg</p>
              </div>
            )}

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
              disabled={rating === 0 || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </div>
        </Card>

        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate('/', { replace: true })}
        >
          Back to Home
        </Button>
      </div>
    </main>
  );
};

export default RideComplete;