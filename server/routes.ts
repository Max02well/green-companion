import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPlantSchema } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI();

export function registerRoutes(app: Express): Server {
  // Plant CRUD endpoints
  app.get("/api/plants", async (_req, res) => {
    const plants = await storage.getPlants();
    res.json(plants);
  });

  app.get("/api/plants/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const plant = await storage.getPlant(id);
    if (!plant) {
      res.status(404).json({ message: "Plant not found" });
      return;
    }
    res.json(plant);
  });

  app.post("/api/plants", async (req, res) => {
    try {
      const plantData = insertPlantSchema.parse(req.body);
      const plant = await storage.createPlant(plantData);
      res.status(201).json(plant);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid plant data", errors: error.errors });
        return;
      }
      throw error;
    }
  });

  app.patch("/api/plants/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const updates = req.body;
    const updated = await storage.updatePlant(id, updates);
    if (!updated) {
      res.status(404).json({ message: "Plant not found" });
      return;
    }
    res.json(updated);
  });

  app.delete("/api/plants/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deletePlant(id);
    if (!success) {
      res.status(404).json({ message: "Plant not found" });
      return;
    }
    res.status(204).send();
  });

  // Plant Guide endpoints
  app.get("/api/guides", async (_req, res) => {
    const guides = await storage.getAllGuides();
    res.json(guides);
  });

  app.get("/api/guides/:species", async (req, res) => {
    const guide = await storage.getGuide(req.params.species);
    if (!guide) {
      res.status(404).json({ message: "Guide not found" });
      return;
    }
    res.json(guide);
  });

  app.post("/api/analyze-plant", async (req, res) => {
    try {
      const { image } = req.body;

      if (!image || !image.startsWith('data:image/')) {
        res.status(400).json({ error: "Invalid image format" });
        return;
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this plant image and provide the following information in JSON format:\n" +
                      "1. species: The plant species name\n" +
                      "2. wateringFrequency: How often to water in days (number)\n" +
                      "3. sunlight: Light needs ('low', 'medium', or 'high')\n" +
                      "4. fertilizingFrequency: How often to fertilize in days (number)\n" +
                      "5. notes: Brief care instructions\n\n" +
                      "If you're not sure it's a plant, set species to 'unknown' and use default values."
              },
              {
                type: "image_url",
                image_url: {
                  url: image
                }
              }
            ],
          }
        ],
        max_tokens: 500,
        response_format: { type: "json_object" }
      });

      const plantInfo = JSON.parse(response.choices[0].message.content || "{}");
      res.json({
        species: plantInfo.species || 'unknown',
        careInfo: {
          wateringFrequency: plantInfo.wateringFrequency || 7,
          sunlight: plantInfo.sunlight || 'medium',
          fertilizingFrequency: plantInfo.fertilizingFrequency || 30,
          notes: plantInfo.notes || ''
        }
      });
    } catch (error) {
      console.error('Plant analysis error:', error);
      res.status(500).json({ error: "Failed to analyze plant image" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}