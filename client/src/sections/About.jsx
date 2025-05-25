import about from "../assets/about.jpg"
import { ArrowRight, Users, Clock, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

const About = () => {
  const stats = [
    {
      icon: <Users className="h-5 w-5" />,
      value: "10K+",
      label: "Active Users"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      value: "24/7",
      label: "Support"
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      value: "98%",
      label: "Satisfaction"
    }
  ]

  return (
    <section className="py-24 overflow-hidden">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <img 
                alt="People sharing a ride" 
                src={about} 
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
            
            <div className="absolute -bottom-6 -right-6 hidden lg:block">
              <div className="bg-primary text-primary-foreground rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
                <div className="text-3xl font-bold">10K+</div>
                <div className="text-sm opacity-90">Happy Riders</div>
              </div>
            </div>

            <div className="absolute -top-6 -left-6 hidden lg:block">
              <div className="bg-background rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="flex items-center gap-2">
                      <div className="text-primary">{stat.icon}</div>
                      <div>
                        <div className="font-semibold">{stat.value}</div>
                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:pl-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              About Us
            </div>
            
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
              Make your everyday life{" "}
              <span className="relative">
                <span className="relative z-10 text-primary">smart</span>
                <span className="absolute bottom-2 left-0 w-full h-3 bg-primary/20 -rotate-1"></span>
              </span>{" "}
              &{" "}
              <span className="relative">
                <span className="relative z-10 text-primary">sustainable</span>
                <span className="absolute bottom-2 left-0 w-full h-3 bg-primary/20 -rotate-1"></span>
              </span>
            </h2>
            
            <div className="space-y-4 text-muted-foreground">
              <p className="text-lg">
                Effortlessly find and connect with fellow commuters who have similar routes or destinations. Whether it&apos;s commuting to work, attending events, or running errands.
              </p>
              <p className="text-lg">
                This platform brings together a community of travelers with a common goal: to share rides and reduce traffic congestion while enjoying the benefits of cost saving and social interaction.
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button className="h-12 px-8 group">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" className="h-12 px-8">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About