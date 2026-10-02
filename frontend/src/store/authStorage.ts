// The only module that touches localStorage. The keys are the ones the app
// used before Redux was introduced, so doctors already logged in on the live
// site stay logged in after this deploy.
const TOKEN_KEY = "doctorJWT";
const NAME_KEY = "username";

export interface StoredAuth {
  token: string;
  doctorName: string;
}

export const readAuth = (): StoredAuth | null => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    return { token, doctorName: localStorage.getItem(NAME_KEY) || "" };
  } catch {
    return null;
  }
};

export const writeAuth = ({ token, doctorName }: StoredAuth) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(NAME_KEY, doctorName);
  } catch {
    // Storage unavailable (private mode, blocked): the session lives in memory only.
  }
};

export const clearAuth = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(NAME_KEY);
  } catch {
    // ignore
  }
};
