import pickle
import numpy as np
import pandas as pd
from fastapi import FastAPI, UploadFile, File
from tensorflow.keras.models import load_model
from pydantic import BaseModel
from PIL import Image
import io

class PatientData(BaseModel):
    Age_at_Diagnosis: int
    Type_of_Breast_Surgery: str
    ER_Status: str
    HER2_Status: str
    Neoplasm_Histologic_Grade: str
    TMB_nonsynonymous: float
    Tumor_Stage: str
    Three_Gene_classifier_subtype: str
    PR_Status: str
    Lymph_nodes_examined_positive: int
    Integrative_Cluster: str
    Hormone_Therapy: str
    Nottingham_prognostic_index: float
    Tumor_Other_Histologic_Subtype: str

app = FastAPI(title="B-C Prediction API")

# -----------------------------
# Load Models
# -----------------------------

molecular_model = pickle.load(open("models/molecular_subtype_model.pkl", "rb"))
molecular_le = pickle.load(open("models/molecular_le.pkl", "rb"))

survival_model = pickle.load(open("models/survival_status_model.pkl", "rb"))

cnn_model = load_model("models/cnn_model.keras")


# Home Route

@app.get("/")
def home():
    return {"message": "B-C Multi-Model Prediction API"}


# Image Classification 


@app.post("/predict-image")
async def predict_image(file: UploadFile = File(...)):

    image_bytes = await file.read()
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    img = img.resize((224,224))
    img_array = np.expand_dims(np.array(img)/255.0, axis=0)

    prediction = cnn_model.predict(img_array)[0][0]

    if prediction > 0.5:
        result = "Malignant"
    else:
        result = "Benign"

    return {
        "prediction": result,
        "confidence": float(prediction)
    }


# Subtype Prediction


@app.post("/predict-subtype")
def predict_subtype(data: PatientData):

    df = pd.DataFrame([data.dict()])

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


# Survival Status Prediction


@app.post("/predict-survival")
def predict_survival(data: PatientData):

    df = pd.DataFrame([data.dict()])

    if hasattr(survival_model, "predict_proba"):
        proba = survival_model.predict_proba(df)[0]
        pred = np.argmax(proba)

        confidence = float(proba[pred] * 100)

        output = "DECEASED" if pred == 1 else "LIVING"

        return {
            "prediction": output,
            "confidence": confidence
        }

    else:
        pred = survival_model.predict(df)[0]
        output = "DECEASED" if pred == 1 else "LIVING"

        return {
            "prediction": output
        }


