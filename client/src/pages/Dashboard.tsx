import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCalculateSignal, useSaveSimulation, useGraphData } from "@/hooks/use-simulation";
import { TrafficLight } from "@/components/TrafficLight";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle, Car, Users, Zap, Clock, TrendingUp, CheckCircle2, Upload, Video } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

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
    formData.append("video", file);

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
        title: "Video Analyzed",
        description: `Detected ~${result.estimatedPedestrians} pedestrians and ~${result.estimatedVehicles} vehicles.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not process video. Please try a smaller file.",
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
      // 1. Calculate parameters
      const result = await calculateMutation.mutateAsync({
        pedestrians,
        vehicles,
        isPeakHour
      });

      // 2. Start Visual Simulation Sequence
      // Sequence: Red (2s) -> Green (Calculated Time) -> Yellow (3s) -> Red
      
      setTimeout(() => {
        // Switch to Green
        setActiveLight("green");
        const greenTime = result.adaptiveGreenTime;
        setCountDown(greenTime);

        // Start Countdown Timer
        const timer = setInterval(() => {
          setCountDown(prev => {
            if (prev === null || prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // Schedule switch to Yellow
        setTimeout(() => {
          setActiveLight("yellow");
          setCountDown(null);
          
          // Schedule switch back to Red
          setTimeout(() => {
            setActiveLight("red");
            setIsSimulating(false);
            
            // Save the run to history
            saveMutation.mutate({
              pedestrians,
              vehicles,
              isPeakHour,
              calculatedGreenTime: result.adaptiveGreenTime,
              riskLevel: result.riskLevel,
              explanation: result.explanation
            });
            
            toast({
              title: "Simulation Complete",
              description: `Adaptive cycle finished with ${result.riskLevel} risk rating.`,
            });
            
          }, 3000); // Yellow duration
        }, greenTime * 1000); // Green duration

      }, 2000); // Initial Red duration

    } catch (error) {
      console.error(error);
      setIsSimulating(false);
      toast({
        variant: "destructive",
        title: "Simulation Failed",
        description: "Could not calculate signal timing. Please try again.",
      });
    }
  };

  const result = calculateMutation.data;

  // Map risk level to color
  const getRiskColor = (level?: string) => {
    switch(level) {
      case "Low": return "success";
      case "Moderate": return "warning";
      case "High": return "danger";
      default: return "default";
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#1F2937]">Traffic Control Center</h2>
          <p className="text-[#6B7280] mt-1">Real-time adaptive signal processing with visual motion detection.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 rounded-full bg-green-500" />
          <span className="text-sm font-medium text-[#6B7280]">System Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Controls & Input */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="glass-panel bg-white shadow-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#1F2937]">
                <Zap className="w-5 h-5 text-[#4F46E5]" />
                Parameters
              </CardTitle>
              <CardDescription className="text-[#6B7280]">Configure environment or upload traffic footage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* Video Upload Section */}
              <div className="p-4 rounded-xl border border-dashed border-border bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Video className="w-4 h-4 text-[#4F46E5]" />
                    Video Analysis
                  </Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-[#4F46E5]"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? <Clock className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="video/*" 
                    onChange={handleFileUpload} 
                  />
                </div>
                <p className="text-xs text-[#6B7280]">
                  {isUploading ? "Extracting motion data..." : "Upload clip to auto-estimate counts."}
                </p>
              </div>

              {/* Pedestrians Input */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2 text-base text-[#1F2937]">
                    <Users className="w-4 h-4 text-indigo-500" />
                    Pedestrians
                  </Label>
                  <span className="font-mono text-lg font-bold text-indigo-600">
                    {pedestrians}
                  </span>
                </div>
                <Slider 
                  value={[pedestrians]} 
                  onValueChange={(vals) => setPedestrians(vals[0])} 
                  max={100} 
                  step={1}
                />
              </div>

              {/* Vehicles Input */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2 text-base text-[#1F2937]">
                    <Car className="w-4 h-4 text-indigo-500" />
                    Vehicles
                  </Label>
                  <span className="font-mono text-lg font-bold text-indigo-600">
                    {vehicles}
                  </span>
                </div>
                <Slider 
                  value={[vehicles]} 
                  onValueChange={(vals) => setVehicles(vals[0])} 
                  max={100} 
                  step={1}
                />
              </div>

              {/* Peak Hour Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-border">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium text-[#1F2937]">Peak Hour</Label>
                </div>
                <Switch 
                  checked={isPeakHour} 
                  onCheckedChange={setIsPeakHour} 
                />
              </div>

              <Button 
                onClick={handleSimulate} 
                disabled={isSimulating}
                className="w-full h-11 text-base font-semibold bg-[#4F46E5] hover:bg-[#4338CA] transition-colors shadow-sm"
              >
                {isSimulating ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>Process Signal</>
                )}
              </Button>

            </CardContent>
          </Card>

          {/* Logic Explanation Box */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card className="bg-slate-50 border-dashed shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Analysis Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[#1F2937] leading-relaxed mb-4">{result.explanation}</p>
                    <div className="space-y-1.5">
                      {result.breakdown.map((rule, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-2 rounded bg-white border border-border">
                          <span className="text-[#6B7280]">{rule.rule}</span>
                          <span className={cn("font-bold", rule.adjustment > 0 ? "text-green-600" : "text-red-600")}>
                            {rule.adjustment > 0 ? "+" : ""}{rule.adjustment}s
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Visualization & Stats */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Top Row: Traffic Light & Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="flex justify-center py-10 bg-slate-100 rounded-2xl border border-border shadow-inner">
              <TrafficLight activeLight={activeLight} countdown={countDown} />
            </div>

            <div className="grid gap-4">
              <StatsCard 
                title="Optimal Green Duration" 
                value={`${result ? result.adaptiveGreenTime : '--'}s`}
                description="Optimized for current flow"
                icon={<Clock className="w-5 h-5 text-[#4F46E5]" />}
                className="bg-white border-border shadow-sm"
              />
              
              <StatsCard 
                title="Intersection Risk" 
                value={result?.riskLevel || "Pending"}
                description="Safety classification"
                icon={<AlertCircle className="w-5 h-5" />}
                color={getRiskColor(result?.riskLevel)}
                className="bg-white border-border shadow-sm"
              />

              {result && (
                <div className="relative overflow-hidden rounded-xl border bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#6B7280]">Efficiency Status</p>
                      <h3 className="text-2xl font-bold mt-1 text-[#1F2937]">
                        {result.adaptiveGreenTime !== 25 ? (
                          <span className={result.adaptiveGreenTime > 25 ? "text-indigo-600" : "text-orange-600"}>
                             {Math.abs(result.adaptiveGreenTime - 25)}s {result.adaptiveGreenTime > 25 ? "Increase" : "Decrease"}
                          </span>
                        ) : "Optimal"}
                      </h3>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-[#6B7280]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Graph Section */}
          <Card className="bg-white border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#1F2937]">Signal Response Curve</CardTitle>
              <CardDescription className="text-[#6B7280]">Relationship between density and signal timing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={graphData || []}>
                    <defs>
                      <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis 
                      dataKey="pedestrians" 
                      stroke="#9CA3AF" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#9CA3AF" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="greenTime" 
                      stroke="#4F46E5" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorGreen)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}