import numpy as np
from sklearn.ensemble import IsolationForest

class AnomalyDetector:
    def __init__(self):
        self.model = None
        self.fitted = False

    def fit_if_needed(self, values: dict):
        # Train model dynamically based on number of features
        if not self.fitted:
            feature_count = len(values)
            X = np.random.normal(0, 1, (300, feature_count))
            self.model = IsolationForest(n_estimators=100, contamination=0.1)
            self.model.fit(X)
            self.fitted = True

    def predict(self, values: dict) -> dict:
        self.fit_if_needed(values)

        features = np.array(list(values.values())).reshape(1, -1)

        score = float(self.model.decision_function(features)[0])
        prediction = int(self.model.predict(features)[0])  # -1 or 1

        return {
            "score": score,
            "is_anomaly": bool(prediction == -1)
        }
