import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    IconButton,
    CircularProgress,
    Button,
    LinearProgress,
    Tooltip,
    Chip,
    Divider
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    WaterDrop as WaterDropIcon,
    Thermostat as ThermostatIcon,
    Opacity as OpacityIcon,
    Grass as GrassIcon,
    TrendingUp as TrendingUpIcon,
    Launch as LaunchIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { sensorsAPI, irrigationAPI, reportsAPI, weatherAPI } from '../services/api';
import {
    WbSunny as SunnyIcon,
    Cloud as CloudIcon,
    Umbrella as RainIcon,
    Storm as StormIcon,
    Air as WindIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
const Dashboard = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { showError, showSuccess } = useNotification();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [latestData, setLatestData] = useState(null);
    const [irrigationStatus, setIrrigationStatus] = useState(null);
    const [stats, setStats] = useState(null);
    const [terrainRisk, setTerrainRisk] = useState(null);
    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadDashboardData();

        // Polling for real-time updates every 30 seconds
        const interval = setInterval(loadDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadDashboardData = async (isManual = false) => {
        if (!isManual) setLoading(true);
        try {
            const [dataRes, statusRes, statsRes, reportSummaryRes, weatherRes, forecastRes] = await Promise.all([
                sensorsAPI.getLatest(),
                irrigationAPI.getStatus(),
                irrigationAPI.getStats(),
                reportsAPI.getSummary(),
                weatherAPI.getCurrent(),
                weatherAPI.getForecast()
            ]);

            setLatestData(dataRes.data?.data || dataRes.data);
            setIrrigationStatus(statusRes.data);
            setStats(statsRes.data.stats);
            setTerrainRisk(reportSummaryRes.data.risk);
            setWeather(weatherRes.data.weather);
            setForecast(forecastRes.data.forecast);

            if (isManual) showSuccess('Agricultural telemetry synchronized');
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            showError('Failed to synchronize field telemetry');
        } finally {
            setLoading(false);
        }
    };

    const handleStart = async () => {
        setActionLoading(true);
        try {
            const logRes = await irrigationAPI.start({ reason: 'user' });
            showSuccess("Valves Activated");
            setIrrigationStatus({ isActive: true, irrigation: { status: "ON", _id: logRes.data?.irrigationId } });
        } catch (error) {
            console.error(error);
            showError("Failed to turn ON pump");
        } finally {
            setActionLoading(false);
        }
    };

    const handleStop = async () => {
        setActionLoading(true);
        try {
            if (irrigationStatus?.irrigation?._id) {
                await irrigationAPI.stop(irrigationStatus.irrigation._id);
            }
            showSuccess("Valves Deactivated");
            setIrrigationStatus({ isActive: false, irrigation: null });
        } catch (error) {
            console.error(error);
            showError("Failed to turn OFF pump");
        } finally {
            setActionLoading(false);
        }
    };

    const getWeatherIcon = (condition) => {
        const cond = condition?.toLowerCase() || '';
        if (cond.includes('sun') || cond.includes('clear')) return <SunnyIcon sx={{ color: '#ffb800' }} />;
        if (cond.includes('rain') || cond.includes('drizzle')) return <RainIcon sx={{ color: '#00d4ff' }} />;
        if (cond.includes('storm')) return <StormIcon sx={{ color: '#ff3366' }} />;
        return <CloudIcon sx={{ color: 'rgba(255,255,255,0.6)' }} />;
    };

    if (loading && !latestData) {
        return (
            <Layout>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                    <CircularProgress sx={{ color: '#00d4ff' }} />
                </Box>
            </Layout>
        );
    }

    const sensorCards = [
        {
            title: t('dashboard.soilMoisture'),
            value: (latestData?.soilMoisture !== undefined && latestData?.soilMoisture !== null) ? `${latestData.soilMoisture}%` : 'N/A',
            icon: <WaterDropIcon />,
            color: '#00d4ff',
            status: latestData?.soilMoisture < 30 ? t('dashboard.status.CRITICAL') : t('dashboard.status.OPTIMAL')
        },
        {
            title: t('dashboard.temperature'),
            value: (latestData?.temperature !== undefined && latestData?.temperature !== null) ? `${latestData.temperature.toFixed(1)}°C` : 'N/A',
            icon: <ThermostatIcon />,
            color: '#ffb800',
            status: t('dashboard.status.STABLE')
        },
        {
            title: t('dashboard.humidity'),
            value: (latestData?.humidity !== undefined && latestData?.humidity !== null) ? `${latestData.humidity}%` : 'N/A',
            icon: <OpacityIcon />,
            color: '#667eea',
            status: t('dashboard.status.NORMAL')
        },
        {
            title: t('dashboard.waterReserve'),
            value: (latestData?.waterTankLevel !== undefined && latestData?.waterTankLevel !== null) ? `${latestData.waterTankLevel}` : '0',
            icon: <GrassIcon />,
            color: '#00ff88',
            status: latestData?.waterTankLevel >= 8 ? t('dashboard.status.LOW') : t('dashboard.status.FULL')
        }
    ];

    return (
        <Layout>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'fadeInUp 0.6s ease-out' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                        {t('dashboard.title1')} <span className="gradient-text">{t('dashboard.title2')}</span>
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        {t('dashboard.subtitle', { farmName: user?.farmDetails?.farmName || 'your high-altitude site' })}
                    </Typography>
                </Box>
                <IconButton
                    onClick={() => loadDashboardData(true)}
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
                {sensorCards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index} sx={{ animation: `fadeInUp ${0.7 + (index * 0.1)}s ease-out` }}>
                        <Card className="glass-card hover-lift" sx={{ height: '100%' }}>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                    <Box sx={{ p: 1, borderRadius: 2, background: `${card.color}10`, color: card.color, display: 'flex' }}>
                                        {card.icon}
                                    </Box>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: card.status === 'CRITICAL' ? '#ff3366' : 'rgba(255,255,255,0.4)' }}>
                                        {card.status}
                                    </Typography>
                                </Box>
                                <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>{card.value}</Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: '0.05em' }}>
                                    {card.title}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}

                {/* Unique Terrain Risk Monitor */}
                <Grid item xs={12} sx={{ animation: 'fadeInUp 1.1s ease-out' }}>
                    <Card
                        className="glass-card"
                        sx={{
                            background: terrainRisk?.level === 'Critical' || terrainRisk?.level === 'High'
                                ? 'linear-gradient(135deg, rgba(255, 51, 102, 0.1) 0%, rgba(20, 20, 45, 0.9) 100%)'
                                : 'rgba(255, 255, 255, 0.05)',
                            border: terrainRisk?.level === 'Critical' ? '1px solid rgba(255, 51, 102, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Grid container spacing={3} alignItems="center">
                                <Grid item xs={12} md={8}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                        <Box sx={{
                                            p: 1.5,
                                            borderRadius: '50%',
                                            background: terrainRisk?.level === 'Critical' ? '#ff3366' : '#00ff88',
                                            display: 'flex',
                                            boxShadow: `0 0 20px ${terrainRisk?.level === 'Critical' ? 'rgba(255, 51, 102, 0.4)' : 'rgba(0, 255, 136, 0.4)'}`
                                        }}>
                                            <WarningIcon sx={{ color: 'white' }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                                {t('dashboard.terrainRisk1')} <span className="gradient-text">{t('dashboard.terrainRisk2')}</span>
                                            </Typography>
                                            <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                                {t('dashboard.terrainDesc')}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 4, mt: 3 }}>
                                        <Box>
                                            <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.5 }}>{t('dashboard.riskLevel')}</Typography>
                                            <Typography variant="h6" sx={{ color: terrainRisk?.level === 'Critical' ? '#ff3366' : '#00ff88', fontWeight: 800 }}>
                                                {terrainRisk?.level?.toUpperCase() || t('dashboard.status.LOW')}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.5 }}>{t('dashboard.stabilityScore')}</Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                                {100 - (terrainRisk?.score || 0)}/100
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.5 }}>{t('dashboard.slopeAngle')}</Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 800 }}>{terrainRisk?.factors?.slope || 0}°</Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Box sx={{ p: 3, borderRadius: 3, background: 'rgba(0,0,0,0.2)', textAlign: 'center' }}>
                                        <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
                                            {terrainRisk?.level === 'Critical' || terrainRisk?.level === 'High'
                                                ? t('dashboard.immediateAction')
                                                : t('dashboard.optimalGround')}
                                        </Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={terrainRisk?.score || 10}
                                            sx={{
                                                height: 10,
                                                borderRadius: 5,
                                                background: 'rgba(255,255,255,0.05)',
                                                '& .MuiLinearProgress-bar': {
                                                    background: terrainRisk?.level === 'Critical' ? '#ff3366' : '#00ff88'
                                                }
                                            }}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Irrigation Status Card */}
                <Grid item xs={12} md={8} sx={{ animation: 'fadeInUp 1.2s ease-out' }}>
                    <Card className="glass-card" sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
                        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', bgcolor: irrigationStatus?.isActive ? '#00d4ff' : 'rgba(255,255,255,0.1)' }} />
                        <CardContent sx={{ p: 4 }}>
                            <Grid container spacing={4} alignItems="center">
                                <Grid item xs={12} sm={7}>
                                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                                        {t('dashboard.hydrationLogic')} <span style={{ color: irrigationStatus?.isActive ? '#00d4ff' : 'inherit' }}>{irrigationStatus?.isActive ? t('dashboard.active') : t('dashboard.standby')}</span>
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', mb: 3 }}>
                                        {irrigationStatus?.isActive
                                            ? t('dashboard.distributingWater', { duration: irrigationStatus.irrigation?.duration || 0 })
                                            : t('dashboard.systemReady')}
                                    </Typography>
                                    <Box display="flex" gap={2}>
                                        {!irrigationStatus?.isActive ? (
                                            <Button
                                                variant="contained"
                                                startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : <WaterDropIcon />}
                                                onClick={handleStart}
                                                disabled={actionLoading}
                                            >
                                                Initiate Flow
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="contained"
                                                color="error"
                                                startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : <WarningIcon />}
                                                onClick={handleStop}
                                                disabled={actionLoading}
                                                sx={{ background: '#ff3366', '&:hover': { background: '#d62d58' } }}
                                            >
                                                Terminate Flow
                                            </Button>
                                        )}
                                        <Button
                                            sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'none' }}
                                            onClick={() => navigate('/analytics')}
                                        >
                                            {t('dashboard.viewTrends')}
                                        </Button>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={5}>
                                    <Box sx={{ textAlign: 'center', p: 3, borderRadius: 4, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Typography variant="h4" sx={{ fontWeight: 800 }}>{stats?.totalWaterUsed || 0}L</Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.5, fontWeight: 700 }}>{t('dashboard.monthlyResource')}</Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Weather & Predictive Intelligence */}
                <Grid item xs={12} md={4} sx={{ animation: 'fadeInUp 1.4s ease-out' }}>
                    <Card className="glass-card" sx={{ height: '100%', background: 'rgba(255, 255, 255, 0.02)' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {t('dashboard.weatherIntelligence1')} <span className="gradient-text">{t('dashboard.weatherIntelligence2')}</span>
                                </Typography>
                                <Chip
                                    label={t('dashboard.live')}
                                    size="small"
                                    sx={{ height: 16, fontSize: '0.6rem', fontWeight: 900, background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88', border: '1px solid rgba(0, 255, 136, 0.2)' }}
                                />
                            </Box>

                            {/* Current Weather */}
                            <Box display="flex" alignItems="center" gap={3} mb={4} sx={{ p: 2, borderRadius: 3, background: 'rgba(255,255,255,0.03)' }}>
                                <Box sx={{ p: 2, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex' }}>
                                    {getWeatherIcon(weather?.weather?.[0]?.main)}
                                </Box>
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 800 }}>{weather?.main?.temp?.toFixed(1) || '--'}°C</Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.6, textTransform: 'capitalize' }}>
                                        {weather?.weather?.[0]?.description || t('dashboard.syncing')}
                                    </Typography>
                                </Box>
                                <Divider orientation="vertical" flexItem sx={{ opacity: 0.05 }} />
                                <Box>
                                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                        <WindIcon sx={{ fontSize: 14, opacity: 0.5 }} />
                                        <Typography variant="caption" sx={{ fontWeight: 700 }}>{weather?.wind?.speed || 0} km/h</Typography>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <OpacityIcon sx={{ fontSize: 14, opacity: 0.5 }} />
                                        <Typography variant="caption" sx={{ fontWeight: 700 }}>{weather?.main?.humidity || 0}%</Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {/* 12h Outlook */}
                            <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.4, letterSpacing: '0.1em', display: 'block', mb: 2 }}>
                                {t('dashboard.12hOutlook')}
                            </Typography>
                            <Box display="flex" justifyContent="space-between" mb={3}>
                                {forecast?.list?.slice(0, 4).map((item, i) => (
                                    <Box key={i} sx={{ textAlign: 'center' }}>
                                        <Typography variant="caption" sx={{ display: 'block', mb: 1, opacity: 0.5 }}>
                                            {new Date(item.dt * 1000).getHours()}:00
                                        </Typography>
                                        {getWeatherIcon(item.weather[0].main)}
                                        <Typography variant="caption" sx={{ display: 'block', mt: 1, fontWeight: 800 }}>
                                            {Math.round(item.main.temp)}°
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>

                            {/* Predictive Advice */}
                            <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(0, 212, 255, 0.05)', border: '1px solid rgba(0, 212, 255, 0.1)' }}>
                                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#00d4ff', fontWeight: 800, mb: 1 }}>
                                    <LaunchIcon sx={{ fontSize: 14 }} /> {t('dashboard.advisory')}
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: '0.8rem', opacity: 0.8 }}>
                                    {forecast?.list?.some(f => f.pop > 0.5)
                                        ? t('dashboard.rainLikely')
                                        : t('dashboard.dryConditions')}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Layout>
    );
};

export default Dashboard;
