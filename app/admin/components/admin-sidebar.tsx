"use client";

import { useState } from "react";
import { 
  Home, 
  Shield, 
  Database, 
  Cpu, 
  Settings, 
  BarChart3, 
  Zap, 
  AlertTriangle,
  RefreshCw,
  Clock,
  Server
} from "lucide-react";
import { Button, Badge } from "@/components/ui";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
}

export function AdminSidebar() {
  const [activeItem, setActiveItem] = useState("health");

  const navItems: NavItem[] = [
    {
      id: "health",
      label: "System Health",
      icon: <Home className="h-5 w-5" />,
      href: "/admin/health",
    },
    {
      id: "providers",
      label: "Provider Status",
      icon: <Server className="h-5 w-5" />,
      href: "/admin/providers",
      badge: 2,
    },
    {
      id: "performance",
      label: "Performance",
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/admin/performance",
    },
    {
      id: "queues",
      label: "Task Queues",
      icon: <Clock className="h-5 w-5" />,
      href: "/admin/queues",
    },
    {
      id: "circuit-breakers",
      label: "Circuit Breakers",
      icon: <AlertTriangle className="h-5 w-5" />,
      href: "/admin/circuit-breakers",
      badge: 1,
    },
    {
      id: "cache",
      label: "Cache Status",
      icon: <Database className="h-5 w-5" />,
      href: "/admin/cache",
    },
    {
      id: "security",
      label: "Security",
      icon: <Shield className="h-5 w-5" />,
      href: "/admin/security",
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/admin/settings",
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Goblin Ops</h2>
              <p className="text-xs text-gray-500">Admin Console</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeItem === item.id ? "default" : "ghost"}
              size="md"
              onClick={() => setActiveItem(item.id)}
              className={`justify-start w-full ${
                activeItem === item.id ? "bg-indigo-50 border-r-2 border-indigo-500" : ""
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge variant="destructive" className="ml-2">
                  {item.badge}
                </Badge>
              )}
            </Button>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Button variant="ghost" size="md" className="justify-start w-full">
            <RefreshCw className="mr-3 h-5 w-5" />
            Refresh All
          </Button>
          <Button variant="secondary" size="md" className="justify-start w-full">
            <Settings className="mr-3 h-5 w-5" />
            System Settings
          </Button>
        </div>
      </div>
    </aside>
  );
}
