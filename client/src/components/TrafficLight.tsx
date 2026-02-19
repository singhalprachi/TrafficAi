
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface TrafficLightProps {
  activeLight: "red" | "yellow" | "green";
  countdown: number | null;
  pedestrianStatus: "WALK" | "STOP" | "WAIT";
}

export function TrafficLight({ activeLight, countdown, pedestrianStatus }: TrafficLightProps) {
  return (
    <div className="flex flex-col items-center gap-10">
      {/* Vehicle Traffic Light */}
      <div className="traffic-light-container flex flex-col gap-6 w-28 items-center">
        <Light color="bg-rose-500" active={activeLight === "red"} glowColor="shadow-rose-500/50" />
        <Light color="bg-amber-400" active={activeLight === "yellow"} glowColor="shadow-amber-400/50" />
        <Light color="bg-emerald-500" active={activeLight === "green"} glowColor="shadow-emerald-500/50" />
      </div>

      {/* Pedestrian Visual */}
      <div className="flex flex-col items-center gap-4">
        <span className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-bold">Pedestrian Status</span>
        <div className="w-24 h-14 bg-slate-900 rounded-2xl border-2 border-slate-800 flex items-center justify-center relative shadow-inner">
          <AnimatePresence mode="wait">
            <motion.div
              key={pedestrianStatus}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className={cn(
                "font-bold text-xl tracking-wider",
                pedestrianStatus === "WALK" ? "text-emerald-400" : 
                pedestrianStatus === "WAIT" ? "text-amber-400" : "text-rose-400"
              )}
            >
              {pedestrianStatus}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Real-time Countdown */}
      <div className="flex flex-col items-center">
        <span className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Time Remaining</span>
        <div className="text-5xl font-mono font-bold text-slate-800 tabular-nums">
          {countdown !== null ? `${countdown}s` : '--'}
        </div>
      </div>
    </div>
  );
}

function Light({ color, active, glowColor }: { color: string; active: boolean; glowColor: string }) {
  return (
    <div className="relative w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
      <motion.div
        animate={{ 
          opacity: active ? 1 : 0.15,
          scale: active ? 1.1 : 1,
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={cn(
          "w-14 h-14 rounded-full", 
          color, 
          active && `shadow-[0_0_40px_rgba(0,0,0,0.1)] ${glowColor}`
        )}
      />
      {active && (
        <motion.div
          layoutId="active-glow"
          className={cn("absolute inset-0 rounded-full blur-xl opacity-20", color)}
        />
      )}
    </div>
  );
}
