import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "./ui/button";

const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container px-4 py-16 mx-auto">
        <div className="grid gap-10 row-gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
          <div className="pt-8 px-6 w-16 mb-10">
        <h3 className="font-rock-salt text-2xl text-black/80">Zygo</h3>
      </div>
            <div className="mt-6 lg:max-w-sm">
              <p className="text-muted-foreground">
                Share your ride with the person heading to the same destination. Experience convenience, reliability, and affordability in one seamless package. Your journey, our priority.
              </p>
              <div className="mt-6 flex items-center gap-4">
                <Button variant="outline" size="icon" className="rounded-full">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Instagram className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Facebook className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Quick Links</h2>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/search" className="text-muted-foreground hover:text-primary transition-colors">
                  Search Rides
                </a>
              </li>
              <li>
                <a href="/offer-seat" className="text-muted-foreground hover:text-primary transition-colors">
                  Offer a Ride
                </a>
              </li>
              <li>
                <a href="/profile" className="text-muted-foreground hover:text-primary transition-colors">
                  My Profile
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Contact Us</h2>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <a href="tel:8917483689" className="hover:text-primary transition-colors">
                  8917483689
                </a>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a href="mailto:zygo@gmail.com" className="hover:text-primary transition-colors">
                  zygo@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <a 
                  href="https://www.google.com/maps" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  India
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col-reverse justify-between pt-8 border-t md:flex-row md:items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} RideShare. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-6 mb-4 md:mb-0">
            <li>
              <a href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                F.A.Q
              </a>
            </li>
            <li>
              <a href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms &amp; Conditions
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer