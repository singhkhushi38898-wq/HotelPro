# HotelPro — MERN Hotel Management System

A learning starter project with React/Vite frontend, Express API, MongoDB models, JWT authentication, room management, and bookings.

## Requirements
- Node.js 20+ (Node.js 24 is fine)
- MongoDB running locally, or MongoDB Atlas URI
- VS Code

## 1. Configure the backend
Open a terminal in this folder:
```bash
cd server
copy .env.example .env
```
Open `server/.env` and set `MONGODB_URI` and a long random `JWT_SECRET`.
For local MongoDB, use `mongodb://127.0.0.1:27017/hotelpro`.

## 2. Start backend
```bash
cd server
npm install
npm run dev
```
API: `http://localhost:5000`; health check: `http://localhost:5000/api/health`.

## 3. Start frontend
Open a SECOND terminal from the HotelPro root folder:
```bash
cd client
npm install
npm run dev
```
Open the URL Vite prints, usually `http://localhost:5173`.

## Demo rooms
After backend is running and MongoDB is connected, open a third terminal:
```bash
cd server
npm run seed
```

## Notes
- Create an account using Sign in → Create an account.
- Admin-only room creation endpoints are included. For local development, change a user role to `admin` in MongoDB to access admin privileges.
- Real payments are not connected. Do not enter real card details.
- This is a learning starter, not production-ready. Add validation, rate limiting, audit logs, email verification, and a real payment provider before production.
