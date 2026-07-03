# 🗺️ CivicFix — AI-Powered Civic Issue Reporting Platform
🔗 **Live Demo:** https://bug-map-eight.vercel.app
CivicFix is a full-stack web application that empowers citizens to report civic issues like potholes, garbage overflow, broken streetlights, and water leakage. It uses AI to generate formal complaint letters addressed to the correct municipal authorities.

## 🚀 Live Features

- 📍 **Report civic issues** with GPS auto-detection and photo upload
- 🗺️ **Interactive map** showing all reported issues across the city (OpenStreetMap + Leaflet.js)
- ⚡ **Real-time updates** — new issues appear instantly on every connected user's map via Socket.io, no refresh needed
- 🤖 **AI Complaint Letter Generator** — generates formal letters to BBMP/BWSSB using Groq LLaMA API
- 📊 **Analytics dashboard** — visualizes issues by category, status, severity, and trends over time using Recharts
- ⬆️ **Community upvoting** — citizens upvote issues to increase priority
- 🔄 **Status tracking** — Open → In Progress → Resolved
- 🔐 **JWT Authentication** — secure register/login system

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Leaflet.js, Recharts, Socket.io-client, React Router |
| Backend | Node.js, Express.js, Socket.io |
| Database | PostgreSQL (Neon - cloud) |
| Authentication | JWT, bcryptjs |
| AI | Groq API (LLaMA 3.3) |
| Image Storage | Cloudinary |
| Maps | OpenStreetMap + Leaflet.js |
| Deployement | Vercel (frontend), Render (backend) |
## 📁 Project Structure
Civicfix/

├── backend/

│   ├── config/        # DB and Cloudinary config

│   ├── controllers/   # Business logic

│   ├── middleware/    # JWT auth middleware

│   ├── routes/        # API routes

│   └── index.js       # Express + Socket.io server

└── frontend/

└── src/

├── components/ # Navbar

├── context/    # Auth context

├── pages/      # Login, Register, Home, ReportIssue, IssueDetail, Analytics

└── api.js      # API calls

## 🎯 Impact

India loses billions annually to unaddressed civic infrastructure issues. BugMap gives citizens a voice and creates public accountability — showing exactly which areas have the most unresolved issues and for how long, backed by real-time visibility and data-driven insights.

## 👩‍💻 Developer

Built by **Vishrutha M R** — ISE, Bangalore Institute of Technology
