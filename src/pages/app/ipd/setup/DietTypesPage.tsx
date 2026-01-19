import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DIET_TYPES } from "@/hooks/useDietCharts";
import { Apple, Droplet, Heart, AlertTriangle, Pill, Utensils, Ban, Leaf, Beef, FlaskConical, Salad, Sparkles, Syringe, Settings2 } from "lucide-react";

const DIET_TYPE_CONFIG: Record<string, { label: string; description: string; icon: React.ReactNode; color: string }> = {
  normal: {
    label: "Normal / Regular",
    description: "Standard balanced diet with no restrictions",
    icon: <Utensils className="h-5 w-5" />,
    color: "bg-green-100 text-green-800 border-green-200",
  },
  soft: {
    label: "Soft Diet",
    description: "Easy to chew and digest foods",
    icon: <Leaf className="h-5 w-5" />,
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  liquid: {
    label: "Full Liquid",
    description: "All liquids including milk, juices, and soups",
    icon: <Droplet className="h-5 w-5" />,
    color: "bg-cyan-100 text-cyan-800 border-cyan-200",
  },
  clear_liquid: {
    label: "Clear Liquid",
    description: "Clear fluids only - water, broth, clear juices",
    icon: <Droplet className="h-5 w-5" />,
    color: "bg-sky-100 text-sky-800 border-sky-200",
  },
  npo: {
    label: "NPO (Nothing By Mouth)",
    description: "No oral intake - pre-surgery or specific conditions",
    icon: <Ban className="h-5 w-5" />,
    color: "bg-red-100 text-red-800 border-red-200",
  },
  diabetic: {
    label: "Diabetic Diet",
    description: "Controlled carbohydrate and sugar intake",
    icon: <AlertTriangle className="h-5 w-5" />,
    color: "bg-orange-100 text-orange-800 border-orange-200",
  },
  renal: {
    label: "Renal Diet",
    description: "Low sodium, potassium, and phosphorus for kidney patients",
    icon: <FlaskConical className="h-5 w-5" />,
    color: "bg-pink-100 text-pink-800 border-pink-200",
  },
  cardiac: {
    label: "Cardiac Diet",
    description: "Heart-healthy, low cholesterol and sodium",
    icon: <Heart className="h-5 w-5" />,
    color: "bg-rose-100 text-rose-800 border-rose-200",
  },
  low_sodium: {
    label: "Low Sodium",
    description: "Restricted salt intake for hypertension",
    icon: <Sparkles className="h-5 w-5" />,
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  high_protein: {
    label: "High Protein",
    description: "Increased protein for healing and recovery",
    icon: <Beef className="h-5 w-5" />,
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  low_fat: {
    label: "Low Fat",
    description: "Reduced fat content for digestive health",
    icon: <Salad className="h-5 w-5" />,
    color: "bg-lime-100 text-lime-800 border-lime-200",
  },
  bland: {
    label: "Bland Diet",
    description: "Non-irritating foods for GI conditions",
    icon: <Apple className="h-5 w-5" />,
    color: "bg-stone-100 text-stone-800 border-stone-200",
  },
  pureed: {
    label: "Pureed",
    description: "Blended foods for swallowing difficulties",
    icon: <Pill className="h-5 w-5" />,
    color: "bg-violet-100 text-violet-800 border-violet-200",
  },
  tube_feeding: {
    label: "Tube Feeding",
    description: "Enteral nutrition via feeding tube",
    icon: <Syringe className="h-5 w-5" />,
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  custom: {
    label: "Custom Diet",
    description: "Customized diet based on specific patient needs",
    icon: <Settings2 className="h-5 w-5" />,
    color: "bg-gray-100 text-gray-800 border-gray-200",
  },
};

export default function DietTypesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Diet Types"
        description="Available diet types for patient nutrition management in IPD"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Apple className="h-5 w-5 text-primary" />
            Diet Types Configuration
          </CardTitle>
          <CardDescription>
            These diet types are available when prescribing nutrition plans for admitted patients.
            Contact system administrator to add or modify diet types.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {DIET_TYPES.map((type) => {
              const config = DIET_TYPE_CONFIG[type] || {
                label: type.replace(/_/g, " ").toUpperCase(),
                description: "Diet type configuration",
                icon: <Utensils className="h-5 w-5" />,
                color: "bg-gray-100 text-gray-800 border-gray-200",
              };

              return (
                <div
                  key={type}
                  className={`p-4 rounded-lg border ${config.color} flex items-start gap-3`}
                >
                  <div className="mt-0.5">{config.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium">{config.label}</h3>
                    <p className="text-sm opacity-80 mt-1">{config.description}</p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {type}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage Notes</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <ul className="space-y-2 text-muted-foreground">
            <li>Diet types are assigned to patients through the <strong>Diet Management</strong> page in IPD</li>
            <li>Each patient can have one active diet chart at a time</li>
            <li>Diet charts include meal timings, restrictions, and special instructions</li>
            <li><strong>NPO</strong> status is critical and should be verified before any procedure</li>
            <li>Custom diets allow for specific patient requirements not covered by standard types</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
