
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface TrafficLightProps {
  activeLight: "red" | "yellow" | "green";
  countdown: number | null;
  pedestrianActive?: boolean;
}

export function TrafficLight({ activeLight, countdown, pedestrianActive }: TrafficLightProps) {
  return (
    <div className="flex flex-col items-center gap-8">
      {/* Vehicle Traffic Light */}
      <div className="w-24 bg-zinc-900 p-4 rounded-3xl shadow-2xl flex flex-col gap-4 border border-white/10">
        <Light color="bg-red-600" active={activeLight === "red"} glowColor="bg-red-500" />
        <Light color="bg-yellow-500" active={activeLight === "yellow"} glowColor="bg-yellow-400" />
        <Light color="bg-green-600" active={activeLight === "green"} glowColor="bg-green-500" />
      </div>

      {/* Pedestrian Crossing Visual */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Pedestrian Crossing</div>
        <div className="w-16 h-10 bg-zinc-900 rounded-xl border border-white/10 flex items-center justify-center relative overflow-hidden">
          <AnimatePresence mode="wait">
            {pedestrianActive ? (
              <motion.div
                key="walk"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-green-500 font-bold text-lg"
              >
                WALK
              </motion.div>
            ) : (
              <motion.div
                key="stop"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-red-500 font-bold text-lg"
              >
                WAIT
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Timer Overlay */}
      {countdown !== null && (
        <div className="text-4xl font-mono font-bold text-indigo-400 tabular-nums">
          {countdown}s
        </div>
      )}
    </div>
  );
}

function Light({ color, active, glowColor }: { color: string; active: boolean; glowColor: string }) {
  return (
    <div className="relative w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
      <motion.div
        animate={{ 
          opacity: active ? 1 : 0.2,
          scale: active ? 1.05 : 1
        }}
        transition={{ duration: 0.5 }}
        className={cn("w-14 h-14 rounded-full", color, active && "shadow-[0_0_30px_rgba(255,255,255,0.2)]")}
      />
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          className={cn("absolute inset-0 traffic-light-glow rounded-full", glowColor)}
        />
      )}
    </div>
  );
}
