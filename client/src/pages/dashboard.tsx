import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import PlantCard from "@/components/plant-card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Search } from "lucide-react";
import type { Plant } from "@shared/schema";
import { useState } from "react";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  
  const { data: plants, isLoading, error } = useQuery<Plant[]>({
    queryKey: ["/api/plants"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/plants/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plants"] });
    },
  });

  const filteredPlants = plants?.filter(
    (plant) =>
      plant.name.toLowerCase().includes(search.toLowerCase()) ||
      plant.species.toLowerCase().includes(search.toLowerCase())
  );

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load plants</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold">My Plants</h1>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search plants..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[400px] rounded-lg" />
          ))}
        </div>
      ) : filteredPlants?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No plants found</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPlants?.map((plant) => (
            <PlantCard
              key={plant.id}
              plant={plant}
              onDelete={() => deleteMutation.mutate(plant.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
