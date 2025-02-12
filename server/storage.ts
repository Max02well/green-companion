import { plants, plantGuides, type Plant, type InsertPlant, type PlantGuide, type InsertGuide } from "@shared/schema";

export interface IStorage {
  // Plant CRUD
  getPlants(): Promise<Plant[]>;
  getPlant(id: number): Promise<Plant | undefined>;
  createPlant(plant: InsertPlant): Promise<Plant>;
  updatePlant(id: number, plant: Partial<Plant>): Promise<Plant | undefined>;
  deletePlant(id: number): Promise<boolean>;

  // Plant Guide operations
  getGuide(species: string): Promise<PlantGuide | undefined>;
  getAllGuides(): Promise<PlantGuide[]>;
}

export class MemStorage implements IStorage {
  private plants: Map<number, Plant>;
  private guides: Map<string, PlantGuide>;
  private currentId: number;

  constructor() {
    this.plants = new Map();
    this.guides = new Map();
    this.currentId = 1;
    this.initializeGuides();
  }

  private initializeGuides() {
    const defaultGuides: InsertGuide[] = [
      {
        species: "Snake Plant",
        wateringTips: "Water every 2-6 weeks, allow soil to dry between waterings",
        sunlightNeeds: "Tolerates low to bright indirect light",
        fertilizingTips: "Feed with mild cactus fertilizer every 6 months",
        generalCare: "Very tolerant of neglect, perfect for beginners"
      },
      // Add more default guides as needed
    ];

    defaultGuides.forEach((guide, index) => {
      this.guides.set(guide.species, { ...guide, id: index + 1 });
    });
  }

  async getPlants(): Promise<Plant[]> {
    return Array.from(this.plants.values());
  }

  async getPlant(id: number): Promise<Plant | undefined> {
    return this.plants.get(id);
  }

  async createPlant(insertPlant: InsertPlant): Promise<Plant> {
    const id = this.currentId++;
    const now = new Date();
    const plant: Plant = {
      ...insertPlant,
      id,
      lastWatered: now,
      lastFertilized: now,
      notes: insertPlant.notes || null
    };
    this.plants.set(id, plant);
    return plant;
  }

  async updatePlant(id: number, updates: Partial<Plant>): Promise<Plant | undefined> {
    const existing = this.plants.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates };
    this.plants.set(id, updated);
    return updated;
  }

  async deletePlant(id: number): Promise<boolean> {
    return this.plants.delete(id);
  }

  async getGuide(species: string): Promise<PlantGuide | undefined> {
    return this.guides.get(species);
  }

  async getAllGuides(): Promise<PlantGuide[]> {
    return Array.from(this.guides.values());
  }
}

export const storage = new MemStorage();