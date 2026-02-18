import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCalculateSignal, useSaveSimulation, useGraphData } from "@/hooks/use-simulation";
import { TrafficLight } from "@/components/TrafficLight";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle, Car, Users, Zap, Clock, TrendingUp, CheckCircle2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [pedestrians, setPedestrians] = useState(20);
  const [vehicles, setVehicles] = useState(30);
  const [isPeakHour, setIsPeakHour] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [countDown, setCountDown] = useState<number | null>(null);
  const [activeLight, setActiveLight] = useState<"red" | "yellow" | "green">("red");
  
  const calculateMutation = useCalculateSignal();
  const saveMutation = useSaveSimulation();
  const { data: graphData } = useGraphData();
  const { toast } = useToast();

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Traffic Control Center</h2>
          <p className="text-muted-foreground mt-1">Real-time adaptive signal processing powered by AI logic.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-muted-foreground">System Operational</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Controls & Input */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="glass-panel border-white/5 bg-gradient-to-b from-card to-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Simulation Parameters
              </CardTitle>
              <CardDescription>Adjust traffic conditions to test the adaptive logic.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* Pedestrians Input */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2 text-base">
                    <Users className="w-4 h-4 text-blue-400" />
                    Pedestrians
                  </Label>
                  <span className="font-mono text-xl font-bold bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg border border-blue-500/20">
                    {pedestrians}
                  </span>
                </div>
                <Slider 
                  value={[pedestrians]} 
                  onValueChange={(vals) => setPedestrians(vals[0])} 
                  max={100} 
                  step={1}
                  className="py-2"
                />
              </div>

              {/* Vehicles Input */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2 text-base">
                    <Car className="w-4 h-4 text-purple-400" />
                    Vehicles
                  </Label>
                  <span className="font-mono text-xl font-bold bg-purple-500/10 text-purple-400 px-3 py-1 rounded-lg border border-purple-500/20">
                    {vehicles}
                  </span>
                </div>
                <Slider 
                  value={[vehicles]} 
                  onValueChange={(vals) => setVehicles(vals[0])} 
                  max={100} 
                  step={1}
                  className="py-2"
                />
              </div>

              {/* Peak Hour Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-white/5">
                <div className="space-y-0.5">
                  <Label className="text-base">Peak Hour Mode</Label>
                  <p className="text-xs text-muted-foreground">Increases base timing pressure</p>
                </div>
                <Switch 
                  checked={isPeakHour} 
                  onCheckedChange={setIsPeakHour} 
                />
              </div>

              <Button 
                onClick={handleSimulate} 
                disabled={isSimulating}
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-violet-600 hover:to-violet-500 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
              >
                {isSimulating ? (
                  <>
                    <Clock className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Run Simulation</>
                )}
              </Button>

            </CardContent>
          </Card>

          {/* Logic Explanation Box */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card className="bg-muted/30 border-dashed">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">AI Decision Logic</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{result.explanation}</p>
                    <div className="mt-4 space-y-2">
                      {result.breakdown.map((rule, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-2 rounded bg-background/50">
                          <span>{rule.rule}</span>
                          <span className={cn("font-mono font-bold", rule.adjustment > 0 ? "text-green-400" : "text-red-400")}>
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
            <div className="flex justify-center py-8 bg-zinc-900/50 rounded-2xl border border-white/5 shadow-inner">
              <TrafficLight activeLight={activeLight} countdown={countDown} />
            </div>

            <div className="grid gap-4">
              <StatsCard 
                title="Adaptive Green Time" 
                value={`${result ? result.adaptiveGreenTime : '--'}s`}
                description="Optimized duration based on real-time inputs"
                icon={<Clock className="w-5 h-5" />}
                className="bg-gradient-to-br from-card to-primary/5"
              />
              
              <StatsCard 
                title="Risk Assessment" 
                value={result?.riskLevel || "Pending"}
                description="Current intersection safety rating"
                icon={<AlertCircle className="w-5 h-5" />}
                color={getRiskColor(result?.riskLevel)}
              />

              {/* Comparison Stat */}
              {result && (
                <div className="relative overflow-hidden rounded-2xl border bg-card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Efficiency Gain</p>
                      <h3 className="text-2xl font-bold mt-1">
                        {result.adaptiveGreenTime !== 25 ? (
                          <span className={result.adaptiveGreenTime > 25 ? "text-blue-400" : "text-orange-400"}>
                             {Math.abs(result.adaptiveGreenTime - 25)}s {result.adaptiveGreenTime > 25 ? "Added" : "Reduced"}
                          </span>
                        ) : "Optimal"}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-2">vs. Static 25s Standard</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Graph Section */}
          <Card className="border-white/5 bg-card/50">
            <CardHeader>
              <CardTitle>Algorithm Performance Curve</CardTitle>
              <CardDescription>Pedestrian Density vs. Green Signal Duration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={graphData || []}>
                    <defs>
                      <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis 
                      dataKey="pedestrians" 
                      stroke="#666" 
                      tickLine={false}
                      axisLine={false}
                      label={{ value: 'Pedestrians', position: 'insideBottom', offset: -5 }} 
                    />
                    <YAxis 
                      stroke="#666" 
                      tickLine={false}
                      axisLine={false}
                      label={{ value: 'Green Time (s)', angle: -90, position: 'insideLeft' }} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="greenTime" 
                      stroke="#8b5cf6" 
                      strokeWidth={3}
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
