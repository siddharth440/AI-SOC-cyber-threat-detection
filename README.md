# 🛡️ SentinelX — AI SOC / Cyber Threat Detection Platform

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-22272E?style=for-the-badge&logo=github&logoColor=white)

**SentinelX** is an enterprise-grade, resume-level Security Operations Center (SOC) dashboard and AI-assisted cyber threat detection platform built with zero external framework dependencies using **HTML5, CSS3, and Vanilla JavaScript**. Designed for GitHub Pages compatibility, SentinelX delivers real-time telemetry simulation, explainable AI risk scoring, multi-event correlation, endpoint isolation workflows, SVG cyber attack mapping, and MITRE ATT&CK tactical mapping.

---

## 📌 Executive Overview

### Problem Statement
Modern enterprise environments generate millions of security events daily across web servers, firewalls, workstations, and identity providers. Standard student projects often rely on static CRUD interfaces that fail to demonstrate real-time event processing, multi-stage attack correlation, and explainable threat scoring.

### The Solution
SentinelX bridges this gap by implementing a modular, client-side Security Operations Center architecture. It features a transparent, explainable threat scoring engine, real-time simulated telemetry feeds, interactive vector canvas visualizations, and local persistence—all running strictly in the browser without requiring backend servers, Node.js, or npm dependencies.

---

## ⚡ Key Features

- **🔐 Client-Side Authentication**: Secure login portal with demo credential autofill, protected route guards, and session state persistence.
- **🛡️ Dynamic SOC Dashboard**: Dynamic KPI cards (Critical Alerts, Active Incidents, Threats Detected, Monitored Endpoints, Processed Events) calculated on-the-fly from live dataset.
- **🎯 Circular Security Score Gauge**: Custom SVG circular gauge dynamically computing health score (0–100) based on active threat metrics.
- **🤖 Explainable Threat Detection Engine**: Rule-based AI engine evaluating telemetry attributes (failed logins, geo-IP anomalies, suspicious ports, request spikes, privileged users) and outputting risk scores, severity, confidence %, classification, and human-readable explanation reasons.
- **🔥 Multi-Event Correlation Engine**: Automatically correlates sequences of alerts across time windows (e.g. Brute Force + Geo Anomaly → Credential Compromise) and generates correlated incidents.
- **🚨 Interactive Alerts Management**: Multi-column search, severity/status filters, pagination, and alert details modal with explainable detection rationales.
- **💻 Endpoint Fleet & Isolation Simulation**: Real-time CPU/RAM progress gauges, endpoint drill-downs, and a 1-click **ISOLATE ENDPOINT** action simulator with audit trail logging.
- **📋 On-The-Fly Log Analyzer**: Unified audit logs across Authentication, Firewall, DNS, Web, and Endpoint layers with instant "Analyze Log" AI triage.
- **🌐 SVG Cyber Attack Map**: Animated vector map rendering real-time curved attack arcs between global origin IPs and internal target subnets.
- **⚔️ MITRE ATT&CK Matrix**: 10-tactic matrix with technique tiles dynamically highlighted based on live system threat activity.
- **📈 Executive Security Reports**: Custom reporting interface with print stylesheet optimization (`window.print()`) for direct PDF export.
- **⚙️ Settings & Factory Reset**: Configurable SOC defaults, analyst profile, live stream toggle, and LocalStorage data reset.

---

## 🏗️ System Architecture

```
                          ┌────────────────────────────────────────────────────────┐
                          │                SentinelX Web Application               │
                          │   (Vanilla HTML5 / Modern CSS3 / Modular JS ES6)       │
                          └───────────────────────────┬────────────────────────────┘
                                                      │
         ┌────────────────────────────────────────────┼────────────────────────────────────────────┐
         │                                            │                                            │
┌────────┴─────────┐                       ┌──────────┴──────────┐                       ┌─────────┴────────┐
│  Presentation    │                       │   Core Security     │                       │ Data & Telemetry │
│     Layer        │                       │      Engines        │                       │      Engine      │
├──────────────────┤                       ├─────────────────────┤                       ├──────────────────┤
│ • 11 HTML Pages  │                       │ • Detection Engine  │                       │ • Demo Generator │
│ • 4 CSS Modules  │                       │   (Risk & Scoring)  │                       │   (100+ Alerts)  │
│ • Custom Canvas/ │                       │ • Correlation Engine│                       │ • Storage Wrapper│
│   SVG Charts     │                       │   (Multi-event)     │                       │   (localStorage) │
│ • Interactive    │                       │ • Live Event Stream │                       │ • Audit Trail &  │
│   Attack Map     │                       │   (Simulated)       │                       │   Notifications  │
└──────────────────┘                       └─────────────────────┘                       └──────────────────┘
```

---

## 📁 Repository Structure

```
SentinelX/
├── index.html            # Login Authentication Page
├── dashboard.html        # Main SOC Security Operations Dashboard
├── alerts.html           # Security Alerts Management & AI Explainability
├── incidents.html        # Incident Response & Workflow Timeline
├── threats.html          # Threat Intelligence IOC Database
├── endpoints.html        # Endpoint Fleet Monitoring & Containment
├── logs.html             # Log Analyzer & On-The-Fly AI Triage
├── attack-map.html       # SVG Global Cyber Attack Map
├── mitre.html            # MITRE ATT&CK Tactical Matrix
├── reports.html          # Executive Security Report Generator
├── settings.html         # SOC Configuration & Demo Data Reset
├── 404.html              # Cyber-themed 404 Page
│
├── css/
│   ├── style.css         # Core Design System & CSS Variables
│   ├── components.css    # Sidebar, Topbar, Modals, Tables, Toasts
│   ├── dashboard.css     # Dashboard Grids, Charts, MITRE Tiles, Print CSS
│   └── responsive.css    # Tablet & Mobile Breakpoints
│
├── js/
│   ├── app.js            # Core App Shell & Live Telemetry Stream Engine
│   ├── auth.js           # Client-side Auth & Route Protection
│   ├── storage.js        # LocalStorage Abstraction & Persistence
│   ├── data.js           # Deterministic Demo Data Generator
│   ├── detection-engine.js  # Explainable AI Threat Scoring Engine
│   ├── correlation-engine.js# Multi-event Attack Chain Correlation Engine
│   ├── dashboard.js      # Dashboard View & Dynamic KPI Calculation
│   ├── alerts.js         # Alerts Table, Search, Filters & Modal
│   ├── incidents.js      # Incident Response Cards & Timeline
│   ├── threats.js        # Threat Intel IOC Management
│   ├── endpoints.js      # Endpoint Fleet & Network Isolation Simulator
│   ├── logs.js           # Log Analyzer View
│   ├── attack-map.js     # SVG Attack Arc Animation Controller
│   ├── mitre.js          # MITRE Matrix Mapper
│   ├── reports.js        # Printable Executive Report Engine
│   ├── settings.js       # Settings View & Factory Reset
│   ├── notifications.js  # Toast Notifications & Header Bell Popover
│   ├── charts.js         # Zero-Dependency Canvas & SVG Chart Engine
│   └── utils.js          # Helpers, Formatters & Sanitizers
│
└── README.md             # Project Documentation
```

---

## 🚀 How to Run Locally

SentinelX requires **no server installation, node modules, or build steps**.

1. Download or clone this repository:
   ```bash
   git clone https://github.com/your-username/SentinelX.git
   ```
2. Navigate into the `SentinelX` folder.
3. Open `index.html` directly in any modern web browser (Chrome, Firefox, Edge, Safari).

---

## 🔑 Demo Analyst Credentials

> [!NOTE]
> Authentication is strictly client-side for demonstration and portfolio presentation purposes.

- **Email**: `soc.admin@sentinelx.local`
- **Password**: `SentinelX@123`

---

## 🌐 Deploying to GitHub Pages

1. Push your SentinelX repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial SentinelX Release"
   git branch -M main
   git remote add origin https://github.com/your-username/SentinelX.git
   git push -u origin main
   ```
2. On GitHub, navigate to your repository's **Settings** tab.
3. Scroll down to **Pages** in the left sidebar.
4. Under **Build and deployment** → **Source**, select `Deploy from a branch`.
5. Under **Branch**, select `main` and `/ (root)`, then click **Save**.
6. GitHub will generate a live URL (e.g. `https://your-username.github.io/SentinelX/`).

---

## ⚠️ Project Limitations & Disclaimers

- **Simulated Telemetry**: The threat detection engine, network logs, and live telemetry events are client-side simulations operating on rule-based heuristics.
- **Client-Side Auth**: Login validation is client-side for demonstration purposes; it does not replace server-side OAuth/JWT authentication in production environments.
- **Simulated Endpoint Isolation**: Clicking "Isolate Endpoint" modifies local state and generates audit logs without executing actual OS or network-level firewall commands.
- **Local Persistence**: Data modifications are saved in the browser's `localStorage`. Clearing browser cache or clicking "Reset Demo Data" restores factory defaults.

---

## 🔮 Future Improvements

- Integration with real SIEM collectors (Elasticsearch / Splunk REST APIs).
- Integration with Machine Learning anomaly detection models via WebAssembly (WASM).
- WebSocket support for real-time live syslog streams.
- Multi-tenant role-based access control (RBAC).

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
