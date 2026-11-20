# FasalSetu

React + Vite frontend and Express + MongoDB backend.

## Run locally

1. Install Node.js (LTS) and MongoDB, or create a MongoDB Atlas database.
2. In `backend/`, copy `.env.example` to `.env` and set `MONGO_URI` and a long random `JWT_SECRET`.
3. Terminal 1:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
4. In the project root, copy `.env.example` to `.env` if you need a non-default API URL.
5. Terminal 2:
   ```bash
   npm install
   npm run dev
   ```
6. Open the Vite URL shown in the terminal (normally http://localhost:5173).

## Free-tier deployment outline

### 1. Deploy backend on Render
- Push this project to a GitHub repository (do not commit `.env` files).
- In Render, create a Blueprint from the repository and select `render.yaml`.
- Set `MONGO_URI` to your MongoDB Atlas connection string.
- Set `CLIENT_URL` to the exact deployed frontend origin, e.g. `https://your-site.vercel.app`.
- Deploy and copy the Render service URL, e.g. `https://your-api.onrender.com`.

### 2. Deploy frontend on Vercel
- Import the same GitHub repository into Vercel.
- Set the project root to the repository root.
- Add environment variable `VITE_API_URL` with the Render backend base URL (no trailing slash), e.g. `https://your-api.onrender.com`.
- Build command: `npm run build`; output directory: `dist`.
- Deploy.

### 3. Final connection
- In Render, update `CLIENT_URL` to the exact Vercel domain and redeploy.
- In Vercel, confirm `VITE_API_URL` points to the Render backend and redeploy if changed.
- Open the public Vercel URL on another phone and test signup/login and product listing/management.

## Important limitations / current implementation scope
- Free hosting tiers have usage limits; backend services may sleep when idle and take time to wake.
- The backend currently implements farmer/retailer signup and login plus product catalogue and retailer product CRUD.
- A real order/checkout API, payment integration, email/SMS password reset, and production monitoring are not implemented in the current source. Do not advertise these as working until they are built and tested.
- This project ZIP is deployment-prepared, not already deployed. You must create/configure the hosting and database accounts and set their environment variables.
