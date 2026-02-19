import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCalculateSignal, useSaveSimulation, useGraphData } from "@/hooks/use-simulation";
import { TrafficLight } from "@/components/TrafficLight";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle, Car, Users, Zap, Clock, TrendingUp, Upload, Activity, ShieldCheck } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [pedestrians, setPedestrians] = useState(20);
  const [vehicles, setVehicles] = useState(30);
  const [isPeakHour, setIsPeakHour] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [countDown, setCountDown] = useState<number | null>(null);
  const [activeLight, setActiveLight] = useState<"red" | "yellow" | "green">("red");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const calculateMutation = useCalculateSignal();
  const saveMutation = useSaveSimulation();
  const { data: graphData } = useGraphData();
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/simulation/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const result = await response.json();
      setPedestrians(result.estimatedPedestrians);
      setVehicles(result.estimatedVehicles);
      
      toast({
        title: "AI Analysis Complete",
        description: `Detected ${result.estimatedPedestrians} pedestrians and ${result.estimatedVehicles} vehicles.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not process image.",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSimulate = async () => {
    setIsSimulating(true);
    setActiveLight("red");
    setCountDown(null);

    try {
      const result = await calculateMutation.mutateAsync({
        pedestrians,
        vehicles,
        isPeakHour
      });

      setTimeout(() => {
        setActiveLight("green");
        const greenTime = result.adaptiveGreenTime;
        setCountDown(greenTime);

        const timer = setInterval(() => {
          setCountDown(prev => {
            if (prev === null || prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        setTimeout(() => {
          setActiveLight("yellow");
          setCountDown(null);
          
          setTimeout(() => {
            setActiveLight("red");
            setIsSimulating(false);
            
            saveMutation.mutate({
              pedestrians,
              vehicles,
              isPeakHour,
              calculatedGreenTime: result.adaptiveGreenTime,
              riskLevel: result.riskLevel,
              explanation: result.explanation
            });
            
            toast({
              title: "Signal Cycle Complete",
              description: `Adaptive timing: ${result.adaptiveGreenTime}s`,
            });
            
          }, 3000);
        }, greenTime * 1000);

      }, 2000);

    } catch (error) {
      setIsSimulating(false);
      toast({
        variant: "destructive",
        title: "Simulation Error",
        description: "Calculation failed.",
      });
    }
  };

  const result = calculateMutation.data;
  const pedestrianActive = pedestrians > vehicles;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8 font-sans">
      {/* Top Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">TrafficAI v2.1</h1>
            <div className="flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest text-emerald-500/80 font-bold">System Active</span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel: Upload & Controls */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="glass-card border-none">
            <CardContent className="p-6 space-y-8">
              <div className="space-y-4">
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center gap-3 shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
                >
                  {isUploading ? <Clock className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  <span className="font-semibold text-base">Upload Traffic Image</span>
                </Button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Pedestrians
                    </Label>
                    <span className="text-lg font-bold text-white">{pedestrians}</span>
                  </div>
                  <Slider value={[pedestrians]} onValueChange={(v) => setPedestrians(v[0])} max={100} step={1} className="py-2" />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                      <Car className="w-4 h-4" /> Vehicles
                    </Label>
                    <span className="text-lg font-bold text-white">{vehicles}</span>
                  </div>
                  <Slider value={[vehicles]} onValueChange={(v) => setVehicles(v[0])} max={100} step={1} className="py-2" />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                  <Label className="text-sm font-medium text-slate-300">Peak Hour</Label>
                  <Switch checked={isPeakHour} onCheckedChange={setIsPeakHour} />
                </div>

                <Button 
                  onClick={handleSimulate} 
                  disabled={isSimulating}
                  className="w-full h-12 bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-xl font-bold transition-all"
                >
                  {isSimulating ? "Processing..." : "Recalculate Timing"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center: Animated Signal */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 bg-white/[0.02] rounded-[32px] border border-white/5 relative overflow-hidden min-h-[500px]">
          <div className="absolute inset-0 bg-indigo-500/5 blur-[100px] -z-10" />
          <TrafficLight activeLight={activeLight} countdown={countDown} pedestrianActive={pedestrianActive} />
        </div>

        {/* Right: AI Decision & Stats */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="glass-card border-none">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-indigo-400 font-bold">
                  <Zap className="w-3 h-3" /> AI Decision Panel
                </div>
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                  <p className="text-sm leading-relaxed text-indigo-100 italic">
                    {result?.explanation || "Awaiting real-time traffic data input..."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Load Meter</div>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-white">{Math.min(100, Math.floor((vehicles + pedestrians) / 2))}%</span>
                    <TrendingUp className="w-4 h-4 text-emerald-500 mb-1" />
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Risk Level</div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-bold px-2 py-0.5 rounded-full",
                      result?.riskLevel === "High" ? "bg-rose-500/20 text-rose-400" :
                      result?.riskLevel === "Moderate" ? "bg-amber-500/20 text-amber-400" :
                      "bg-emerald-500/20 text-emerald-400"
                    )}>
                      {result?.riskLevel || "Low"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="pt-4 border-t border-white/5">
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4">Response Curve</div>
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={graphData || []}>
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="pedestrians" hide />
                      <YAxis hide />
                      <Tooltip contentStyle={{ display: 'none' }} />
                      <Area type="monotone" dataKey="greenTime" stroke="#6366f1" strokeWidth={2} fill="url(#chartGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-xs font-medium text-slate-400">Node Encryption Active</span>
            </div>
            <div className="h-1.5 w-20 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-full bg-emerald-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
