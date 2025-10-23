import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function StatCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    blue: {
      bg: "from-blue-50 to-blue-100",
      text: "text-blue-600",
      iconBg: "bg-blue-500",
      valueText: "text-blue-900",
    },
    green: {
      bg: "from-green-50 to-green-100",
      text: "text-green-600",
      iconBg: "bg-green-500",
      valueText: "text-green-900",
    },
    amber: {
      bg: "from-amber-50 to-amber-100",
      text: "text-amber-600",
      iconBg: "bg-amber-500",
      valueText: "text-amber-900",
    },
    purple: {
      bg: "from-purple-50 to-purple-100",
      text: "text-purple-600",
      iconBg: "bg-purple-500",
      valueText: "text-purple-900",
    },
    pink: {
      bg: "from-pink-50 to-pink-100",
      text: "text-pink-600",
      iconBg: "bg-pink-500",
      valueText: "text-pink-900",
    },
  };
  
  const selectedColor = colorClasses[color] || colorClasses.blue;

  return (
    <Card className={`border-0 shadow-lg bg-gradient-to-br ${selectedColor.bg}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className={`font-medium text-sm mb-1 ${selectedColor.text}`}>{title}</p>
            <p className={`text-3xl font-bold ${selectedColor.valueText}`}>{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedColor.iconBg}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}