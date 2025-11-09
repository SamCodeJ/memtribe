import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Lock } from "lucide-react";

const PHOTOBOOK_TEMPLATES = [
  // ===== STARTER TIER (Free) =====
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean layouts with plenty of white space",
    preview: "bg-white border",
    layoutStyle: "grid",
    planRequired: "starter"
  },
  {
    id: "classic",
    name: "Classic Album",
    description: "Traditional photo album style with borders",
    preview: "bg-gradient-to-br from-amber-50 to-orange-50",
    layoutStyle: "album",
    planRequired: "starter"
  },
  {
    id: "simple-grid",
    name: "Simple Grid",
    description: "Straightforward grid layout perfect for beginners",
    preview: "bg-gradient-to-br from-gray-50 to-slate-50",
    layoutStyle: "simple-grid",
    planRequired: "starter"
  },
  
  // ===== PRO TIER =====
  {
    id: "magazine",
    name: "Magazine", 
    description: "Dynamic layouts with varied photo sizes",
    preview: "bg-gradient-to-br from-slate-50 to-slate-100",
    layoutStyle: "masonry",
    planRequired: "pro"
  },
  {
    id: "modern",
    name: "Modern Grid",
    description: "Contemporary grid layout with bold typography",
    preview: "bg-gradient-to-br from-blue-50 to-cyan-50",
    layoutStyle: "modern-grid",
    planRequired: "pro"
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Refined layouts with elegant spacing",
    preview: "bg-gradient-to-br from-purple-50 to-pink-50",
    layoutStyle: "elegant",
    planRequired: "pro"
  },
  {
    id: "wedding",
    name: "Wedding",
    description: "Romantic layout perfect for wedding memories",
    preview: "bg-gradient-to-br from-rose-50 to-pink-50",
    layoutStyle: "wedding",
    planRequired: "pro"
  },
  {
    id: "travel-journal",
    name: "Travel Journal",
    description: "Adventure-inspired design with map aesthetics",
    preview: "bg-gradient-to-br from-teal-50 to-cyan-50",
    layoutStyle: "travel",
    planRequired: "pro"
  },
  
  // ===== BUSINESS TIER =====
  {
    id: "scrapbook",
    name: "Scrapbook",
    description: "Playful design with decorative elements",
    preview: "bg-gradient-to-br from-pink-50 to-yellow-50",
    layoutStyle: "creative",
    planRequired: "business"
  },
  {
    id: "vintage",
    name: "Vintage",
    description: "Nostalgic design with retro aesthetics",
    preview: "bg-gradient-to-br from-amber-100 to-yellow-100",
    layoutStyle: "vintage",
    planRequired: "business"
  },
  {
    id: "storyteller",
    name: "Storyteller",
    description: "Narrative style with space for captions",
    preview: "bg-gradient-to-br from-green-50 to-emerald-50",
    layoutStyle: "story",
    planRequired: "business"
  },
  {
    id: "yearbook",
    name: "Yearbook",
    description: "Classic yearbook style with captions and dates",
    preview: "bg-gradient-to-br from-blue-100 to-indigo-100",
    layoutStyle: "yearbook",
    planRequired: "business"
  },
  
  // ===== ENTERPRISE TIER =====
  {
    id: "professional",
    name: "Professional",
    description: "Sophisticated layouts for corporate events",
    preview: "bg-gradient-to-br from-slate-800 to-slate-900",
    layoutStyle: "formal",
    planRequired: "enterprise"
  },
  {
    id: "luxury",
    name: "Luxury",
    description: "Premium design with golden accents",
    preview: "bg-gradient-to-br from-yellow-100 to-amber-200",
    layoutStyle: "luxury",
    planRequired: "enterprise"
  },
  {
    id: "polaroid",
    name: "Polaroid",
    description: "Instant photo style with handwritten feel",
    preview: "bg-gradient-to-br from-gray-100 to-slate-200",
    layoutStyle: "polaroid",
    planRequired: "enterprise"
  },
  {
    id: "collage",
    name: "Artistic Collage",
    description: "Creative mix of overlapping photos",
    preview: "bg-gradient-to-br from-rose-50 to-orange-50",
    layoutStyle: "collage",
    planRequired: "enterprise"
  },
  {
    id: "fashion",
    name: "Fashion Editorial",
    description: "High-fashion editorial style layouts",
    preview: "bg-gradient-to-br from-black to-gray-900",
    layoutStyle: "fashion",
    planRequired: "enterprise"
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