import { Link, useLocation } from "wouter";
import { LayoutDashboard, History, Cpu, Activity, ShieldCheck, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/history", label: "History Log", icon: History },
  { href: "/architecture", label: "System View", icon: Cpu },
];

export function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 right-4 z-50 bg-white shadow-sm border border-border"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>

      <nav className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-border transition-transform duration-300 md:translate-x-0 flex flex-col shadow-sm",
        !isOpen && "-translate-x-full"
      )}>
        <div className="p-8 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4F46E5] flex items-center justify-center shadow-indigo-100 shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1F2937] tracking-tight">TrafficAI</h1>
              <p className="text-[10px] uppercase tracking-widest text-[#6B7280] font-semibold">Smart Signal v2.0</p>
            </div>
          </div>
        </div>

        <div className="flex-1 py-8 px-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a 
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium group",
                  location === item.href 
                    ? "bg-slate-50 text-[#4F46E5] shadow-sm" 
                    : "text-[#6B7280] hover:bg-slate-50 hover:text-[#4F46E5]"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  location === item.href ? "text-[#4F46E5]" : "text-[#9CA3AF] group-hover:text-[#4F46E5]"
                )} />
                {item.label}
              </a>
            </Link>
          ))}
        </div>

        <div className="p-6 mt-auto">
          <div className="p-4 rounded-xl bg-slate-50 border border-border">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280] mb-2 uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              Security Status
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full w-full bg-green-500 rounded-full" />
            </div>
            <p className="text-[10px] text-[#6B7280] mt-2">Node Encryption Active</p>
          </div>
        </div>
      </nav>
      
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
