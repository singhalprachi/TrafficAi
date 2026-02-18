
import { db } from "./db";
import { simulationRuns, type InsertSimulationRun, type SimulationRun } from "@shared/schema";

export interface IStorage {
  saveSimulation(run: InsertSimulationRun): Promise<SimulationRun>;
  getHistory(): Promise<SimulationRun[]>;
}

export class DatabaseStorage implements IStorage {
  async saveSimulation(run: InsertSimulationRun): Promise<SimulationRun> {
    const [saved] = await db.insert(simulationRuns).values(run).returning();
    return saved;
  }

  async getHistory(): Promise<SimulationRun[]> {
    return await db.select().from(simulationRuns).orderBy(simulationRuns.id);
  }
}

export const storage = new DatabaseStorage();
