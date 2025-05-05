
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define a mapping for translating dish names to Indian dishes
const translateToIndianDish = (name: string) => {
  const indianDishes: Record<string, string> = {
    // Appetizers
    "Bruschetta": "Samosa",
    "Calamari": "Pakora",
    "Chicken Wings": "Chicken Tikka",
    "Shrimp Cocktail": "Paneer Tikka",
    "Spinach Artichoke Dip": "Chaat Papri",
    // Main Course
    "Steak": "Butter Chicken",
    "Salmon": "Palak Paneer",
    "Chicken Parmesan": "Chicken Biryani",
    "Lasagna": "Lamb Rogan Josh",
    "Vegetable Stir Fry": "Vegetable Jalfrezi",
    // Desserts
    "Cheesecake": "Gulab Jamun",
    "Chocolate Cake": "Rasgulla",
    "Apple Pie": "Kheer",
    "Tiramisu": "Jalebi",
    // Drinks
    "Wine": "Lassi",
    "Beer": "Masala Chai",
    "Cocktail": "Mango Lassi",
    "Soft Drink": "Nimbu Pani",
  };

  // If we have a mapping for this dish, return it, otherwise return the original name
  return indianDishes[name] || name;
};

const Bookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        return;
      }

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          tables (
            table_number,
            capacity
          ),
          booking_items (
            quantity,
            menu_items (
              name,
              price
            )
          )
        `)
        .order("booking_date", { ascending: true });

      if (!error && data) {
        // Transform the data to include Indian dish names
        const transformedData = data.map(booking => ({
          ...booking,
          booking_items: booking.booking_items?.map(item => ({
            ...item,
            menu_items: {
              ...item.menu_items,
              displayName: translateToIndianDish(item.menu_items.name)
            }
          }))
        }));
        
        setBookings(transformedData);
      }
    };

    fetchBookings();
  }, [navigate]);

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <CardTitle>
                  Booking for Table {booking.tables.table_number}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Date: {new Date(booking.booking_date).toLocaleDateString()}</p>
                <p>Time: {booking.booking_time}</p>
                <p>Guests: {booking.guest_count}</p>
                <p>Status: {booking.status}</p>
                <p>Payment Status: {booking.payment_status}</p>
                <div className="mt-4">
                  <h4 className="font-semibold">Order Items:</h4>
                  {booking.booking_items?.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.quantity}x {item.menu_items.displayName || item.menu_items.name}</span>
                      <span>₹{Math.round(item.quantity * item.menu_items.price * 83)}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 font-semibold">
                  Total Amount: ₹{Math.round(booking.booking_amount * 83)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Bookings;
