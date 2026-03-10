import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SubtypeInput } from "@/lib/api";

export type ClinicalFormData = SubtypeInput;

interface Props {
  form: ClinicalFormData;
  onUpdate: (field: keyof ClinicalFormData, value: string | number) => void;
}

export default function ClinicalInputForm({ form, onUpdate }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">

        {/* Age */}
        <div className="space-y-1.5">
          <Label className="text-xs">Age at Diagnosis</Label>
          <Input
            type="number" min={0} max={120}
            value={form.Age_at_Diagnosis}
            onChange={(e) => onUpdate("Age_at_Diagnosis", +e.target.value)}
          />
        </div>

        {/* Surgery type */}
        <div className="space-y-1.5">
          <Label className="text-xs">Breast Surgery Type</Label>
          <Select value={form.Type_of_Breast_Surgery} onValueChange={(v) => onUpdate("Type_of_Breast_Surgery", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="MASTECTOMY">MASTECTOMY</SelectItem>
              <SelectItem value="BREAST CONSERVING">BREAST CONSERVING</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ER status */}
        <div className="space-y-1.5">
          <Label className="text-xs">ER Status</Label>
          <Select value={form.ER_Status} onValueChange={(v) => onUpdate("ER_Status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Positive">Positive</SelectItem>
              <SelectItem value="Negative">Negative</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* HER2 status */}
        <div className="space-y-1.5">
          <Label className="text-xs">HER2 Status</Label>
          <Select value={form.HER2_Status} onValueChange={(v) => onUpdate("HER2_Status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Positive">Positive</SelectItem>
              <SelectItem value="Negative">Negative</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* TMB */}
        <div className="space-y-1.5">
          <Label className="text-xs">TMB (nonsynonymous)</Label>
          <Input
            type="number" step={0.1} min={0} max={110}
            value={form.TMB_nonsynonymous}
            onChange={(e) => onUpdate("TMB_nonsynonymous", +e.target.value)}
          />
        </div>

        {/* Tumor stage */}
        <div className="space-y-1.5">
          <Label className="text-xs">Tumor Stage</Label>
          <Select value={form.Tumor_Stage} onValueChange={(v) => onUpdate("Tumor_Stage", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["0.0", "1.0", "2.0", "3.0", "4.0"].map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 3-Gene classifier */}
        <div className="space-y-1.5 col-span-2">
          <Label className="text-xs">3-Gene Classifier Subtype</Label>
          <Select value={form.Three_Gene_classifier_subtype} onValueChange={(v) => onUpdate("Three_Gene_classifier_subtype", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ER+/HER2- Low Prolif">ER+/HER2- Low Prolif</SelectItem>
              <SelectItem value="ER+/HER2- High Prolif">ER+/HER2- High Prolif</SelectItem>
              <SelectItem value="ER-/HER2-">ER-/HER2-</SelectItem>
              <SelectItem value="HER2+">HER2+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* PR status */}
        <div className="space-y-1.5">
          <Label className="text-xs">PR Status</Label>
          <Select value={form.PR_Status} onValueChange={(v) => onUpdate("PR_Status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Positive">Positive</SelectItem>
              <SelectItem value="Negative">Negative</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lymph nodes */}
        <div className="space-y-1.5">
          <Label className="text-xs">Lymph Nodes Positive</Label>
          <Input
            type="number" min={0} max={50}
            value={form.Lymph_nodes_examined_positive}
            onChange={(e) => onUpdate("Lymph_nodes_examined_positive", +e.target.value)}
          />
        </div>

        {/* Integrative cluster */}
        <div className="space-y-1.5">
          <Label className="text-xs">Integrative Cluster</Label>
          <Select value={form.Integrative_Cluster} onValueChange={(v) => onUpdate("Integrative_Cluster", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["1", "2", "3", "4ER+", "4ER-", "5", "6", "7", "8", "9", "10"].map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Nottingham prognostic index */}
        <div className="space-y-1.5">
          <Label className="text-xs">Nottingham Prognostic Index</Label>
          <Input
            type="number" step={0.001} min={0} max={10}
            value={form.Nottingham_prognostic_index}
            onChange={(e) => onUpdate("Nottingham_prognostic_index", +e.target.value)}
          />
        </div>

        {/* Histologic subtype */}
        <div className="space-y-1.5 col-span-2">
          <Label className="text-xs">Tumor Histologic Subtype</Label>
          <Select value={form.Tumor_Other_Histologic_Subtype} onValueChange={(v) => onUpdate("Tumor_Other_Histologic_Subtype", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Ductal/NST", "Mixed", "Lobular", "Medullary", "Mucinous", "Tubular/ cribriform", "Other", "Metaplastic"].map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>


      </div>
    </div>
  );
}
