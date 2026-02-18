
import { z } from 'zod';
import { calculateSignalSchema, simulationRuns, insertSimulationRunSchema } from './schema';

export const api = {
  simulation: {
    calculate: {
      method: 'POST' as const,
      path: '/api/simulation/calculate' as const,
      input: calculateSignalSchema,
      responses: {
        200: z.object({
          baseGreenTime: z.number(),
          adaptiveGreenTime: z.number(),
          riskLevel: z.enum(["Low", "Moderate", "High"]),
          explanation: z.string(),
          breakdown: z.array(z.object({
            rule: z.string(),
            adjustment: z.number()
          }))
        })
      }
    },
    history: {
      method: 'GET' as const,
      path: '/api/simulation/history' as const,
      responses: {
        200: z.array(z.custom<typeof simulationRuns.$inferSelect>())
      }
    },
    save: {
      method: 'POST' as const,
      path: '/api/simulation/save' as const,
      input: insertSimulationRunSchema,
      responses: {
        201: z.custom<typeof simulationRuns.$inferSelect>()
      }
    },
    graphData: { // Endpoint to get data for the graph (Green Time vs Pedestrians)
      method: 'GET' as const,
      path: '/api/simulation/graph-data' as const,
      responses: {
        200: z.array(z.object({
          pedestrians: z.number(),
          greenTime: z.number()
        }))
      }
    }
  }
};
