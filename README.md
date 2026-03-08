 SentinelAI Frontend

![React Native](https://img.shields.io/badge/React%20Native-Expo-blue)
![Platform](https://img.shields.io/badge/Platform-Web-lightgrey)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

SentinelAI Frontend is a React Native (Expo Web) client application that consumes the SentinelAI Backend REST API. It provides a real-time dashboard for monitoring AI-classified incidents and performing live camera analysis.

This repository focuses on frontend architecture, navigation flow, and API integration.

---

  Features

- Live webcam frame analysis
- Automatic periodic scanning
- Incident dashboard with statistics
- Risk level visualization
- Detailed AI-generated incident reports
- Backend-integrated video upload

---

 Frontend Architecture

```
App
 ├── Navigation (Bottom Tabs + Stack)
 ├── Screens
 │     ├── DashboardScreen
 │     ├── LiveAnalysisScreen
 │     └── IncidentDetailScreen
 │
 └── API Layer (HTTP Requests to Backend)
```

 Design Principles

- Clear screen separation
- Stateless data fetching from backend
- Reusable UI components
- Backend-driven state

---

 🛠 Tech Stack

- React Native
- Expo
- Expo Web
- React Navigation

---

  Project Structure

```
SentinelAI-Frontend/
├── src/
│   ├── screens/
│   ├── components/
│   ├── navigation/
│   └── services/
│
├── package.json
└── README.md
```

---

  Prerequisites

- Node.js
- npm
- Expo CLI

---

  Setup Guide

 1️⃣ Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/SentinelAI-Frontend.git
cd SentinelAI-Frontend
```

---

 2️⃣ Install Dependencies

```bash
npm install
npm install @react-navigation/native-stack
```

---

 3️⃣ Configure Backend URL

Update API base URL in:

- DashboardScreen.js
- LiveAnalysisScreen.js
- IncidentDetailScreen.js

```
const API_BASE = 'http://YOUR_LOCAL_IP:8082';
```

Find local IP:

```bash
ipconfig
```

---

 4️⃣ Run Application

```bash
npx expo start --web
```

---

 🔗 Backend Dependency

Backend must be running:

http://localhost:8082

Backend Repository:
https://github.com/SoftwareReboot/SentinelAI-Backend.git

---

 📄 License

MIT License
