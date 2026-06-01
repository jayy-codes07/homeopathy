"use client";
import Loading from "@/components/Loading";
import api from "@/utils/api";
import { useRouter } from "next/navigation";
import React, { FormEvent, useState } from "react";

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

  const handelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const saveTokenAndRedirect = async () => {
      const response = await api.post("/doctor/login", formData);
      const token = response.data.data.Accesstoken;
      localStorage.setItem("doctorJWT", token);
      router.push("/dashboard");
    };
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

  return isLoading ? (
    <Loading />
  ) : (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-100 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl grid md:grid-cols-2">
        {/* Left Side */}
        <div className="hidden md:flex flex-col justify-center bg-gradient-to-br from-blue-600 to-cyan-500 p-12 text-white">
          <h1 className="text-5xl font-bold mb-4">Doctor Portal</h1>

          <p className="text-lg text-blue-100 leading-relaxed">
            Manage patients, prescriptions and follow-ups from one centralized
            dashboard.
          </p>

          <img
            src="/doctor-illustration.svg"
            alt="Doctor"
            className="mt-10 max-w-sm"
          />
        </div>

        {/* Right Side */}
        <div className="flex items-center justify-center p-8 md:p-12">
          <div className="w-full max-w-md">
            <h2 className="text-3xl font-bold text-slate-900">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>

            <p className="mt-2 text-slate-500">
              {isLogin ? "Sign in to continue" : "Register your doctor account"}
            </p>

            <form onSubmit={handelSubmit} className="mt-8 space-y-5">
              {!isLogin && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    placeholder="John Doe"
                    value={formData.fullname}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fullname: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="doctor@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {!isLogin && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Degree
                  </label>

                  <input
                    type="text"
                    placeholder="MBBS, MD..."
                    value={formData.degree}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        degree: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>

                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                {isLogin ? "Login" : "Register"}
              </button>

              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="w-full text-sm text-blue-600 hover:text-blue-800"
              >
                {isLogin
                  ? "Don't have an account? Register"
                  : "Already have an account? Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
