import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import BottomNav from './components/layout/BottomNav';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import FolderDetailsPage from './pages/FolderDetailsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0F0D0B] text-[#FAF7F2] font-cairo">
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
