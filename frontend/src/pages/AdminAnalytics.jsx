import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    CircularProgress,
    Card,
    CardContent,
    Avatar,
    Divider
} from '@mui/material';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import {
    Insights as InsightsIcon,
    WaterDrop as WaterIcon,
    Timeline as TrendsIcon,
    AutoGraph as EfficiencyIcon,
    QueryStats as StatsIcon
} from '@mui/icons-material';
import {
    getWaterUsageAnalytics,
    getSensorTrends,
    getIrrigationEfficiency
} from '../services/adminService';
import { useNotification } from '../context/NotificationContext';
import Layout from '../components/Layout';

const AdminAnalytics = () => {
    const [waterUsage, setWaterUsage] = useState(null);
    const [sensorTrends, setSensorTrends] = useState(null);
    const [efficiency, setEfficiency] = useState(null);
    const [loading, setLoading] = useState(true);
    const { showError } = useNotification();

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const [waterData, trendsData, efficiencyData] = await Promise.all([
                getWaterUsageAnalytics(30),
                getSensorTrends(7),
                getIrrigationEfficiency()
            ]);
            setWaterUsage(waterData);
            setSensorTrends(trendsData);
            setEfficiency(efficiencyData);
        } catch (error) {
            console.error('Error loading analytics:', error);
            showError('Data intelligence processing failed');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                    <CircularProgress sx={{ color: '#ff6b9d' }} />
                </Box>
            </Layout>
        );
    }

    // Prepare water usage chart data
    const waterUsageChartData = waterUsage?.dailyUsage
        ? Object.entries(waterUsage.dailyUsage).map(([date, usage]) => ({
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            water: Math.round(usage)
        }))
        : [];

    // Prepare irrigation efficiency pie chart data
    const efficiencyPieData = [
        { name: 'Manual Override', value: efficiency?.manualIrrigations || 0 },
        { name: 'Autonomous', value: efficiency?.autoIrrigations || 0 }
    ];

    const COLORS = ['#ff6b9d', '#00ff88'];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Box sx={{ p: 2, bgcolor: 'rgba(10, 15, 30, 0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 800 }}>{label}</Typography>
                    {payload.map((entry, index) => (
                        <Typography key={index} variant="body2" sx={{ color: entry.color, fontWeight: 800, mt: 0.5 }}>
                            {entry.name}: {entry.value}{entry.name.includes('Water') ? 'L' : ''}
                        </Typography>
                    ))}
                </Box>
            );
        }
        return null;
    };

    return (
        <Layout>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2, animation: 'fadeInUp 0.6s ease-out' }}>
                <Box
                    sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: 'rgba(255, 107, 157, 0.1)',
                        display: 'flex',
                        border: '1px solid rgba(255, 107, 157, 0.2)'
                    }}
                >
                    <InsightsIcon sx={{ color: '#ff6b9d', fontSize: 32 }} />
                </Box>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                        Data <span className="gradient-text-pink">Intelligence</span>
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        Cross-sector analytics and operational efficiency modeling.
                    </Typography>
                </Box>
            </Box>

            {/* Key Metrics */}
            <Grid container spacing={3} mb={4} sx={{ animation: 'fadeInUp 0.8s ease-out' }}>
                {[
                    { label: 'CUMULATIVE HYDRATION', value: `${waterUsage?.totalWaterUsed?.toLocaleString() || 0}L`, sub: 'Last 30 Sol periods', color: '#00d4ff', icon: <WaterIcon /> },
                    { label: 'TOTAL OPERATIONS', value: efficiency?.totalIrrigations || 0, sub: 'All-time initialized logs', color: '#b388ff', icon: <EfficiencyIcon /> },
                    { label: 'AUTONOMY RATE', value: `${efficiency?.automationRate || 0}%`, sub: 'Auto vs Manual execution', color: '#00ff88', icon: <TrendsIcon /> },
                    { label: 'AVG DURATION', value: `${efficiency?.avgDuration || 0} min`, sub: 'Per irrigation sequence', color: '#ffb800', icon: <StatsIcon /> }
                ].map((metric, i) => (
                    <Grid item xs={12} sm={6} md={3} key={i}>
                        <Card className="glass-card hover-lift" sx={{ position: 'relative', overflow: 'hidden' }}>
                            <Box sx={{ position: 'absolute', top: -10, right: -10, opacity: 0.05, transform: 'scale(1.5)', color: metric.color }}>{metric.icon}</Box>
                            <CardContent>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, letterSpacing: '0.1em' }}>{metric.label}</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 900, my: 1, color: metric.color }}>{metric.value}</Typography>
                                <Typography variant="caption" sx={{ opacity: 0.6 }}>{metric.sub}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Charts */}
            <Grid container spacing={3}>
                {/* Water Usage Over Time */}
                <Grid item xs={12} lg={8} sx={{ animation: 'fadeInUp 1s ease-out' }}>
                    <Card className="glass-card" sx={{ p: 1 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <WaterIcon sx={{ color: '#00d4ff' }} /> Hydration Telemetry (30D)
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={waterUsageChartData}>
                                    <defs>
                                        <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} />
                                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="water" name="Water Used" stroke="#00d4ff" strokeWidth={3} fillOpacity={1} fill="url(#colorWater)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Irrigation Type Distribution */}
                <Grid item xs={12} lg={4} sx={{ animation: 'fadeInUp 1.1s ease-out' }}>
                    <Card className="glass-card" sx={{ p: 1, height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EfficiencyIcon sx={{ color: '#00ff88' }} /> Execution Mode
                            </Typography>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={efficiencyPieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={85}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {efficiencyPieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                            <Box sx={{ mt: 3, textAlign: 'center' }}>
                                <Typography variant="h3" sx={{ fontWeight: 900, color: '#00ff88' }}>{efficiency?.automationRate || 0}%</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.5 }}>SYSTEM AUTONOMY INDEX</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Sensor Trends */}
                <Grid item xs={12} sx={{ animation: 'fadeInUp 1.2s ease-out' }}>
                    <Card className="glass-card" sx={{ p: 1 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TrendsIcon sx={{ color: '#b388ff' }} /> Environmental Vector Trends (7D)
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={sensorTrends?.trends || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} />
                                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Line type="monotone" dataKey="avgSoilMoisture" stroke="#b388ff" strokeWidth={3} dot={false} name="Soil Moisture" />
                                    <Line type="monotone" dataKey="avgTemperature" stroke="#ffb800" strokeWidth={3} dot={false} name="Temperature" />
                                    <Line type="monotone" dataKey="avgHumidity" stroke="#00d4ff" strokeWidth={3} dot={false} name="Humidity" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Top Water Users */}
                <Grid item xs={12} sx={{ animation: 'fadeInUp 1.3s ease-out' }}>
                    <Card className="glass-card" sx={{ p: 1 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <StatsIcon sx={{ color: '#667eea' }} /> Sector Load Distribution
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={waterUsage?.userUsage?.slice(0, 10) || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="farmName" stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} />
                                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="totalWater" fill="#667eea" radius={[4, 4, 0, 0]} name="Water Consumed" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Box sx={{ mt: 6, p: 4, borderRadius: 4, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', opacity: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.2em' }}>
                    AGROSMART ANALYTIC ENGINE V4.0 // SECURE DATA INTELLIGENCE
                </Typography>
            </Box>
        </Layout>
    );
};

export default AdminAnalytics;
