import { Card, CardContent } from "@/components/ui/card";
import { Users, Car, Clock, Activity, Zap } from "lucide-react";

interface AnalyticsPanelProps {
  totalCycles: number;
  avgVehicleWait: number;
  avgPedestrianWait: number;
  isAutoMode: boolean;
  lastPriorityShift: string;
}

export function AnalyticsPanel({
  totalCycles,
  avgVehicleWait,
  avgPedestrianWait,
  isAutoMode,
  lastPriorityShift
}: AnalyticsPanelProps) {
  return (
    <Card className="premium-card bg-white border-slate-100 rounded-2xl shadow-soft">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-primary font-black">
          <Activity className="w-4 h-4" /> System Analytics
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
          <StatItem 
            label="Total Cycles" 
            value={totalCycles.toString()} 
            icon={<Zap className="w-4 h-4 text-amber-500" />} 
          />
          <StatItem 
            label="Avg Vehicle Wait" 
            value={`${avgVehicleWait.toFixed(1)}s`} 
            icon={<Car className="w-4 h-4 text-blue-500" />} 
          />
          <StatItem 
            label="Avg Pedestrian Wait" 
            value={`${avgPedestrianWait.toFixed(1)}s`} 
            icon={<Users className="w-4 h-4 text-emerald-500" />} 
          />
          <StatItem 
            label="Current Mode" 
            value={isAutoMode ? "Auto" : "Manual"} 
            icon={<Clock className="w-4 h-4 text-slate-500" />} 
          />
          <div className="pt-2 border-t border-slate-50">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Last Priority Shift</p>
            <p className="text-sm font-semibold text-slate-600">{lastPriorityShift}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-lg font-black text-slate-800">{value}</span>
    </div>
  );
}
