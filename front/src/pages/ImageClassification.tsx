import { useState, useCallback } from "react";
import { Upload, Loader2, ImageIcon, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { predictImage, type ImagePredictionResult } from "@/lib/api";

export default function ImageClassification() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImagePredictionResult | null>(null);
  const { toast } = useToast();

  const handleFile = useCallback(
    (f: File) => {
      if (!f.type.startsWith("image/")) {
        toast({ title: "Invalid file", description: "Please upload an image file.", variant: "destructive" });
        return;
      }
      setFile(f);
      setResult(null);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    },
    [toast],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  const handleClassify = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await predictImage(file);
      setResult(res);
      toast({ title: "Classification complete", description: `Predicted: ${res.prediction}` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not reach the API.";
      toast({ title: "Classification failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  // confidence is raw sigmoid (0-1); >0.5 = Malignant
  const isMalignant = result?.prediction?.toLowerCase().includes("malig");
  const confidencePct = result
    ? isMalignant
      ? result.confidence * 100          // raw sigmoid directly = malignant probability
      : (1 - result.confidence) * 100    // flip for benign
    : 0;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Image Classification</h1>
        <p className="text-muted-foreground mt-1">
          Upload a histopathology image — the model will classify it as Benign or Malignant.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Upload panel ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upload Image</CardTitle>
            <CardDescription>Drag & drop or click to select a histopathology image</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!preview ? (
              <label
                className="flex flex-col items-center justify-center h-56 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/40 transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                <span className="text-sm font-medium text-muted-foreground">Drop image here or click to browse</span>
                <span className="text-xs text-muted-foreground mt-1">PNG, JPG, TIFF supported</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </label>
            ) : (
              <div className="relative">
                <img src={preview} alt="Uploaded preview" className="w-full h-56 object-contain rounded-lg bg-muted" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={clearFile}
                >
                  <X className="h-4 w-4" />
                </Button>
                {file && (
                  <div className="mt-2 px-3 py-2 bg-muted rounded-md">
                    <p className="text-xs text-muted-foreground truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                )}
              </div>
            )}

            <Button className="w-full" disabled={!file || loading} onClick={handleClassify}>
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Classifying…</>
              ) : (
                <><ImageIcon className="h-4 w-4" /> Classify Image</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* ── Results panel ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Classification Result</CardTitle>
            <CardDescription>AI prediction output from /predict-image</CardDescription>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="flex flex-col items-center justify-center h-56 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mb-3 opacity-20" />
                <p className="text-sm">Upload and classify an image to see results</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Main verdict */}
                <div className={`flex items-center gap-4 p-5 rounded-lg ${isMalignant ? "bg-destructive/10 border border-destructive/30" : "bg-success/10 border border-success/30"}`}>
                  {isMalignant ? (
                    <AlertCircle className="h-8 w-8 text-destructive shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-8 w-8 text-success shrink-0" />
                  )}
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Predicted Class</p>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={isMalignant ? "bg-destructive text-destructive-foreground" : "bg-success text-success-foreground"}
                      >
                        {result.prediction}
                      </Badge>
                      <span className="text-sm font-semibold text-foreground">
                        {confidencePct.toFixed(1)}% confidence
                      </span>
                    </div>
                  </div>
                </div>

                {/* Confidence bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Model Confidence</span>
                    <span className="font-medium text-foreground">{confidencePct.toFixed(1)}%</span>
                  </div>
                  <Progress value={confidencePct} className="h-3" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
