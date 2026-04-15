import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import IrrigationControl from './pages/IrrigationControl';
import CropDatabase from './pages/CropDatabase';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import CropManagement from './pages/CropManagement';
import SystemMonitoring from './pages/SystemMonitoring';
import AdminAnalytics from './pages/AdminAnalytics';
import AlertManagement from './pages/AlertManagement';
import LandingPage from './pages/LandingPage';
import './styles/index.css';

// Create custom theme with glassmorphism and vibrant colors
const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#00d4ff',
            light: '#5dfdff',
            dark: '#00a3cc'
        },
        secondary: {
            main: '#ff6b9d',
            light: '#ff9ec7',
            dark: '#c73b6e'
        },
        background: {
            default: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1428 100%)',
            paper: 'rgba(255, 255, 255, 0.08)'
        },
        success: {
            main: '#00ff88',
            light: '#5dffb3',
            dark: '#00cc6e'
        },
        warning: {
            main: '#ffb800',
            light: '#ffd24d',
            dark: '#cc9300'
        },
        error: {
            main: '#ff3366',
            light: '#ff6690',
            dark: '#cc2952'
        },
        info: {
            main: '#667eea',
            light: '#8b9ef7',
            dark: '#4c63d2'
        }
    },
    typography: {
        fontFamily: '"Inter", "Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        h1: {
            fontWeight: 800,
            letterSpacing: '-0.02em'
        },
        h2: {
            fontWeight: 700,
            letterSpacing: '-0.01em'
        },
        h3: {
            fontWeight: 700
        },
        h4: {
            fontWeight: 600
        },
        button: {
            fontWeight: 600,
            letterSpacing: '0.02em'
        }
    },
    shape: {
        borderRadius: 16
    },
    shadows: [
        'none',
        '0 2px 8px rgba(0, 212, 255, 0.15)',
        '0 4px 16px rgba(0, 212, 255, 0.2)',
        '0 8px 24px rgba(0, 212, 255, 0.25)',
        '0 12px 32px rgba(0, 212, 255, 0.3)',
        ...Array(20).fill('0 16px 48px rgba(0, 212, 255, 0.35)')
    ],
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1428 100%)',
                    backgroundAttachment: 'fixed',
                    '&::before': {
                        content: '""',
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'radial-gradient(circle at 20% 50%, rgba(0, 212, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 107, 157, 0.1) 0%, transparent 50%)',
                        pointerEvents: 'none',
                        zIndex: 0
                    }
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    boxShadow: '0 8px 32px 0 rgba(0, 212, 255, 0.15)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 48px 0 rgba(0, 212, 255, 0.25)',
                        border: '1px solid rgba(0, 212, 255, 0.3)'
                    }
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 12,
                    padding: '10px 24px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(0, 212, 255, 0.3)'
                    }
                },
                contained: {
                    background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
                    boxShadow: '0 4px 16px rgba(0, 212, 255, 0.3)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #00a3cc 0%, #4c63d2 100%)',
                        boxShadow: '0 8px 24px rgba(0, 212, 255, 0.4)'
                    }
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    backdropFilter: 'blur(10px)',
                    fontWeight: 600
                }
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            background: 'rgba(255, 255, 255, 0.08)'
                        },
                        '&.Mui-focused': {
                            background: 'rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 0 0 2px rgba(0, 212, 255, 0.2)'
                        }
                    }
                }
            }
        }
    }
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return user?.role === 'admin' ? children : <Navigate to="/dashboard" />;
};

function AppRoutes() {
    const { isAuthenticated, user } = useAuth();

    return (
        <Routes>
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
            />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/irrigation"
                element={
                    <ProtectedRoute>
                        <IrrigationControl />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/crops"
                element={
                    <ProtectedRoute>
                        <CropDatabase />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/analytics"
                element={
                    <ProtectedRoute>
                        <Analytics />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/settings"
                element={
                    <ProtectedRoute>
                        <Settings />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/reports"
                element={
                    <ProtectedRoute>
                        <Reports />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin"
                element={
                    <AdminRoute>
                        <AdminDashboard />
                    </AdminRoute>
                }
            />
            <Route
                path="/admin/users"
                element={
                    <AdminRoute>
                        <UserManagement />
                    </AdminRoute>
                }
            />
            <Route
                path="/admin/crops"
                element={
                    <AdminRoute>
                        <CropManagement />
                    </AdminRoute>
                }
            />
            <Route
                path="/admin/monitoring"
                element={
                    <AdminRoute>
                        <SystemMonitoring />
                    </AdminRoute>
                }
            />
            <Route
                path="/admin/analytics"
                element={
                    <AdminRoute>
                        <AdminAnalytics />
                    </AdminRoute>
                }
            />
            <Route
                path="/admin/alerts"
                element={
                    <AdminRoute>
                        <AlertManagement />
                    </AdminRoute>
                }
            />
            <Route
                path="/"
                element={
                    isAuthenticated
                        ? <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} />
                        : <LandingPage />
                }
            />
        </Routes>
    );
}

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <NotificationProvider>
                    <Router>
                        <AppRoutes />
                    </Router>
                </NotificationProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
