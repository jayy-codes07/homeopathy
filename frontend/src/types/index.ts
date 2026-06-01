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
