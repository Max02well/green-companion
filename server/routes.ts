import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPlantSchema } from "@shared/schema";
import { z } from "zod";

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

  const httpServer = createServer(app);
  return httpServer;
}
