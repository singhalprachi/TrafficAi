import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
  color?: "default" | "success" | "warning" | "danger";
}

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon, 
  className,
  color = "default"
}: StatsCardProps) {
  
  const colorStyles = {
    default: "bg-card border-border/50",
    success: "bg-green-500/10 border-green-500/20 text-green-500",
    warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-500",
    danger: "bg-red-500/10 border-red-500/20 text-red-500",
  };

  return (
    <div className={cn(
      "rounded-2xl p-6 border shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md",
      colorStyles[color],
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className={cn("text-sm font-medium", color === 'default' ? "text-muted-foreground" : "text-current opacity-80")}>
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className={cn("text-2xl font-bold tracking-tight", color === 'default' ? "text-foreground" : "text-current")}>
              {value}
            </h3>
          </div>
        </div>
        {icon && (
          <div className={cn("p-2 rounded-lg", color === 'default' ? "bg-primary/10 text-primary" : "bg-current/10 text-current")}>
            {icon}
          </div>
        )}
      </div>
      {description && (
        <p className={cn("mt-4 text-xs", color === 'default' ? "text-muted-foreground" : "text-current opacity-70")}>
          {description}
        </p>
      )}
    </div>
  );
}
