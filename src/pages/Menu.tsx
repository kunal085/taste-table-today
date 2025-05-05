
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define a mapping for translating dish names to Indian dishes
const translateToIndianDish = (category: string, name: string) => {
  const indianDishes: Record<string, Record<string, string>> = {
    "Appetizers": {
      "Bruschetta": "Samosa",
      "Calamari": "Pakora",
      "Chicken Wings": "Chicken Tikka",
      "Shrimp Cocktail": "Paneer Tikka",
      "Spinach Artichoke Dip": "Chaat Papri",
      // Add more mappings as needed
    },
    "Main Course": {
      "Steak": "Butter Chicken",
      "Salmon": "Palak Paneer",
      "Chicken Parmesan": "Chicken Biryani",
      "Lasagna": "Lamb Rogan Josh",
      "Vegetable Stir Fry": "Vegetable Jalfrezi",
      // Add more mappings as needed
    },
    "Desserts": {
      "Cheesecake": "Gulab Jamun",
      "Chocolate Cake": "Rasgulla",
      "Apple Pie": "Kheer",
      "Tiramisu": "Jalebi",
      // Add more mappings as needed
    },
    "Drinks": {
      "Wine": "Lassi",
      "Beer": "Masala Chai ban",
      "Cocktail": "Mango Lassi",
      "Soft Drink": "Nimbu Pani",
      // Add more mappings as needed
    }
  };

  // If we have a mapping for this dish, return it, otherwise return the original name
  return indianDishes[category]?.[name] || name;
};

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchMenuItems = async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("category");

      if (!error && data) {
        // Transform menu items to have Indian dish names
        const transformedData = data.map(item => ({
          ...item,
          displayName: translateToIndianDish(item.category, item.name)
        }));
        
        setMenuItems(transformedData);
        const uniqueCategories = [...new Set(data.map(item => item.category))];
        setCategories(uniqueCategories);
      }
    };

    fetchMenuItems();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Our Menu</h1>
        {categories.map((category) => (
          <div key={category} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems
                .filter((item) => item.category === category)
                .map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <CardTitle>{item.displayName || item.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{item.description}</p>
                      <p className="text-lg font-semibold mt-2">₹{Math.round(item.price * 83)}</p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;
