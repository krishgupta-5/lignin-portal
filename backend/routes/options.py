import os
import logging
import asyncio
from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["Options"])
logger = logging.getLogger(__name__)

# ── Robust Built-in Scientific Catalog (18 Feedstocks, 25 HBAs, 39 HBDs) ────────
DEFAULT_FEED_MATERIALS = [
  {"name": "Bamboo", "key": "bamboo", "sample_count": 139, "cellulose_percent": 44.3, "hemicellulose_percent": 20.0, "lignin_percent": 27.9, "size_mm": 0.54},
  {"name": "Wheat Straw", "key": "wheat_straw", "sample_count": 59, "cellulose_percent": 35.8, "hemicellulose_percent": 22.3, "lignin_percent": 18.2, "size_mm": 0.83},
  {"name": "Bagasse", "key": "bagasse", "sample_count": 48, "cellulose_percent": 42.1, "hemicellulose_percent": 23.4, "lignin_percent": 21.6, "size_mm": 0.62},
  {"name": "Willow", "key": "willow", "sample_count": 41, "cellulose_percent": 41.2, "hemicellulose_percent": 19.8, "lignin_percent": 26.5, "size_mm": 0.5},
  {"name": "Eucalyptus", "key": "eucalyptus", "sample_count": 39, "cellulose_percent": 45.0, "hemicellulose_percent": 18.5, "lignin_percent": 28.2, "size_mm": 0.5},
  {"name": "Corn Cob", "key": "corn_cob", "sample_count": 38, "cellulose_percent": 38.5, "hemicellulose_percent": 32.1, "lignin_percent": 16.4, "size_mm": 2.08},
  {"name": "Miscanthus", "key": "miscanthus", "sample_count": 37, "cellulose_percent": 43.2, "hemicellulose_percent": 24.1, "lignin_percent": 22.0, "size_mm": 0.5},
  {"name": "Birch", "key": "birch", "sample_count": 36, "cellulose_percent": 40.5, "hemicellulose_percent": 25.3, "lignin_percent": 21.4, "size_mm": 0.5},
  {"name": "Corn Stover", "key": "corn_stover", "sample_count": 36, "cellulose_percent": 36.3, "hemicellulose_percent": 20.6, "lignin_percent": 20.9, "size_mm": 0.83},
  {"name": "Rice Husks", "key": "rice_husks", "sample_count": 21, "cellulose_percent": 34.7, "hemicellulose_percent": 16.4, "lignin_percent": 17.0, "size_mm": 0.83},
  {"name": "Sunflower Straw", "key": "sunflower_straw", "sample_count": 19, "cellulose_percent": 30.8, "hemicellulose_percent": 12.4, "lignin_percent": 15.1, "size_mm": 0.38},
  {"name": "Reed Straw", "key": "reed_straw", "sample_count": 15, "cellulose_percent": 43.8, "hemicellulose_percent": 18.1, "lignin_percent": 25.3, "size_mm": 0.42},
  {"name": "Bambara Groundnut Haulm", "key": "bambara_groundnut_haulm", "sample_count": 14, "cellulose_percent": 36.5, "hemicellulose_percent": 14.9, "lignin_percent": 13.1, "size_mm": 0.5},
  {"name": "Boehmeria Nivea Stalks", "key": "boehmeria_nivea_stalks", "sample_count": 12, "cellulose_percent": 44.3, "hemicellulose_percent": 24.2, "lignin_percent": 21.3, "size_mm": 0.88},
  {"name": "Lettuce", "key": "lettuce", "sample_count": 9, "cellulose_percent": 28.0, "hemicellulose_percent": 24.1, "lignin_percent": 18.1, "size_mm": 1.0},
  {"name": "Luffa", "key": "luffa", "sample_count": 7, "cellulose_percent": 51.8, "hemicellulose_percent": 17.5, "lignin_percent": 17.8, "size_mm": 1.0},
  {"name": "Switch Grass", "key": "switch_grass", "sample_count": 5, "cellulose_percent": 35.4, "hemicellulose_percent": 23.7, "lignin_percent": 23.4, "size_mm": 0.7},
  {"name": "Arabidopsis Thaliana Mutant", "key": "arabidopsis_thaliana_mutant", "sample_count": 4, "cellulose_percent": 28.1, "hemicellulose_percent": 12.2, "lignin_percent": 13.8, "size_mm": 0.25},
  {"name": "Soybean Straw", "key": "soybean_straw", "sample_count": 3, "cellulose_percent": 34.0, "hemicellulose_percent": 29.7, "lignin_percent": 17.5, "size_mm": 0.83},
  {"name": "Canola Straw", "key": "canola_straw", "sample_count": 1, "cellulose_percent": 30.2, "hemicellulose_percent": 18.1, "lignin_percent": 18.9, "size_mm": 0.83},
]

DEFAULT_HBA_LIST = [
  {"name": "Allyl trimethyl ammonium chloride", "abbreviation": "ATMAC", "type": "HBA"},
  {"name": "Aniline", "abbreviation": "An", "type": "HBA"},
  {"name": "Arginine", "abbreviation": "Arg", "type": "HBA"},
  {"name": "Benzyltrimethylammonium chloride", "abbreviation": "BTMAC", "type": "HBA"},
  {"name": "Betaine", "abbreviation": "Bet", "type": "HBA"},
  {"name": "Betaine hydrochloride", "abbreviation": "Bet HCl", "type": "HBA"},
  {"name": "Cetyltrimethylammonium bromide", "abbreviation": "CTAB", "type": "HBA"},
  {"name": "Ethanolamine hydrochloride", "abbreviation": "MEA HCl", "type": "HBA"},
  {"name": "Ethylene Glycol", "abbreviation": "EG", "type": "HBA"},
  {"name": "Glycerol", "abbreviation": "Gly", "type": "HBA"},
  {"name": "Guanidine hydrochloride", "abbreviation": "GuHCl", "type": "HBA"},
  {"name": "Methacryloxyethyltrimethyl ammonium chloride", "abbreviation": "DMC", "type": "HBA"},
  {"name": "Methyl triethyl ammonium chloride", "abbreviation": "MTAC", "type": "HBA"},
  {"name": "Potassium carbonate", "abbreviation": "K2CO3", "type": "HBA"},
  {"name": "Proline", "abbreviation": "Pro", "type": "HBA"},
  {"name": "Pyrazole", "abbreviation": "Pz", "type": "HBA"},
  {"name": "Pyridine", "abbreviation": "Py", "type": "HBA"},
  {"name": "Tetraethylammonium chloride", "abbreviation": "TEAC", "type": "HBA"},
  {"name": "Tetramethylammonium chloride", "abbreviation": "TMAC", "type": "HBA"},
  {"name": "Tetrapropyl ammonium chloride", "abbreviation": "TPAC", "type": "HBA"},
  {"name": "Triethylamine hydrochloride", "abbreviation": "TEA HCl", "type": "HBA"},
  {"name": "Triethylbenzyl ammonium chloride", "abbreviation": "TEBAC", "type": "HBA"},
  {"name": "chlormequat chloride", "abbreviation": "CCC", "type": "HBA"},
  {"name": "choline chloride", "abbreviation": "ChCl", "type": "HBA"},
  {"name": "tetrabutylammonium chloride", "abbreviation": "TBAC", "type": "HBA"},
]

DEFAULT_HBD_LIST = [
  {"name": "1,2-Propanediol", "abbreviation": "1,2-PDO", "type": "HBD"},
  {"name": "1,3-Propanediol", "abbreviation": "1,3-PDO", "type": "HBD"},
  {"name": "2-Chloropropionic acid", "abbreviation": "2-CPA", "type": "HBD"},
  {"name": "2-Mercaptopropionic acid", "abbreviation": "2-MPA", "type": "HBD"},
  {"name": "2-Phenylpropionic acid", "abbreviation": "2-PPA", "type": "HBD"},
  {"name": "3-(4-hydroxy-3-methoxyphenyl)propanoic acid", "abbreviation": "HMPA", "type": "HBD"},
  {"name": "3-(4-hydroxyphenyl)propionic acid", "abbreviation": "HPA", "type": "HBD"},
  {"name": "3-Mercaptopropionic acid", "abbreviation": "3-MPA", "type": "HBD"},
  {"name": "4-hydroxybenzaldehyde", "abbreviation": "4-HBA", "type": "HBD"},
  {"name": "Acetamide", "abbreviation": "AcAm", "type": "HBD"},
  {"name": "Acetic acid", "abbreviation": "AA", "type": "HBD"},
  {"name": "Catechol", "abbreviation": "CAT", "type": "HBD"},
  {"name": "Citric acid", "abbreviation": "CA", "type": "HBD"},
  {"name": "Diethanolamine", "abbreviation": "DEA", "type": "HBD"},
  {"name": "Ethylene Glycol", "abbreviation": "EG", "type": "HBD"},
  {"name": "Formamide", "abbreviation": "FAA", "type": "HBD"},
  {"name": "Formic acid", "abbreviation": "FA", "type": "HBD"},
  {"name": "Glutaric acid", "abbreviation": "GluA", "type": "HBD"},
  {"name": "Glycerol", "abbreviation": "Gly", "type": "HBD"},
  {"name": "Glycolic acid", "abbreviation": "GA", "type": "HBD"},
  {"name": "Guanidine HCl", "abbreviation": "GuHCl", "type": "HBD"},
  {"name": "Imidazole", "abbreviation": "IMZ", "type": "HBD"},
  {"name": "Lactic acid", "abbreviation": "LA", "type": "HBD"},
  {"name": "Levulinic acid", "abbreviation": "LeA", "type": "HBD"},
  {"name": "Malic acid", "abbreviation": "MIA", "type": "HBD"},
  {"name": "Malonic acid", "abbreviation": "MNA", "type": "HBD"},
  {"name": "Methyldiethanolamine", "abbreviation": "MDEA", "type": "HBD"},
  {"name": "Monoethanolamine", "abbreviation": "MEA", "type": "HBD"},
  {"name": "Oxalic acid", "abbreviation": "OA", "type": "HBD"},
  {"name": "Oxalic acid dihydrate", "abbreviation": "OAD", "type": "HBD"},
  {"name": "Sorbitol", "abbreviation": "Sor", "type": "HBD"},
  {"name": "Succinic acid", "abbreviation": "SA", "type": "HBD"},
  {"name": "Tartaric acid", "abbreviation": "TA", "type": "HBD"},
  {"name": "Urea", "abbreviation": "U", "type": "HBD"},
  {"name": "Vanillin", "abbreviation": "VAN", "type": "HBD"},
  {"name": "Xylitol", "abbreviation": "XYL", "type": "HBD"},
  {"name": "glyoxylic acid", "abbreviation": "GXA", "type": "HBD"},
  {"name": "p-coumaric acid", "abbreviation": "PCA", "type": "HBD"},
  {"name": "p-toluenesulfonic acid", "abbreviation": "p–TsOH", "type": "HBD"},
]

from config import MONGODB_URL

RESEARCH_MONGODB_URI = os.getenv(
    "RESEARCH_MONGODB_URI",
    MONGODB_URL,
)

_cached_options: dict | None = None


def _get_built_in_options() -> dict:
    return {
        "feed_materials": DEFAULT_FEED_MATERIALS,
        "hba_compounds": DEFAULT_HBA_LIST,
        "hbd_compounds": DEFAULT_HBD_LIST,
        "biomass_compositions": [],
        "temperature_range": {"min": 60, "max": 200, "values": [60, 80, 100, 120, 140, 160, 180, 200]},
        "hbd_hba_ratio_range": {"min": 0.5, "max": 10.0, "values": [0.5, 1, 2, 3, 4, 5, 6, 8, 10]},
        "liquid_solid_ratio_range": {"min": 5.0, "max": 30.0, "values": [5, 10, 15, 18, 20, 25, 30]},
    }


def _fetch_options_sync() -> dict:
    """Fetch dropdown options from research MongoDB with built-in instant fallback."""
    global _cached_options
    if _cached_options is not None:
        return _cached_options

    try:
        # pyrefly: ignore [missing-import]
        import certifi
        # pyrefly: ignore [missing-import]
        from pymongo import MongoClient

        client = MongoClient(RESEARCH_MONGODB_URI, serverSelectionTimeoutMS=3000, connectTimeoutMS=3000, tlsCAFile=certifi.where())
        db = client["Lignin"]

        # ── 1. Compounds (HBA & HBD) ────────────────────────────────────
        hba_list = []
        hbd_list = []
        for doc in db["compounds"].find({}, {"_id": 0}):
            entry = {
                "name": doc.get("compound_name", ""),
                "abbreviation": doc.get("abbreviation", ""),
                "type": doc.get("type", ""),
            }
            if doc.get("type") == "HBA":
                hba_list.append(entry)
            elif doc.get("type") == "HBD":
                hbd_list.append(entry)

        hba_list.sort(key=lambda x: x["name"])
        hbd_list.sort(key=lambda x: x["name"])

        # ── 2. Feed Materials ────
        feed_materials = []
        if "experiments" in db.list_collection_names():
            exp_pipeline = [
                {
                    "$group": {
                        "_id": "$feed_material",
                        "count": {"$sum": 1},
                        "cellulose": {"$avg": "$cellulose_percent"},
                        "hemicellulose": {"$avg": "$hemicellulose_percent"},
                        "lignin": {"$avg": "$lignin_percent"},
                        "size_mm": {"$avg": "$size_mm"},
                    }
                },
                {"$sort": {"count": -1}}
            ]
            for doc in db["experiments"].aggregate(exp_pipeline):
                name = str(doc["_id"] or "").strip()
                if name:
                    feed_materials.append({
                        "name": name.title(),
                        "key": name.lower().replace(" ", "_"),
                        "sample_count": doc["count"],
                        "cellulose_percent": round(float(doc["cellulose"] or 35.0), 1),
                        "hemicellulose_percent": round(float(doc["hemicellulose"] or 22.0), 1),
                        "lignin_percent": round(float(doc["lignin"] or 20.0), 1),
                        "size_mm": round(float(doc["size_mm"] or 0.5), 2),
                    })

        client.close()

        if feed_materials and hba_list and hbd_list:
            _cached_options = {
                "feed_materials": feed_materials,
                "hba_compounds": hba_list,
                "hbd_compounds": hbd_list,
                "biomass_compositions": [],
                "temperature_range": {"min": 60, "max": 200, "values": [60, 80, 100, 120, 140, 160, 180, 200]},
                "hbd_hba_ratio_range": {"min": 0.5, "max": 10.0, "values": [0.5, 1, 2, 3, 4, 5, 6, 8, 10]},
                "liquid_solid_ratio_range": {"min": 5.0, "max": 30.0, "values": [5, 10, 15, 18, 20, 25, 30]},
            }
            logger.info("Fetched and cached options from MongoDB successfully.")
            return _cached_options

    except Exception as e:
        logger.info("Using built-in research dataset catalog: %s", e)

    # Use built-in complete scientific dataset
    _cached_options = _get_built_in_options()
    return _cached_options


@router.get("/options")
async def get_options():
    """Return all dropdown options with built-in instant catalog guarantee."""
    return await asyncio.to_thread(_fetch_options_sync)

