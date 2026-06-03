import json

import numpy as np

from .trainer import ModelTrainer, FEATURE_COLUMNS

RECOMMENDATIONS = {
    "attendance_score": "Improve class attendance. Regular attendance is strongly correlated with better grades.",
    "assignment_score": "Complete all assignments on time. Seek help from lecturers or peers for difficult topics.",
    "ca_score": "Prepare thoroughly for continuous assessments. Form study groups and review past questions.",
    "exam_score": "Dedicate more time to exam preparation. Practice with past papers and focus on weak areas.",
}


class ModelPredictor:
    def __init__(self, trainer: ModelTrainer):
        self.trainer = trainer
        self.model = trainer.model
        self.label_encoder = trainer.label_encoder

    def predict(self, features: dict) -> dict:
        """Predict grade for a single student based on their academic features."""
        if self.model is None or self.label_encoder is None:
            raise RuntimeError("Model not loaded. Train the model first.")

        feature_vector = np.array([
            [
                features.get("attendance_score", 0),
                features.get("assignment_score", 0),
                features.get("ca_score", 0),
                features.get("exam_score", 0),
            ]
        ])

        prediction = int(self.model.predict(feature_vector)[0])
        predicted_grade = self.label_encoder.inverse_transform([prediction])[0]

        probabilities = self.model.predict_proba(feature_vector)[0]
        prob_dict = {
            str(grade): round(float(prob), 4)
            for grade, prob in zip(self.label_encoder.classes_, probabilities)
        }
        confidence = round(float(max(probabilities)), 4)

        recommendations = self._generate_recommendations(features)

        return {
            "predicted_grade": str(predicted_grade),
            "confidence": confidence,
            "probability_scores": prob_dict,
            "features_used": {
                "attendance_score": features.get("attendance_score", 0),
                "assignment_score": features.get("assignment_score", 0),
                "ca_score": features.get("ca_score", 0),
                "exam_score": features.get("exam_score", 0),
            },
            "recommendations": recommendations,
        }

    def _generate_recommendations(self, features: dict) -> str:
        lines = []
        thresholds = {"attendance_score": 60, "assignment_score": 60, "ca_score": 60, "exam_score": 50}
        for key, threshold in thresholds.items():
            score = features.get(key, 0)
            if score < threshold:
                lines.append(f"• {RECOMMENDATIONS[key]}")
        if not lines:
            return "Performance is on track across all areas. Maintain consistent effort and continue good study habits."
        return "\n".join(lines)
