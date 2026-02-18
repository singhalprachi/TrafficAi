import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Cpu, Eye, AlertTriangle, TrafficCone } from "lucide-react";

export default function Architecture() {
  const steps = [
    {
      icon: Eye,
      title: "Sensors (Input)",
      desc: "Cameras & IoT sensors detect real-time pedestrian and vehicle density.",
      color: "text-blue-400",
      bg: "bg-blue-500/10"
    },
    {
      icon: Cpu,
      title: "AI Processing",
      desc: "Algorithm processes counts, checks peak hours, and applies threshold logic.",
      color: "text-purple-400",
      bg: "bg-purple-500/10"
    },
    {
      icon: AlertTriangle,
      title: "Risk Analysis",
      desc: "Evaluates crowd density risks to determine safety priority.",
      color: "text-orange-400",
      bg: "bg-orange-500/10"
    },
    {
      icon: TrafficCone,
      title: "Adaptive Signal",
      desc: "Final calculation of Green Time duration sent to traffic controller.",
      color: "text-green-400",
      bg: "bg-green-500/10"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          System Architecture
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          The flow of data from real-world perception to intelligent action.
          This system uses a rule-based AI approach to optimize urban traffic flow.
        </p>
      </div>

      <div className="relative">
        {/* Connection Line */}
        <div className="absolute left-[50%] top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-primary/50 to-transparent hidden md:block" />

        <div className="space-y-12 relative z-10">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className={`flex items-center gap-8 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Text Content */}
                <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.desc}</p>
                </div>

                {/* Icon Circle */}
                <div className="relative flex-shrink-0">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-white/5 shadow-2xl ${step.bg}`}>
                    <Icon className={`w-8 h-8 ${step.color}`} />
                  </div>
                  {index < steps.length - 1 && (
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground md:hidden">
                      <ArrowRight className="rotate-90" />
                    </div>
                  )}
                </div>

                {/* Spacer for alignment */}
                <div className="flex-1 hidden md:block" />
              </motion.div>
            );
          })}
        </div>
      </div>

      <Card className="mt-16 bg-white/5 border-none">
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-4">Core Logic Engine</h3>
          <div className="inline-block text-left bg-black/40 p-6 rounded-xl font-mono text-sm text-muted-foreground border border-white/10 shadow-inner">
            <p><span className="text-purple-400">const</span> baseTime = 25;</p>
            <p><span className="text-purple-400">if</span> (pedestrians &gt; 15) time += 10;</p>
            <p><span className="text-purple-400">if</span> (pedestrians &gt; 30) time += 20;</p>
            <p><span className="text-purple-400">if</span> (peakHour) time += 5;</p>
            <p className="text-green-500/50 mt-2">// Safety cap for high traffic</p>
            <p><span className="text-purple-400">if</span> (vehicles &gt; 40) time = Math.min(time, 45);</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
