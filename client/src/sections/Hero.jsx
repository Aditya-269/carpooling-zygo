import bg from "@/assets/hero.svg"
import Search from "@/components/Search"
import { ArrowRight, Sparkles } from "lucide-react"

const Hero = () => {
  return (
    <div className="relative min-h-[90vh] flex flex-col justify-center items-center bg-gradient-to-b from-[#ebf3fa] to-background overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20">
        <img src={bg} className="h-full w-full object-cover" alt="hero background" />
      </div>
      
      <div className="container relative z-10 px-4 mx-auto text-center space-y-12">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            <span>Join thousands of happy riders today</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-primary tracking-tight">
            Your pick of rides at{" "}
            <span className="relative">
              <span className="relative z-10 text-primary/80">low prices</span>
              <span className="absolute bottom-2 left-0 w-full h-3 bg-primary/20 -rotate-1"></span>
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground">
            Find and book rides with trusted drivers. Share your journey and save money while traveling.
          </p>
        </div>

        <div className="relative w-full max-w-3xl mx-auto transform transition-all duration-300 hover:scale-[1.02]">
          <Search />
          
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <a
            href="#features"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
          >
            Learn More
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="/offer-seat"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-medium text-primary border-2 border-primary rounded-lg hover:bg-primary/10 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
          >
            Offer a Ride
          </a>
        </div>
      </div>
    </div>
  )
}

export default Hero