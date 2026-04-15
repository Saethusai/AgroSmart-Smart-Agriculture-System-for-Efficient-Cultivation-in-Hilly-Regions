import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Tab,
    Tabs,
    CircularProgress,
    InputAdornment,
    Divider
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Agriculture,
    Email,
    Lock,
    Person,
    Phone,
    Landscape,
    Grass
} from '@mui/icons-material';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import axios from 'axios';

export default function Login() {
    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, register } = useAuth();
    const { showSuccess, showError } = useNotification();

    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });

    const [registerData, setRegisterData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        farmName: '',
        cropType: ''
    });

    const handleTabChange = (event, newValue) => {
        setTab(newValue);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await login(loginData.email, loginData.password);

        if (result.success) {
            showSuccess('Welcome back to AgroSmart!');
            navigate('/dashboard');
        } else {
            showError(result.error || 'Login failed. Please check your credentials.');
        }

        setLoading(false);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        const userData = {
            name: registerData.name,
            email: registerData.email,
            password: registerData.password,
            phone: registerData.phone,
            farmDetails: {
                farmName: registerData.farmName,
                cropType: registerData.cropType
            }
        };

        const result = await register(userData);

        if (result.success) {
            showSuccess('Registration successful! Welcome to the community.');
            navigate('/dashboard');
        } else {
            showError(result.error || 'Registration failed. Please try again.');
        }

        setLoading(false);
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setLoading(true);

            // Send Google credential to backend
            const response = await axios.post('http://localhost:5000/api/auth/google', {
                credential: credentialResponse.credential
            });

            const { token, user } = response.data;

            // Store token and user data
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            showSuccess('Welcome to AgroSmart!');
            navigate('/dashboard');
            window.location.reload(); // Reload to update auth context

        } catch (error) {
            console.error('Google login error:', error);
            showError(error.response?.data?.message || 'Google login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        showError('Google login was cancelled or failed');
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                py: 4,
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")', // Beautiful Hill Farm
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'brightness(0.3) blur(2px)',
                    zIndex: -1
                }
            }}
        >
            <Container maxWidth="sm" component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <Box sx={{ textAlign: 'center', mb: 4, animation: 'fadeInDown 0.8s ease-out' }}>
                    <Box
                        sx={{
                            display: 'inline-flex',
                            p: 2,
                            borderRadius: '50%',
                            background: 'rgba(0, 212, 255, 0.2)',
                            backdropFilter: 'blur(10px)',
                            mb: 2,
                            border: '2px solid rgba(0, 212, 255, 0.3)',
                            animation: 'float 3s ease-in-out infinite'
                        }}
                    >
                        <Agriculture sx={{ fontSize: 40, color: '#00d4ff' }} />
                    </Box>
                    <Typography
                        variant="h3"
                        sx={{
                            color: 'white',
                            fontWeight: 800,
                            mb: 1,
                            textShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
                            letterSpacing: '-0.02em'
                        }}
                    >
                        AgroSmart
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: 'rgba(255,255,255,0.8)',
                            fontWeight: 500
                        }}
                    >
                        Smart Irrigation for Hilly Regions
                    </Typography>
                </Box>

                <Card
                    component={motion.div}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="glass-card"
                    sx={{ border: '1px solid rgba(255,255,255,0.1)' }}
                >
                    <CardContent sx={{ p: 4 }}>
                        <Tabs
                            value={tab}
                            onChange={handleTabChange}
                            centered
                            sx={{
                                mb: 4,
                                '& .MuiTab-root': { color: 'rgba(255,255,255,0.6)', fontWeight: 600 },
                                '& .Mui-selected': { color: '#00d4ff !important' },
                                '& .MuiTabs-indicator': { backgroundColor: '#00d4ff' }
                            }}
                        >
                            <Tab label="Login" />
                            <Tab label="Register" />
                        </Tabs>
                        <AnimatePresence mode="wait">
                            {tab === 0 ? (
                                <motion.div
                                    key="login"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <form onSubmit={handleLogin}>
                                        <TextField
                                            fullWidth
                                            label="Email Address"
                                            type="email"
                                            variant="outlined"
                                            value={loginData.email}
                                            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                            required
                                            sx={{ mb: 2 }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Email sx={{ color: 'rgba(255,255,255,0.5)' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Password"
                                            type="password"
                                            variant="outlined"
                                            value={loginData.password}
                                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                            required
                                            sx={{ mb: 3 }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Lock sx={{ color: 'rgba(255,255,255,0.5)' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <Button
                                            fullWidth
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            disabled={loading}
                                            sx={{
                                                py: 1.8,
                                                fontSize: '1.1rem',
                                                borderRadius: '12px',
                                                background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
                                                boxShadow: '0 8px 16px rgba(0, 212, 255, 0.3)'
                                            }}
                                        >
                                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                                        </Button>

                                        <Divider sx={{ my: 3, color: 'rgba(255,255,255,0.3)' }}>OR</Divider>

                                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                            <GoogleLogin
                                                onSuccess={handleGoogleSuccess}
                                                onError={handleGoogleError}
                                                theme="filled_black"
                                                size="large"
                                                text="signin_with"
                                                width="100%"
                                            />
                                        </Box>
                                    </form>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="register"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <form onSubmit={handleRegister}>
                                        <TextField
                                            fullWidth
                                            label="Full Name"
                                            variant="outlined"
                                            value={registerData.name}
                                            onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                                            required
                                            sx={{ mb: 2 }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Person sx={{ color: 'rgba(255,255,255,0.5)' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Email Address"
                                            type="email"
                                            variant="outlined"
                                            value={registerData.email}
                                            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                            required
                                            sx={{ mb: 2 }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Email sx={{ color: 'rgba(255,255,255,0.5)' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Phone Number"
                                            variant="outlined"
                                            value={registerData.phone}
                                            onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                                            required
                                            sx={{ mb: 2 }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Phone sx={{ color: 'rgba(255,255,255,0.5)' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Farm Name"
                                            variant="outlined"
                                            value={registerData.farmName}
                                            onChange={(e) => setRegisterData({ ...registerData, farmName: e.target.value })}
                                            sx={{ mb: 2 }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Landscape sx={{ color: 'rgba(255,255,255,0.5)' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Main Crop Type"
                                            variant="outlined"
                                            value={registerData.cropType}
                                            onChange={(e) => setRegisterData({ ...registerData, cropType: e.target.value })}
                                            sx={{ mb: 2 }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Grass sx={{ color: 'rgba(255,255,255,0.5)' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Password"
                                            type="password"
                                            variant="outlined"
                                            value={registerData.password}
                                            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                            required
                                            sx={{ mb: 3 }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Lock sx={{ color: 'rgba(255,255,255,0.5)' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <Button
                                            fullWidth
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            disabled={loading}
                                            sx={{
                                                py: 1.8,
                                                fontSize: '1.1rem',
                                                borderRadius: '12px',
                                                background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)'
                                            }}
                                        >
                                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                                        </Button>

                                        <Divider sx={{ my: 3, color: 'rgba(255,255,255,0.3)' }}>OR</Divider>

                                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                            <GoogleLogin
                                                onSuccess={handleGoogleSuccess}
                                                onError={handleGoogleError}
                                                theme="filled_black"
                                                size="large"
                                                text="signup_with"
                                                width="100%"
                                            />
                                        </Box>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>

                <Typography
                    variant="body2"
                    sx={{
                        color: 'rgba(255,255,255,0.6)',
                        textAlign: 'center',
                        mt: 4,
                        fontWeight: 500
                    }}
                >
                    © 2026 AgroSmart. Revolutionizing hill agriculture.
                </Typography>
            </Container>
        </Box>
    );
}
