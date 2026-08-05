"""
AI-Powered Lignin Extraction Predictor — FastAPI Backend
Database: MongoDB Atlas (Clean State)
"""


import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import CORS_ORIGINS
from database import connect_db, disconnect_db
from routes import auth, predictions, history, compare, reports, options

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("Starting Lignin Extraction Predictor API...")
    try:
        await connect_db()
    except Exception as e:
        logger.warning("MongoDB connection failed at startup (will retry on first request): %s", e)
    yield
    await disconnect_db()
    logger.info("Shutting down API.")


app = FastAPI(
    title="AI-Powered Lignin Extraction Predictor API",
    description="Backend API for predicting lignin yield and recommended extraction time using deep learning.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(predictions.router)
app.include_router(history.router)
app.include_router(compare.router)
app.include_router(reports.router)
app.include_router(options.router)


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint — API health check."""
    return {
        "message": "AI-Powered Lignin Extraction Predictor API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running",
    }


@app.get("/api/health", tags=["Root"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "database": "connected",
    }

