import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ShiftPlannerPage } from '@/pages/ShiftPlannerPage';
import { ShiftAnalysisPage } from '@/pages/ShiftAnalysisPage';
import { SeasonalPlaybookPage } from '@/pages/SeasonalPlaybookPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { CompliancePage } from '@/pages/CompliancePage';
import { CertificationDashboardPage } from '@/pages/CertificationDashboardPage';
import { ExceptionRequestsPage } from '@/pages/ExceptionRequestsPage';
import { PtoPage } from '@/pages/PtoPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { BusinessRulesPage } from '@/pages/BusinessRulesPage';
import { BillingPage } from '@/pages/BillingPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes with layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route
              path="planner"
              element={
                <ProtectedRoute roles={['admin', 'gm', 'store_manager']}>
                  <ShiftPlannerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="analysis"
              element={
                <ProtectedRoute roles={['admin', 'gm', 'store_manager']}>
                  <ShiftAnalysisPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="playbook"
              element={
                <ProtectedRoute roles={['admin', 'gm']}>
                  <SeasonalPlaybookPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute roles={['admin', 'gm']}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="compliance"
              element={
                <ProtectedRoute roles={['admin', 'gm']}>
                  <CompliancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="certifications"
              element={
                <ProtectedRoute roles={['admin', 'gm', 'store_manager']}>
                  <CertificationDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="exceptions"
              element={
                <ProtectedRoute roles={['admin', 'gm', 'store_manager']}>
                  <ExceptionRequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="pto"
              element={
                <ProtectedRoute>
                  <PtoPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="onboarding"
              element={
                <ProtectedRoute roles={['admin', 'gm']}>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="business-rules"
              element={
                <ProtectedRoute roles={['admin', 'gm']}>
                  <BusinessRulesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="billing"
              element={
                <ProtectedRoute roles={['admin']}>
                  <BillingPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
