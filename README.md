 SentinelAI Frontend

![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-5-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-teal)
![Platform](https://img.shields.io/badge/Platform-Web-lightgrey)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

SentinelAI Frontend is a React web application that consumes the SentinelAI Backend REST API. It provides a real-time dashboard for monitoring AI-classified incidents and performing live camera analysis.

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
 ├── React Router v6 (Client-side Routing)
 ├── Pages
 │     ├── Dashboard
 │     ├── LiveMonitor
 │     ├── VideoUpload
 │     ├── IncidentReports
 │     ├── IncidentDetail
 │     └── Settings
 │
 └── API Layer (HTTP Requests to Backend)
```

 Design Principles

- Clear page separation
- Stateless data fetching from backend
- Reusable UI components
- Backend-driven state

---

 🛠 Tech Stack

- React 18
- React Router v6
- Vite 5
- TailwindCSS 3
- Recharts
- Lucide Icons

---

 Project Structure

```
SentinelAI/
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── utils/
│   └── services/
│
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── README.md
```

---

 Prerequisites

- Node.js 18+
- npm

---

 Setup Guide

 1️⃣ Clone Repository

```bash
git clone https://github.com/jNyxxx/SentinelAI.git
cd SentinelAI
```

---

 2️⃣ Install Dependencies

```bash
npm install
```

---

 3️⃣ Configure Backend URL

Update API base URL in the services layer:

```js
const API_BASE = 'http://YOUR_LOCAL_IP:8082';
```

Find local IP:

```bash
ipconfig
```

---

 4️⃣ Run Application

```bash
npm run dev
```

Frontend runs on http://localhost:5173

---

 🔗 Backend Dependency

Backend must be running:
http://localhost:8082

Backend Repository:
https://github.com/SentinelAI-UCMN/SentinelAI-Backend.git

---

 📄 License

MIT License
