import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Wind, Music, PawPrint, Cigarette, Car, Zap } from "lucide-react";

const RideCard = ({details}) => {
  const {creator, origin, destination, startTime, endTime, price, tags} = details;
  
  function getTime(dateTimeInput){
    const selectedDate = new Date(dateTimeInput);
    // Extract the time without seconds
    const hours = selectedDate.getHours();
    const minutes = selectedDate.getMinutes();
    // Format the time as HH:mm
    return `${hours}:${minutes}`;
  }

  const getTagIcon = (tag) => {
    switch(tag) {
      case 'AC': return <Wind className="h-3 w-3" />;
      case 'Music': return <Music className="h-3 w-3" />;
      case 'Pet Friendly': return <PawPrint className="h-3 w-3" />;
      case 'No Smoking': return <Cigarette className="h-3 w-3" />;
      case 'Ladies Only': return <Car className="h-3 w-3" />;
      case 'Express Route': return <Zap className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <div className="container border rounded-md my-3 p-4 border-radius">
      <div className="relative border-s sm:mx-5">
        <div className="mx-5 mb-6 ms-4">
          <div className="absolute -z-0 w-3 h-3 bg-accent rounded-full mt-1.5 -start-1.5"></div>
          <time className="mb-1 text-sm font-normal leading-none text-muted-foreground">{getTime(startTime)}</time>
          <h3 className="text-md md:text-lg font-semibold">{origin.place}</h3>
        </div>
        <div className="mx-5 mb-6 ms-4">
          <div className="absolute -z-0 w-3 h-3 bg-accent rounded-full mt-1.5 -start-1.5"></div>
          <time className="mb-1 text-sm font-normal leading-none text-muted-foreground">{getTime(endTime)}</time>
          <h3 className="text-md md:text-lg font-semibold">{destination.place}</h3>
        </div>
        <h1 className="absolute -z-0 text-lg md:text-2xl font-bold top-0 right-0">₹{price} </h1>
      </div>
      <div>
        <div className="inline-flex items-center">
          <span className="flex-grow flex flex-col pl-4">
            <span className="title-font font-medium">{creator.name}</span>
            {creator?.trustScore !== undefined && (
              <span className="text-sm text-muted-foreground">Trust: {creator.trustScore.toFixed(0)}</span>
            )}
          </span>
        </div>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="flex items-center gap-1">
                {getTagIcon(tag)}
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default RideCard