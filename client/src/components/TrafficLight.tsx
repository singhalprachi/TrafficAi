import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TrafficLightProps {
  activeLight: "red" | "yellow" | "green";
  countdown?: number | null;
}

export function TrafficLight({ activeLight, countdown }: TrafficLightProps) {
  return (
    <div className="bg-[#1F2937] p-6 rounded-3xl border-4 border-[#374151] shadow-xl flex flex-col gap-6 w-32 items-center relative overflow-hidden">
      {/* Glossy overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-3xl" />
      
      {/* Red Light */}
      <div className="relative">
        <motion.div
          animate={{
            opacity: activeLight === "red" ? 1 : 0.2,
            scale: activeLight === "red" ? 1.05 : 1,
            boxShadow: activeLight === "red" 
              ? "0 0 30px 5px rgba(239, 68, 68, 0.5)" 
              : "none"
          }}
          className="w-20 h-20 rounded-full bg-red-500 border-4 border-[#111827]"
        />
      </div>

      {/* Yellow Light */}
      <div className="relative">
        <motion.div
          animate={{
            opacity: activeLight === "yellow" ? 1 : 0.2,
            scale: activeLight === "yellow" ? 1.05 : 1,
            boxShadow: activeLight === "yellow" 
              ? "0 0 30px 5px rgba(234, 179, 8, 0.5)" 
              : "none"
          }}
          className="w-20 h-20 rounded-full bg-yellow-500 border-4 border-[#111827]"
        />
      </div>

      {/* Green Light */}
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{
            opacity: activeLight === "green" ? 1 : 0.2,
            scale: activeLight === "green" ? 1.05 : 1,
            boxShadow: activeLight === "green" 
              ? "0 0 30px 5px rgba(34, 197, 94, 0.5)" 
              : "none"
          }}
          className="w-20 h-20 rounded-full bg-green-500 border-4 border-[#111827]"
        />
        {activeLight === "green" && countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold font-mono text-white/90 drop-shadow-sm">
              {countdown}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
