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
   <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      {/* Main Card */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row bg-zinc-800 rounded-3xl shadow-2xl overflow-hidden border border-zinc-700/50">
        
        {/* Left Side - Branding (Hidden on Mobile) */}
        <div className="hidden md:flex md:w-5/12 flex-col justify-center bg-zinc-900 p-12 relative border-r border-zinc-700/50">
          {/* Subtle background glow effect to match your blue accents */}
          <div className="absolute top-0 left-0 w-full h-full bg-blue-900/10 pointer-events-none"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-white mb-4">
              Doctor Portal
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed mb-10">
              Manage patients, prescriptions, and follow-ups from one sleek, centralized dashboard.
            </p>
            
            {/* Optional: You can keep your illustration here, or use an abstract medical icon pattern */}
           
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-7/12 p-8 md:p-14 flex items-center justify-center">
          <div className="w-full max-w-md">
            
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                {isLogin ? "Sign in to access your dashboard" : "Register your doctor account to get started"}
              </p>
            </div>

            <form onSubmit={handelSubmit} className="space-y-6">
              
              {!isLogin && (
                <div>
                  <label className="block text-xs uppercase tracking-wider text-blue-400 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Dr. John Doe"
                    value={formData.fullname}
                    onChange={(e) =>
                      setFormData({ ...formData, fullname: e.target.value })
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 placeholder-zinc-600 transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs uppercase tracking-wider text-blue-400 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="doctor@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 placeholder-zinc-600 transition-colors"
                />
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-xs uppercase tracking-wider text-blue-400 mb-2">
                    Degree
                  </label>
                  <input
                    type="text"
                    placeholder="MBBS, MD..."
                    value={formData.degree}
                    onChange={(e) =>
                      setFormData({ ...formData, degree: e.target.value })
                    }
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 placeholder-zinc-600 transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs uppercase tracking-wider text-blue-400 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 placeholder-zinc-600 transition-colors"
                />
              </div>

              {error && (
                <div className="bg-red-900/30 border border-red-700 text-red-400 rounded-xl p-3 text-sm">
                  {error}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 transition duration-200 text-white shadow-lg shadow-blue-900/20"
                >
                  {isLogin ? "Login" : "Register"}
                </button>
              </div>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-zinc-400 hover:text-blue-400 transition-colors duration-200"
                >
                  {isLogin
                    ? "Don't have an account? Register here"
                    : "Already have an account? Login here"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
