import { HandCoins, ShieldCheck, Rocket } from "lucide-react"

const Features = () => {
  const features = [
    {
      icon: <HandCoins className="h-6 w-6" />,
      title: "Save on travel costs",
      desc: "Share the cost of your journey with other passengers, significantly reducing your travel expenses compared to solo travelling.",
      stats: "Save up to 60%"
    },
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      title: "Join a trustworthy community",
      desc: "Connect with like-minded people. Meet new people who share your interest and destination through carpooling.",
      stats: "10K+ Verified Users"
    },
    {
      icon: <Rocket className="h-6 w-6" />,
      title: "Carpooling made simple",
      desc: "Find rides with ease. Search for rides that match your destination, schedule, and preference with just a few taps.",
      stats: "5min Average Booking"
    }
  ]

  return (
    <section id="features" className="py-24 bg-muted/50">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Why Choose Us
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-primary mb-4">
            Experience the Future of Travel
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the benefits of carpooling with our platform designed for convenience, safety, and community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative bg-background rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                
                <h3 className="text-xl font-semibold mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {feature.desc}
                </p>

                <div className="text-sm font-medium text-primary">
                  {feature.stats}
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features