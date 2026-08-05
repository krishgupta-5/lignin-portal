"""
Feature lookup tables and feature engineering for NODE v14 inference.

Maps the simple frontend inputs (plant name, chemical name, temperature, etc.)
to the full 43-feature vector expected by the trained model.

Plant composition and chemical molecular descriptor values are representative
values from the lignin extraction literature / DES databases.
"""
import os
import logging
# pyrefly: ignore [missing-import]
import numpy as np
# pyrefly: ignore [missing-import]
import pandas as pd

logger = logging.getLogger(__name__)

# ── MongoDB Connection ───────────────────────────────────────────────────────
MONGODB_URI = (
    os.getenv("MONGODB_URL")
    or os.getenv("MONGODB_URI")
    or "mongodb://localhost:27017"
)
DB_NAME = os.getenv("DATABASE_NAME", "lignin_predictor")

# ── Dynamic In-Memory Stores (Loaded from MongoDB) ───────────────────────────
PLANT_DATA: dict[str, dict] = {}
CHEMICAL_DATA: dict[str, dict] = {}



# ── Ordered feature columns (must match FEAT_COLS from training) ─────────────
FEAT_COLS = (
    ["cellulose_percent", "hemicellulose_percent", "lignin_percent",
     "size_mm", "temperature_C", "time_hr", "HBD_HBA_ratio", "liquid_solid_ratio", "LogR0"]
    + ["HBA-pKa/pkb", "HBD-pKa/pkb", "HBD-MW", "HBA-TopoPSA", "HBD-TopoPSA",
       "HBA-nHBAcc", "HBA-nHBDon", "HBD-nHBAcc", "HBD-nHBDon",
       "HBA-SlogP_VSA1", "HBA-SLogP", "HBD-SlogP_VSA1", "HBD-SLogP",
       "HBA-nAromAtom", "HBD-nAromAtom", "HBA-nRot", "HBD-nRot",
       "HBA-nBase", "HBD-nBase", "HBD-nC"]
    + ["LogR0_sq", "severity_x_time", "log_time", "sqrt_time", "temp_sq",
       "temp_x_LogR0", "inv_temp", "log_LSR", "LSR_x_LogR0", "LSR_sq",
       "ratio_x_LogR0", "lignin_x_LogR0", "SLogP_sum"]
)


def _add_engineered_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add engineered features exactly as done during training for NODE and TabNet v6.
    Mirrors the feature engineering pipeline.
    """
    df = df.copy()

    # Temperature and Time Kinetics
    if "temperature_C" in df.columns:
        t = df["temperature_C"].astype(float)
        df["temp_sq"] = t ** 2
        df["temp_cb"] = t ** 3
        df["inv_temp"] = 1.0 / (t + 273.15)
        df["arrhenius"] = np.exp(-2000.0 / (t + 273.15))

        if "time_hr" in df.columns:
            hr = df["time_hr"].astype(float)
            df["temp_x_time"] = t * hr
            df["log_time"] = np.log1p(hr)
            df["sqrt_time"] = np.sqrt(hr.clip(lower=0))

            if "LogR0" not in df.columns or df["LogR0"].isna().any():
                df["LogR0"] = np.log10((hr * 60.0 + 1e-9) * np.exp((t - 100.0) / 14.75))

    # LogR0 Polynomials and Interactions
    if "LogR0" in df.columns:
        r0 = df["LogR0"].astype(float)
        df["LogR0_sq"] = r0 ** 2
        df["LogR0_cb"] = r0 ** 3
        df["inv_LogR0"] = 1.0 / (r0.clip(lower=0.01))
        df["exp_sev"] = np.exp((df["temperature_C"].astype(float) - 100.0) / 14.75) if "temperature_C" in df.columns else np.exp(r0)

        if "temperature_C" in df.columns:
            t = df["temperature_C"].astype(float)
            df["temp_x_LogR0"] = t * r0
            df["R0_x_tempsq"] = (10.0 ** r0.clip(upper=5.0)) * (t ** 2) / 1000.0

        if "time_hr" in df.columns:
            hr = df["time_hr"].astype(float)
            df["severity_x_time"] = r0 * hr

    # Liquid-to-Solid Ratio (LSR)
    if "liquid_solid_ratio" in df.columns:
        lsr = df["liquid_solid_ratio"].astype(float)
        df["log_LSR"] = np.log1p(lsr)
        df["LSR_sq"] = lsr ** 2
        df["LSR_cb"] = lsr ** 3

        if "LogR0" in df.columns:
            df["LSR_x_LogR0"] = lsr * df["LogR0"].astype(float)
        if "temperature_C" in df.columns:
            t = df["temperature_C"].astype(float)
            df["LSR_x_temp"] = lsr * t
            df["LSR_x_inv_temp"] = lsr / (t + 273.15)

    # HBD:HBA Molar Ratio
    if "HBD_HBA_ratio" in df.columns:
        ratio = df["HBD_HBA_ratio"].astype(float)
        df["ratio_sq"] = ratio ** 2
        df["log_ratio"] = np.log1p(ratio)
        if "LogR0" in df.columns:
            df["ratio_x_LogR0"] = ratio * df["LogR0"].astype(float)

    # Biomass Lignin / Cellulose / Hemicellulose Interactions
    if "lignin_percent" in df.columns:
        lig = df["lignin_percent"].astype(float)
        df["lig_sq"] = lig ** 2
        if "LogR0" in df.columns:
            df["lig_x_LogR0"] = lig * df["LogR0"].astype(float)
        if "cellulose_percent" in df.columns:
            cell = df["cellulose_percent"].astype(float)
            df["cell_lig_ratio"] = cell / (lig + 1e-9)
            df["cell_plus_lig"] = cell + lig
        if "hemicellulose_percent" in df.columns:
            hemi = df["hemicellulose_percent"].astype(float)
            df["hemi_lig_ratio"] = hemi / (lig + 1e-9)

    # Chemical Molecular Descriptors & Hansen / LogP Solvation
    if "HBA-SLogP" in df.columns and "HBD-SLogP" in df.columns:
        hba_logp = df["HBA-SLogP"].astype(float)
        hbd_logp = df["HBD-SLogP"].astype(float)
        df["SLogP_sum"] = hba_logp + hbd_logp
        df["SLogP_diff"] = hba_logp - hbd_logp
        df["SLogP_product"] = hba_logp * hbd_logp
        if "LogR0" in df.columns:
            df["SLogP_HBA_x_R0"] = hba_logp * df["LogR0"].astype(float)

    if "HBA-TopoPSA" in df.columns and "HBD-TopoPSA" in df.columns:
        psa_hba = df["HBA-TopoPSA"].astype(float)
        psa_hbd = df["HBD-TopoPSA"].astype(float)
        df["PSA_sum"] = psa_hba + psa_hbd
        df["PSA_ratio"] = psa_hba / (psa_hbd + 1e-9)

    if "HBD-nHBDon" in df.columns and "HBD-nHBAcc" in df.columns:
        hbd_don = df["HBD-nHBDon"].astype(float)
        hbd_acc = df["HBD-nHBAcc"].astype(float)
        hba_arom = df["HBA-nAromAtom"].astype(float) if "HBA-nAromAtom" in df.columns else 0.0
        df["HB_comp"] = hbd_don + hbd_acc - hba_arom

    if "HBA-MW" in df.columns and "HBD-MW" in df.columns:
        df["MW_ratio"] = df["HBA-MW"].astype(float) / (df["HBD-MW"].astype(float) + 1e-9)

    return df


def parse_ratio(ratio_str: str) -> float:
    """Parse '1:15' → 15.0 (liquid-to-solid ratio)."""
    try:
        parts = ratio_str.replace(" ", "").split(":")
        if len(parts) == 2:
            return float(parts[1]) / float(parts[0])
        return float(ratio_str)
    except (ValueError, ZeroDivisionError):
        return 15.0  # sensible default


def parse_time_range(time_range_str: str) -> tuple[float, float]:
    """
    Parse '10 – 180' → (10.0, 180.0).
    Handles en-dash, em-dash, hyphen, etc.
    """
    for sep in ["–", "—", "-"]:
        if sep in time_range_str:
            parts = time_range_str.split(sep)
            try:
                return float(parts[0].strip()), float(parts[1].strip())
            except (ValueError, IndexError):
                pass
    return 10.0, 180.0  # default


_mongo_fetched: bool = False


def fetch_features_from_mongo(uri: str = MONGODB_URI) -> bool:
    """
    Fetch plant composition and chemical descriptors from the database.
    Caches the results in memory for fast inference.
    """
    global _mongo_fetched, PLANT_DATA, CHEMICAL_DATA
    if _mongo_fetched:
        return True

    try:
        # pyrefly: ignore [missing-import]
        from pymongo import MongoClient

        client = MongoClient(uri, serverSelectionTimeoutMS=5000, connectTimeoutMS=5000)
        db = client[DB_NAME]
        existing_cols = db.list_collection_names()

        # Query all available feature/dataset collections
        for col_name in ["compounds", "molecular_features", "experiments", "engineered_features", "validation_dataset"]:
            if col_name in existing_cols:
                for doc in db[col_name].find({}, {"_id": 0}):
                    # Extract plant / biomass data
                    plant_key = doc.get("plant") or doc.get("biomass") or doc.get("feedstock")
                    if plant_key and str(plant_key).lower() not in PLANT_DATA:
                        PLANT_DATA[str(plant_key).lower().replace(" ", "_")] = {
                            "cellulose_percent": float(doc.get("cellulose_percent", 40.0)),
                            "hemicellulose_percent": float(doc.get("hemicellulose_percent", 25.0)),
                            "lignin_percent": float(doc.get("lignin_percent", 20.0)),
                            "size_mm": float(doc.get("size_mm", 0.5)),
                        }

                    # Extract chemical / DES descriptors
                    chem_key = doc.get("name") or doc.get("chemical") or doc.get("compound") or doc.get("solvent")
                    if chem_key and str(chem_key).lower() not in CHEMICAL_DATA:
                        CHEMICAL_DATA[str(chem_key).lower().replace(" ", "_")] = doc

        client.close()
        _mongo_fetched = True
        logger.info("Successfully loaded features from MongoDB: %s", uri)
        return True
    except Exception as e:
        logger.warning("MongoDB fetch error (%s)", e)
        _mongo_fetched = True
        return False


def get_plant_data(plant: str) -> dict:
    """Get plant composition data directly from MongoDB."""
    if not _mongo_fetched:
        fetch_features_from_mongo()
    plant_key = plant.lower().replace(" ", "_")
    return PLANT_DATA.get(plant_key, {})


def get_chemical_data(chemical: str) -> dict:
    """Get chemical/DES descriptor data directly from MongoDB."""
    if not _mongo_fetched:
        fetch_features_from_mongo()
    chem_key = chemical.lower().replace(" ", "_")
    return CHEMICAL_DATA.get(chem_key, {})



def build_feature_vector(
    plant: str,
    chemical: str,
    temperature: float,
    time_hr: float,
    ratio_str: str,
    ph: float,
    feature_names: list[str] | None = None,
    cellulose_percent: float | None = None,
    hemicellulose_percent: float | None = None,
    lignin_percent: float | None = None,
    size_mm: float | None = None,
    hbd_hba_ratio: float | None = None,
    liquid_solid_ratio: float | None = None,
) -> np.ndarray:
    """
    Build a single feature vector from frontend inputs.

    Args:
        plant: Plant / Biomass key (e.g. 'wheat_straw')
        chemical: Chemical key (e.g. 'choline_chloride_urea')
        temperature: Temperature in °C
        time_hr: Extraction time in hours
        ratio_str: Solid-to-liquid ratio string (e.g. '1:15') or LSR float
        ph: pH value (kept for API compat)
        feature_names: Ordered list of feature names from the checkpoint.
        cellulose_percent: Optional explicit Cellulose % override
        hemicellulose_percent: Optional explicit Hemicellulose % override
        lignin_percent: Optional explicit Lignin % override
        size_mm: Optional explicit Particle size (mm) override
        hbd_hba_ratio: Optional explicit HBD:HBA molar ratio override
        liquid_solid_ratio: Optional explicit liquid-solid ratio override

    Returns:
        1-D numpy array of shape (n_features,) in float32
    """
    plant_info = get_plant_data(plant).copy()
    chem_info = get_chemical_data(chemical).copy()

    # Override plant composition if explicitly provided
    if cellulose_percent is not None:
        plant_info["cellulose_percent"] = float(cellulose_percent)
    if hemicellulose_percent is not None:
        plant_info["hemicellulose_percent"] = float(hemicellulose_percent)
    if lignin_percent is not None:
        plant_info["lignin_percent"] = float(lignin_percent)
    if size_mm is not None:
        plant_info["size_mm"] = float(size_mm)

    # Resolve LSR
    if liquid_solid_ratio is not None:
        lsr = float(liquid_solid_ratio)
    else:
        lsr = parse_ratio(ratio_str)

    # Build a single-row DataFrame with base columns
    row = {
        "temperature_C": float(temperature),
        "time_hr": float(time_hr),
        "liquid_solid_ratio": lsr,
        **plant_info,
        **chem_info,
    }

    # Override HBD:HBA ratio if explicitly given
    if hbd_hba_ratio is not None:
        row["HBD_HBA_ratio"] = float(hbd_hba_ratio)

    df = pd.DataFrame([row])
    df = _add_engineered_features(df)

    feat_cols = feature_names if feature_names is not None else FEAT_COLS

    # Ensure all columns exist (fill missing with 0)
    for col in feat_cols:
        if col not in df.columns:
            df[col] = 0.0

    return df[feat_cols].values.astype(np.float32)[0]

