
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 ease-in-out px-4 sm:px-6",
        isScrolled ? "py-3 bg-unsaid-darker/90 backdrop-blur-lg" : "py-5 bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a href="/" className="text-xl sm:text-2xl font-bold text-white flex items-center">
          <span className="text-unsaid-accent">Un</span>said
        </a>

        <nav className="hidden md:flex items-center space-x-8">
          <Button 
            className="btn-hover-effect bg-transparent border border-unsaid-accent text-white hover:bg-transparent hover:text-white hover:border-transparent"
            onClick={() => window.location.href = "http://localhost:5173/login"}
          >
            Join Us
          </Button>
        </nav>

        <button 
          className="block md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-unsaid-darker/95 backdrop-blur-lg border-t border-white/10 py-4 animate-fade-in">
          <div className="flex flex-col space-y-4 px-6">
            <Button 
              className="btn-hover-effect bg-transparent border border-unsaid-accent text-white hover:bg-transparent hover:text-white hover:border-transparent w-full justify-center"
              onClick={() => window.location.href = "http://localhost:5173/login"}
            >
              Join Us
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

const NavLink = ({ 
  href, 
  children, 
  mobile = false,
  onClick
}) => {
  return (
    <a 
      href={href} 
      className={cn(
        "text-white/80 hover:text-white transition-colors duration-200 relative group",
        mobile ? "block py-2" : ""
      )}
      onClick={onClick}
    >
      {children}
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-unsaid-accent group-hover:w-full transition-all duration-300" />
    </a>
  );
};

export default Navbar;
