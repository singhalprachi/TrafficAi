
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post(api.simulation.calculate.path, (req, res) => {
    try {
      const input = api.simulation.calculate.input.parse(req.body);
      
      let greenTime = 25; // Base green time
      let explanation = "Base green time starts at 25s.";
      const breakdown = [{ rule: "Base Time", adjustment: 25 }];
      let riskLevel: "Low" | "Moderate" | "High" = "Low";

      // Pedestrian Logic
      if (input.pedestrians > 30) {
        greenTime += 20;
        explanation += " Increased by 20s due to heavy pedestrian traffic (>30).";
        breakdown.push({ rule: "Heavy Pedestrians (>30)", adjustment: 20 });
        riskLevel = "High";
      } else if (input.pedestrians > 15) {
        greenTime += 10;
        explanation += " Increased by 10s due to moderate pedestrian traffic (>15).";
        breakdown.push({ rule: "Moderate Pedestrians (>15)", adjustment: 10 });
        riskLevel = "Moderate";
      } else {
        riskLevel = "Low";
      }

      // Peak Hour Logic
      if (input.isPeakHour) {
        greenTime += 5;
        explanation += " Added 5s bonus for Peak Hour.";
        breakdown.push({ rule: "Peak Hour Bonus", adjustment: 5 });
      }

      // Vehicle Cap Logic
      if (input.vehicles > 40) {
        if (greenTime > 45) {
          explanation += " Capped at 45s due to high vehicle traffic (>40).";
          breakdown.push({ rule: "High Vehicle Traffic Cap", adjustment: 45 - greenTime }); // Negative adjustment to cap
          greenTime = 45;
        }
      }

      res.json({
        baseGreenTime: 25,
        adaptiveGreenTime: greenTime,
        riskLevel,
        explanation,
        breakdown
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.post(api.simulation.save.path, async (req, res) => {
    try {
      const input = api.simulation.save.input.parse(req.body);
      const saved = await storage.saveSimulation(input);
      res.status(201).json(saved);
    } catch (err) {
       res.status(500).json({ message: "Failed to save simulation" });
    }
  });

  app.get(api.simulation.history.path, async (req, res) => {
    const history = await storage.getHistory();
    res.json(history);
  });

  app.get(api.simulation.graphData.path, (req, res) => {
    // Generate data points for the graph: Pedestrians (0-100) vs Green Time
    // Keeping vehicles constant (e.g., 20) and Peak Hour off for the base curve, 
    // or we could generate multiple lines. For simplicity, let's just vary pedestrians.
    const data = [];
    const vehicles = 20;
    const isPeakHour = false;

    for (let p = 0; p <= 60; p += 5) {
       let gt = 25;
       if (p > 30) gt += 20;
       else if (p > 15) gt += 10;
       
       if (isPeakHour) gt += 5;
       
       if (vehicles > 40 && gt > 45) gt = 45;

       data.push({ pedestrians: p, greenTime: gt });
    }
    res.json(data);
  });

  return httpServer;
}
