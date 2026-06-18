# FireSafe OS: Safety Compliance & Service Management Platform (MVP)

**FireSafe OS** is an AI-powered inspection, certification, compliance, and service contract (AMC) management platform built for fire protection and safety companies.

The platform helps organizations manage inspections, generate compliance documentation, track safety assets, monitor service contracts, and improve operational visibility across customers, sites, and crews.

Instead of relying on spreadsheets, paper reports, and disconnected systems, **FireSafe OS** creates a centralized, intelligent digital workflow from site selection to client portal updates.

---

## 🔗 Business Alignment: Industry Problem vs. Solution

| Industry Business Challenge | FireSafe OS Module Solution |
| :--- | :--- |
| **Manual Inspection Documentation**: Technicians spend significant time writing reports and compiling photo evidence. | **Smart Inspection & AI Assistant**: Site selector, scanner, photo staging, and AI diagnostic engine generating immediate defect detection. |
| **Compliance Management**: Tracking regulations (NFPA), certificates, and audit readiness is complex. | **Compliance Evaluation Engine**: Compares findings against safety standards to output PASS/FAIL verdicts with reasoning. |
| **Asset Visibility**: Thousands of safety assets (extinguishers, alarm loops, detectors) must be tracked across multiple sites. | **Safety Asset Registry**: Filterable, multi-site asset ledger tracking complete installation, inspection, and timeline history. |
| **AMC Management**: Service schedules, renewals, and recurring contract obligations require constant tracking. | **AMC & Service Management**: Real-time contract ledger tracking active AMC contracts, service cycles, monthly values, and technician assignments. |
| **Customer Portal**: Customers need instant access to compliance reports, active certificates, and service records. | **Customer Self-Service Portal**: Direct client portal listing site compliance logs, certificate downloads, and warning notifications. |

---

## 🛠️ Core Functional Modules

### 1. 📋 Smart Inspection Workflow (Module 1)
Allows technicians to select a customer facility site, choose/verify local assets, capture condition photos, and submit records.

### 2. 🤖 AI Inspection Assistant (Module 2)
Runs a computer-vision neural model on staged photos to locate anomalies (Pressure abnormalities, Corrosion, Missing safety seal) and render overlay **glowing bounding boxes** with confidence ratings.

### 3. ⚖️ Compliance Evaluation Engine (Module 3)
Audits AI findings against local regulations and NFPA standards to output a PASS/FAIL decision with explainable reasoning.

### 4. 📄 Automated Reports & Certificates (Module 4)
Instantly compiles inspection logs, photo annexes, digital surveyor signatures, and **Proactive Maintenance Recommendation alerts** into professional certificates.

### 5. 🗃️ Safety Asset Registry (Module 5)
A multi-site registry storing historical service timelines, serial IDs, and status markers for Fire Extinguishers, Fire Alarm Systems, Gas Detection Systems, and SCBA Equipment.

### 6. 📅 AMC & Service Management (Module 6)
Tracks 18 Active AMC contracts, monthly values, next service dates, and assigned technicians.

### 7. 💬 Compliance AI Knowledge Assistant (Module 7)
Trained chatbot ready to answer operational queries:
- *"What inspections are due this month?"*
- *"Why did asset FE-102 fail?"*
- *"Show previous service history for FE-102."*
- *"Which assets have expired certificates?"*

### 8. 🧑‍💻 Customer Portal (Module 8)
Gives facility clients a secure view of their site safety inventory, active/suspended certificates, and warning alerts.

---

## ⚙️ Advanced IoT & Safety Monitoring Features

- **IoT Telemetry**: Slider hooks simulating cylinder pressure drops and H2S gas leaks to trigger real-time system warnings.
- **CCTV Surveillance Monitoring**: Live security camera feed running object-detection bounding boxes over crew, tracking helmet/vest compliance, and triggering safety alarms on hazard breaches.
- **Predictive Health**: Chart plotting forecasting estimated cylinder valve failure dates.
- **🌗 Contrast Mode**: Sun/Moon header toggle to switch between dark and light themes.

---

## 🚀 How to Run the Simulation

The simulation is built as a self-contained, client-side web application. It has zero external dependencies, zero compilation steps, and does not require Node.js.

### Method A: Double-Click (Local Execution)
1. Clone or download this repository.
2. Locate `index.html` in your directory.
3. Double-click **`index.html`** to launch the operations console directly in any web browser.

### Method B: Python Local Server
To run the dashboard as a local hosted project:
1. Open your terminal in the project folder and run:
   ```bash
   python -m http.server 8000
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

---

## 📝 Demo Presentation Walkthrough

1. **Start**: Click **Start Walkthrough** in the scenario pane. The view routes to the *Smart Inspection* tab.
2. **Select Site**: Select **Terminal 1 - Cargo Port Facility** in the Customer Site dropdown.
3. **Scan**: Click the **QR Code** placeholder to simulate scanning cylinder `FE-102`.
4. **Photos**: Click **Stage Photos** on the controller to load the three inspection images (Gauge, Corrosion, Seal).
5. **AI Audit**: Click **Run AI Analysis** to watch the computer-vision bounding boxes overlay onto the cylinder defects.
6. **Verdict**: The compliance engine fails the asset, issues a critical maintenance recommendation, and updates the certificate.
7. **Verify**: Click **Verify with AI Chat** to ask the chatbot *"Why did asset FE-102 fail?"* for Solas/NFPA citation logs.
8. **Client Sync**: Click **Inspect Customer Portal** to view the customer portal, showing the warning alerts, notifications, and suspended certificate.
