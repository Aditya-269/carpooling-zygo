import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Card } from "@/components/ui/card";
import useFetch from "@/hooks/useFetch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import axios from "axios";

const apiUri = import.meta.env.VITE_REACT_API_URI;

const Payment = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const { data: rideData, error } = useFetch(`rides/${rideId}`);
  const [isPayPalReady, setIsPayPalReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const initialOptions = {
    clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID || "test",
    currency: "USD",
    intent: "capture",
    components: "buttons",
    "disable-funding": "credit,card",
  };

  // Convert INR to USD (assuming 1 USD = 83 INR)
  const convertToUSD = (inrAmount) => {
    return (inrAmount / 83).toFixed(2);
  };

  const handlePaymentSuccess = async (details) => {
    try {
      setIsProcessing(true);
      console.log('Payment successful, saving data...');
      
      // Save payment data to backend
      const response = await axios.post(
        `${apiUri}/api/payments`,
        {
          rideId,
          amount: convertToUSD(rideData.price),
          currency: "USD"
        },
        { withCredentials: true }
      );

      console.log('Payment saved:', response.data);

      // Update ride status to completed and calculate carbon savings
      try {
        await axios.post(
          `${apiUri}/api/rides/${rideId}/complete`,
          {},
          { withCredentials: true }
        );
        console.log('Ride marked as completed and carbon savings calculated');
        
        // Navigate to complete page
        navigate(`/ride/${rideId}/complete`, { replace: true });
      } catch (error) {
        console.error('Error updating ride status:', error);
        toast.error('Payment successful but failed to update ride status');
        navigate(`/ride/${rideId}/complete`, { replace: true });
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
      navigate(`/ride/${rideId}/complete`, { replace: true });
    } finally {
      setIsProcessing(false);
    }
  };

  if (error) {
    return (
      <main className="container max-w-md mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-muted-foreground">
            Failed to load ride details. Please try again.
          </p>
        </div>
      </main>
    );
  }

  if (!process.env.REACT_APP_PAYPAL_CLIENT_ID) {
    return (
      <main className="container max-w-md mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Payment Configuration Error</h1>
          <p className="text-muted-foreground">
            PayPal client ID is not configured. Please check your environment variables.
          </p>
        </div>
      </main>
    );
  }

  const usdAmount = convertToUSD(rideData?.price || 0);

  return (
    <main className="container max-w-md mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Payment</h1>
          <p className="text-muted-foreground">Complete your ride payment</p>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Ride Fare</span>
              <div className="text-right">
                <span className="text-xl font-bold">${usdAmount}</span>
                <p className="text-sm text-muted-foreground">(₹{rideData?.price || 0})</p>
              </div>
            </div>
            
            <div className="mt-6">
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Processing payment...</span>
                </div>
              ) : (
                <PayPalScriptProvider options={initialOptions}>
                  <PayPalButtons
                    style={{ layout: "vertical" }}
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        purchase_units: [
                          {
                            amount: {
                              value: usdAmount,
                              currency_code: "USD"
                            },
                          },
                        ],
                      });
                    }}
                    onApprove={handlePaymentSuccess}
                    onError={(err) => {
                      console.error("PayPal Error:", err);
                      toast.error("Payment failed. Please try again.");
                      setIsProcessing(false);
                    }}
                    onInit={() => {
                      setIsPayPalReady(true);
                    }}
                    onCancel={() => {
                      toast.info("Payment cancelled");
                      setIsProcessing(false);
                    }}
                  />
                </PayPalScriptProvider>
              )}
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
};

export default Payment; 