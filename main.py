import pickle
import numpy as np
import pandas as pd
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from PIL import Image
import io
from tensorflow.keras.models import load_model
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Breast Cancer Prediction API")

# Allow CORS for testing
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

# Input model
class PatientData(BaseModel):
    Age_at_Diagnosis: int
    Type_of_Breast_Surgery: str
    ER_Status: str
    HER2_Status: str
    TMB_nonsynonymous: float
    Tumor_Stage: int
    Three_Gene_classifier_subtype: str
    PR_Status: str
    Lymph_nodes_examined_positive: int
    Integrative_Cluster: int
    Nottingham_prognostic_index: float
    Tumor_Other_Histologic_Subtype: str

# Load models
molecular_model = pickle.load(open("models/molecular_subtype_model.pkl", "rb"))
molecular_le = pickle.load(open("models/molecular_le.pkl", "rb"))
survival_model = pickle.load(open("models/survival_status_model.pkl", "rb"))
cnn_model = load_model("models/cnn_model.keras")

# Home route
@app.get("/")
def home():
    return {"message": "B-C Multi-Model Prediction API"}

# Helper function: prepare dataframe for models
def prepare_dataframe(data: PatientData):
    df = pd.DataFrame([data.dict()])

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

# Image classification
@app.post("/predict-image")
async def predict_image(file: UploadFile = File(...)):
    image_bytes = await file.read()
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((224, 224))
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    
    prediction = cnn_model.predict(img_array)[0][0]
    result = "Malignant" if prediction > 0.5 else "Benign"

    return {
        "prediction": result,
        "confidence": float(prediction)
    }

# Subtype prediction
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

# Survival prediction
@app.post("/predict-survival")
def predict_survival(data: PatientData):
    try:
        df = prepare_dataframe(data)
        df = df.astype(object)
        pred = int(survival_model.predict(df)[0])
        output = "DECEASED" if pred == 1 else "LIVING"
        return {"prediction": output}
    except Exception as e:
        return {"error": f"Survival prediction failed: {str(e)}"}
