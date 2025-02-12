import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplet, Sun, Beaker } from "lucide-react";
import type { Plant } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface CareScheduleProps {
  plant: Plant;
  onUpdate: () => void;
}

export default function CareSchedule({ plant, onUpdate }: CareScheduleProps) {
  const { toast } = useToast();

  const handleWater = async () => {
    try {
      await apiRequest("PATCH", `/api/plants/${plant.id}`, {
        lastWatered: new Date().toISOString(),
      });
      onUpdate();
      toast({
        title: "Plant watered!",
        description: "Watering schedule has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update watering schedule.",
        variant: "destructive",
      });
    }
  };

  const handleFertilize = async () => {
    try {
      await apiRequest("PATCH", `/api/plants/${plant.id}`, {
        lastFertilized: new Date().toISOString(),
      });
      onUpdate();
      toast({
        title: "Plant fertilized!",
        description: "Fertilizing schedule has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update fertilizing schedule.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-sm font-medium">
            <Droplet className="mr-2 h-4 w-4" />
            Watering
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {formatDistanceToNow(new Date(plant.lastWatered || new Date()), { addSuffix: true })}
          </p>
          <p className="text-xs text-muted-foreground">
            Every {plant.wateringFrequency} days
          </p>
          <Button
            className="mt-4 w-full"
            size="sm"
            onClick={handleWater}
          >
            Water Now
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-sm font-medium">
            <Sun className="mr-2 h-4 w-4" />
            Sunlight
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold capitalize">{plant.sunlight}</p>
          <p className="text-xs text-muted-foreground">Required exposure</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-sm font-medium">
            <Beaker className="mr-2 h-4 w-4" />
            Fertilizing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {formatDistanceToNow(new Date(plant.lastFertilized || new Date()), { addSuffix: true })}
          </p>
          <p className="text-xs text-muted-foreground">
            Every {plant.fertilizingFrequency} days
          </p>
          <Button
            className="mt-4 w-full"
            size="sm"
            onClick={handleFertilize}
          >
            Fertilize Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}