export interface Patient {
  _id: string;
  patientName: string;
  age: number;
  gender: "MALE" | "FEMALE" | "OTHER";
  diagnosis: string;
  medicine: string;
  address?: string;
  diet?: "VEG" | "NON VEG" | "MIXED";
  phoneNumber: string;
  familySize?: number;
  occupation?: string;
  followUpDate?: Date;
}

export interface Followup {
  _id: string;
  followUpDate: Date;
  symptoms: string;
  advise: string;
  medicine: string;
  patientId: string;
}

export type ThermalReactivity = "HOT" | "CHILLY" | "AMBITHERMAL";

export interface PresentingComplaint {
  locationExtension?: string;
  sensation?: string;
  modalities?: string;
  concomitants?: string;
}

export interface PersonalHistory {
  thermalReactivity?: ThermalReactivity | "";
  appetite?: string;
  desires?: string;
  aversion?: string;
  intolerance?: string;
  thirst?: string;
  bowel?: string;
  urine?: string;
  sleep?: string;
  dream?: string;
  perspiration?: string;
  addiction?: string;
  menses?: string;
  mentals?: string;
}

export interface Interrogation {
  presentingComplaint?: PresentingComplaint;
  historyOfPresentIllness?: string;
  pastHistory?: string;
  personalHistory?: PersonalHistory;
}

export interface Case {
  _id: string;
  patient: string;
  chiefComplaint: string;
  interrogation?: Interrogation;
  createdAt?: string;
}

// Form-side shape: every field is a present string so the inputs stay
// controlled. Blanks are stripped out before the case is sent.
export interface CaseFormData {
  chiefComplaint: string;
  interrogation: {
    presentingComplaint: Required<PresentingComplaint>;
    historyOfPresentIllness: string;
    pastHistory: string;
    personalHistory: Required<PersonalHistory>;
  };
}
