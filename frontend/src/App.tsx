import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store';

// Layouts
import AuthLayout      from './components/layout/AuthLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import Spinner         from './components/common/Spinner';

// Auth Pages (eager — needed immediately)
import Login    from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPin from './pages/Auth/ForgotPin';

// Lazy-loaded pages (better performance)
const Home           = lazy(() => import('./pages/Dashboard/Home'));
const Dashboard      = lazy(() => import('./pages/Dashboard/Dashboard'));
const SendMoney      = lazy(() => import('./pages/Transactions/SendMoney'));
const Deposit        = lazy(() => import('./pages/Transactions/Deposit'));
const Withdraw       = lazy(() => import('./pages/Transactions/Withdraw'));
const History        = lazy(() => import('./pages/Transactions/History'));
const Details        = lazy(() => import('./pages/Transactions/Details'));
const Profile        = lazy(() => import('./pages/Profile/Profile'));
const EditProfile    = lazy(() => import('./pages/Profile/EditProfile'));
const ChangePin      = lazy(() => import('./pages/Profile/ChangePin'));
const Settings       = lazy(() => import('./pages/Profile/Settings'));
const Wallet         = lazy(() => import('./pages/Profile/Wallet'));
const Notifications  = lazy(() => import('./pages/Notifications/Notifications'));
const AgentList      = lazy(() => import('./pages/Agents/AgentList'));
const AgentDetails   = lazy(() => import('./pages/Agents/AgentDetails'));

// ─────────────────────────────────────────
// Route Guards
// ─────────────────────────────────────────

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

// ─────────────────────────────────────────
// Page Loader
// ─────────────────────────────────────────

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Spinner size="lg" text="Loading page…" />
  </div>
);

// ─────────────────────────────────────────
// Not Found
// ─────────────────────────────────────────

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
    <h1 className="text-8xl font-black text-gray-200 mb-4">404</h1>
    <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
    <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
    <a href="/dashboard" className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
      Back to Dashboard
    </a>
  </div>
);

// ─────────────────────────────────────────
// App
// ─────────────────────────────────────────

const App = () => {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Public Home ─────────────────────── */}
          <Route path="/" element={<Home />} />

          {/* ── Auth Routes ─────────────────────── */}
          <Route element={<PublicRoute><AuthLayout /></PublicRoute>}>
            <Route path="/login"      element={<Login />} />
            <Route path="/register"   element={<Register />} />
            <Route path="/forgot-pin" element={<ForgotPin />} />
          </Route>

          {/* ── Protected Dashboard Routes ────────── */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route path="/dashboard"    element={<Dashboard />} />

            {/* Transactions */}
            <Route path="/send-money"           element={<SendMoney />} />
            <Route path="/deposit"              element={<Deposit />} />
            <Route path="/withdraw"             element={<Withdraw />} />
            <Route path="/transactions"         element={<History />} />
            <Route path="/transactions/:id"     element={<Details />} />

            {/* Profile */}
            <Route path="/profile"       element={<Profile />} />
            <Route path="/profile/edit"  element={<EditProfile />} />
            <Route path="/change-pin"    element={<ChangePin />} />
            <Route path="/settings"      element={<Settings />} />
            <Route path="/wallet"        element={<Wallet />} />

            {/* Notifications */}
            <Route path="/notifications" element={<Notifications />} />

            {/* Agents */}
            <Route path="/agents"        element={<AgentList />} />
            <Route path="/agents/:id"    element={<AgentDetails />} />
          </Route>

          {/* ── 404 ──────────────────────────────── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      {/* Global Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#374151',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#16a34a', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#dc2626', secondary: '#fff' },
          },
        }}
      />
    </Router>
  );
};

export default App;