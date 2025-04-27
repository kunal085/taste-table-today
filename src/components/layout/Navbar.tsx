
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function Navbar() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex">
            <Button variant="link" onClick={() => navigate("/")}>Home</Button>
            <Button variant="link" onClick={() => navigate("/menu")}>Menu</Button>
            <Button variant="link" onClick={() => navigate("/bookings")}>My Bookings</Button>
          </div>
          <Button onClick={handleSignOut}>Sign Out</Button>
        </div>
      </div>
    </nav>
  );
}
