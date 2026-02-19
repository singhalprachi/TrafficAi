
import type { Express, Request } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import cv from "opencv4nodejs-prebuilt-install";
import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import ffmpeg from "ffmpeg-static";
import { execSync } from "child_process";

const upload = multer({ dest: "uploads/" });

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/simulation/upload", upload.single("image"), async (req: MulterRequest, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const imagePath = path.resolve(req.file.path);
    
    try {
      // Simulate AI detection from image
      // In a real app, we'd use a model here. For now, we simulate based on file existence
      const estimatedVehicles = Math.floor(Math.random() * 50);
      const estimatedPedestrians = Math.floor(Math.random() * 40);

      res.json({
        estimatedPedestrians,
        estimatedVehicles
      });
    } catch (err) {
      console.error("Image processing error:", err);
      res.status(500).json({ message: "Image processing failed" });
    } finally {
      await fs.unlink(imagePath).catch(() => {});
    }
  });

  app.post(api.simulation.calculate.path, (req, res) => {
    try {
      const input = api.simulation.calculate.input.parse(req.body);
      
      let greenTime = 25; // baseTime
      let explanation = "Base green time starts at 25s.";
      const breakdown = [{ rule: "Base Time", adjustment: 25 }];
      
      // New logic from requirements
      if (input.vehicles > 20) {
        greenTime += 10;
        breakdown.push({ rule: "Vehicles > 20", adjustment: 10 });
      }
      if (input.vehicles > 40) {
        greenTime += 15;
        breakdown.push({ rule: "Vehicles > 40", adjustment: 15 });
      }

      if (input.pedestrians > 10) {
        greenTime += 5;
        breakdown.push({ rule: "Pedestrians > 10", adjustment: 5 });
      }
      if (input.pedestrians > 25) {
        greenTime += 10;
        breakdown.push({ rule: "Pedestrians > 25", adjustment: 10 });
      }

      if (input.isPeakHour) {
        greenTime += 5;
        breakdown.push({ rule: "Peak Hour Bonus", adjustment: 5 });
      }

      // Cap maximum green time
      const finalTime = Math.min(greenTime, 60);
      if (finalTime < greenTime) {
        breakdown.push({ rule: "Maximum Cap", adjustment: finalTime - greenTime });
      }
      
      let riskLevel: "Low" | "Moderate" | "High" = "Low";
      if (input.pedestrians > 25 || input.vehicles > 40) riskLevel = "High";
      else if (input.pedestrians > 10 || input.vehicles > 20) riskLevel = "Moderate";

      res.json({
        baseGreenTime: 25,
        adaptiveGreenTime: finalTime,
        riskLevel,
        explanation: `AI Signal Optimization: ${finalTime}s calculated based on traffic density.`,
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
