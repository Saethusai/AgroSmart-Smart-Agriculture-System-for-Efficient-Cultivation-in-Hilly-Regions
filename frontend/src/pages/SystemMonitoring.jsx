import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Tabs,
    Tab,
    Card,
    CardContent,
    Avatar,
    Tooltip,
    Divider
} from '@mui/material';
import {
    Router as RouterIcon,
    Sensors as SensorsIcon,
    Waves as WavesIcon,
    History as HistoryIcon,
    Dns as ServerIcon,
    WifiTethering as WifiIcon,
    Opacity as WaterIcon,
    Thermostat as TempIcon,
    Cloud as HumidityIcon
} from '@mui/icons-material';
import { getAllSensorData, getAllIrrigationLogs } from '../services/adminService';
import { useNotification } from '../context/NotificationContext';
import Layout from '../components/Layout';

const SystemMonitoring = () => {
    const [tabValue, setTabValue] = useState(0);
    const [sensorData, setSensorData] = useState([]);
    const [irrigationLogs, setIrrigationLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showError } = useNotification();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [sensorResponse, irrigationResponse] = await Promise.all([
                getAllSensorData({ limit: 50 }),
                getAllIrrigationLogs({ limit: 50 })
            ]);
            setSensorData(sensorResponse.sensorData);
            setIrrigationLogs(irrigationResponse.irrigationLogs);
        } catch (error) {
            console.error('Error loading monitoring data:', error);
            showError('Infrastructure telemetry synchronization failed');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return '#00ff88';
            case 'In Progress': return '#00d4ff';
            case 'Failed': return '#ff3366';
            default: return 'rgba(255,255,255,0.4)';
        }
    };

    return (
        <Layout>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2, animation: 'fadeInUp 0.6s ease-out' }}>
                <Box
                    sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: 'rgba(179, 136, 255, 0.1)',
                        display: 'flex',
                        border: '1px solid rgba(179, 136, 255, 0.2)'
                    }}
                >
                    <ServerIcon sx={{ color: '#b388ff', fontSize: 32 }} />
                </Box>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                        Infrastructure <span className="gradient-text-purple">Pulse</span>
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        Live telemetry streams and operational logs from Distributed Farm Nodes.
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ mb: 3, borderBottom: '1px solid rgba(255,255,255,0.05)', animation: 'fadeInUp 0.8s ease-out' }}>
                <Tabs
                    value={tabValue}
                    onChange={(e, newValue) => setTabValue(newValue)}
                    sx={{
                        '& .MuiTabs-indicator': {
                            background: 'linear-gradient(90deg, #00d4ff, #b388ff)',
                            height: 3,
                            borderRadius: '3px 3px 0 0'
                        },
                        '& .MuiTab-root': {
                            color: 'rgba(255,255,255,0.4)',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            letterSpacing: '0.05em',
                            '&.Mui-selected': {
                                color: 'white'
                            }
                        }
                    }}
                >
                    <Tab icon={<SensorsIcon sx={{ mr: 1, fontSize: 18 }} />} iconPosition="start" label="TELEMETRY STREAMS" />
                    <Tab icon={<HistoryIcon sx={{ mr: 1, fontSize: 18 }} />} iconPosition="start" label="OPERATION LOGS" />
                </Tabs>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" py={12}>
                    <CircularProgress sx={{ color: '#b388ff' }} />
                </Box>
            ) : (
                <Box sx={{ animation: 'fadeInUp 1s ease-out' }}>
                    {/* Sensor Data Tab */}
                    {tabValue === 0 && (
                        <TableContainer
                            component={Card}
                            className="glass-card"
                            sx={{
                                maxHeight: 'calc(100vh - 350px)',
                                '& .MuiTableHead-root': { background: 'rgba(255,255,255,0.02)' }
                            }}
                        >
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ background: 'transparent', fontWeight: 800, color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>SITE ARCHITECTURE</TableCell>
                                        <TableCell sx={{ background: 'transparent', fontWeight: 800, color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>HYDRATION</TableCell>
                                        <TableCell sx={{ background: 'transparent', fontWeight: 800, color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>THERMAL</TableCell>
                                        <TableCell sx={{ background: 'transparent', fontWeight: 800, color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>ATMOSPHERE</TableCell>
                                        <TableCell sx={{ background: 'transparent', fontWeight: 800, color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>RESERVOIR</TableCell>
                                        <TableCell sx={{ background: 'transparent', fontWeight: 800, color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>TIMESTAMP</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sensorData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                                <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>No active telemetry detected.</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        sensorData.map((data, index) => (
                                            <TableRow key={index} sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                                                <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', background: 'rgba(0, 212, 255, 0.1)', color: '#00d4ff', border: '1px solid rgba(0, 212, 255, 0.2)' }}>
                                                            {data.userId?.farmDetails?.farmName?.[0] || 'F'}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{data.userId?.farmDetails?.farmName || 'Unknown Site'}</Typography>
                                                            <Typography variant="caption" sx={{ opacity: 0.5 }}>{data.userId?.name || 'External User'}</Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <WaterIcon sx={{ fontSize: 16, color: '#00d4ff' }} />
                                                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{data.soilMoisture}%</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#ffb800' }}>{data.temperature?.toFixed(1)}°C</Typography>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#667eea' }}>{data.humidity}%</Typography>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <Box sx={{ width: '100%', maxWidth: 60 }}>
                                                        <Box sx={{ height: 4, width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden', mb: 0.5 }}>
                                                            <Box sx={{ height: '100%', width: `${((10 - data.waterTankLevel) / 10) * 100}%`, background: data.waterTankLevel >= 8 ? '#ff3366' : '#00ff88' }} />
                                                        </Box>
                                                        <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.5 }}>{data.waterTankLevel}%</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <Typography variant="caption" sx={{ fontFamily: 'monospace', opacity: 0.6 }}>{formatDate(data.timestamp)}</Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* Irrigation Sessions Tab */}
                    {tabValue === 1 && (
                        <TableContainer
                            component={Card}
                            className="glass-card"
                            sx={{
                                maxHeight: 'calc(100vh - 350px)',
                                '& .MuiTableHead-root': { background: 'rgba(255,255,255,0.02)' }
                            }}
                        >
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ background: 'transparent', fontWeight: 800, color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>OPERATIONAL TARGET</TableCell>
                                        <TableCell sx={{ background: 'transparent', fontWeight: 800, color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>STATUS</TableCell>
                                        <TableCell sx={{ background: 'transparent', fontWeight: 800, color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>TRIGGER ARCHITECTURE</TableCell>
                                        <TableCell sx={{ background: 'transparent', fontWeight: 800, color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>METRICS</TableCell>
                                        <TableCell sx={{ background: 'transparent', fontWeight: 800, color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>INITIATION TIME</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {irrigationLogs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                                <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>No operational logs found.</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        irrigationLogs.map((log, index) => (
                                            <TableRow key={index} sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                                                <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <WifiIcon sx={{ fontSize: 18, color: '#b388ff', opacity: 0.5 }} />
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{log.userId?.farmDetails?.farmName || 'N/A'}</Typography>
                                                            <Typography variant="caption" sx={{ opacity: 0.5 }}>{log.userId?.name || 'N/A'}</Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: getStatusColor(log.status), boxShadow: `0 0 10px ${getStatusColor(log.status)}` }} />
                                                        <Typography variant="caption" sx={{ fontWeight: 800, color: getStatusColor(log.status), textTransform: 'uppercase' }}>
                                                            {log.status}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <Chip
                                                        label={log.triggerType.toUpperCase()}
                                                        size="small"
                                                        sx={{
                                                            fontSize: '0.65rem',
                                                            fontWeight: 800,
                                                            background: log.triggerType === 'Automatic' ? 'rgba(0, 255, 136, 0.05)' : 'rgba(102, 126, 234, 0.05)',
                                                            color: log.triggerType === 'Automatic' ? '#00ff88' : '#667eea',
                                                            border: `1px solid ${log.triggerType === 'Automatic' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(102, 126, 234, 0.2)'}`
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{log.waterVolume ? `${log.waterVolume}L` : '0L'}</Typography>
                                                        <Typography variant="caption" sx={{ opacity: 0.5 }}>{log.duration ? `${log.duration} min` : 'Pending'}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <Typography variant="caption" sx={{ fontFamily: 'monospace', opacity: 0.6 }}>{formatDate(log.startTime)}</Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            )}
        </Layout>
    );
};

export default SystemMonitoring;
