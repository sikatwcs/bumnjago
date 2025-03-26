import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { AdminAuthProvider } from '@/contexts/AdminAuthContext'
import { QuestionerAuthProvider } from '@/contexts/QuestionerAuthContext'
import { Toaster } from '@/components/ui/toaster'
import QuestionerDashboard from './pages/QuestionerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'
import QuestionerLogin from './pages/QuestionerLogin'
import Dashboard from '@/pages/Dashboard'
import ExamList from './pages/ExamList'
import ExamPage from './pages/ExamPage'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Auth from '@/pages/Auth'
import FreeTryoutForm from './pages/FreeTryoutForm'
import Profile from '@/pages/Profile'
import ProtectedRoute from '@/components/ProtectedRoute'
import ProtectedRouteAdmin from '@/components/ProtectedRouteAdmin'
import ProtectedRouteQuestioner from '@/components/ProtectedRouteQuestioner'

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <QuestionerAuthProvider>
          <Router>
            <Toaster />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/questioner/login" element={<QuestionerLogin />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/admin/dashboard" element={
                <ProtectedRouteAdmin>
                  <AdminDashboard />
                </ProtectedRouteAdmin>
              } />
              <Route path="/questioner/dashboard" element={
                <ProtectedRouteQuestioner>
                  <QuestionerDashboard />
                </ProtectedRouteQuestioner>
              } />
              <Route path="/exam/list" element={<ExamList />} />
              <Route path="/exam/:id" element={<ExamPage />} />
              <Route path="/free-tryout" element={<FreeTryoutForm />} />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </QuestionerAuthProvider>
      </AdminAuthProvider>
    </AuthProvider>
  )
}

export default App