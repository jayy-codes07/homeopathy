import React from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AddPatient from "./pages/AddPatient";
import Dashboard from "./pages/Dashboard";
import Patient from "./pages/PatientDetail";
import Followup from "./pages/AddFollowup";
import Profile from "./pages/Profile";


import { Routes, Route, Navigate } from "react-router-dom";

const App = () => {
  return (
    <div className="flex items-center justify-center h-100">
      <Routes>
        <Route path="/" element={<Navigate to="/login" />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/register" element={<Register />}></Route>
        <Route path="/add-patient" element={<AddPatient />}></Route>
        <Route path="/dashboard" element={<Dashboard />}></Route>
        <Route path="/patient/:id" element={<Patient />}></Route>
        <Route path="/patient/:id/add-followup" element={<Followup />}></Route>
        <Route path="/profile" element={<Profile />}></Route>
      </Routes>
    </div>
  );
};

export default App;
