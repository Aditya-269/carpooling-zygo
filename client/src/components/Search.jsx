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

const searchSchema = z.object({
  from: z.string().min(1, "Please enter a departure location"),
  to: z.string().min(1, "Please enter a destination"),
  seat: z.number().min(1).max(10),
  date: z.date(),
})

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams({from:"",to:"",seat:"",date:""})

  const form = useForm({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      from: searchParams.get("from") || "",
      to: searchParams.get("to") || "",
      seat: parseInt(searchParams.get("seat")) >= 1 && parseInt(searchParams.get("seat")) <= 10 ? parseInt(searchParams.get("seat")) : 1,
      date: searchParams.get("date") ? new Date(searchParams.get("date")) : null
    },
  });

  const onSubmit = async (data) => {
    await form.handleSubmit((formData) => {
      setSearchParams(formData, {replace: true});
    })(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="from"
            render={({ field }) => (
              <FormItem className="relative">
                <FormControl>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="From" 
                      className="pl-9 h-12 bg-background/50" 
                      {...field} 
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="to"
            render={({ field }) => (
              <FormItem className="relative">
                <FormControl>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="To" 
                      className="pl-9 h-12 bg-background/50" 
                      {...field} 
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="relative">
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button 
                        variant="outline" 
                        className={cn(
                          "w-full h-12 pl-9 text-left font-normal bg-background/50",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date().setHours(0, 0, 0, 0)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="seat"
            render={({ field }) => (
              <FormItem className="relative">
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button 
                        variant="outline" 
                        className="w-full h-12 pl-9 text-left font-normal bg-background/50"
                      >
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <span>{field.value} {field.value === 1 ? 'Passenger' : 'Passengers'}</span>
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4" align="start">
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => field.value > 1 && field.onChange(field.value - 1)}
                        disabled={field.value <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{field.value}</span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => field.value < 10 && field.onChange(field.value + 1)}
                        disabled={field.value >= 10}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
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