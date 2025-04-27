
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/");
    };

    const fetchTables = async () => {
      const { data, error } = await supabase
        .from("tables")
        .select("*")
        .order("table_number");

      if (!error && data) setTables(data);
    };

    checkAuth();
    fetchTables();
  }, [navigate]);

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Available Tables</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((table) => (
            <Card key={table.id}>
              <CardHeader>
                <CardTitle>Table {table.table_number}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Capacity: {table.capacity} people</p>
                <Button 
                  className="w-full mt-4"
                  onClick={() => navigate(`/bookings/new?table=${table.id}`)}
                >
                  Book Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
