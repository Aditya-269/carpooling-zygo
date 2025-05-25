import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { cn } from "@/lib/utils"
import { z } from "zod"
import { format } from "date-fns"
import { Button } from "./ui/button"
import { Calendar } from "./ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Form, FormControl, FormField, FormItem } from "./ui/form"
import { CalendarIcon, MapPin, Minus, Plus, User, Search as SearchIcon } from "lucide-react"
import { Input } from "./ui/input"
import { useSearchParams } from "react-router-dom"
import LocationAutocomplete from "./LocationAutocomplete"

const searchSchema = z.object({
  from: z.string().min(1, "Please enter a departure location"),
  to: z.string().min(1, "Please enter a destination"),
  seat: z.number().min(1).max(10),
  date: z.date(),
})

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const form = useForm({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      from: searchParams.get("from") || "",
      to: searchParams.get("to") || "",
      seat: parseInt(searchParams.get("seat")) >= 1 && parseInt(searchParams.get("seat")) <= 10 ? parseInt(searchParams.get("seat")) : 1,
      date: searchParams.get("date") ? new Date(searchParams.get("date")) : new Date()
    },
  });

  const onSubmit = async (data) => {
    // Only update search params if we have valid data
    if (data.from && data.to && data.seat && data.date) {
      const params = {
        from: data.from,
        to: data.to,
        seat: data.seat.toString(),
        date: format(data.date, "yyyy-MM-dd")
      };
      setSearchParams(params, { replace: true });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="from"
            render={({ field }) => (
              <LocationAutocomplete
                label="From"
                placeholder="Enter departure location"
                value={field.value}
                onChange={field.onChange}
                onPlaceSelect={(place) => {
                  if (place) {
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
                placeholder="Enter destination"
                value={field.value}
                onChange={field.onChange}
                onPlaceSelect={(place) => {
                  if (place) {
                    form.setValue('to', place.name || place.address);
                  }
                }}
                error={form.formState.errors.to?.message}
              />
            )}
          />

          <FormField
            control={form.control}
            name="seat"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-1.5">
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
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-1.5">
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />
        </div>
        <Button 
          type="submit" 
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <SearchIcon className="mr-2 h-4 w-4" />
          Search Rides
        </Button>
      </form>
    </Form>
  )
}

export default Search