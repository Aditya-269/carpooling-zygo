import logo from "../assets/logo.svg"
import { Link, NavLink, useNavigate,  } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage  } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Search, PlusCircle, LogOut, User } from "lucide-react";
import LoginSignupDialog from "./LoginSignupDialog";
import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";
import axios from "axios";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import NotificationBell from "./NotificationBell";

const apiUri = import.meta.env.VITE_REACT_API_URI

const Header = () => {
  const {user, dispatch} = useContext(AuthContext)
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const handleLogout = async () => {
    try {
      const apiUrl = import.meta.env.DEV 
        ? `/api/auth/logout`
        : `${apiUri}/auth/logout`;
      
      await axios.get(apiUrl, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      dispatch({ type: 'LOGOUT' });
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
      // Still clear local state even if server request fails
      dispatch({ type: 'LOGOUT' });
      navigate("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <NavLink to="/" className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"> 
            <div className="pt-8 px-6 w-16 mb-10">
              <h3 className="font-rock-salt text-2xl text-foreground">Zygo</h3>
            </div>       
          </NavLink>
          
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink 
              to="/search" 
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <Search className="h-4 w-4" />
              Search Rides
            </NavLink>
            <NavLink 
              to="/offer-seat" 
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <PlusCircle className="h-4 w-4"/>
              Publish a Ride
            </NavLink>
          </nav>

          <div className="flex items-center gap-4">
            {mounted && (
              <div className="relative">
                <button
                  className="p-2 rounded-full border border-border bg-background hover:bg-accent transition-colors"
                  aria-label="Toggle theme"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5 text-yellow-400" />
                  ) : (
                    <Moon className="h-5 w-5 text-gray-800 dark:text-gray-200" />
                  )}
                </button>
              </div>
            )}
            {user && <NotificationBell />}
            {!user ? (
              <LoginSignupDialog />
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                  <Avatar className="h-8 w-8 border-2 border-primary/10 transition-transform hover:scale-105">
                    <AvatarImage src={user.user.profilePicture} />
                    <AvatarFallback className="select-none text-primary text-sm font-bold">
                      {user.user?.name[0]}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4"/>
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4"/>
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header