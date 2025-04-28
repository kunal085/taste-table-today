
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Calendar, Menu } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-purple-600" />
            <span className="font-semibold text-lg">Rasoi</span>
          </div>
          
          <div className="flex space-x-4 items-center">
            <Button variant="ghost" className="flex items-center space-x-2" onClick={() => navigate("/menu")}>
              <Menu className="h-4 w-4" />
              <span>Menu</span>
            </Button>
            <Button variant="ghost" className="flex items-center space-x-2" onClick={() => navigate("/bookings")}>
              <Calendar className="h-4 w-4" />
              <span>My Bookings</span>
            </Button>
            <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
