import RideCard from '@/components/RideCard';
import Search from '@/components/Search';
import Sidebar from '@/components/Sidebar';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import useFetch from '@/hooks/useFetch';
import { MoveRight, SlidersHorizontal } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';

const SearchPage = () => {
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const date = searchParams.get('date');
  const seat = searchParams.get('seat');

  const [sortBy, setSortBy] = useState('');
  const [departureTimes, setDepartureTimes] = useState([]);

  // Only fetch if all required parameters are present
  const shouldFetch = from && to && date && seat;
  const { loading, data } = useFetch(
    shouldFetch ? `rides/find?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&seat=${encodeURIComponent(seat)}&date=${encodeURIComponent(date)}` : null
  );

  // Debug logging for departure times
  useEffect(() => {
    console.log('Selected departure times:', departureTimes);
  }, [departureTimes]);

  const filteredAndSortedRides = useMemo(() => {
    if (!data?.rides) return [];

    let filteredRides = [...data.rides];
    console.log('Total rides before filtering:', filteredRides.length);

    // Apply departure time filters
    if (departureTimes.length > 0) {
      filteredRides = filteredRides.filter(ride => {
        const departureHour = new Date(ride.startTime).getHours();
        console.log(`Ride ${ride._id} departure hour:`, departureHour);
        
        const isInSelectedTime = departureTimes.some(time => {
          let isInTime = false;
          switch (time) {
            case 'before_6':
              isInTime = departureHour < 6;
              break;
            case '6_to_12':
              isInTime = departureHour >= 6 && departureHour < 12;
              break;
            case '12_to_18':
              isInTime = departureHour >= 12 && departureHour < 18;
              break;
            default:
              isInTime = true;
          }
          console.log(`Time slot ${time} check:`, isInTime);
          return isInTime;
        });
        
        console.log(`Ride ${ride._id} included in filter:`, isInSelectedTime);
        return isInSelectedTime;
      });
      console.log('Rides after departure time filtering:', filteredRides.length);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price':
        filteredRides.sort((a, b) => a.price - b.price);
        break;
      case 'departure':
        filteredRides.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        break;
      default:
        break;
    }

    return filteredRides;
  }, [data?.rides, sortBy, departureTimes]);

  return (
    <main>
      <div className="z-10 flex justify-center items-center border-b bg-background p-8">
        <Search />
        <Dialog>
          <DialogTrigger className="md:hidden border border-lg p-2 bg-background absolute right-0">
            <SlidersHorizontal />
          </DialogTrigger>
          <DialogContent>
            <Sidebar 
              onSortChange={setSortBy}
              onDepartureTimeChange={setDepartureTimes}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="container p-0 max-w-screen-xl grid md:grid-cols-5">
        <div className="hidden md:block">
          <div className="sticky top-16">
            <Sidebar 
              onSortChange={setSortBy}
              onDepartureTimeChange={setDepartureTimes}
            />
          </div>
        </div>
        <div className="col-span-3 py-6 md:col-span-4 lg:border-l">
          <div className="container">
            {loading && (
              <>
                <Skeleton className="h-[200px] w-full my-3 p-4 rounded-xl" />
                <Skeleton className="h-[200px] w-full my-3 p-4 rounded-xl" />
              </>
            )}
            {!shouldFetch ? (
              <h3 className="text-xl font-semibold">Please enter search criteria to find rides.</h3>
            ) : data && (
              <>
                <h3>
                  {from} <MoveRight className="inline-block" /> {to}
                </h3>
                <h3>{filteredAndSortedRides.length} rides available</h3>
                {filteredAndSortedRides.length === 0 ? (
                  <h3 className='text-xl font-semibold'>No rides available based on your search criteria.</h3>
                ) : (
                  filteredAndSortedRides.map((ride) => (
                    <Link key={ride._id} to={`/ride/${ride._id}`}>
                      <RideCard details={ride} />
                    </Link>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default SearchPage;
