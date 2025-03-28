import React from "react";
import { Button } from "@/components/ui/button";
import Container from "./layout/Container";
import { Plus, User, ShieldAlert, Home } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { Link, useNavigate } from "react-router-dom";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  onCreatePost: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onCreatePost }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };
  
  const isAdmin = user?.role === 'admin';
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg animate-slide-down">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">Unsaid</h1>
          </Link>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button 
              onClick={onCreatePost}
              className="flex items-center gap-2 button-interaction"
            >
              <Plus size={18} />
              <span>New Post</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <User size={14} />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link to="/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    Profile
                  </DropdownMenuItem>
                </Link>
                {isAdmin && (
                  <Link to="/admin">
                    <DropdownMenuItem className="cursor-pointer">
                      <div className="flex items-center gap-2 text-primary">
                        <ShieldAlert size={14} />
                        <span>Admin Dashboard</span>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuItem className="cursor-pointer">
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="cursor-pointer text-destructive font-medium hover:text-destructive/80 dark:text-red-400 dark:hover:text-red-300"
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Container>
    </header>
  );
};

// AdminNavbar component that doesn't require onCreatePost
export const AdminNavbar: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg animate-slide-down">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">Unsaid Admin</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/feed">
              <Button 
                variant="outline"
                className="flex items-center gap-2 button-interaction"
              >
                <Home size={18} />
                <span>Go to Feed</span>
              </Button>
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <User size={14} />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link to="/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    Profile
                  </DropdownMenuItem>
                </Link>
                <Link to="/feed">
                  <DropdownMenuItem className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Home size={14} />
                      <span>Feed</span>
                    </div>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="cursor-pointer text-destructive font-medium hover:text-destructive/80 dark:text-red-400 dark:hover:text-red-300"
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Navbar;
