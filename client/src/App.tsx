import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { QuestionerAuthProvider } from './contexts/QuestionerAuthContext'
import AppRoutes from './routes'

function App() {
  return (
    <Router>
      <QuestionerAuthProvider>
        <Toaster position="top-right" />
        <AppRoutes />
      </QuestionerAuthProvider>
    </Router>
  )
}

export default App