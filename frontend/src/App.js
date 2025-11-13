import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import WorkOrders from "./pages/WorkOrders";
import Assets from "./pages/Assets";
import PreventiveMaintenance from "./pages/PreventiveMaintenance";
import Inventory from "./pages/Inventory";
import ServiceRequests from "./pages/ServiceRequests";
import Locations from "./pages/Locations";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-50">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 ml-64">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/work-orders" element={<WorkOrders />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/preventive-maintenance" element={<PreventiveMaintenance />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/requests" element={<ServiceRequests />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
