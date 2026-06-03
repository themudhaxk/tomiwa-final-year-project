"use client";

import { useEffect, useState } from "react";
import { Brain, Zap, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import { getPredictions, trainModel, predictBatch, getModelMetrics } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { PageSpinner, Spinner } from "@/components/ui/spinner";
import type { Prediction, ModelMetrics } from "@/types";

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [predicting, setPredicting] = useState(false);

  const fetch = () => {
    Promise.all([
      getPredictions(),
      getModelMetrics().catch(() => null),
    ]).then(([p, m]) => {
      setPredictions(p);
      setMetrics(m);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleTrain = async () => {
    setTraining(true);
    try {
      const result = await trainModel();
      setMetrics(result.metrics);
      toast.success(
        `Model trained! Accuracy: ${(result.metrics.accuracy * 100).toFixed(1)}%, F1: ${(result.metrics.f1_score * 100).toFixed(1)}%`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Training failed");
    } finally {
      setTraining(false);
    }
  };

  const handleBatchPredict = async () => {
    setPredicting(true);
    try {
      const result = await predictBatch();
      toast.success(`${result.count} predictions generated`);
      fetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Batch prediction failed. Train the model first.");
    } finally {
      setPredicting(false);
    }
  };

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleTrain}
          disabled={training}
          className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50 transition"
        >
          {training ? <Spinner className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
          {training ? "Training Model..." : "Train Model"}
        </button>
        <button
          onClick={handleBatchPredict}
          disabled={predicting || !metrics}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 transition"
        >
          {predicting ? <Spinner className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
          {predicting ? "Predicting..." : "Predict All Students"}
        </button>
        <p className="text-xs text-gray-400">
          Train the model first, then run predictions for all students. Or predict individual students from their detail page.
        </p>
      </div>

      {/* Model Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Accuracy", value: `${(metrics.accuracy * 100).toFixed(1)}%`, color: "text-green-600" },
            { label: "Precision", value: `${(metrics.precision * 100).toFixed(1)}%`, color: "text-blue-600" },
            { label: "Recall", value: `${(metrics.recall * 100).toFixed(1)}%`, color: "text-purple-600" },
            { label: "F1 Score", value: `${(metrics.f1_score * 100).toFixed(1)}%`, color: "text-orange-600" },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs text-gray-500">{m.label}</p>
              <p className={`mt-1 text-xl font-bold ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>
      )}

      {metrics && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Model Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <span className="text-gray-500">Training Samples</span>
              <p className="font-semibold">{metrics.training_samples}</p>
            </div>
            <div>
              <span className="text-gray-500">Features</span>
              <p className="font-semibold">{metrics.features.join(", ")}</p>
            </div>
            <div>
              <span className="text-gray-500">Trained At</span>
              <p className="font-semibold">{new Date(metrics.trained_at).toLocaleString()}</p>
            </div>
            {metrics.feature_importance && (
              <div>
                <span className="text-gray-500">Top Feature</span>
                <p className="font-semibold">
                  {Object.entries(metrics.feature_importance).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "—"}
                </p>
              </div>
            )}
          </div>
          {metrics.feature_importance && (
            <div className="mt-4">
              <h4 className="mb-2 text-xs font-medium text-gray-500">Feature Importance</h4>
              <div className="space-y-1.5">
                {Object.entries(metrics.feature_importance)
                  .sort(([, a], [, b]) => b - a)
                  .map(([feature, importance]) => (
                    <div key={feature} className="flex items-center gap-3">
                      <span className="w-28 text-xs text-gray-600">{feature}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full"
                          style={{ width: `${importance * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-12 text-right">
                        {(importance * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!metrics && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <Brain className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-600">No trained model yet</p>
          <p className="mt-1 text-xs text-gray-400">
            Click &quot;Train Model&quot; to train the Random Forest classifier on existing academic records.
            You need at least 10 academic records to train.
          </p>
        </div>
      )}

      {/* Prediction History */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Prediction History</h3>
        {predictions.length > 0 ? (
          <div className="space-y-3">
            {predictions.slice(0, 20).map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-primary-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.student_name}</p>
                    <p className="text-xs text-gray-500">{p.recommendations.slice(0, 80)}...</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="grade" value={p.predicted_grade} />
                  <span className="text-xs text-gray-500">{(p.confidence * 100).toFixed(0)}%</span>
                  <span className="text-xs text-gray-400">
                    {new Date(p.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-gray-400">
            No predictions yet. Train the model, then predict students.
          </div>
        )}
      </div>
    </div>
  );
}
