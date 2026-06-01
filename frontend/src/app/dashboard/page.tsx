"use client";
import Loading from "@/components/Loading";
import api from "@/utils/api";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
interface Patient {
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
const Page = () => {
  const [patient, setPatient] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const functionFetchData = async () => {
    const patientData = await api.get("/patient/all-patient");
    setPatient(patientData.data.data);
  };

  useEffect(() => {
    try {
      if (!localStorage.getItem("doctorJWT")) router.push("login");
      const load = async () => {
        setLoading(true);
        await functionFetchData();
        setLoading(false);
      };
      load();
    } catch (error:any) {
      setError(
        error.response?.data?.message ||
          "there is problem while fetching patients",
      );
    }
  }, []);

  return loading ? <Loading /> : <div>hello</div>;
};

export default Page;
