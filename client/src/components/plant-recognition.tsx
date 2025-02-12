import { useState, useRef, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface PlantRecognitionProps {
  onSpeciesDetected: (species: string) => void;
  className?: string;
}

export default function PlantRecognition({ onSpeciesDetected, className }: PlantRecognitionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<{ className: string; probability: number }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Load the model on component mount
  useEffect(() => {
    loadModel();
  }, []);

  async function loadModel() {
    try {
      setModelLoading(true);
      const loadedModel = await mobilenet.load();
      setModel(loadedModel);
      toast({
        title: "Ready for plant recognition",
        description: "Upload a photo to identify your plant",
      });
    } catch (error) {
      console.error("Failed to load MobileNet model:", error);
      toast({
        title: "Error",
        description: "Failed to initialize plant recognition. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setModelLoading(false);
    }
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !model) return;

    setIsLoading(true);
    try {
      // Create image preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      // Create an image element for TensorFlow
      const img = new Image();
      img.src = previewUrl;
      await img.decode(); // Wait for image to load

      // Get predictions
      const results = await model.classify(img, 5); // Get top 5 predictions
      setPredictions(results);

      // Find the most likely plant prediction
      const plantPrediction = results.find(p => 
        p.className.toLowerCase().includes("plant") ||
        p.className.toLowerCase().includes("flower") ||
        p.className.toLowerCase().includes("tree")
      );

      if (plantPrediction) {
        // Clean up the class name (e.g., "pot plant, houseplant" -> "houseplant")
        const cleanedName = plantPrediction.className
          .split(",")[0]
          .replace(/(pot plant|flower|tree)/i, "")
          .trim();
        onSpeciesDetected(cleanedName);
        toast({
          title: "Plant Detected!",
          description: `Identified as: ${cleanedName}`,
        });
      } else {
        toast({
          title: "No plant detected",
          description: "Try uploading a clearer photo of your plant",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        title: "Error",
        description: "Failed to process the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset file input
      }
    }
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Plant Recognition</CardTitle>
        <CardDescription>
          Upload a photo to automatically identify your plant
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="w-full h-32 relative"
            disabled={modelLoading || isLoading}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Plant preview"
                className="absolute inset-0 w-full h-full object-cover rounded-md"
              />
            ) : (
              <div className="flex flex-col items-center gap-2">
                {modelLoading ? (
                  <>
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span>Loading recognition model...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8" />
                    <span>Upload plant photo</span>
                  </>
                )}
              </div>
            )}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
          </Button>

          {predictions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Possible matches:</h4>
              {predictions.map((prediction, index) => (
                <div key={index} className="text-sm text-muted-foreground">
                  {prediction.className} ({(prediction.probability * 100).toFixed(1)}%)
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}