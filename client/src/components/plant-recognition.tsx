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
import { apiRequest } from "@/lib/queryClient";

interface PlantRecognitionProps {
  onSpeciesDetected: (species: string) => void;
  onImageDetected?: (imageUrl: string) => void;
  onCareInfoDetected?: (careInfo: {
    wateringFrequency: number;
    sunlight: "low" | "medium" | "high";
    fertilizingFrequency: number;
    notes: string;
  }) => void;
  className?: string;
}

export default function PlantRecognition({
  onSpeciesDetected,
  onCareInfoDetected,
  className
}: PlantRecognitionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<{ className: string; probability: number }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function initTensorFlow() {
      try {
        setModelLoading(true);
        await tf.ready();
        const loadedModel = await mobilenet.load();
        setModel(loadedModel);
        toast({
          title: "Ready for plant recognition",
          description: "Upload a photo to identify your plant",
        });
      } catch (error) {
        console.error("Failed to initialize TensorFlow or load model:", error);
        toast({
          title: "Error",
          description: "Failed to initialize plant recognition",
          variant: "destructive",
        });
      } finally {
        setModelLoading(false);
      }
    }

    initTensorFlow();
  }, []);

  function cleanSpeciesName(name: string): string {
    return name
      .replace(/^(common|wild|garden|indoor|outdoor|potted|flowering|decorative)\s+/i, '')
      .replace(/(plant|flower|tree|shrub|vine|grass)$/i, '')
      .split(',')[0]
      .split(' or ')[0]
      .trim();
  }

  async function analyzeWithOpenAI(imageData: string) {
    try {
      const response = await apiRequest("POST", "/api/analyze-plant", { image: imageData });
      const data = await response.json();

      if (data.careInfo && onCareInfoDetected) {
        console.log("Received care info:", data.careInfo); // Debug log
        onCareInfoDetected({
          wateringFrequency: Number(data.careInfo.wateringFrequency) || 7,
          sunlight: data.careInfo.sunlight as "low" | "medium" | "high",
          fertilizingFrequency: Number(data.careInfo.fertilizingFrequency) || 30,
          notes: data.careInfo.notes || "Water when top soil feels dry. Provide indirect light."
        });
      }

      return data.species;
    } catch (error) {
      console.error("OpenAI analysis error:", error);
      return null;
    }
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !model) return;

    setIsLoading(true);
    setPredictions([]);

    try {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      if (onImageDetected) {
        onImageDetected(previewUrl);
      }

      const reader = new FileReader();
      const imageData = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = previewUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const results = await model.classify(img, 10);
      setPredictions(results);

      const bestPrediction = results[0];
      //Always use OpenAI for plant identification
      const openAIResult = await analyzeWithOpenAI(imageData);
      const finalSpecies = openAIResult || cleanSpeciesName(bestPrediction.className);

      if (finalSpecies) {
        onSpeciesDetected(finalSpecies);
        toast({
          title: "Plant Detected",
          description: `Identified as: ${finalSpecies}`,
        });
      }
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        title: "Error",
        description: "Failed to process the image",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
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
            capture="environment"
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
                  {cleanSpeciesName(prediction.className)} ({(prediction.probability * 100).toFixed(1)}%)
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}