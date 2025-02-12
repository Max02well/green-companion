import { plants, plantGuides, type Plant, type InsertPlant, type PlantGuide, type InsertGuide } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async getPlants(): Promise<Plant[]> {
    return await db.select().from(plants);
  }

  async getPlant(id: number): Promise<Plant | undefined> {
    const [plant] = await db.select().from(plants).where(eq(plants.id, id));
    return plant;
  }

  async createPlant(plant: InsertPlant): Promise<Plant> {
    const [newPlant] = await db.insert(plants).values({
      ...plant,
      lastWatered: new Date(),
      lastFertilized: new Date(),
    }).returning();
    return newPlant;
  }

  async updatePlant(id: number, updates: Partial<Plant>): Promise<Plant | undefined> {
    const [updated] = await db
      .update(plants)
      .set(updates)
      .where(eq(plants.id, id))
      .returning();
    return updated;
  }

  async deletePlant(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(plants)
      .where(eq(plants.id, id))
      .returning();
    return !!deleted;
  }

  async getGuide(species: string): Promise<PlantGuide | undefined> {
    const [guide] = await db
      .select()
      .from(plantGuides)
      .where(eq(plantGuides.species, species));
    return guide;
  }

  async getAllGuides(): Promise<PlantGuide[]> {
    return await db.select().from(plantGuides);
  }
}

export const storage = new DatabaseStorage();