import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios";
import { Minus, Plus } from "lucide-react";
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Toaster } from "./ui/sonner";
import { toast } from "sonner";
import LocationAutocomplete from "./LocationAutocomplete";
const apiUri = import.meta.env.VITE_REACT_API_URI

const formSchema = z.object({
  from: z.string().min(1, "Please enter a departure location"),
  to: z.string().min(1, "Please enter a destination"),
  fromCoordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional(),
  toCoordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional(),
  seat: z.number().min(1).max(10),
  price: z.number().nonnegative(),
  startTime: z.date().min(new Date()),
  endTime: z.date().min(new Date())
})

const PublishCard = () => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      from: "",
      to: "",
      fromCoordinates: undefined,
      toCoordinates: undefined,
      seat: 1,
      price: 0,
      startTime: new Date(),
      endTime: new Date(),
    },
  });

  const onSubmit = async (data) => {
    try {
      // Ensure we have coordinates for both locations
      if (!data.fromCoordinates || !data.toCoordinates) {
        toast.error("Please select valid locations from the suggestions");
        return;
      }

      // Format dates to ensure they're in the correct format
      const startTime = new Date(data.startTime);
      const endTime = new Date(data.endTime);

      // Validate dates
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        toast.error("Invalid date format");
        return;
      }

      const body = {
        availableSeats: Number(data.seat),
        origin: {
          place: data.from,
          coordinates: [data.fromCoordinates.lng, data.fromCoordinates.lat]
        },
        destination: {
          place: data.to,
          coordinates: [data.toCoordinates.lng, data.toCoordinates.lat]
        },
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        price: Number(data.price)
      };

      console.log('Sending ride data:', JSON.stringify(body, null, 2)); // Debug log

      const response = await axios.post(`${apiUri}/rides`, body, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 201 || response.status === 200) {
        toast.success("Ride created successfully!");
        form.reset();
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error) {
      console.error('Error creating ride:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to create ride. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create a Ride</CardTitle>
        <CardDescription>Publish your ride with just one click.</CardDescription>
      </CardHeader>
      <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid w-full items-center gap-4">
          <FormField
            control={form.control}
            name="from"
            render={({ field }) => (
              <LocationAutocomplete
                label="From"
                placeholder="Enter pickup location"
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  if (!value) {
                    form.setValue('fromCoordinates', undefined);
                  }
                }}
                onPlaceSelect={(place) => {
                  if (place) {
                    form.setValue('fromCoordinates', {
                      lat: place.lat,
                      lng: place.lng
                    });
                    form.setValue('from', place.name || place.address);
                  }
                }}
                error={form.formState.errors.from?.message}
              />
            )}
          />
          <FormField
            control={form.control}
            name="to"
            render={({ field }) => (
              <LocationAutocomplete
                label="To"
                placeholder="Enter drop-off location"
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  if (!value) {
                    form.setValue('toCoordinates', undefined);
                  }
                }}
                onPlaceSelect={(place) => {
                  if (place) {
                    form.setValue('toCoordinates', {
                      lat: place.lat,
                      lng: place.lng
                    });
                    form.setValue('to', place.name || place.address);
                  }
                }}
                error={form.formState.errors.to?.message}
              />
            )}
          />
          <div className="flex gap-24">
            <FormField
              control={form.control}
              name="seat"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5">
                  <FormLabel>Available seats</FormLabel>
                  <FormControl>
                    <div className="flex gap-2 items-center">
                      <Button variant="outline" size="icon" type="button" onClick={() => field.value>1 && field.onChange(field.value - 1)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span>{field.value}</span>
                      <Button variant="outline" size="icon" type="button" onClick={() => field.value<10 && field.onChange(field.value + 1)}  >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5">
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input placeholder="Price" min="0" {...field} onChange={(event) => field.onChange(Number(event.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-1.5">
                <FormLabel>Departure Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" placeholder="Departure time" {...field} 
                    value={field.value ? field.value.toISOString().slice(0, 16) : ''}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />  
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-1.5">
                <FormLabel>Arrival Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" placeholder="Arrival time" {...field} 
                    value={field.value ? field.value.toISOString().slice(0, 16) : ''}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Publish</Button>
        </form>
      </Form>
      </CardContent>
      <Toaster />
    </Card>
  )
}

export default PublishCard