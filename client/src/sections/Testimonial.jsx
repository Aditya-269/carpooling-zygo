import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Quote, Star } from "lucide-react"

const Testimonial = () => {
  const feedback = [
    {
      desc: "RideShare made my daily commute a breeze! The app is user-friendly, and I've met some wonderful people through carpooling. Thank you RideShare for providing such a fantastic service.",
      img: "https://dummyimage.com/106x106",
      user: "John",
      prof: "UI Developer",
      rating: 5
    },
    {
      desc: "Ever since I started using RideShare, my daily commute has transformed into a seamless and enjoyable experience. The convenience and reliability of this app have truly exceeded my expectations.",
      img: "https://dummyimage.com/106x106",
      user: "Sarah",
      prof: "Backend Developer",
      rating: 5
    },
    {
      desc: "I just had to share my recent experience with RideShare because it has truly been a game-changer for me! From the easy sign-up process to the consistently reliable service.",
      img: "https://dummyimage.com/106x106",
      user: "Michael",
      prof: "Product Manager",
      rating: 5
    }
  ]

  return (
    <section className="py-24 bg-muted/30">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Testimonials
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-primary mb-4">
            What People Say About Us
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it - hear from our community of satisfied riders and drivers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {feedback.map((testimonial) => (
            <div
              key={testimonial.user}
              className="group relative bg-background rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="absolute top-6 left-6 text-primary/10 transform group-hover:scale-110 transition-transform duration-300">
                <Quote className="h-8 w-8" />
              </div>

              <div className="relative">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  {testimonial.desc}
                </p>

                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/10 transform group-hover:scale-105 transition-transform duration-300">
                    <AvatarImage src={testimonial.img} />
                    <AvatarFallback className="text-primary">
                      {testimonial.user[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                      {testimonial.user}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.prof}
                    </div>
                  </div>
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

export default Testimonial