import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeManager from './pages/ResumeManager';
import SetupInterview from './pages/SetupInterview';
import InterviewSession from './pages/InterviewSession';
import InterviewReport from './pages/InterviewReport';
import About from './pages/About';

function App() {
  return (
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-black text-gray-900 dark:text-gray-100 transition-colors duration-200">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/resumes"
                  element={
                    <ProtectedRoute>
                      <ResumeManager />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/setup"
                  element={
                    <ProtectedRoute>
                      <SetupInterview />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/session/:id"
                  element={
                    <ProtectedRoute>
                      <InterviewSession />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/report/:id"
                  element={
                    <ProtectedRoute>
                      <InterviewReport />
                    </ProtectedRoute>
                  }
                />
                <Route 
                path="/about"
                element={
                  <About />
                }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
  );
}

export default App;
