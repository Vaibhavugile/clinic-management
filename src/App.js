import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import SocialSidebar from "./components/SocialSidebar";
import AdminDashboard from "./admin/AdminDashboard";

import "./App.css";

function PlaceholderPage({ title }) {
  return (
    <main className="placeholder-page container">
      <span className="eyebrow">ANAND DENTAL CLINIC &amp; IMPLANT CENTER</span>
      <h1>{title}</h1>
      <p>This page is currently being developed. Please check back soon.</p>
    </main>
  );
}

function AppRoutes() {
  const { pathname } = useLocation();
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <>
      <Routes>
        {/* Public website */}
        <Route path="/" element={<Home />} />
        <Route path="/appointment" element={<Home />} />
        <Route path="/about" element={<PlaceholderPage title="About Our Clinic" />} />
        <Route path="/treatments" element={<PlaceholderPage title="Our Treatments" />} />
        <Route path="/treatments/:slug" element={<PlaceholderPage title="Treatment Details" />} />
        <Route path="/gallery" element={<PlaceholderPage title="Smile Gallery" />} />
        <Route path="/blog" element={<PlaceholderPage title="Dental Journal" />} />
        <Route path="/contact" element={<PlaceholderPage title="Contact Our Clinic" />} />
        <Route path="/privacy" element={<PlaceholderPage title="Privacy Policy" />} />
        <Route path="/terms" element={<PlaceholderPage title="Terms of Use" />} />

        {/* Admin dashboard (has its own layout and pages) */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Keep the catch-all last */}
        <Route path="*" element={<PlaceholderPage title="Page Not Found" />} />
      </Routes>

      {/* Outside Routes so it shows on every public page, but not on admin pages */}
      {!isAdminPage && <SocialSidebar />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;