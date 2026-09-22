# Lignin Extraction Portal

A full-stack web portal that serves deep learning models predicting lignin removal efficiency in deep eutectic solvent-based biomass fractionation, letting users run predictions, compare models, and review results through a browser instead of a script.

## Features
- Prediction interface for lignin removal yield from process parameters
- Model comparison across DNN, TabNet, and NODE, with confidence indicators
- Prediction history and downloadable reports (PDF export)
- Email/OTP-based signup and login with JWT authentication
- Responsive React UI with charts for yield/time and multi-model benchmarking

## Tech Stack
**Frontend:** React (Vite), React Router, Recharts, Framer Motion, Three.js
**Backend:** FastAPI, MongoDB, JWT auth, OTP email verification
**ML:** PyTorch (DNN), TabNet, NODE — trained models served via the FastAPI backend
**Deployment:** Render

## My Contribution
Built collaboratively with a teammate. My focus:
- React frontend: pages, layout, and the architecture/pipeline visualisation
- FastAPI backend: authentication routes, OTP email flow, and MongoDB integration
- Bug fixes and UI polish across the auth and dashboard components

## Setup
**Backend**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
**Frontend**
```bash
npm install
npm run dev
```
Configure `.env` for MongoDB connection string, JWT secret, and email SMTP credentials (see `backend/config.py` and `backend/.env.example`).

## Screenshots
_Add screenshots of the prediction page, model comparison, and dashboard here._
