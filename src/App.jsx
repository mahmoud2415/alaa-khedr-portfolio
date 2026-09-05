import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import BottomNav from './components/layout/BottomNav';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import FolderDetailsPage from './pages/FolderDetailsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import AdminPage from './pages/AdminPage';

// Automatically scrolls the window to the very top whenever the route changes
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Instant reset to prevent glitching
    });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0F0D0B] text-[#FAF7F2] font-cairo">
      <ScrollToTop />
      <Navbar />
      
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/folder/:folderId" element={<FolderDetailsPage />} />
          <Route path="/project/:id" element={<ProjectDetailsPage />} />
          <Route path="/p/:id" element={<ProjectDetailsPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
}

