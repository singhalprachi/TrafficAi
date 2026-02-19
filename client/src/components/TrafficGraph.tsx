import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface TrafficGraphProps {
  data: {
    time: string;
    vehicles: number;
    pedestrians: number;
  }[];
}

export function TrafficGraph({ data }: TrafficGraphProps) {
  return (
    <Card className="premium-card bg-white border-slate-100 rounded-2xl shadow-soft">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-bold">Density Trends (Last 60s)</div>
          <TrendingUp className="w-4 h-4 text-slate-300" />
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="time" 
                hide 
              />
              <YAxis 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#94a3b8' }}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="vehicles" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={false} 
                animationDuration={300}
              />
              <Line 
                type="monotone" 
                dataKey="pedestrians" 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={false} 
                animationDuration={300}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">Vehicles</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">Pedestrians</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
