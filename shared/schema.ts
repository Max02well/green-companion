import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const plants = pgTable("plants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  species: text("species").notNull(),
  image: text("image").notNull(),
  wateringFrequency: integer("watering_frequency").notNull(), // days
  lastWatered: timestamp("last_watered"),
  sunlight: text("sunlight").notNull(), // enum: low, medium, high
  fertilizingFrequency: integer("fertilizing_frequency").notNull(), // days
  lastFertilized: timestamp("last_fertilized"),
  notes: text("notes"),
});

export const plantGuides = pgTable("plant_guides", {
  id: serial("id").primaryKey(),
  species: text("species").notNull().unique(),
  wateringTips: text("watering_tips").notNull(),
  sunlightNeeds: text("sunlight_needs").notNull(),
  fertilizingTips: text("fertilizing_tips").notNull(),
  generalCare: text("general_care").notNull(),
});

export const insertPlantSchema = createInsertSchema(plants).omit({ 
  id: true,
  lastWatered: true,
  lastFertilized: true 
}).extend({
  sunlight: z.enum(['low', 'medium', 'high'])
});

export const insertGuideSchema = createInsertSchema(plantGuides).omit({ 
  id: true 
});

export type Plant = typeof plants.$inferSelect;
export type InsertPlant = z.infer<typeof insertPlantSchema>;
export type PlantGuide = typeof plantGuides.$inferSelect;
export type InsertGuide = z.infer<typeof insertGuideSchema>;
