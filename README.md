# ESMAR Marine Safety Operations OS (MVP Simulation)

**ESMAR Marine Safety Operations OS** is a state-of-the-art, AI-powered inspection, compliance, and asset lifecycle management platform designed specifically to transform ESMAR Marine's safety operations from manual spreadsheets and paperwork into an automated digital workflow.

ESMAR Marine is a leading provider of marine safety, firefighting, inspection, and compliance services. This platform is built to solve ESMAR's core challenge: **moving from selling physical equipment to selling continuous, bulletproof Safety Compliance.**

---

## 🔗 Business Alignment: Problem vs. Solution

Here is how the modules implemented in this simulation align directly with ESMAR Marine's core business areas and revenue streams:

| ESMAR Business Area | ESMAR Operational Challenge | Safety Operations OS Solution |
| :--- | :--- | :--- |
| **Marine Safety & Firefighting** | Manual checklists, varying technician standards, missed component checks. | **AI Inspection Assistant**: Standardized, automated inspection checklist using QR scans and visual photo analysis. |
| **Inspection & Certification** | Days spent writing reports, manual certificate tracking, audit compliance delays. | **Automated Compliance Engine**: Generates official PDF-printable SOLAS/IMO-compliant safety certificates instantly on sign-off. |
| **Safety Compliance (Core Sale)** | Keeping shipowners compliant, tracking upcoming certificate expiries. | **Asset Lifecycle Registry**: Chronological service timelines, active alert states, and renewal countdowns for every asset. |
| **Revenue Model & Retention** | Customer support overhead, manual certificate sharing, lack of transparency. | **Customer Self-Service Portal**: Direct portal for shipowners to review their fleet inventory, download active certs, and request service. |
| **Offshore & Industrial Support** | Keeping crew safe on deck, managing safety in toxic or remote locations. | **Advanced IoT Telemetry & CCTV PPE Monitoring**: Real-time sensor alerts (pressure, gas levels) and computer-vision surveillance compliance checks. |

---

## 🛠️ Main Simulation Features

### 1. 🤖 AI-Powered Inspections (Module 1)
Field technicians scan an asset QR code to pull up the record, capture condition photos (Pressure, Corrosion, Tamper Seal), and run the AI analyzer. The model automatically outputs visual defect bounding boxes and calculates pass/fail results.

### 2. 📄 Automated Compliance Certificates (Module 2)
Instantly generates a professional compliance report including asset serial numbers, vessel IMO identification, visual inspection logs, photo annexes, and digital surveyor signatures, ready for print/export.

### 3. ⚓ Fleet Asset Registry (Module 3)
A unified, filterable ledger of safety assets showing installation parameters, inspection histories, and complete chronological event logs in a drawer overlay.

### 4. 💬 Compliance Intelligence AI Chat (Module 4)
A regulatory chatbot pre-trained on **SOLAS Chapter II-2 (Fire)**, **SOLAS Chapter III (LSA)**, and **IMO standards** to give technicians and auditors immediate compliance answers.

### 5. 🧑‍💻 Customer Self-Service Portal (Module 5)
Vessel owners can log in to view their fleet compliance rating, active safety certificates, upcoming renewals (e.g. SCBA servicing), and download verified PDFs.

### 6. 🚨 Advanced Safety Telemetry & Monitoring (Module 6 & Beyond)
- **IoT Sensors**: Live slider telemetry to test air pressure decay and toxic H2S gas alarms.
- **CCTV Video Analytics**: Visual deck camera rendering bounding boxes over crew, tracking helmet/vest compliance, and triggering safety alarms on breaches.
- **Predictive Health**: Machine learning forecast curves predicting estimated valve failure dates.
- **🌗 Mode Toggle**: Easily switch between Dark console mode and Light high-contrast corporate theme.

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

## 📝 Walkthrough Scenario to Present to Clients

1. **Initialize**: Click **Start Scenario** in the top controller. The system will switch to the *AI Inspection* screen.
2. **Scan**: Click the **QR Code** to simulate scanning Fire Extinguisher `FE-102`.
3. **Capture**: Click **Select Photos** to stage the pressure gauge, corrosion, and seal photos.
4. **AI Check**: Click **Run AI Analysis** to watch the computer-vision bounding boxes draw over the anomalies.
5. **Verify**: Click **Verify with AI Chat** to ask the chatbot about the SOLAS regulations regarding this failure.
6. **Deploy**: Click **Open Customer Portal** to see the client's warning alerts, notifications, and download the updated certificate.
