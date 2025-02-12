import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplets, Sun, Calendar } from "lucide-react";
import type { Plant } from "@shared/schema";

interface PlantCardProps {
  plant: Plant;
  onDelete?: () => void;
}

export default function PlantCard({ plant, onDelete }: PlantCardProps) {
  return (
    <Card className="overflow-hidden">
      <img 
        src={plant.image} 
        alt={plant.name} 
        className="h-48 w-full object-cover"
      />
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold">{plant.name}</h3>
        <p className="text-sm text-muted-foreground">{plant.species}</p>
        <div className="mt-4 flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <Droplets className="h-4 w-4 text-primary" />
            <span>{plant.wateringFrequency} days</span>
          </div>
          <div className="flex items-center space-x-1">
            <Sun className="h-4 w-4 text-primary" />
            <span>{plant.sunlight}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{plant.fertilizingFrequency} days</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button variant="outline" className="flex-1 mr-2" asChild>
          <Link href={`/plant/${plant.id}`}>View Details</Link>
        </Button>
        {onDelete && (
          <Button variant="destructive" onClick={onDelete}>
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}