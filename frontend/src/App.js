import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import TallySheet from './pages/TallySheet';
import Auctions from './pages/Auctions';
import Expenses from './pages/Expenses';
import Members from './pages/Members';
import './App.css';

function Navigation() {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            <i className="fas fa-hand-holding-usd text-3xl"></i>
            <h1 className="text-2xl font-bold">
              KA <span className="text-cyan-300">Associates</span>
            </h1>
          </div>

          <nav className="flex gap-6">
            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/') ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <i className="fas fa-home"></i> Dashboard
            </Link>
            <Link
              to="/tally"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/tally') ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <i className="fas fa-file-invoice-dollar"></i> Tally Sheet
            </Link>
            <Link
              to="/auctions"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/auctions') ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <i className="fas fa-gavel"></i> Auction List
            </Link>
            <Link
              to="/expenses"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/expenses') ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <i className="fas fa-wallet"></i> Expenses
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer">
              <i className="fas fa-bell text-xl"></i>
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-white text-blue-600 flex items-center justify-center font-semibold">
              AJ
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/members/:groupId" element={<Members />} />
            <Route path="/tally" element={<TallySheet />} />
            <Route path="/auctions" element={<Auctions />} />
            <Route path="/expenses" element={<Expenses />} />
          </Routes>
        </main>

        <footer className="bg-gray-800 text-white py-8 mt-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <p>© 2023 KrushnaArpan Associates. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-cyan-300 transition-colors">
                  <i className="fas fa-shield-alt"></i> Privacy Policy
                </a>
                <a href="#" className="hover:text-cyan-300 transition-colors">
                  <i className="fas fa-file-contract"></i> Terms of Service
                </a>
                <a href="#" className="hover:text-cyan-300 transition-colors">
                  <i className="fas fa-headset"></i> Support
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
