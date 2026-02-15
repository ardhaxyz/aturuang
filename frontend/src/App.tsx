import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BookPage } from './pages/BookPage';
import { RoomsPage } from './pages/RoomsPage';
import { CalendarPage } from './pages/CalendarPage';

import { OrganizationsPage } from './pages/OrganizationsPage';
import { RoomManagementPage } from './pages/RoomManagementPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

function AppRoutes() {
  const { user, isSuperadmin } = useAuth();

  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={
        user ? <Navigate to="/" replace /> : <LoginPage />
      } />

      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <DashboardPage />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/book" element={
        <ProtectedRoute>
          <Layout>
            <BookPage />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/rooms" element={
        <ProtectedRoute>
          <Layout>
            <RoomsPage />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/calendar" element={
        <ProtectedRoute>
          <Layout>
            <CalendarPage />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Admin Dashboard - Main control page */}
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin>
          <Layout>
            <AdminDashboardPage />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Admin - Organizations (Superadmin only) */}
      <Route path="/admin/organizations" element={
        <ProtectedRoute requireAdmin>
          <Layout>
            {isSuperadmin ? <OrganizationsPage /> : <Navigate to="/admin/rooms" replace />}
          </Layout>
        </ProtectedRoute>
      } />

      {/* Admin - Room Management */}
      <Route path="/admin/rooms" element={
        <ProtectedRoute requireAdmin>
          <Layout>
            <RoomManagementPage />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Admin - User Management */}
      <Route path="/admin/users" element={
        <ProtectedRoute requireAdmin>
          <Layout>
            <UserManagementPage />
          </Layout>
        </ProtectedRoute>
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
