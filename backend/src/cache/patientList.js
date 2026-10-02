import { getCache } from "./index.js";

export const PATIENT_LIST_TTL = 60; // seconds

// One namespace (Redis hash) per doctor. The id comes from req.doctor, which
// verifyJWT loaded from the verified token, so no client input can select
// another doctor's namespace.
export const patientListNamespace = (doctorId) => `patients:list:${String(doctorId)}`;

// The search regex is case-insensitive, so lower-casing the key only merges
// entries that would hold identical results anyway.
export const patientListField = ({ page, limit, term }) =>
  `p=${page}&l=${limit}&q=${term.toLowerCase()}`;

export const invalidatePatientList = (doctorId) =>
  getCache().invalidate(patientListNamespace(doctorId));
