import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import type { Plant } from "@shared/schema";
import CareSchedule from "@/components/care-schedule";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient } from "@/lib/queryClient";

export default function PlantDetails() {
  const { id } = useParams();

  const { data: plant, isLoading } = useQuery<Plant>({
    queryKey: [`/api/plants/${id}`],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!plant) {
    return <div>Plant not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{plant.name}</h1>
        <p className="text-muted-foreground">{plant.species}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-0">
            <img
              src={plant.image}
              alt={plant.name}
              className="w-full h-64 object-cover rounded-t-lg"
            />
          </CardContent>
        </Card>

        <CareSchedule
          plant={plant}
          onUpdate={() => {
            queryClient.invalidateQueries({ queryKey: [`/api/plants/${id}`] });
          }}
        />
      </div>

      {plant.notes && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-2">Notes</h2>
            <p className="whitespace-pre-wrap">{plant.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
