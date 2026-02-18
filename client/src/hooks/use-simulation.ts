import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes"; // Assuming routes are exported here as per instructions
import type { CalculateSignalRequest, InsertSimulationRun } from "@shared/schema";

// Helper to handle API requests with correct types
async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, options);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export function useCalculateSignal() {
  return useMutation({
    mutationFn: async (data: CalculateSignalRequest) => {
      // POST to /api/simulation/calculate
      return fetchApi<any>(api.simulation.calculate.path, {
        method: api.simulation.calculate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
  });
}

export function useSimulationHistory() {
  return useQuery({
    queryKey: [api.simulation.history.path],
    queryFn: () => fetchApi<any[]>(api.simulation.history.path),
  });
}

export function useSaveSimulation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertSimulationRun) => {
      return fetchApi(api.simulation.save.path, {
        method: api.simulation.save.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.simulation.history.path] });
    },
  });
}

export function useGraphData() {
  return useQuery({
    queryKey: [api.simulation.graphData.path],
    queryFn: () => fetchApi<Array<{ pedestrians: number; greenTime: number }>>(api.simulation.graphData.path),
  });
}
