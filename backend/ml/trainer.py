import json
import pickle
import os
from datetime import datetime, timezone

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
from sklearn.preprocessing import LabelEncoder

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "model.pkl")
ENCODER_PATH = os.path.join(os.path.dirname(__file__), "..", "encoder.pkl")
METRICS_PATH = os.path.join(os.path.dirname(__file__), "..", "model_metrics.json")

FEATURE_COLUMNS = ["attendance_score", "assignment_score", "ca_score", "exam_score"]
TARGET_GRADES = ["A", "B", "C", "D", "F"]


class ModelTrainer:
    def __init__(self):
        self.model: RandomForestClassifier | None = None
        self.label_encoder: LabelEncoder | None = None
        self.metrics: dict = {}

    def train(self, records: list[dict]) -> dict:
        """Train the Random Forest model on academic records. Returns performance metrics."""
        if len(records) < 10:
            raise ValueError(f"Insufficient training data. Need at least 10 records, got {len(records)}.")

        df = pd.DataFrame(records)

        # Ensure required columns
        for col in FEATURE_COLUMNS:
            if col not in df.columns:
                raise ValueError(f"Missing required feature column: {col}")
        if "grade" not in df.columns:
            raise ValueError("Missing target column: grade")

        X = df[FEATURE_COLUMNS].values
        y_raw = df["grade"].values

        self.label_encoder = LabelEncoder()
        y = self.label_encoder.fit_transform(y_raw)

        try:
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        except ValueError:
            # stratify fails when some classes have too few samples — fall back to unstratified
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            class_weight="balanced",
        )
        self.model.fit(X_train, y_train)

        y_pred = self.model.predict(X_test)

        self.metrics = {
            "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
            "precision": round(float(precision_score(y_test, y_pred, average="weighted", zero_division=0)), 4),
            "recall": round(float(recall_score(y_test, y_pred, average="weighted", zero_division=0)), 4),
            "f1_score": round(float(f1_score(y_test, y_pred, average="weighted", zero_division=0)), 4),
            "training_samples": len(records),
            "test_samples": len(X_test),
            "features": FEATURE_COLUMNS,
            "trained_at": datetime.now(timezone.utc).isoformat(),
            "feature_importance": dict(
                zip(FEATURE_COLUMNS, [round(float(i), 4) for i in self.model.feature_importances_])
            ),
        }

        self._save()
        return self.metrics

    def _save(self):
        if self.model is None or self.label_encoder is None:
            return
        with open(MODEL_PATH, "wb") as f:
            pickle.dump(self.model, f)
        with open(ENCODER_PATH, "wb") as f:
            pickle.dump(self.label_encoder, f)
        with open(METRICS_PATH, "w") as f:
            json.dump(self.metrics, f, indent=2)

    @classmethod
    def load(cls) -> "ModelTrainer | None":
        if not os.path.exists(MODEL_PATH) or not os.path.exists(ENCODER_PATH):
            return None
        instance = cls()
        with open(MODEL_PATH, "rb") as f:
            instance.model = pickle.load(f)
        with open(ENCODER_PATH, "rb") as f:
            instance.label_encoder = pickle.load(f)
        if os.path.exists(METRICS_PATH):
            with open(METRICS_PATH, "r") as f:
                instance.metrics = json.load(f)
        return instance

    @classmethod
    def get_saved_metrics(cls) -> dict | None:
        if not os.path.exists(METRICS_PATH):
            return None
        with open(METRICS_PATH, "r") as f:
            return json.load(f)
