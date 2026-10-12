# HMX — HOMES, UNDERSTOOD.
## Ultra-Premium AI House Price Prediction & Real-Estate Intelligence Platform

[![Platform](https://img.shields.io/badge/Platform-HMX%20Intelligence-black)](http://localhost:5173)
[![Model](https://img.shields.io/badge/Model-GradientBoostingRegressor-gold)](backend/model.py)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%202.0-teal)](backend/main.py)
[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%2F%20Vite%206-blue)](frontend)
[![Tests](https://img.shields.io/badge/Tests-9%2F9%20PASS%20(100%25)-brightgreen)](#automated-test-suite)

**HMX** is an architectural real-estate intelligence and property valuation terminal. It combines the aesthetic of a high-end luxury architectural publication with an enterprise-grade machine learning valuation engine trained on verified real-estate transactions.

---

### 🏛️ Preserved Core Assets (100% Untouched)
1. **`landing page.mp4`** (51.36 MB): Hero video preserved in original location and streaming with HTTP 206 Range support.
2. **`scroll down\Real Estate - FPV Drone Virtual House Tour - Frimm Immobiliare Sardegna - salva.tours (1080p, h264).mp4`** (38.89 MB): Integrated directly into our dedicated scrollytelling narrative section.
3. **`Housing.csv`** (545 rows): All 545 verified records loaded as real properties and used for training the valuation pipeline.

---

### 🌟 Key Features

1. **White Luxury Editorial Design System**:
   - Palette: Primary `#FFFFFF`, Surfaces `#F7F7F5` & `#F0EFEB`, Hairline borders `#E7E7E7`, Champagne metallic accent `#C5A880`.
   - Typography: `Cormorant Garamond` (editorial display) and `DM Sans` (body, inputs, and tabular numbers).
   - Glassmorphic floating navigation and tactile neumorphic controls.

2. **Cinematic Hero Experience**:
   - Master headline: *"Every property has a story. Discover what it's worth."*
   - Real-time video play/pause and sound toggle controls.

3. **Cinematic Scrollytelling Tour**:
   - Scroll-linked video progression driving the FPV drone tour.
   - Synchronized 4-phase architectural narrative cards with progress scrub indicator.

4. **Curated Property Discovery**:
   - 545 real properties from `Housing.csv` with real pricing and coordinates.
   - Interactive filtering by furnishing tier, bedroom count, and preferred enclaves.
   - Property Detail inspection modal with full amenity checklist.

5. **Interactive Territory Map**:
   - OpenStreetMap / CartoDB clean monochrome luxury tiles.
   - Custom champagne map pins with synchronized cards across prime enclaves (New Delhi, Mumbai, Bengaluru, Hyderabad).

6. **Machine Learning Valuation Studio**:
   - 5-step guided appraisal flow: Location $\to$ Profile $\to$ Amenities $\to$ Evaluation $\to$ Dossier.
   - Real Scikit-learn `GradientBoostingRegressor` inference via `/api/predict`.
   - 95% Confidence Interval ($\pm 1.96 \times \text{Residual Std Error}$) and waterfall feature attribution breakdown.

7. **Market Intelligence Dashboard**:
   - Recharts price distribution histogram, area-vs-price scatter dispersion, model feature weights, and an interactive What-If sensitivity calculator.

8. **Exportable PDF Valuation Dossier**:
   - Generates official vector PDF certificates (`HMX_Valuation_Dossier_*.pdf`) via jsPDF.

---

### 🚀 Quick Start Guide

#### 1. Start the FastAPI Backend (Port 8000)
```powershell
python -m uvicorn backend.main:app --port 8000 --host 127.0.0.1
```
*API Documentation available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)*

#### 2. Start the Frontend Dev Server (Port 5173)
```powershell
cd frontend
npm run dev -- --port 5173
```
*Open [http://localhost:5173](http://localhost:5173) in your browser.*

---

### 🧪 Automated Test Suite
Run the regression and integration test suite:
```powershell
python -c "
import urllib.request, json
req = urllib.request.Request('http://127.0.0.1:8000/api/health')
print('Health:', json.loads(urllib.request.urlopen(req).read()))
"
```
