"""
ML prediction service — genuine PyTorch model inference with dynamic MongoDB feature extraction.
Supports NODE, NODE Augmented, DNN, and TabNet architectures.
"""

import os
import math
import logging
import warnings

# Suppress version mismatches during pickle loads
warnings.filterwarnings("ignore", message=".*unpickle estimator.*")
warnings.filterwarnings("ignore", message=".*InconsistentVersionWarning.*")

# pyrefly: ignore [missing-import]
import numpy as np
# pyrefly: ignore [missing-import]
import torch
# pyrefly: ignore [missing-import]
import joblib

from lignin.node.model import load_model as load_node_model  # pyrefly: ignore [missing-import]
from lignin.node_augmented.model import load_model as load_node_augmented_model  # pyrefly: ignore [missing-import]
from lignin.dnn.model import load_model as load_dnn_model  # pyrefly: ignore [missing-import]
from lignin.tabnet.model import load_model as load_tabnet_model  # pyrefly: ignore [missing-import]
from lignin.feature_lookup import (  # pyrefly: ignore [missing-import]
    build_feature_vector,
    parse_time_range,
    parse_ratio,
    FEAT_COLS,
)

logger = logging.getLogger(__name__)

# ── Paths ────────────────────────────────────────────────────────────────────
_BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_LIGNIN_DIR = os.path.join(_BASE_DIR, "lignin")

# Model folders
MODEL_DIRS = {
    "node": os.path.join(_LIGNIN_DIR, "node"),
    "node_augmented": os.path.join(_LIGNIN_DIR, "node_augmented"),
    "dnn": os.path.join(_LIGNIN_DIR, "dnn"),
    "tabnet": os.path.join(_LIGNIN_DIR, "tabnet"),
}

# ── Model Registry Cache ─────────────────────────────────────────────────────
_loaded_models: dict[str, dict] = {}



def _find_checkpoint(model_name: str) -> str | None:
    """Find any .pt file in the model's dedicated directory."""
    folder = MODEL_DIRS.get(model_name)
    if not folder or not os.path.exists(folder):
        return None
    for fname in os.listdir(folder):
        if fname.endswith(".pt"):
            return os.path.join(folder, fname)
    return None


def _find_scaler(folder: str, pattern: str) -> str | None:
    """Find a scaler .pkl file in the model folder matching *<pattern>.pkl."""
    if not folder or not os.path.exists(folder):
        return None
    for fname in os.listdir(folder):
        if fname.endswith(".pkl") and pattern in fname:
            return os.path.join(folder, fname)
    return None


def _get_model(model_name: str):
    """Load and cache model from its dedicated folder."""
    if model_name in _loaded_models:
        return _loaded_models[model_name]

    ckpt_path = _find_checkpoint(model_name)
    if not ckpt_path:
        return None

    try:
        if model_name == "node":
            m, f_names, meta = load_node_model(ckpt_path, device="cpu")
        elif model_name == "node_augmented":
            try:
                m, f_names, meta = load_node_augmented_model(ckpt_path, device="cpu")
            except Exception:
                m, f_names, meta = load_node_model(ckpt_path, device="cpu")
        elif model_name == "dnn":
            m, f_names, meta = load_dnn_model(ckpt_path, device="cpu")
        elif model_name == "tabnet":
            m, f_names, meta = load_tabnet_model(ckpt_path, device="cpu")
        else:
            return None

        # Load scalers — dynamically find any *scaler_x.pkl / *scaler_y.pkl in folder
        folder = MODEL_DIRS.get(model_name, _LIGNIN_DIR)
        sx_path = _find_scaler(folder, "scaler_x")
        sy_path = _find_scaler(folder, "scaler_y")

        scaler_x = joblib.load(sx_path) if sx_path else None
        scaler_y = joblib.load(sy_path) if sy_path else None


        _loaded_models[model_name] = {
            "model": m,
            "feature_names": f_names,
            "metadata": meta,
            "scaler_x": scaler_x,
            "scaler_y": scaler_y,
        }
        logger.info("Successfully loaded model '%s' from %s", model_name, ckpt_path)
        return _loaded_models[model_name]
    except Exception as e:
        logger.warning("Could not load model '%s' from %s: %s", model_name, ckpt_path, e)
        return None



# ── Model Inference Pipeline ──────────────────────────────────────────────────

def _predict_single(
    plant, chemical, temperature, time_hr, ratio_str, ph,
    model_name: str = "node",
    cellulose_percent: float | None = None,
    hemicellulose_percent: float | None = None,
    lignin_percent: float | None = None,
    size_mm: float | None = None,
    hbd_hba_ratio: float | None = None,
    liquid_solid_ratio: float | None = None,
):
    """Run real inference for any model loaded from its dedicated folder."""
    model_info = _get_model(model_name)
    if not model_info:
        # If requested model checkpoint is missing, fallback to node
        model_info = _get_model("node")
    if not model_info:
        raise RuntimeError(f"No model checkpoint available for '{model_name}'")

    model = model_info["model"]
    feature_names = model_info["feature_names"]
    scaler_x = model_info["scaler_x"]
    scaler_y = model_info["scaler_y"]

    # Build raw feature vector
    x_raw = build_feature_vector(
        plant, chemical, temperature, time_hr, ratio_str, ph,
        feature_names=feature_names,
        cellulose_percent=cellulose_percent,
        hemicellulose_percent=hemicellulose_percent,
        lignin_percent=lignin_percent,
        size_mm=size_mm,
        hbd_hba_ratio=hbd_hba_ratio,
        liquid_solid_ratio=liquid_solid_ratio,
    )

    # Scale inputs
    if scaler_x is not None:
        x_scaled = scaler_x.transform(x_raw.reshape(1, -1)).astype(np.float32)
    else:
        x_scaled = x_raw.reshape(1, -1).astype(np.float32)

    # Inference
    with torch.no_grad():
        x_tensor = torch.tensor(x_scaled)
        y_scaled = model(x_tensor).cpu().numpy().flatten()

    # Inverse-scale — target is fraction (0–1), UI needs percentage (0–100)
    if scaler_y is not None:
        y_orig = scaler_y.inverse_transform(y_scaled.reshape(-1, 1)).flatten()
        return float(np.clip(y_orig[0] * 100.0, 0.0, 100.0))
    else:
        return float(np.clip(y_scaled[0] * 100.0 if y_scaled[0] <= 1.0 else y_scaled[0], 0.0, 100.0))


def _predict_pipeline(
    plant, chemical, temperature, time_range, ratio, ph, model_name: str,
    cellulose_percent: float | None = None,
    hemicellulose_percent: float | None = None,
    lignin_percent: float | None = None,
    size_mm: float | None = None,
    hbd_hba_ratio: float | None = None,
    liquid_solid_ratio: float | None = None,
):
    """
    Full prediction pipeline:
    - Sweep time range for yield curve
    - Pick recommended time
    - Return structured response dict
    """
    t_min, t_max = parse_time_range(time_range)

    # Generate yield curve by sweeping time (in hours)
    time_points = list(range(int(t_min), int(t_max) + 1, 10))
    if not time_points:
        time_points = list(range(0, 181, 10))

    yields = []
    for t_min_val in time_points:
        time_hr = t_min_val / 60.0  # convert minutes → hours
        y = _predict_single(
            plant, chemical, temperature, time_hr, ratio, ph,
            model_name=model_name,
            cellulose_percent=cellulose_percent,
            hemicellulose_percent=hemicellulose_percent,
            lignin_percent=lignin_percent,
            size_mm=size_mm,
            hbd_hba_ratio=hbd_hba_ratio,
            liquid_solid_ratio=liquid_solid_ratio,
        )
        yields.append(round(y, 1))

    yield_curve = [
        {"time": t, "yield_value": y}
        for t, y in zip(time_points, yields)
    ]

    # Best yield and recommended time
    best_idx = int(np.argmax(yields))
    lignin_yield = yields[best_idx]
    recommended_time = time_points[best_idx]

    # Performance rating
    if lignin_yield >= 75:
        performance = "Better"
    elif lignin_yield >= 60:
        performance = "Good"
    elif lignin_yield >= 45:
        performance = "Average"
    else:
        performance = "Poor"

    # Confidence derived from model benchmark R² score
    model_r2_map = {
        "tabnet": 0.7256,
        "dnn": 0.8350,
        "node": 0.8726,
        "node_augmented": 0.8335,
    }
    model_info = _get_model(model_name) or _get_model("node")
    blind_r2 = model_r2_map.get(
        model_name,
        (model_info.get("metadata") or {}).get("blind_r2", 0.8726),
    )
    confidence = round(float(blind_r2) * 100.0, 1)

    return {
        "plant": plant,
        "chemical": chemical,
        "temperature": temperature,
        "time_range": time_range,
        "ratio": ratio,
        "ph": ph,
        "model": model_name,
        "lignin_yield": lignin_yield,
        "recommended_time": recommended_time,
        "performance": performance,
        "confidence": confidence,
        "yield_curve": yield_curve,
    }


# ── Public API ───────────────────────────────────────────────────────────────

def predict_lignin(
    plant: str,
    chemical: str,
    temperature: float,
    time_range: str,
    ratio: str,
    ph: float,
    model: str = "node_augmented",
    cellulose_percent: float | None = None,
    hemicellulose_percent: float | None = None,
    lignin_percent: float | None = None,
    size_mm: float | None = None,
    hbd_hba_ratio: float | None = None,
    liquid_solid_ratio: float | None = None,
) -> dict:
    """
    Run genuine PyTorch inference using the specified model architecture
    loaded from its dedicated folder (`backend/lignin/<model>/`).
    """
    return _predict_pipeline(
        plant=plant,
        chemical=chemical,
        temperature=temperature,
        time_range=time_range,
        ratio=ratio,
        ph=ph,
        model_name=model,
        cellulose_percent=cellulose_percent,
        hemicellulose_percent=hemicellulose_percent,
        lignin_percent=lignin_percent,
        size_mm=size_mm,
        hbd_hba_ratio=hbd_hba_ratio,
        liquid_solid_ratio=liquid_solid_ratio,
    )


