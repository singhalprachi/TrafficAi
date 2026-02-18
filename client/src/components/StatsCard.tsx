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
    default: "bg-white border-border shadow-sm",
    success: "bg-green-50 border-green-100 text-green-700",
    warning: "bg-yellow-50 border-yellow-100 text-yellow-700",
    danger: "bg-red-50 border-red-100 text-red-700",
  };

  return (
    <div className={cn(
      "rounded-xl p-6 border transition-all duration-300 hover:shadow-md",
      colorStyles[color],
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className={cn("text-xs font-semibold uppercase tracking-wider", color === 'default' ? "text-[#6B7280]" : "text-current opacity-80")}>
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className={cn("text-2xl font-bold tracking-tight", color === 'default' ? "text-[#1F2937]" : "text-current")}>
              {value}
            </h3>
          </div>
        </div>
        {icon && (
          <div className={cn("p-2 rounded-lg", color === 'default' ? "bg-slate-50 text-[#4F46E5]" : "bg-current/10 text-current")}>
            {icon}
          </div>
        )}
      </div>
      {description && (
        <p className={cn("mt-4 text-xs font-medium", color === 'default' ? "text-[#6B7280]" : "text-current opacity-70")}>
          {description}
        </p>
      )}
    </div>
  );
}
