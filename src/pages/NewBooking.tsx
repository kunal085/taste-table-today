
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
};

type TableDetails = {
  id: string;
  table_number: number;
  capacity: number;
};

const NewBooking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const tableId = searchParams.get("table");
  
  const [tableDetails, setTableDetails] = useState<TableDetails | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState("19:00");
  const [guestCount, setGuestCount] = useState(2);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<{id: string, quantity: number}[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/");
    };

    // Fetch table details
    const fetchTableDetails = async () => {
      if (!tableId) {
        navigate("/dashboard");
        return;
      }

      const { data, error } = await supabase
        .from("tables")
        .select("*")
        .eq("id", tableId)
        .single();

      if (error || !data) {
        toast({
          title: "Error",
          description: "Could not find the selected table",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setTableDetails(data);
      setGuestCount(data.capacity > 2 ? 2 : data.capacity);
    };

    // Fetch menu items
    const fetchMenuItems = async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("category", { ascending: true });

      if (!error && data) {
        setMenuItems(data);
      }
    };

    checkAuth();
    fetchTableDetails();
    fetchMenuItems();
  }, [tableId, navigate, toast]);

  const handleItemSelection = (itemId: string, quantity: number) => {
    setSelectedItems(prev => {
      // If quantity is 0, remove the item
      if (quantity === 0) {
        return prev.filter(item => item.id !== itemId);
      }
      
      // If item exists, update quantity
      const existingItem = prev.find(item => item.id === itemId);
      if (existingItem) {
        return prev.map(item => 
          item.id === itemId ? { ...item, quantity } : item
        );
      }
      
      // If item doesn't exist, add it
      return [...prev, { id: itemId, quantity }];
    });
  };

  const calculateTotal = () => {
    let total = 0;
    selectedItems.forEach(selectedItem => {
      const menuItem = menuItems.find(item => item.id === selectedItem.id);
      if (menuItem) {
        total += menuItem.price * selectedItem.quantity;
      }
    });
    return total.toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tableDetails) return;
    
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to make a booking",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      const bookingAmount = parseFloat(calculateTotal());
      
      // Create booking
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          table_id: tableId,
          booking_date: date,
          booking_time: time,
          guest_count: guestCount,
          booking_amount: bookingAmount,
        })
        .select()
        .single();

      if (bookingError || !bookingData) {
        throw new Error(bookingError?.message || "Failed to create booking");
      }

      // Add booking items
      if (selectedItems.length > 0) {
        const bookingItems = selectedItems.map(item => ({
          booking_id: bookingData.id,
          menu_item_id: item.id,
          quantity: item.quantity,
        }));

        const { error: itemsError } = await supabase
          .from("booking_items")
          .insert(bookingItems);

        if (itemsError) {
          throw new Error(itemsError.message);
        }
      }

      toast({
        title: "Success!",
        description: "Your booking has been confirmed",
      });

      navigate("/bookings");
    } catch (error: any) {
      toast({
        title: "Booking failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Make a Reservation</h1>
        
        {tableDetails && (
          <form onSubmit={handleSubmit} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Table Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Table Number: {tableDetails.table_number}</p>
                <p>Capacity: {tableDetails.capacity} people</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Select defaultValue={time} onValueChange={setTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="17:00">5:00 PM</SelectItem>
                        <SelectItem value="17:30">5:30 PM</SelectItem>
                        <SelectItem value="18:00">6:00 PM</SelectItem>
                        <SelectItem value="18:30">6:30 PM</SelectItem>
                        <SelectItem value="19:00">7:00 PM</SelectItem>
                        <SelectItem value="19:30">7:30 PM</SelectItem>
                        <SelectItem value="20:00">8:00 PM</SelectItem>
                        <SelectItem value="20:30">8:30 PM</SelectItem>
                        <SelectItem value="21:00">9:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="guests">Number of Guests</Label>
                    <Select 
                      defaultValue={guestCount.toString()} 
                      onValueChange={(value) => setGuestCount(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select number of guests" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(tableDetails.capacity)].map((_, i) => (
                          <SelectItem key={i} value={(i + 1).toString()}>
                            {i + 1} {i === 0 ? "guest" : "guests"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Select Menu Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {menuItems.reduce((acc, item) => {
                    const category = item.category;
                    if (!acc[category]) {
                      acc[category] = [];
                    }
                    acc[category].push(item);
                    return acc;
                  }, {} as Record<string, MenuItem[]>)
                    .constructor === Object &&
                    Object.entries(
                      menuItems.reduce((acc, item) => {
                        const category = item.category;
                        if (!acc[category]) {
                          acc[category] = [];
                        }
                        acc[category].push(item);
                        return acc;
                      }, {} as Record<string, MenuItem[]>)
                    ).map(([category, items]) => (
                      <div key={category}>
                        <h3 className="text-lg font-semibold mb-2">{category}</h3>
                        <div className="space-y-3">
                          {items.map((item) => {
                            const selectedItem = selectedItems.find(
                              (selected) => selected.id === item.id
                            );
                            const quantity = selectedItem?.quantity || 0;
                            
                            return (
                              <div
                                key={item.id}
                                className="flex justify-between items-center border-b pb-2"
                              >
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-sm text-gray-600">
                                    {item.description}
                                  </p>
                                  <p>${item.price.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={quantity === 0}
                                    onClick={() => handleItemSelection(item.id, quantity - 1)}
                                  >
                                    -
                                  </Button>
                                  <span>{quantity}</span>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleItemSelection(item.id, quantity + 1)}
                                  >
                                    +
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                </div>
                
                <div className="mt-6 text-right">
                  <p className="text-xl font-bold">
                    Total: ${calculateTotal()}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/dashboard")}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating Booking..." : "Confirm Booking"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default NewBooking;
