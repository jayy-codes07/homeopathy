"use client";
import Loading from "@/components/Loading";
import api from "@/utils/api";
import React, { FormEvent, useState } from "react";

interface FormData {
  fullname: string;
  email: string;
  password: string;
  degree: string;
}

const Page = () => {
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
    try {
      if (isLogin) {
        const response = await api.post("/doctor/login", formData);
        const token = response.data.data.???  // what goes here?
localStorage.setItem('doctorJWT', token)
      } else {
        const response = await api.post("/doctor/register", formData);
      }
    } catch (error: any) {
      throw new Error("error while sending response to backend", error);
    }
    setIsLoading(false);
  };

  return isLoading ? (
    <Loading />
  ) : (
    <div className="flex items-center justify-center flex-col bg-[url('/10554240.jpg')]">
      <div className="w-[40%] flex justify-center flex-col text-center border-1 border-red-400 p-5">
        <h1 className="text-3xl font-bold ">
          {isLogin ? "Login" : "Register"}
        </h1>{" "}
        <h2 className="text-xl">
          {isLogin ? "Welcome Back! Please Enter you details" : ""}
        </h2>
        <form onSubmit={handelSubmit}>
          {!isLogin && (
            <div className="flex flex-col p-2 w-[50%] self-center ">
              <label htmlFor="Username">Username</label>
              <input
                type="text"
                className="border-blue-600 border-1 rounded p-2 pl-5"
                placeholder="Enter Your Username"
                value={formData.fullname}
                onChange={(e) => {
                  setFormData({ ...formData, fullname: e.target.value });
                }}
              />
            </div>
          )}

          <div className="flex flex-col p-2 w-[50%] self-center ">
            <label htmlFor="Email">Email</label>
            <input
              type="email"
              className="border-blue-600 border-1 rounded p-2 pl-5"
              placeholder="Enter Your Registerd Email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
              }}
            />
          </div>
          {!isLogin && (
            <div className="flex flex-col p-2 w-[50%] self-center ">
              <label htmlFor="degree">degree</label>
              <input
                type="text"
                className="border-blue-600 border-1 rounded p-2 pl-5"
                placeholder="Enter Your degree"
                value={formData.degree}
                onChange={(e) => {
                  setFormData({ ...formData, degree: e.target.value });
                }}
              />
            </div>
          )}
          <div>
            <label htmlFor="Password">Password</label>
            <input
              type="password"
              placeholder="Enter Your Password"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
              }}
            />
          </div>
          <button type="submit">Login</button>
          <button
            onClick={() => {
              setIsLogin((login) => !login);
            }}
          >
            {isLogin ? "Dont have Account?" : "Already have account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Page;
