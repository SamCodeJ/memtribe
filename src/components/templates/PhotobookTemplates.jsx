import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Lock } from "lucide-react";

const PHOTOBOOK_TEMPLATES = [
  // ===== STARTER TIER (Free) =====
  {
    id: "grid",
    name: "Grid Layout",
    description: "Classic grid - equal sized photos in rows and columns",
    layoutStyle: "grid",
    planRequired: "starter",
    previewLayout: (
      <div className="absolute inset-1 grid grid-cols-2 gap-px">
        <div className="bg-slate-500 rounded-sm"></div>
        <div className="bg-slate-500 rounded-sm"></div>
        <div className="bg-slate-500 rounded-sm"></div>
        <div className="bg-slate-500 rounded-sm"></div>
      </div>
    )
  },
  {
    id: "single-large",
    name: "Single Photo",
    description: "One large photo per page with caption below",
    layoutStyle: "single-large",
    planRequired: "starter",
    previewLayout: (
      <div className="absolute inset-1 flex flex-col gap-px">
        <div className="bg-slate-500 rounded-sm flex-1"></div>
        <div className="h-1 bg-slate-400 w-3/4"></div>
      </div>
    )
  },
  
  // ===== PRO TIER =====
  {
    id: "masonry",
    name: "Masonry", 
    description: "Pinterest-style varied photo sizes flowing naturally",
    layoutStyle: "masonry",
    planRequired: "pro",
    previewLayout: (
      <div className="absolute inset-1 grid grid-cols-2 gap-px">
        <div className="bg-slate-500 rounded-sm row-span-2"></div>
        <div className="bg-slate-500 rounded-sm"></div>
        <div className="bg-slate-500 rounded-sm"></div>
      </div>
    )
  },
  {
    id: "magazine-spread",
    name: "Magazine Spread",
    description: "Large feature photo with smaller side images",
    layoutStyle: "magazine-spread",
    planRequired: "pro",
    previewLayout: (
      <div className="absolute inset-1 flex gap-px">
        <div className="bg-slate-500 rounded-sm flex-1"></div>
        <div className="flex flex-col gap-px w-1/3">
          <div className="bg-slate-500 rounded-sm flex-1"></div>
          <div className="bg-slate-500 rounded-sm flex-1"></div>
        </div>
      </div>
    )
  },
  {
    id: "two-column",
    name: "Two Column",
    description: "Two photos side by side on each page",
    layoutStyle: "two-column",
    planRequired: "pro",
    previewLayout: (
      <div className="absolute inset-1 grid grid-cols-2 gap-px">
        <div className="bg-slate-500 rounded-sm"></div>
        <div className="bg-slate-500 rounded-sm"></div>
      </div>
    )
  },
  
  // ===== BUSINESS TIER =====
  {
    id: "polaroid-stack",
    name: "Polaroid Stack",
    description: "Photos styled as polaroids with handwritten captions",
    layoutStyle: "polaroid-stack",
    planRequired: "business",
    previewLayout: (
      <div className="absolute inset-1 flex items-center justify-center">
        <div className="bg-white border-2 border-slate-400 rounded-sm w-7 h-8 shadow-md transform rotate-3">
          <div className="bg-slate-500 m-1 h-5"></div>
        </div>
      </div>
    )
  },
  {
    id: "collage",
    name: "Creative Collage",
    description: "Overlapping photos with rotation and depth",
    layoutStyle: "collage",
    planRequired: "business",
    previewLayout: (
      <div className="absolute inset-1 flex items-center justify-center">
        <div className="bg-slate-500 w-6 h-6 rounded-sm absolute transform rotate-12"></div>
        <div className="bg-slate-600 w-5 h-5 rounded-sm absolute transform -rotate-6 translate-x-1"></div>
      </div>
    )
  },
  {
    id: "storyteller",
    name: "Storyteller",
    description: "Large caption areas for detailed stories with photos",
    layoutStyle: "storyteller",
    planRequired: "business",
    previewLayout: (
      <div className="absolute inset-1 flex flex-col gap-px">
        <div className="h-2 bg-slate-400 rounded w-full"></div>
        <div className="h-1 bg-slate-400 rounded w-4/5"></div>
        <div className="bg-slate-500 rounded-sm flex-1 mt-px"></div>
      </div>
    )
  },
  
  // ===== ENTERPRISE TIER =====
  {
    id: "full-bleed",
    name: "Full Bleed",
    description: "Edge-to-edge photos with no margins",
    layoutStyle: "full-bleed",
    planRequired: "enterprise",
    previewLayout: (
      <div className="absolute inset-0">
        <div className="bg-slate-500 w-full h-full"></div>
      </div>
    )
  },
  {
    id: "cinematic",
    name: "Cinematic",
    description: "Widescreen format with letterbox styling",
    layoutStyle: "cinematic",
    planRequired: "enterprise",
    previewLayout: (
      <div className="absolute inset-1 flex items-center">
        <div className="bg-slate-500 w-full h-3/5 rounded-sm"></div>
      </div>
    )
  },
  {
    id: "editorial",
    name: "Editorial",
    description: "High-fashion layout with asymmetric composition",
    layoutStyle: "editorial",
    planRequired: "enterprise",
    previewLayout: (
      <div className="absolute inset-1 grid grid-rows-3 gap-px">
        <div className="bg-slate-500 rounded-sm row-span-2"></div>
        <div className="grid grid-cols-2 gap-px">
          <div className="bg-slate-500 rounded-sm"></div>
          <div className="bg-slate-500 rounded-sm"></div>
        </div>
      </div>
    )
  }
];

export default function PhotobookTemplates({ selectedTemplate, onTemplateSelect, currentPlan }) {
  const canUseTemplate = (template) => {
    const planHierarchy = ["starter", "pro", "business", "enterprise"];
    // Use slug if available, otherwise fall back to lowercase name
    const userPlan = currentPlan?.slug || currentPlan?.name?.toLowerCase() || "starter";
    const userPlanIndex = planHierarchy.indexOf(userPlan);
    const requiredPlanIndex = planHierarchy.indexOf(template.planRequired);
    
    // Debug logging
    console.log('🔍 Template Check:', {
      template: template.name,
      userPlan,
      currentPlan,
      userPlanIndex,
      requiredPlanIndex,
      canUse: userPlanIndex >= requiredPlanIndex
    });
    
    return userPlanIndex >= requiredPlanIndex;
  };

  return (
    <div className="grid grid-cols-2 gap-3">
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
            <div className="flex flex-col gap-2">
              {/* Template Preview */}
              <div className="w-full aspect-square rounded-md bg-white border border-slate-200 relative overflow-hidden">
                {/* Unique layout preview */}
                {template.previewLayout}
                
                {isSelected && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center z-10">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                
                {!canUse && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              
              {/* Template Info */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-slate-900 truncate">{template.name}</h3>
                  <Badge 
                    variant={canUse ? "secondary" : "destructive"}
                    className="text-[10px] px-1.5 py-0 flex-shrink-0"
                  >
                    {template.planRequired}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{template.description}</p>
                {!canUse && (
                  <p className="text-xs text-red-600 mt-0.5">Upgrade required</p>
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