import pickle
import numpy as np
import pandas as pd
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from PIL import Image
import io
from tensorflow.keras.models import load_model
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Breast Cancer Multi-Model Prediction API")


# Allow CORS (for frontend use)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Training feature names

TRAINING_COLUMNS = [
    "Age at Diagnosis",
    "Type of Breast Surgery",
    "ER Status",
    "HER2 Status",
    "TMB (nonsynonymous)",
    "Tumor Stage",
    "3-Gene classifier subtype",
    "PR Status",
    "Lymph nodes examined positive",
    "Integrative Cluster",
    "Nottingham prognostic index",
    "Tumor Other Histologic Subtype"
]


# Input Schema

class PatientData(BaseModel):
    Age_at_Diagnosis: float
    Type_of_Breast_Surgery: str
    ER_Status: str
    HER2_Status: str
    TMB_nonsynonymous: float
    Tumor_Stage: int
    Three_Gene_classifier_subtype: str
    PR_Status: str
    Lymph_nodes_examined_positive: int
    Integrative_Cluster: str
    Nottingham_prognostic_index: float
    Tumor_Other_Histologic_Subtype: str



# Load Models

with open("models/molecular_subtype_model.pkl", "rb") as f:
    molecular_model = pickle.load(f)

with open("models/molecular_le.pkl", "rb") as f:
    molecular_le = pickle.load(f)

with open("models/survival_status_model.pkl", "rb") as f:
    survival_model = pickle.load(f)

cnn_model = load_model("models/cnn_model.keras")


# Health check

@app.get("/")
def home():
    return {"message": "Breast Cancer Multi-Model Prediction API"}

@app.get("/health")
def health():
    return {"status": "API running"}


# Helper function

def prepare_dataframe(data: PatientData):

    df = pd.DataFrame([data.model_dump()])

    df = df.rename(columns={
        "Age_at_Diagnosis": "Age at Diagnosis",
        "Type_of_Breast_Surgery": "Type of Breast Surgery",
        "ER_Status": "ER Status",
        "HER2_Status": "HER2 Status",
        "TMB_nonsynonymous": "TMB (nonsynonymous)",
        "Tumor_Stage": "Tumor Stage",
        "Three_Gene_classifier_subtype": "3-Gene classifier subtype",
        "PR_Status": "PR Status",
        "Lymph_nodes_examined_positive": "Lymph nodes examined positive",
        "Integrative_Cluster": "Integrative Cluster",
        "Nottingham_prognostic_index": "Nottingham prognostic index",
        "Tumor_Other_Histologic_Subtype": "Tumor Other Histologic Subtype"
    })

    df = df[TRAINING_COLUMNS]

    return df

# -----------------------------
# Image Classification Endpoint
# -----------------------------
@app.post("/predict-image")
async def predict_image(file: UploadFile = File(...)):

    if not file.content_type.startswith("image"):
        return {"error": "Uploaded file must be an image"}

    image_bytes = await file.read()

    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((224, 224))

    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    prediction = cnn_model.predict(img_array)[0][0]

    if prediction > 0.5:
        result = "Malignant"
        confidence = prediction
    else:
        result = "Benign"
        confidence = 1 - prediction

    return {
        "prediction": result,
        "confidence": float(confidence)
    }


# Molecular Subtype Prediction

@app.post("/predict-subtype")
def predict_subtype(data: PatientData):

    df = prepare_dataframe(data)

    pred_numeric = molecular_model.predict(df)[0]
    pred_label = molecular_le.inverse_transform([pred_numeric])[0]

    treatment = "Radiotherapy and chemotherapy"

    if "LUMA" in pred_label:
        treatment = "Hormone therapy, Radiotherapy"

    elif "LUMB" in pred_label:
        treatment = "Hormone therapy, Chemotherapy, Radiotherapy"

    elif "HER2" in pred_label:
        treatment = "Chemotherapy, Radiotherapy"

    elif "BASAL" in pred_label:
        treatment = "Chemotherapy, Radiotherapy"

    elif "CLAUDIN-LOW" in pred_label:
        treatment = "Chemotherapy, Radiotherapy"

    return {
        "molecular_subtype": pred_label,
        "recommended_treatment": treatment
    }


# Survival Prediction

@app.post("/predict-survival")
def predict_survival(data: PatientData):

    try:
        df = prepare_dataframe(data)

        pred = int(survival_model.predict(df)[0])

        
        confidence = None
        if hasattr(survival_model, "predict_proba"):
            confidence = float(survival_model.predict_proba(df)[0][1])

        output = "DECEASED" if pred == 1 else "LIVING"

        return {
            "prediction": output,
            "confidence": confidence
        }

    except Exception as e:
        return {"error": f"Survival prediction failed: {str(e)}"}
