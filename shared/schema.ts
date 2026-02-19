
import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const simulationRuns = pgTable("simulation_runs", {
  id: serial("id").primaryKey(),
  pedestrians: integer("pedestrians").notNull(),
  vehicles: integer("vehicles").notNull(),
  isPeakHour: boolean("is_peak_hour").notNull(),
  calculatedGreenTime: integer("calculated_green_time").notNull(),
  riskLevel: text("risk_level").notNull(), // "Low", "Moderate", "High"
  explanation: text("explanation").notNull(),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const insertSimulationRunSchema = createInsertSchema(simulationRuns).omit({ id: true, createdAt: true });

export type SimulationRun = typeof simulationRuns.$inferSelect;
export type InsertSimulationRun = z.infer<typeof insertSimulationRunSchema>;

export const calculateSignalSchema = z.object({
  pedestrians: z.number().min(0),
  vehicles: z.number().min(0),
  isPeakHour: z.boolean(),
});

export type CalculateSignalRequest = z.infer<typeof calculateSignalSchema>;

export type SimulationResult = {
  baseGreenTime: number;
  adaptiveGreenTime: number;
  riskLevel: "Low" | "Moderate" | "High";
  explanation: string;
  breakdown: {
    rule: string;
    adjustment: number;
  }[];
};
