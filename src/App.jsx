import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import ResumeBuilder from './pages/ResumeBuilder';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route
            path="/resume"
            element={
              <ProtectedRoute>
                <ResumeBuilder />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/resume" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
