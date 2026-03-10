// ── CellSentinel Backend ──────────────────────────────────────────────────────
const BASE = import.meta.env.VITE_API_URL as string;

// ---------- Shared fetch helper (JSON) ----------
async function apiFetch<T>(endpoint: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Server error ${res.status}`);
  }
  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────
//  POST /predict-image   (multipart/form-data, field = "file")
// ─────────────────────────────────────────────────────────────────────────────
export interface ImagePredictionResult {
  prediction: string;    // "Benign" | "Malignant"
  confidence: number;    // raw sigmoid output 0-1
}

export async function predictImage(file: File): Promise<ImagePredictionResult> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE}/predict-image`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Server error ${res.status}`);
  }
  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────
//  POST /predict-subtype   (JSON) — field names match PatientData in backend
// ─────────────────────────────────────────────────────────────────────────────
export interface SubtypeInput {
  Age_at_Diagnosis: number;
  Type_of_Breast_Surgery: string;
  ER_Status: string;
  HER2_Status: string;
  TMB_nonsynonymous: number;
  Tumor_Stage: string;
  Three_Gene_classifier_subtype: string;
  PR_Status: string;
  Lymph_nodes_examined_positive: number;
  Integrative_Cluster: string;
  Nottingham_prognostic_index: number;
  Tumor_Other_Histologic_Subtype: string;
}

export interface SubtypeResult {
  molecular_subtype: string;         // LUMA | LUMB | HER2 | BASAL | CLAUDIN-LOW
  recommended_treatment: string;
}

export async function predictSubtype(input: SubtypeInput): Promise<SubtypeResult> {
  return apiFetch<SubtypeResult>("/predict-subtype", input);
}

// ─────────────────────────────────────────────────────────────────────────────
//  POST /predict-survival   (JSON) — includes Hormone_Therapy field
// ─────────────────────────────────────────────────────────────────────────────
export type SurvivalInput = SubtypeInput;

export interface SurvivalResult {
  prediction: string;       // "LIVING" | "DECEASED"
  confidence?: number;      // percentage 0-100 (already ×100 in backend)
}

export async function predictSurvival(input: SurvivalInput): Promise<SurvivalResult> {
  return apiFetch<SurvivalResult>("/predict-survival", input);
}

// ─────────────────────────────────────────────────────────────────────────────
//  Default clinical input for forms
// ─────────────────────────────────────────────────────────────────────────────
export const defaultClinicalInput: SubtypeInput = {
  Age_at_Diagnosis: 50,
  Type_of_Breast_Surgery: "MASTECTOMY",
  ER_Status: "Positive",
  HER2_Status: "Negative",
  TMB_nonsynonymous: 6.54,
  Tumor_Stage: "2.0",
  Three_Gene_classifier_subtype: "ER+/HER2- Low Prolif",
  PR_Status: "Positive",
  Lymph_nodes_examined_positive: 0,
  Integrative_Cluster: "3",
  Nottingham_prognostic_index: 4.04,
  Tumor_Other_Histologic_Subtype: "Ductal/NST",
};
