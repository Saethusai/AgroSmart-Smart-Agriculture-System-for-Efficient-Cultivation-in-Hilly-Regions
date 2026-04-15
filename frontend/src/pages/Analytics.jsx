import { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Layout from '../components/Layout';
import { sensorsAPI, irrigationAPI } from '../services/api';

export default function Analytics() {
    const [sensorHistory, setSensorHistory] = useState([]);
    const [irrigationStats, setIrrigationStats] = useState(null);
    const [timeRange, setTimeRange] = useState('7');

    useEffect(() => {
        fetchData();
    }, [timeRange]);

    const fetchData = async () => {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - parseInt(timeRange));

            const [sensorRes, statsRes] = await Promise.all([
                sensorsAPI.getHistory({
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    limit: 100
                }),
                irrigationAPI.getStats({ days: parseInt(timeRange) })
            ]);

            // Reverse to show oldest first
            setSensorHistory(sensorRes.data.data.reverse());
            setIrrigationStats(statsRes.data.stats);
        } catch (error) {
            console.error('Error fetching analytics data:', error);
        }
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    const chartData = sensorHistory.map(data => ({
        date: formatDate(data.timestamp),
        moisture: data.soilMoisture,
        temperature: data.temperature,
        humidity: data.humidity,
        waterTank: data.waterTankLevel,
        risk: data.terrainRisk?.score || 0
    }));

    return (
        <Layout>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Analytics
                </Typography>
                <ToggleButtonGroup
                    value={timeRange}
                    exclusive
                    onChange={(e, value) => value && setTimeRange(value)}
                    size="small"
                >
                    <ToggleButton value="7">7 Days</ToggleButton>
                    <ToggleButton value="14">14 Days</ToggleButton>
                    <ToggleButton value="30">30 Days</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Irrigation Statistics */}
            {irrigationStats && (
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="body2" color="text.secondary">Total Irrigations</Typography>
                                <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                    {irrigationStats.totalIrrigations || 0}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="body2" color="text.secondary">Water Used</Typography>
                                <Typography variant="h3" sx={{ fontWeight: 700, color: 'info.main' }}>
                                    {irrigationStats.totalWaterUsed || 0}L
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="body2" color="text.secondary">Manual</Typography>
                                <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main' }}>
                                    {irrigationStats.manualCount || 0}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="body2" color="text.secondary">Automatic</Typography>
                                <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                                    {irrigationStats.automaticCount || 0}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Charts */}
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Soil Moisture Trend
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                                    <YAxis stroke="rgba(255,255,255,0.5)" />
                                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }} />
                                    <Legend />
                                    <Area type="monotone" dataKey="moisture" stroke="#667eea" fill="#667eea" fillOpacity={0.3} name="Soil Moisture %" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Temperature & Humidity
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                                    <YAxis stroke="rgba(255,255,255,0.5)" />
                                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="temperature" stroke="#ef4444" name="Temperature °C" />
                                    <Line type="monotone" dataKey="humidity" stroke="#3b82f6" name="Humidity %" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Water Tank Level
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                                    <YAxis stroke="rgba(255,255,255,0.5)" />
                                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }} />
                                    <Legend />
                                    <Bar dataKey="waterTank" fill="#10b981" name="Water Tank %" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Terrain Stability & Erosion Risk Trend
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                                    <YAxis stroke="rgba(255,255,255,0.5)" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }}
                                        formatter={(value) => [`${value}/100`, 'Risk Score']}
                                    />
                                    <Legend />
                                    <Area
                                        type="monotone"
                                        dataKey="risk"
                                        stroke="#f43f5e"
                                        fill="#f43f5e"
                                        fillOpacity={0.2}
                                        name="Topographical Risk Score"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Layout>
    );
}
