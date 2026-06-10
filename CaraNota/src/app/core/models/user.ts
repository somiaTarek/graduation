// core/models/user.ts

export type UserRole = 'doctor' | 'patient' | 'receptionist' | 'admin';

// ── Auth requests ──────────────────────────────────────────────────────────────

export interface LoginRequest {
  email:    string;
  password: string;
}

// POST /Api/Auth/Register
// ⚠️ `role` field REMOVED — backend does not accept it in RegisterDto (Swagger confirmed).
//    Registration is always patient self-signup. Doctors/receptionists are created by admin.
// ⚠️ `dateOfBirth` added — ISO 8601 date-time string (nullable).
// ⚠️ `bloodType`, `allergies`, `insuranceInfo`, `chronicConditions` added — all nullable.
export interface RegisterRequest {
  fullName:          string;
  email:             string;
  phoneNumber:       string;
  password:          string;           // min length 8 (enforced by backend)
  gender?:           string | null;
  dateOfBirth?:      string | null;    // ISO 8601 e.g. "1990-05-15T00:00:00Z"
  bloodType?:        string | null;
  allergies?:        string | null;
  insuranceInfo?:    string | null;
  chronicConditions?: string | null;
}

// ── Auth responses ─────────────────────────────────────────────────────────────

// Raw shape returned directly from POST /Api/Auth/Login
export interface RawLoginResponse {
  accessToken:    string;
  refreshToken:   string;
  userId:         string;
  email:          string;
  fullName:       string;
  roles:          string[];
  patientId:      number | null;
  doctorId:       number | null;
  receptionistId: number | null;
  adminId:        number | null;
}

// Normalized shape stored in memory / localStorage after login
export interface LoginResponse {
  token:        string;
  refreshToken: string;
  user: {
    id:    string;
    name:  string;
    email: string;
    role:  UserRole;
  };
}

export interface RegisterResponse {
  message?: string;
}
