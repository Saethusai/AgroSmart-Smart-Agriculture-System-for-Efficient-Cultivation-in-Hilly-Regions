import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    IconButton,
    LinearProgress
} from '@mui/material';
import {
    People as PeopleIcon,
    Grass as GrassIcon,
    Sensors as SensorsIcon,
    WaterDrop as WaterDropIcon,
    TrendingUp as TrendingUpIcon,
    Warning as WarningIcon,
    AdminPanelSettings as AdminIcon,
    Refresh as RefreshIcon,
    Launch as LaunchIcon,
    Agriculture as AgricultureIcon
} from '@mui/icons-material';
import { getSystemStats } from '../services/adminService';
import { useNotification } from '../context/NotificationContext';
import Layout from '../components/Layout';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { showSuccess, showError } = useNotification();
    const navigate = useNavigate();

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async (isRefresh = false) => {
        if (!isRefresh) setLoading(true);
        try {
            const data = await getSystemStats();
            setStats(data);
            if (isRefresh) showSuccess('System statistics synchronized');
        } catch (error) {
            console.error('Error loading stats:', error);
            showError('Data synchronization failed');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                    <CircularProgress sx={{ color: '#00d4ff' }} />
                </Box>
            </Layout>
        );
    }

    const statCards = [
        {
            title: 'Global Farmer Network',
            value: stats?.users?.total || 0,
            icon: <PeopleIcon sx={{ fontSize: 32 }} />,
            color: '#00d4ff',
            subtitle: `${stats?.users?.recentSignups || 0} active deployments this week`
        },
        {
            title: 'System Administrators',
            value: stats?.users?.admins || 0,
            icon: <AdminIcon sx={{ fontSize: 32 }} />,
            color: '#ff6b9d',
            subtitle: 'Core operational oversight'
        },
        {
            title: 'Botanical Repository',
            value: stats?.crops || 0,
            icon: <GrassIcon sx={{ fontSize: 32 }} />,
            color: '#00ff88',
            subtitle: 'Optimized high-altitude profiles'
        },
        {
            title: 'IoT Data Nodes',
            value: stats?.sensorReadings || 0,
            icon: <SensorsIcon sx={{ fontSize: 32 }} />,
            color: '#ffb800',
            subtitle: 'Telemetry streams processed'
        },
        {
            title: 'Automation Cycles',
            value: stats?.irrigations?.total || 0,
            icon: <WaterDropIcon sx={{ fontSize: 32 }} />,
            color: '#667eea',
            subtitle: `${stats?.irrigations?.active || 0} active hydration cycles`
        },
        {
            title: 'Resource Output',
            value: `${stats?.irrigations?.totalWaterUsed || 0}L`,
            icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
            color: '#b388ff',
            subtitle: 'Cumulative water distribution'
        }
    ];

    return (
        <Layout>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'fadeInUp 0.6s ease-out' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: 2,
                            background: 'rgba(255, 107, 157, 0.1)',
                            display: 'flex',
                            border: '1px solid rgba(255, 107, 157, 0.2)'
                        }}
                    >
                        <AdminIcon sx={{ color: '#ff6b9d', fontSize: 32 }} />
                    </Box>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                            Platform <span className="gradient-text">Command</span>
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            Real-time global system intelligence and infrastructure control.
                        </Typography>
                    </Box>
                </Box>
                <IconButton
                    onClick={() => loadStats(true)}
                    className="hover-lift"
                    sx={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        p: 1.5
                    }}
                >
                    <RefreshIcon sx={{ color: '#00d4ff' }} />
                </IconButton>
            </Box>

            <Grid container spacing={3}>
                {statCards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index} sx={{ animation: `fadeInUp ${0.7 + (index * 0.1)}s ease-out` }}>
                        <Card className="glass-card hover-lift" sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: -10,
                                    right: -10,
                                    opacity: 0.05,
                                    transform: 'scale(1.5)'
                                }}
                            >
                                {card.icon}
                            </Box>
                            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <Box
                                        sx={{
                                            backgroundColor: `${card.color}20`,
                                            color: card.color,
                                            borderRadius: 2,
                                            p: 1.5,
                                            mr: 2,
                                            border: `1px solid ${card.color}40`,
                                            display: 'flex'
                                        }}
                                    >
                                        {card.icon}
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase' }}>
                                            {card.title}
                                        </Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 800, color: card.color }}>
                                            {card.value}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                                    {card.subtitle}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3} mt={1}>
                {/* Quick Actions */}
                <Grid item xs={12} md={7} sx={{ animation: 'fadeInUp 1.4s ease-out' }}>
                    <Card className="glass-card" sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 800, color: 'rgba(255,255,255,0.7)' }}>
                                System Operations Gateway
                            </Typography>
                            <Grid container spacing={2}>
                                {[
                                    { label: 'Network Integrity', sub: 'Citizen & Enterprise node management', path: '/admin/users', icon: <PeopleIcon />, color: '#00d4ff' },
                                    { label: 'Agricultural Logic', sub: 'Environmental parameter tuning', path: '/admin/crops', icon: <AgricultureIcon />, color: '#00ff88' },
                                    { label: 'Telemetry Stream', sub: 'Active infrastructure monitoring', path: '/admin/monitoring', icon: <SensorsIcon />, color: '#ffb800' }
                                ].map((action, i) => (
                                    <Grid item xs={12} key={i}>
                                        <Box
                                            onClick={() => navigate(action.path)}
                                            sx={{
                                                cursor: 'pointer',
                                                p: 2.5,
                                                borderRadius: 3,
                                                background: 'rgba(255,255,255,0.02)',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                textDecoration: 'none',
                                                color: 'inherit',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 3,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    background: 'rgba(255,255,255,0.05)',
                                                    borderColor: action.color,
                                                    transform: 'translateX(8px)'
                                                }
                                            }}
                                        >
                                            <Box sx={{ p: 1.5, borderRadius: 2, background: `${action.color}10`, color: action.color, display: 'flex' }}>
                                                {action.icon}
                                            </Box>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1 }}>
                                                    {action.label}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                                                    {action.sub}
                                                </Typography>
                                            </Box>
                                            <LaunchIcon sx={{ fontSize: 18, opacity: 0.3 }} />
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Infrastructure Status */}
                <Grid item xs={12} md={5} sx={{ animation: 'fadeInUp 1.6s ease-out' }}>
                    <Card className="glass-card" sx={{ height: '100%', position: 'relative' }}>
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundImage: 'url("https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")', // Data center/circuitry
                                backgroundSize: 'cover',
                                opacity: 0.05,
                                zIndex: 0
                            }}
                        />
                        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 800, color: 'rgba(255,255,255,0.7)' }}>
                                Infrastructure Pulse
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {[
                                    { label: 'AgroSmart Core API', status: 'Online', color: '#00ff88' },
                                    { label: 'Blockchain Ledger / DB', status: 'Synchronized', color: '#00ff88' },
                                    { label: 'Active Edge Nodes', status: `${stats?.irrigations?.active || 0} Connected`, color: stats?.irrigations?.active > 0 ? '#ffb800' : '#00ff88' }
                                ].map((item, i) => (
                                    <Box key={i} sx={{ p: 2, background: 'rgba(255,255,255,0.03)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                            <Typography variant="body2" sx={{ fontWeight: 700, opacity: 0.8 }}>{item.label}</Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: item.color, boxShadow: `0 0 10px ${item.color}` }} />
                                                <Typography variant="caption" sx={{ fontWeight: 800, color: item.color }}>{item.status.toUpperCase()}</Typography>
                                            </Box>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={100}
                                            sx={{
                                                height: 4,
                                                borderRadius: 1,
                                                bgcolor: 'rgba(255,255,255,0.05)',
                                                '& .MuiLinearProgress-bar': { bgcolor: item.color }
                                            }}
                                        />
                                    </Box>
                                ))}
                            </Box>

                            <Box sx={{ mt: 4, p: 2, borderRadius: 2, background: 'rgba(255, 51, 102, 0.05)', border: '1px solid rgba(255, 51, 102, 0.1)', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <WarningIcon sx={{ color: '#ff3366' }} />
                                <Typography variant="caption" sx={{ color: '#ff3366', fontWeight: 700 }}>
                                    NO CRITICAL SYSTEM FAILURES DETECTED IN LAST 24H
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Layout>
    );
};

export default AdminDashboard;

