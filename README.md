 SentinelAI Frontend

SentinelAI Frontend is a React Native (Expo) web client that consumes the SentinelAI Backend REST API. It provides a dashboard interface for viewing AI-classified incidents, performing live camera analysis, and reviewing full incident reports.

This repository focuses on UI/UX design and API integration.

---

 Features

- Live webcam frame analysis
- Periodic automatic AI scanning
- Incident dashboard with statistics
- Risk level visualization
- Full incident detail screen
- Video upload support via backend

---

 Tech Stack

- React Native (Expo)
- Expo Web
- React Navigation (Bottom Tabs + Native Stack)

---

 Prerequisites

Make sure you have:

- Node.js
- npm
- Expo CLI

---

 Setup Guide

 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/SentinelAI-Frontend.git
cd SentinelAI-Frontend
```

---

 2. Install Dependencies

```bash
npm install
npm install @react-navigation/native-stack
```

---

 3. Configure API Base URL

Open:

- `DashboardScreen.js`
- `LiveAnalysisScreen.js`
- `IncidentDetailScreen.js`

Update:

```javascript
const API_BASE = 'http://YOUR_LOCAL_IP:8082';
```

To find your local IP:

```bash
ipconfig
```

Look for IPv4 address.

---

 4. Start the Application

```bash
npx expo start --web
```

---

 Application Usage

 Live Analysis
1. Go to Live Analysis
2. Allow camera access
3. Click Capture to analyze a frame
4. Click Live for automatic analysis

 Dashboard
- Displays all incidents
- Shows classification, risk level, and timestamp

 Incident Detail
- Click an incident
- View complete AI-generated report

---

 Backend Dependency

This frontend requires the SentinelAI Backend to be running: http://localhost:8082

Backend repository:
https://github.com/SoftwareReboot/SentinelAI-Backend

---

 License

MIT License
