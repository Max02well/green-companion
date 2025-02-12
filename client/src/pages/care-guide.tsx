import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import type { PlantGuide } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Droplet, Sun, Beaker, Info } from "lucide-react";

const GUIDE_IMAGES = [
  "https://images.unsplash.com/photo-1676049516546-f540bcc6caed",
  "https://images.unsplash.com/photo-1501004318641-b39e6451bec6",
  "https://images.unsplash.com/photo-1483794344563-d27a8d18014e",
];

export default function CareGuide() {
  const { species } = useParams();
  const decodedSpecies = species ? decodeURIComponent(species) : "";

  const { data: guide, isLoading } = useQuery<PlantGuide>({
    queryKey: [`/api/guides/${decodedSpecies}`],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            No care guide available for {decodedSpecies}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{guide.species} Care Guide</h1>
        <p className="text-muted-foreground">
          Essential care instructions for your plant
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="relative overflow-hidden">
          <img
            src={GUIDE_IMAGES[0]}
            alt="Watering guide"
            className="absolute inset-0 w-full h-full object-cover opacity-10"
          />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <Droplet className="h-5 w-5" />
              Watering Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-sm">{guide.wateringTips}</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <img
            src={GUIDE_IMAGES[1]}
            alt="Sunlight guide"
            className="absolute inset-0 w-full h-full object-cover opacity-10"
          />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5" />
              Sunlight Needs
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-sm">{guide.sunlightNeeds}</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <img
            src={GUIDE_IMAGES[2]}
            alt="Fertilizing guide"
            className="absolute inset-0 w-full h-full object-cover opacity-10"
          />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <Beaker className="h-5 w-5" />
              Fertilizing Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-sm">{guide.fertilizingTips}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              General Care
            </CardTitle>
            <CardDescription>Additional care instructions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{guide.generalCare}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}