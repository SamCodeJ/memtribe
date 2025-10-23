import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Lock } from "lucide-react";

const PHOTOBOOK_TEMPLATES = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean layouts with plenty of white space",
    preview: "bg-white border",
    layoutStyle: "grid",
    planRequired: "starter"
  },
  {
    id: "magazine",
    name: "Magazine", 
    description: "Dynamic layouts with varied photo sizes",
    preview: "bg-gradient-to-br from-slate-50 to-slate-100",
    layoutStyle: "masonry",
    planRequired: "pro"
  },
  {
    id: "scrapbook",
    name: "Scrapbook",
    description: "Playful design with decorative elements",
    preview: "bg-gradient-to-br from-pink-50 to-yellow-50",
    layoutStyle: "creative",
    planRequired: "business"
  },
  {
    id: "professional",
    name: "Professional",
    description: "Sophisticated layouts for corporate events",
    preview: "bg-gradient-to-br from-slate-800 to-slate-900",
    layoutStyle: "formal",
    planRequired: "enterprise"
  }
];

export default function PhotobookTemplates({ selectedTemplate, onTemplateSelect, currentPlan }) {
  const canUseTemplate = (template) => {
    const planHierarchy = ["starter", "pro", "business", "enterprise"];
    const userPlanIndex = planHierarchy.indexOf(currentPlan?.name?.toLowerCase() || "starter");
    const requiredPlanIndex = planHierarchy.indexOf(template.planRequired);
    return userPlanIndex >= requiredPlanIndex;
  };

  return (
    <div className="space-y-3">
      {PHOTOBOOK_TEMPLATES.map((template) => {
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
                {/* Mock layout preview */}
                <div className="absolute inset-1 space-y-px">
                  <div className="h-1 bg-slate-400 rounded w-3/4"></div>
                  <div className="flex gap-px">
                    <div className="h-3 w-3 bg-slate-500 rounded-sm"></div>
                    <div className="h-3 w-4 bg-slate-500 rounded-sm"></div>
                  </div>
                  <div className="h-px bg-slate-400 w-full"></div>
                  <div className="h-px bg-slate-400 w-2/3"></div>
                </div>
                
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

export { PHOTOBOOK_TEMPLATES };