# CampusNexus AI

## Subtitle

Explainable Campus Intelligence & Resource Optimization Platform

## Tagline

From Campus Data to Smarter Decisions.

## Problem Statement

University campuses manage numerous buildings, facilities, and thousands
of students daily. Often, facility management reacts to issues (like
overflowing waste bins, overcrowding, or extreme energy usage) after
they happen. Identifying the possible reasons behind these
inefficiencies can be slow and requires manual data correlation.

## Solution

CampusNexus AI is a smart campus intelligence platform that aggregates
simulated campus data (energy, occupancy, waste) to proactively identify
abnormal situations, explain why an alert was triggered, suggest
actionable recommendations, and allow administrators to simulate
"What-If" efficiency scenarios.

*Note: This MVP uses an explainable rule-based intelligence engine on
simulated data, not a machine learning model or real IoT sensors.*

## Key Features

1.  **Interactive Campus Dashboard:** Monitor campus-wide energy usage,
    occupancy levels, and waste status.
2.  **Explainable Rule-Based Intelligence:** Automatically generates
    human-readable alerts when thresholds or relationships (e.g., low
    occupancy but high energy) are violated.
3.  **Insights Engine:** Provides data-driven resource optimization
    recommendations.
4.  **What-If Simulator:** Lets administrators test estimated energy and
    cost savings by reducing HVAC or lighting usage and modifying
    expected occupancy.
5.  **Efficiency Score:** A simple calculated metric showing overall
    campus health.

## How It Works (Architecture)

``` text
Simulated Campus Data
        ↓
Simulator Engine (Python)
        ↓
Analyzer / Intelligence Engine (Python Rules)
        ↓
Alerts + Insights + Efficiency Score
        ↓
Flask API (Backend)
        ↓
Frontend Dashboard (HTML/CSS/JS)
```

## Technology Stack

-   **Frontend:** Plain HTML, CSS, JavaScript (No complex frameworks)
-   **Backend:** Python, Flask
-   **Data Engine:** Python-based simulation and rule-based JSON
    generation

## Explainable Intelligence

Instead of a "black-box" AI claiming that an anomaly occurred,
CampusNexus uses an **Explainable Rule-Based** approach. Every generated
alert clearly defines:

-   **Title & Severity**
-   **Reason:** (e.g., "ECE Block is consuming 29% more energy than its
    baseline.")
-   **Evidence:** The raw numbers backing up the claim.
-   **Impact:** What may happen if the issue is ignored.
-   **Recommendation:** Actionable advice.

## Simulation Engine

The `backend/simulator.py` file generates realistic, slightly randomized
data points that correlate with basic logic. For example, if occupancy
increases significantly, energy and waste generation naturally follow.

## What-If Simulation

The What-If Simulator provides basic proportional estimations based on
user-defined slider values (e.g., reducing HVAC by 20%, reducing
lighting by 30%, or modifying expected occupancy). It uses simple
arithmetic formulas accessible in the source code to estimate energy and
cost savings.

*Note: The energy distribution and electricity rate used for the
estimation are assumptions for this prototype and should be configured
according to the intended location and tariff.*

## API Endpoints

-   `GET /api/dashboard` - Overall campus summary
-   `GET /api/energy` - Building-wise energy data
-   `GET /api/occupancy` - Building-wise occupancy data
-   `GET /api/waste` - Building-wise waste data
-   `GET /api/alerts` - Generated explainable alerts
-   `GET /api/insights` - Actionable data insights
-   `POST /api/what-if` - Calculate simulation results
-   `POST /api/simulate` - Generate a new tick of simulated data

## Installation

1.  Ensure you have Python installed.

2.  Clone this repository.

3.  Install the dependencies:

    ``` bash
    pip install -r backend/requirements.txt
    ```

## Running Instructions

1.  Open a terminal and navigate to the project root.

2.  Run the backend Flask server:

    ``` bash
    python backend/app.py
    ```

3.  Open `frontend/index.html` in your web browser. You can also serve
    the frontend using Live Server or:

    ``` bash
    python -m http.server 8000
    ```

## Demo Flow

1.  **Open Dashboard:** View the overall campus status and efficiency
    score.
2.  **Review Energy/Occupancy/Waste:** Check specific buildings for
    unusual or threshold-based metrics.
3.  **Check Alerts:** Read the explainable alerts generated based on
    recent simulated data. Review the "Why?", "Evidence?", and
    "Recommendation" sections.
4.  **Insights:** Read high-level optimization suggestions.
5.  **What-If Simulator:** Use the sliders to reduce HVAC and lighting
    usage or modify expected occupancy to view estimated energy and cost
    savings.
6.  **Run Simulation:** Click "Run Simulation" in the sidebar to
    generate a new simulated data tick and watch the dashboard update.

## Limitations

-   Operates entirely on simulated local JSON data, not a live database
    or actual hardware sensors.
-   Uses configured rule-based thresholds instead of a trained
    machine-learning model for anomaly detection.
-   Does not authenticate users.
-   The What-If calculations use assumptions and estimates rather than
    measured building-level energy data.

## Future Improvements

-   Integrate actual IoT sensor APIs (e.g., MQTT feeds).
-   Implement historical data storage (PostgreSQL/MongoDB).
-   Integrate actual predictive ML models using historical trends.
