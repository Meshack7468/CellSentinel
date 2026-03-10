import { Link } from "react-router-dom";
import { Microscope, Dna, HeartPulse, Activity, TrendingUp, FileImage } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const modules = [
  {
    title: "Image Classification",
    description: "Upload histopathology images for AI-powered benign/malignant classification",
    icon: Microscope,
    href: "/classify",
    stat: "—",
    statLabel: "Classifications",
  },
  {
    title: "Molecular Subtype",
    description: "Predict molecular subtype from clinical and genomic features",
    icon: Dna,
    href: "/subtype",
    stat: "—",
    statLabel: "Predictions",
  },
  {
    title: "Survival Prediction",
    description: "Estimate survival probability based on patient clinical data",
    icon: HeartPulse,
    href: "/survival",
    stat: "—",
    statLabel: "Assessments",
  },
];

const recentActivity = [
  { id: 1, type: "classification", label: "Image classified as Malignant", time: "Just now", confidence: 0.94 },
  { id: 2, type: "subtype", label: "Luminal A subtype predicted", time: "2 min ago", confidence: 0.87 },
  { id: 3, type: "survival", label: "Low-risk survival assessment", time: "5 min ago", confidence: 0.91 },
];

export default function Index() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          AI-powered breast cancer analysis tools for clinical decision support
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileImage className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">—</p>
              <p className="text-xs text-muted-foreground">Total Classifications</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-accent">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">—</p>
              <p className="text-xs text-muted-foreground">Subtype Predictions</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-info">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
              <Activity className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">—</p>
              <p className="text-xs text-muted-foreground">Survival Assessments</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {modules.map((mod) => (
          <Card key={mod.href} className="group hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <mod.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">{mod.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-sm">{mod.description}</CardDescription>
              <Button asChild className="w-full">
                <Link to={mod.href}>Open Module</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <CardDescription>Latest predictions across all modules (demo data)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-sm text-foreground">{item.label}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-medium text-primary">
                    {(item.confidence * 100).toFixed(0)}%
                  </span>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
