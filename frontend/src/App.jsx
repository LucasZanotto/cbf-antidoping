// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ToastProvider } from './components/toast/ToastProvider';

// Páginas já existentes
import Login from './pages/Login';
import AthletesList from './pages/AthletesList';
import AthleteCreate from './pages/AthleteCreate';
import TestOrdersList from './pages/TestOrdersList';
import TestOrderCreate from './pages/TestOrderCreate';

// Novas páginas
import SamplesList from './pages/SamplesList';
import SampleCreate from './pages/SampleCreate';
import TestResultsList from './pages/TestResultsList';
import LabAssignmentsList from './pages/LabAssignmentsList';
import LabAssignmentCreate from './pages/LabAssignmentCreate';
import ResultsList from './pages/ResultsList';
import ResultCreate from './pages/ResultCreate';
import ResultView from './pages/ResultView';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* root protegido redireciona para atletas */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/athletes" />
              </ProtectedRoute>
            }
          />

          {/* auth */}
          <Route path="/login" element={<Login />} />

          {/* atletas */}
          <Route
            path="/athletes"
            element={
              <ProtectedRoute>
                <AthletesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/athletes/new"
            element={
              <ProtectedRoute>
                <AthleteCreate />
              </ProtectedRoute>
            }
          />

          {/* ordens */}
          <Route
            path="/test-orders"
            element={
              <ProtectedRoute>
                <TestOrdersList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test-orders/new"
            element={
              <ProtectedRoute>
                <TestOrderCreate />
              </ProtectedRoute>
            }
          />

          {/* amostras */}
          <Route
            path="/samples"
            element={
              <ProtectedRoute>
                <SamplesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/samples/new"
            element={
              <ProtectedRoute>
                <SampleCreate />
              </ProtectedRoute>
            }
          />

          {/* resultados */}
          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <ResultsList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/results/new"
            element={
              <ProtectedRoute>
                <ResultCreate />
              </ProtectedRoute>
            }
          />

          <Route
            path="/results/:id"
            element={
              <ProtectedRoute>
                <ResultView />
              </ProtectedRoute>
            }
          />

          {/* atribuições de laboratório */}
          <Route
            path="/labs/assignments"
            element={
              <ProtectedRoute>
                <LabAssignmentsList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/labs/assignments/new"
            element={
              <ProtectedRoute>
                <LabAssignmentCreate />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
