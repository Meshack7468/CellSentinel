import { useState } from "react";
import { Loader2, Dna } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { predictSubtype, defaultClinicalInput, type SubtypeInput, type SubtypeResult } from "@/lib/api";
import ClinicalInputForm from "@/components/ClinicalInputForm";

const SUBTYPE_COLORS: Record<string, string> = {
  LUMA: "hsl(187 65% 38%)",
  LUMB: "hsl(210 80% 55%)",
  HER2: "hsl(38 92% 50%)",
  BASAL: "hsl(0 72% 51%)",
  "CLAUDIN-LOW": "hsl(280 60% 50%)",
};

export default function MolecularSubtype() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SubtypeResult | null>(null);
  const [form, setForm] = useState<SubtypeInput>({ ...defaultClinicalInput });
  const { toast } = useToast();

  const update = (field: keyof SubtypeInput, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await predictSubtype(form);
      setResult(res);
      toast({ title: "Prediction complete", description: `Subtype: ${res.molecular_subtype}` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not reach the API.";
      toast({ title: "Prediction failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const subtypeColor = result
    ? SUBTYPE_COLORS[result.molecular_subtype] ?? "hsl(var(--primary))"
    : "hsl(var(--primary))";

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Molecular Subtype Prediction</h1>
        <p className="text-muted-foreground mt-1">
          Enter clinical features — the model will classify the breast cancer molecular subtype and suggest treatment guidance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Input form ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Patient Clinical Features</CardTitle>
            <CardDescription>Fill in all fields then click Predict</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ClinicalInputForm form={form} onUpdate={update} />
            <Button className="w-full" disabled={loading} onClick={handlePredict}>
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Predicting…</>
              ) : (
                <><Dna className="h-4 w-4" /> Predict Subtype</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* ── Results ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prediction Result</CardTitle>
            <CardDescription>Molecular subtype classification from /predict-subtype</CardDescription>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Dna className="h-12 w-12 mb-3 opacity-20" />
                <p className="text-sm">Enter patient features and click Predict</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Predicted subtype badge */}
                <div className="text-center p-5 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Predicted Subtype</p>
                  <p className="text-3xl font-bold" style={{ color: subtypeColor }}>
                    {result.molecular_subtype}
                  </p>
                </div>

                {/* Treatment recommendation */}
                <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-muted-foreground">
                    Recommended Treatment
                  </p>
                  <p className="text-sm font-medium text-foreground">{result.recommended_treatment}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}