"use client";
import Loading from "@/components/Loading";
import api from "@/utils/api";
import { useRouter } from "next/navigation";
import React, { FormEvent, useEffect, useState } from "react";

interface FormData {
  fullname: string;
  email: string;
  password: string;
  degree: string;
}

const Page = () => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    fullname: "",
    email: "",
    password: "",
    degree: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // NEW: only for the eye-icon toggle, no backend impact

  const saveTokenAndRedirect = async () => {
    const response = await api.post("/doctor/login", formData);
    const token = response.data.data.Accesstoken;
    const username = response.data.data.doctor.fullname
    localStorage.setItem("doctorJWT", token);
    localStorage.setItem("username", username);
    router.push("/dashboard");
  };

  const handelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await saveTokenAndRedirect();
      } else {
        await api.post("/doctor/register", formData);
        await saveTokenAndRedirect();
      }
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
        "error while sending response to backend",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("doctorJWT")) {
      router.push("/dashboard");

    }
  }, [])

  return isLoading ? (
    <Loading />
  ) : (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4 md:p-12 font-sans text-[var(--color-on-surface)] antialiased relative overflow-hidden">
      {/* Subtle background blobs, matches Lumina design system */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-[var(--color-surface-container-highest)] rounded-full blur-[100px] opacity-30"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-[var(--color-primary-container)] rounded-full blur-[120px] opacity-10"></div>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-[var(--color-surface-container-lowest)] rounded-xl shadow-[0_8px_24px_rgba(26,28,27,0.08)] p-8 md:p-10 border border-[var(--color-surface-container-highest)] relative overflow-hidden">

          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[color:var(--color-primary-container)]/20 mb-3">
              <span
                className="material-symbols-outlined text-[var(--color-primary)] text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                local_florist
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-[var(--color-on-surface)] mb-1">
              {isLogin ? "Welcome Back" : "Create Doctor Account"}
            </h1>
            <p className="text-sm text-[var(--color-on-surface-variant)]">
              {isLogin
                ? "Sign in to access your dashboard"
                : "Register your doctor account to get started"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handelSubmit} className="space-y-5">

            {!isLogin && (
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-[var(--color-on-surface-variant)]">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Dr. John Doe"
                  value={formData.fullname}
                  onChange={(e) =>
                    setFormData({ ...formData, fullname: e.target.value })
                  }
                  className="w-full rounded-lg px-4 py-[10px] border border-[var(--color-outline-variant)] bg-transparent text-[var(--color-on-surface)] placeholder-[var(--color-outline)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-[var(--color-on-surface-variant)]">
                Email Address
              </label>
              <input
                type="email"
                placeholder="practitioner@clinic.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full rounded-lg px-4 py-[10px] border border-[var(--color-outline-variant)] bg-transparent text-[var(--color-on-surface)] placeholder-[var(--color-outline)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
              />
            </div>

            {!isLogin && (
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-[var(--color-on-surface-variant)]">
                  Degree
                </label>
                <input
                  type="text"
                  placeholder="MBBS, MD..."
                  value={formData.degree}
                  onChange={(e) =>
                    setFormData({ ...formData, degree: e.target.value })
                  }
                  className="w-full rounded-lg px-4 py-[10px] border border-[var(--color-outline-variant)] bg-transparent text-[var(--color-on-surface)] placeholder-[var(--color-outline)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-[var(--color-on-surface-variant)]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full rounded-lg px-4 py-[10px] border border-[var(--color-outline-variant)] bg-transparent text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-outline)] hover:text-[var(--color-on-surface)] transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-[var(--color-error-container)] border border-[color:var(--color-error)]/20 text-[var(--color-on-error-container)] rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[var(--color-primary)] hover:opacity-90 text-[var(--color-on-primary)] font-semibold py-3 rounded-lg transition-all duration-200 shadow-sm mt-2 flex justify-center items-center group"
            >
              {isLogin ? "Sign In" : "Create Account"}
              <span className="material-symbols-outlined ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                arrow_forward
              </span>
            </button>
          </form>

          {/* Footer toggle */}
          <div className="mt-6 text-center border-t border-[var(--color-surface-container-highest)] pt-4">
            <p className="text-sm text-[var(--color-on-surface-variant)]">
              {isLogin ? "New to the clinic? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="font-semibold text-[var(--color-secondary)] hover:opacity-75 transition-colors ml-1"
              >
                {isLogin ? "Register Clinic" : "Sign In"}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Page;