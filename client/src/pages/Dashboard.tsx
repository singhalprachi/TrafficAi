import { useState, useRef } from "react";
import { useCalculateSignal, useSaveSimulation, useGraphData } from "@/hooks/use-simulation";
import { TrafficLight } from "@/components/TrafficLight";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Car, Users, Zap, Clock, TrendingUp, Upload, ShieldCheck, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [pedestrians, setPedestrians] = useState(10);
  const [vehicles, setVehicles] = useState(15);
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
      const response = await fetch("/api/simulation/upload", { method: "POST", body: formData });
      if (!response.ok) throw new Error("Upload failed");
      const result = await response.json();
      setPedestrians(result.estimatedPedestrians);
      setVehicles(result.estimatedVehicles);
      toast({ title: "Analysis Complete", description: `Detected ${result.estimatedPedestrians} pedestrians and ${result.estimatedVehicles} vehicles.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Analysis Failed", description: "Image processing error." });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      // Industry logic based on requirements
      let baseTime = 10;
      let calculatedTime = baseTime;
      let targetLight: "red" | "green" = "red";

      if (vehicles > pedestrians) {
        targetLight = "green";
        calculatedTime += vehicles;
      } else if (pedestrians > vehicles) {
        targetLight = "red";
        calculatedTime += pedestrians;
      } else {
        // Equal: alternate handled by state, for this turn let's pick green
        targetLight = activeLight === "green" ? "red" : "green";
        calculatedTime += vehicles;
      }
      
      const finalTime = Math.min(60, calculatedTime);

      // Start Sequence
      // If we need to change from Red to Green or vice versa, we might go through Yellow
      if (activeLight !== targetLight) {
        setActiveLight("yellow");
        setCountDown(3);
        
        let yTime = 3;
        const yTimer = setInterval(() => {
          setCountDown(prev => (prev && prev > 1 ? prev - 1 : 0));
          yTime--;
          if (yTime <= 0) {
            clearInterval(yTimer);
            startMainPhase(targetLight, finalTime);
          }
        }, 1000);
      } else {
        startMainPhase(targetLight, finalTime);
      }
    } catch (error) {
      setIsSimulating(false);
      toast({ variant: "destructive", title: "System Error", description: "Signal controller failed." });
    }
  };

  const startMainPhase = (light: "red" | "green", duration: number) => {
    setActiveLight(light);
    setCountDown(duration);
    
    let timeLeft = duration;
    const mainTimer = setInterval(() => {
      setCountDown(prev => (prev && prev > 1 ? prev - 1 : 0));
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(mainTimer);
        setIsSimulating(false);
        toast({ title: "Signal Cycle Complete", description: `Cycle lasted ${duration}s` });
      }
    }, 1000);
  };

  const pedestrianStatus = activeLight === "green" ? "STOP" : activeLight === "red" ? "WALK" : "WAIT";

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900 p-6 md:p-10">
      <header className="flex items-center justify-between mb-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">TrafficAI Pro</h1>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Enterprise Signal Control v2.5</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Cloud Synchronized</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
        {/* Controls */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="premium-card">
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isSimulating}
                  variant="outline"
                  className="w-full h-14 rounded-2xl border-2 border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center gap-3 text-slate-700 font-semibold"
                >
                  {isUploading ? <Clock className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  Import Traffic Data
                </Button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              </div>

              <div className="space-y-8">
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4" /> Pedestrians
                    </Label>
                    <span className="text-xl font-black text-primary">{pedestrians}</span>
                  </div>
                  <Slider value={[pedestrians]} onValueChange={(v) => setPedestrians(v[0])} max={100} step={1} disabled={isSimulating} />
                </div>

                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Car className="w-4 h-4" /> Vehicles
                    </Label>
                    <span className="text-xl font-black text-primary">{vehicles}</span>
                  </div>
                  <Slider value={[vehicles]} onValueChange={(v) => setVehicles(v[0])} max={100} step={1} disabled={isSimulating} />
                </div>

                <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100">
                  <Label className="text-sm font-bold text-slate-600">Peak Hour Protocol</Label>
                  <Switch checked={isPeakHour} onCheckedChange={setIsPeakHour} disabled={isSimulating} />
                </div>

                <Button 
                  onClick={handleSimulate} 
                  disabled={isSimulating}
                  className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold shadow-lg shadow-slate-200 transition-all active:scale-[0.98]"
                >
                  {isSimulating ? "System Processing..." : "Execute Signal Phase"}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="p-6 rounded-[20px] bg-white border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fail-Safe Active</span>
            </div>
            <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full w-full bg-emerald-500" />
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="premium-card flex items-center justify-center p-12 min-h-[450px]">
              <TrafficLight activeLight={activeLight} countdown={countDown} pedestrianStatus={pedestrianStatus} />
            </Card>

            <div className="space-y-6">
              <Card className="premium-card p-8">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-primary font-black mb-4">
                  <Zap className="w-4 h-4" /> Logic Console
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                      {vehicles > pedestrians 
                        ? "Vehicle priority detected. Extending Green phase to optimize flow." 
                        : pedestrians > vehicles 
                        ? "High pedestrian volume. Activating Walk phase for public safety."
                        : "Balanced load. Initiating alternating signal rotation."}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50/50">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Load Balance</p>
                      <p className="text-xl font-black text-slate-800">{Math.floor((vehicles + pedestrians) / 2)}%</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50/50">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Risk Rating</p>
                      <p className={cn("text-xl font-black", (vehicles > 40 || pedestrians > 30) ? "text-rose-500" : "text-emerald-500")}>
                        {(vehicles > 40 || pedestrians > 30) ? "HIGH" : "SAFE"}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="premium-card p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-bold">Flow Analytics</div>
                  <TrendingUp className="w-4 h-4 text-slate-300" />
                </div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={graphData || []}>
                      <defs>
                        <linearGradient id="flowGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis hide />
                      <YAxis hide />
                      <Area type="monotone" dataKey="greenTime" stroke="#3b82f6" strokeWidth={3} fill="url(#flowGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
