import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Lock } from "lucide-react";

const SLIDESHOW_TEMPLATES = [
  {
    id: "classic",
    name: "Classic",
    description: "Clean and minimal design with elegant transitions",
    preview: "bg-gradient-to-br from-slate-100 to-slate-200",
    textColor: "text-slate-900",
    overlayColor: "from-black/60 to-transparent",
    planRequired: "starter"
  },
  {
    id: "modern",
    name: "Modern", 
    description: "Bold colors with dynamic animations",
    preview: "bg-gradient-to-br from-blue-500 to-purple-600",
    textColor: "text-white",
    overlayColor: "from-blue-900/70 to-transparent",
    planRequired: "pro"
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Sophisticated layout with gold accents",
    preview: "bg-gradient-to-br from-amber-100 via-amber-200 to-amber-300",
    textColor: "text-amber-900",
    overlayColor: "from-amber-900/60 to-transparent",
    planRequired: "business"
  },
  {
    id: "luxury",
    name: "Luxury",
    description: "Premium design with custom branding options",
    preview: "bg-gradient-to-br from-slate-900 via-slate-800 to-black",
    textColor: "text-gold-400",
    overlayColor: "from-black/80 to-transparent",
    planRequired: "enterprise"
  }
];

export default function SlideshowTemplates({ selectedTemplate, onTemplateSelect, currentPlan }) {
  const canUseTemplate = (template) => {
    const planHierarchy = ["starter", "pro", "business", "enterprise"];
    const userPlanIndex = planHierarchy.indexOf(currentPlan?.name?.toLowerCase() || "starter");
    const requiredPlanIndex = planHierarchy.indexOf(template.planRequired);
    return userPlanIndex >= requiredPlanIndex;
  };

  return (
    <div className="space-y-3">
      {SLIDESHOW_TEMPLATES.map((template) => {
        const canUse = canUseTemplate(template);
        const isSelected = selectedTemplate === template.id;
        
        return (
          <div
            key={template.id} 
            className={`border-2 rounded-lg p-3 cursor-pointer transition-all duration-200 ${
              isSelected ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-slate-300'
            } ${!canUse ? 'opacity-60 cursor-not-allowed' : ''}`}
            onClick={() => canUse && onTemplateSelect(template.id)}
          >
            <div className="flex items-center gap-3">
              {/* Template Preview */}
              <div className={`w-12 h-12 rounded-md flex-shrink-0 ${template.preview} relative overflow-hidden`}>
                {/* Mock slideshow preview */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-4 bg-white/20 rounded-sm border border-white/30"></div>
                </div>
                <div className="absolute bottom-1 left-1 right-1 h-px bg-white/40"></div>
                
                {isSelected && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                    <Check className="w-2 h-2 text-white" />
                  </div>
                )}
                
                {!canUse && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Lock className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              
              {/* Template Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sm text-slate-900 truncate">{template.name}</h3>
                  <Badge 
                    variant={canUse ? "secondary" : "destructive"}
                    className="text-xs ml-2 flex-shrink-0"
                  >
                    {template.planRequired}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{template.description}</p>
                {!canUse && (
                  <p className="text-xs text-red-600 mt-1">Upgrade required</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { SLIDESHOW_TEMPLATES };