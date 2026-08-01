"""
Mock ML prediction service.
Simulates a deep learning model for lignin yield prediction.
Replace with actual model inference when the trained model is ready.
"""
import math
import hashlib


# Plant and chemical label mappings
PLANT_LABELS = {
    "miscanthus": "Miscanthus",
    "rice_straw": "Rice Straw",
    "sugarcane_bagasse": "Sugarcane Bagasse",
    "bamboo": "Bamboo",
    "wheat_straw": "Wheat Straw",
    "corn_stover": "Corn Stover",
    "switchgrass": "Switchgrass",
    "poplar": "Poplar Wood",
}

CHEMICAL_LABELS = {
    "choline_chloride_urea": "Choline Chloride + Urea",
    "naoh": "NaOH (Sodium Hydroxide)",
    "h2so4": "H₂SO₄ (Sulfuric Acid)",
    "ionic_liquids": "Ionic Liquids",
    "des": "Deep Eutectic Solvents",
    "ethanol": "Ethanol (Organosolv)",
    "kraft": "Kraft Process (NaOH + Na₂S)",
}


def _deterministic_random(seed_str: str, min_val: float, max_val: float) -> float:
    """Generate a deterministic pseudo-random float from a seed string."""
    h = int(hashlib.md5(seed_str.encode()).hexdigest(), 16)
    normalized = (h % 100000) / 100000.0
    return min_val + normalized * (max_val - min_val)


def generate_yield_curve(max_yield: float, steepness: float = 0.04, midpoint: float = 60) -> list[dict]:
    """Generate sigmoid-like yield curve data points."""
    data = []
    for t in range(0, 181, 10):
        y = max_yield / (1 + math.exp(-steepness * (t - midpoint)))
        data.append({
            "time": t,
            "yield_value": round(y, 1),
        })
    return data



# Model accuracy profiles — each model has different strengths
MODEL_PROFILES = {
    "tabnet": {
        "name": "TabNet",
        "accuracy": 94.2,
        "yield_bias": 1.5,        # Slight positive bias
        "confidence_range": (78.0, 96.0),
        "steepness_bonus": 0.005,
    },
    "dnn": {
        "name": "DNN",
        "accuracy": 91.7,
        "yield_bias": -2.0,       # Slightly conservative
        "confidence_range": (70.0, 93.0),
        "steepness_bonus": 0.0,
    },
    "node": {
        "name": "NODE",
        "accuracy": 93.5,
        "yield_bias": 0.5,
        "confidence_range": (75.0, 95.5),
        "steepness_bonus": 0.003,
    },
    "node_augmented": {
        "name": "NODE Augmented",
        "accuracy": 95.8,
        "yield_bias": 3.0,        # Best model, highest yield prediction
        "confidence_range": (82.0, 98.5),
        "steepness_bonus": 0.008,
    },
}


def predict_lignin(
    plant: str,
    chemical: str,
    temperature: float,
    time_range: str,
    ratio: str,
    ph: float,
    model: str = "node_augmented",
) -> dict:
    """
    Simulate a prediction from the selected ML model.
    Results vary by model type — each has different accuracy characteristics.
    """
    profile = MODEL_PROFILES.get(model, MODEL_PROFILES["node_augmented"])

    # Create a seed from all inputs + model for reproducible results
    seed = f"{plant}|{chemical}|{temperature}|{time_range}|{ratio}|{ph}|{model}"

    # Base yield adjusted by model bias
    base_yield = _deterministic_random(seed + "_yield", 35.0, 92.0)
    lignin_yield = round(min(99.0, max(10.0, base_yield + profile["yield_bias"])), 1)

    recommended_time = round(_deterministic_random(seed + "_time", 25, 130))

    # Confidence from model-specific range
    conf_min, conf_max = profile["confidence_range"]
    confidence = round(_deterministic_random(seed + "_conf", conf_min, conf_max), 1)

    # Performance rating based on yield
    if lignin_yield >= 75:
        performance = "Better"
    elif lignin_yield >= 60:
        performance = "Good"
    elif lignin_yield >= 45:
        performance = "Average"
    else:
        performance = "Poor"

    # Yield curve with model-specific steepness
    steepness = 0.03 + _deterministic_random(seed + "_steep", 0.0, 0.03) + profile["steepness_bonus"]
    yield_curve = generate_yield_curve(lignin_yield, steepness, recommended_time)

    return {
        "plant": plant,
        "chemical": chemical,
        "temperature": temperature,
        "time_range": time_range,
        "ratio": ratio,
        "ph": ph,
        "model": model,
        "lignin_yield": lignin_yield,
        "recommended_time": recommended_time,
        "performance": performance,
        "confidence": confidence,
        "yield_curve": yield_curve,
    }
