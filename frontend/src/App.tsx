import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SetupRoute } from './components/SetupRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BookPage } from './pages/BookPage';
import { RoomsPage } from './pages/RoomsPage';
import { CalendarPage } from './pages/CalendarPage';
import { SetupPage } from './pages/SetupPage';

import { OrganizationsPage } from './pages/OrganizationsPage';
import { RoomManagementPage } from './pages/RoomManagementPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

function AppRoutes() {
  const { user, isSuperadmin } = useAuth();

  return (
    <Routes>
      {/* Setup route - always accessible when setup is needed */}
      <Route path="/setup" element={<SetupPage />} />

      {/* Public route */}
      <Route path="/login" element={
        user ? <Navigate to="/" replace /> : <LoginPage />
      } />

      {/* Protected routes - require setup to be completed */}
      <Route path="/" element={
        <SetupRoute>
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        </SetupRoute>
      } />

      <Route path="/book" element={
        <SetupRoute>
          <ProtectedRoute>
            <Layout>
              <BookPage />
            </Layout>
          </ProtectedRoute>
        </SetupRoute>
      } />

      <Route path="/rooms" element={
        <SetupRoute>
          <ProtectedRoute>
            <Layout>
              <RoomsPage />
            </Layout>
          </ProtectedRoute>
        </SetupRoute>
      } />

      <Route path="/calendar" element={
        <SetupRoute>
          <ProtectedRoute>
            <Layout>
              <CalendarPage />
            </Layout>
          </ProtectedRoute>
        </SetupRoute>
      } />

      {/* Admin Dashboard - Main control page */}
      <Route path="/admin" element={
        <SetupRoute>
          <ProtectedRoute requireAdmin>
            <Layout>
              <AdminDashboardPage />
            </Layout>
          </ProtectedRoute>
        </SetupRoute>
      } />

      {/* Admin - Organizations (Superadmin only) */}
      <Route path="/admin/organizations" element={
        <SetupRoute>
          <ProtectedRoute requireAdmin>
            <Layout>
              {isSuperadmin ? <OrganizationsPage /> : <Navigate to="/admin/rooms" replace />}
            </Layout>
          </ProtectedRoute>
        </SetupRoute>
      } />

      {/* Admin - Room Management */}
      <Route path="/admin/rooms" element={
        <SetupRoute>
          <ProtectedRoute requireAdmin>
            <Layout>
              <RoomManagementPage />
            </Layout>
          </ProtectedRoute>
        </SetupRoute>
      } />

      {/* Admin - User Management */}
      <Route path="/admin/users" element={
        <SetupRoute>
          <ProtectedRoute requireAdmin>
            <Layout>
              <UserManagementPage />
            </Layout>
          </ProtectedRoute>
        </SetupRoute>
      } />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
