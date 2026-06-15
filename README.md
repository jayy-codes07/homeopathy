# Homeopathy Clinic Management System

A full-stack web app built to help homeopathy doctors manage their patients and track followup history. Built this as a portfolio project to practice building a complete system from scratch — auth, file uploads, pagination, and all.

**Live:** https://homeopathy-dfcotz8uz-jayy-codes07s-projects.vercel.app/

**Backend API:** https://homeopathy-9hau.onrender.com/api/v1

---

## What it does

Doctors can register and log into their own account. From there they can add patients with details like diagnosis, medicine, diet, and followup dates. Each patient has a followup history — so every time a patient comes back, the doctor logs what symptoms they had, what medicine was given, and any advice.

The dashboard has live search so finding a patient by name is instant.

---

## Tech Stack

**Frontend**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Axios with interceptors for auth and token expiry handling

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT (access + refresh tokens)
- Cloudinary for doctor avatar uploads
- Helmet, rate limiting, mongo-sanitize for security

**Deployed on**
- Frontend → Vercel
- Backend → Render

---

## Features

- Doctor auth — register with avatar, login, logout, refresh token, profile update
- Patient CRUD — add, view, edit, delete patients
- Followup management — add, edit, delete followup records per patient
- Live search on dashboard
- JWT stored in localStorage with auto-logout on token expiry
- Pagination on patient list API

---

## Running locally

**Backend**

```bash
cd backend
npm install
```

Create a `.env` file:

```
PORT=8000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

```bash
npm run dev
```

**Frontend**

```bash
cd frontend
npm install
```

Create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

```bash
npm run dev
```

Open `http://localhost:3000`

---

## API Routes

**Doctor** (`/api/v1/doctor`)

| Method | Route | Description |
|--------|-------|-------------|
| POST | /register | Register with avatar upload |
| POST | /login | Login |
| POST | /logout | Logout |
| POST | /generateToken | Refresh access token |
| PATCH | /Password/:doctorId | Update password |
| PATCH | /Details/:doctorId | Update doctor details |
| PATCH | /Avatar/:doctorId | Update avatar |
| DELETE | /doctor/:doctorId | Delete account |

**Patient** (`/api/v1/patient`)

| Method | Route | Description |
|--------|-------|-------------|
| POST | /register | Add new patient |
| GET | /all-patient | Get all patients (paginated) |
| GET | /search | Search patients by name |
| GET | /:patientId | Get patient by id |
| PATCH | /:patientId | Update patient details |
| DELETE | /:patientId | Delete patient |

**Followup** (`/api/v1/followup`)

| Method | Route | Description |
|--------|-------|-------------|
| POST | /create-followup/:patientId | Add followup for patient |
| GET | /patient-followup/:patientId | Get all followups for patient |
| PATCH | /patient-followup/:followupId | Update followup |
| DELETE | /patient-followup/:followupId | Delete followup |
