import { useState } from "react";
import { Loader2, HeartPulse, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

import { useToast } from "@/hooks/use-toast";
import { predictSurvival, defaultClinicalInput, type SurvivalInput, type SurvivalResult } from "@/lib/api";
import ClinicalInputForm from "@/components/ClinicalInputForm";

export default function SurvivalPrediction() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SurvivalResult | null>(null);
  const [form, setForm] = useState<SurvivalInput>({ ...defaultClinicalInput });
  const { toast } = useToast();

  const update = (field: keyof SurvivalInput, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await predictSurvival(form);
      setResult(res);
      toast({ title: "Prediction complete", description: `Status: ${res.prediction}` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not reach the API.";
      toast({ title: "Prediction failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const isLiving = result?.prediction?.toUpperCase() === "LIVING";

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Survival Status Prediction</h1>
        <p className="text-muted-foreground mt-1">
          Enter patient clinical data to predict whether the survival status is LIVING or DECEASED.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Input form ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Patient Clinical Data</CardTitle>
            <CardDescription>Fill in all fields then click Predict</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ClinicalInputForm form={form} onUpdate={update} />


            <Button className="w-full" disabled={loading} onClick={handlePredict}>
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Predicting…</>
              ) : (
                <><HeartPulse className="h-4 w-4" /> Predict Survival Status</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* ── Results ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prediction Result</CardTitle>
            <CardDescription>Survival classification from /predict-survival</CardDescription>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <HeartPulse className="h-12 w-12 mb-3 opacity-20" />
                <p className="text-sm">Enter patient data and click Predict</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Main verdict card */}
                <div
                  className={`flex items-center gap-4 p-5 rounded-lg ${
                    isLiving
                      ? "bg-success/10 border border-success/30"
                      : "bg-destructive/10 border border-destructive/30"
                  }`}
                >
                  {isLiving ? (
                    <CheckCircle2 className="h-10 w-10 text-success shrink-0" />
                  ) : (
                    <AlertCircle className="h-10 w-10 text-destructive shrink-0" />
                  )}
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Predicted Status</p>
                    <Badge
                      className={`text-base px-4 py-1 ${
                        isLiving
                          ? "bg-success text-success-foreground"
                          : "bg-destructive text-destructive-foreground"
                      }`}
                    >
                      {result.prediction}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
