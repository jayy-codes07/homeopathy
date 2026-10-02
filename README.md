# Homeopathy Clinic Management System

A web app for homeopathy doctors to keep patient records, structured case-taking notes, and follow-up history in one place.

## Demo

- **Live app:** `<LIVE_URL>`
- **Demo login:** email `<DEMO_EMAIL>` / password `<DEMO_PASSWORD>`

| Dashboard | Patient detail | Case form |
|---|---|---|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Patient detail](docs/screenshots/patient-detail.png) | ![Case form](docs/screenshots/case-form.png) |

Add the three images at `docs/screenshots/dashboard.png`, `docs/screenshots/patient-detail.png`, and `docs/screenshots/case-form.png`.

## Key features

- **Doctor accounts with JWT auth.** Register and log in; passwords are bcrypt-hashed in a Mongoose pre-save hook. Login issues an access token and a refresh token; every data route runs through a `verifyJWT` middleware that accepts a Bearer header or cookie.
- **Per-doctor data isolation.** Every patient belongs to one doctor. List, read, update, and delete queries all filter by the logged-in doctor's id, and a compound unique index on `(doctor, phoneNumber)` prevents duplicate patients per doctor.
- **Patient CRUD with server-side validation.** Required-field checks, a 10-digit phone number check, and ObjectId validation before any database call.
- **Structured case taking.** A case holds a chief complaint plus an optional "interrogation" section modelled on a paper intake form: presenting complaint, history, past history, and a personal-history block with a thermal-reactivity enum.
- **Two-step patient registration.** The add-patient flow creates the patient, then the first case. The created patient id is remembered so a failed case submission can be retried without creating a duplicate patient.
- **Follow-up history.** Add, edit, and delete dated follow-up entries (symptoms, medicine, advice) per patient, with paginated listing.
- **Paginated dashboard.** Server-side pagination of patients, a debounced search box, and counts of overdue and due-soon follow-ups.
- **Avatar upload.** Multer writes the file to disk, then it is pushed to Cloudinary and the URL is saved on the doctor.
- **Hardened Express app.** Helmet, CORS allowlist, rate limiting (200 requests/minute), request sanitising against MongoDB operator injection, and gzip compression.

## Tech stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Axios, nextjs-toast-notify
- **Backend:** Node.js 20, Express 5, Mongoose 9, jsonwebtoken, bcrypt, Multer, Cloudinary SDK
- **Database:** MongoDB
- **Tooling:** npm, nodemon, ESLint (eslint-config-next)

## Architecture

The Next.js frontend is a pure client of the API. Pages call a shared Axios instance that attaches the stored access token as a Bearer header and redirects to `/login` when the API reports an expired token. Express routes pass through `verifyJWT`, which loads the doctor from MongoDB and puts it on the request. Controllers validate input, run Mongoose queries scoped to that doctor, and return a uniform `ApiResponse` JSON envelope. Thrown `ApiError`s are turned into JSON error responses by the shared async wrapper.

```mermaid
flowchart LR
  UI[Next.js pages] -->|Axios + Bearer token| API[Express routes]
  API --> JWT[verifyJWT]
  JWT --> C[Controllers]
  C --> M[(MongoDB via Mongoose)]
  C -->|avatar| CL[Cloudinary]
```

```
backend/src
  app.js            Express app, middleware, route mounting
  index.js          Local entrypoint: connect to DB, listen
  routes/           doctor, patient, case, followUP
  controllers/      request handlers and validation
  models/           Doctor, Patient, Case, FollowUP schemas
  middleware/       auth (JWT), multer, error handler
  utility/          ApiError, ApiResponse, asyncHandler, cloudinary
frontend/src
  app/              login, (protected)/dashboard, (protected)/patients/...
  components/       PatientForm, CaseForm, CaseDetails, Navbar, form inputs
  utils/            api.ts (Axios instance), case.ts (form <-> payload)
  types/            shared TypeScript interfaces
```

## Notable decisions

- **Token handling.** The access token is returned in the login JSON and kept in `localStorage`; Axios adds it as a Bearer header. The same tokens are also set as `httpOnly` cookies. The refresh token is stored on the doctor document and rotated by `POST /doctor/generateToken`, but the frontend does not call it yet: on `jwt expired` it clears storage and sends the user to login.
- **Errors and validation.** `ApiError` and `ApiResponse` give every response the same shape (`statusCode`, `success`, `message`, `data`). Validation is hand-written in each controller rather than a schema library; invalid ObjectIds and enum values return 400 before Mongoose sees them.
- **Case schema.** The interrogation is a set of nested sub-schemas with `_id: false`. Blank fields are pruned on both client and server so a case with only a chief complaint does not store a tree of empty strings. Updates replace the whole interrogation instead of merging, so cleared fields actually disappear.
- **Serverless-friendly DB connection.** `connectDB` caches the connection promise and is also invoked lazily on `/api/v1`, so `app.js` can be loaded directly by a serverless host without `index.js`.

## Getting started

Requires Node.js 20+ and a MongoDB instance.

```bash
# Backend
cd backend
npm install
# create backend/.env with the variables in the table below
npm run dev            # nodemon on http://localhost:8000 (PORT from .env)

# Frontend (second terminal)
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env
npm run dev            # http://localhost:3000
```

| Variable | Where | Purpose |
|---|---|---|
| `MONGODB_URI` | backend | MongoDB connection string |
| `PORT` | backend | HTTP port (defaults to 3000 if unset) |
| `CORS_ORIGIN` | backend | Allowed browser origin (defaults to `http://localhost:3000`) |
| `ACCESS_TOKEN_SECRET` / `ACCESS_TOKEN_EXPIRE` | backend | Access JWT signing secret and lifetime, e.g. `1d` |
| `REFRESH_TOKEN_SECRET` / `REFRESH_TOKEN_EXPIRE` | backend | Refresh JWT signing secret and lifetime, e.g. `10d` |
| `CLOUDINARY_API_KEY` / `CLOUDINARY_SECRET` | backend | Cloudinary credentials for avatar uploads (cloud name is hard-coded in `utility/cloudinary.js`) |
| `NODE_ENV` | backend | `development` includes stack traces in error responses |
| `NEXT_PUBLIC_API_URL` | frontend | Base URL of the API, including `/api/v1` |

There is no `.env.example` or seed script in the repo yet. Register a doctor through the login page to get started.

## API overview

All paths are prefixed with `/api/v1`. "Auth" means a valid access token is required.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/doctor/register` | no | Create doctor (multipart, optional `avatar`) |
| POST | `/doctor/login` | no | Login, returns access + refresh tokens |
| POST | `/doctor/logout` | yes | Clear refresh token and cookies |
| POST | `/doctor/generateToken` | no | Rotate tokens using the refresh token |
| PATCH | `/doctor/Details/:doctorId` | yes | Update name, email, degree |
| PATCH | `/doctor/Password/:doctorId` | yes | Change password |
| PATCH | `/doctor/Avatar/:doctorId` | yes | Replace avatar (multipart) |
| DELETE | `/doctor/doctor/:doctorId` | yes | Delete doctor account |
| POST | `/patient/register` | yes | Create patient |
| GET | `/patient/all-patient?page&limit` | yes | Paginated patients for this doctor |
| GET | `/patient/search?patientName&diagnosis&medicine&phoneNumber` | yes | Case-insensitive search |
| GET / PATCH / DELETE | `/patient/:patientId` | yes | Read, update, delete one patient |
| POST | `/case/create-case/:patientId` | yes | Create a case for a patient |
| GET | `/case/patient-case/:patientId` | yes | List a patient's cases |
| PATCH | `/case/:caseId` | yes | Update a case |
| POST | `/followup/create-followup/:patientId` | yes | Add a follow-up |
| GET | `/followup/patient-followup/:patientId?page&limit` | yes | List follow-ups |
| PATCH / DELETE | `/followup/patient-followup/:followupId` | yes | Update or delete a follow-up |
| GET | `/api/health` (no `/v1`) | no | Liveness check with DB connection state |

## Testing and deployment

- **Tests:** none. `npm test` in `backend` is the npm placeholder and exits 1. The frontend has ESLint via `npm run lint`.
- **Verified locally:** `npm install` in both packages and `npm run build` in `frontend` succeed on Node 20.20 (Next.js 16.2.6).
- **Deployment:** no Dockerfile, CI config, or `vercel.json` in the repo. The backend is written to run either as a long-lived server (`npm start`) or loaded directly as a serverless function (see `app.js`).

## Roadmap

1. Wire the dashboard search box to `GET /patient/search`. Today it sends a `search` param that the list endpoint ignores.
2. Use `POST /doctor/generateToken` from the Axios interceptor to refresh silently instead of logging the doctor out on expiry.
3. Add API tests with Jest and Supertest, starting with auth and the per-doctor scoping rules.

## Author

**`<YOUR NAME>`** · GitHub [@jayy-codes07](https://github.com/jayy-codes07) · LinkedIn `<LINKEDIN_URL>` · `<EMAIL>`
