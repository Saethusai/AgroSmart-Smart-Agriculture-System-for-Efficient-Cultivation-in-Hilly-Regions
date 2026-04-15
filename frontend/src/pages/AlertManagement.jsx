import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    TextField,
    MenuItem,
    Chip,
    Switch,
    FormControlLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    IconButton,
    Paper,
    Divider,
    Alert as MuiAlert
} from '@mui/material';
import {
    NotificationsActive as AlertIcon,
    Campaign as RadioIcon,
    SettingsSuggest as ConfigIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
    Report as CriticalIcon,
    Refresh as RefreshIcon,
    Save as SaveIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { getAlerts, sendBroadcast, getSystemConfig, updateSystemConfig } from '../services/adminService';
import { useNotification } from '../context/NotificationContext';
import Layout from '../components/Layout';

const AlertManagement = () => {
    const [alerts, setAlerts] = useState([]);
    const [config, setConfig] = useState({
        defaultMoistureThreshold: 30,
        defaultTempMax: 40,
        maintenanceMode: false
    });
    const [broadcastMsg, setBroadcastMsg] = useState('');
    const [broadcastSeverity, setBroadcastSeverity] = useState('info');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { showSuccess, showError, showWarning } = useNotification();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [alertsData, configData] = await Promise.all([
                getAlerts({ limit: 20 }),
                getSystemConfig()
            ]);
            setAlerts(alertsData.alerts);
            setConfig(configData.config);
        } catch (error) {
            console.error('Error loading alert management data:', error);
            showError('System status synchronization failed');
        } finally {
            setLoading(false);
        }
    };

    const handleBroadcast = async () => {
        if (!broadcastMsg.trim()) return;
        setSubmitting(true);
        try {
            await sendBroadcast(broadcastMsg, broadcastSeverity);
            showSuccess('Network-wide broadcast transmitted');
            setBroadcastMsg('');
            loadData(); // Refresh alerts
        } catch (error) {
            showError('Broadcast transmission failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateConfig = async (updates) => {
        try {
            const response = await updateSystemConfig(updates);
            setConfig(response.config);
            showSuccess('Global infrastructure parameters updated');

            if (updates.hasOwnProperty('maintenanceMode')) {
                const mode = updates.maintenanceMode ? 'ACTIVATED' : 'DEACTIVATED';
                showWarning(`System Maintenance Mode: ${mode}`);
            }
        } catch (error) {
            showError('Configuration update failed');
        }
    };

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'critical': return <CriticalIcon sx={{ color: '#ff3366' }} />;
            case 'warning': return <WarningIcon sx={{ color: '#ffb800' }} />;
            default: return <InfoIcon sx={{ color: '#00d4ff' }} />;
        }
    };

    const getSeverityChip = (severity) => {
        const colors = {
            critical: '#ff3366',
            warning: '#ffb800',
            info: '#00d4ff'
        };
        return (
            <Chip
                label={severity.toUpperCase()}
                size="small"
                sx={{
                    bgcolor: `${colors[severity]}20`,
                    color: colors[severity],
                    border: `1px solid ${colors[severity]}40`,
                    fontWeight: 900,
                    fontSize: '0.6rem'
                }}
            />
        );
    };

    return (
        <Layout>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2, animation: 'fadeInUp 0.6s ease-out' }}>
                <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255, 51, 102, 0.1)', display: 'flex', border: '1px solid rgba(255, 51, 102, 0.2)' }}>
                    <AlertIcon sx={{ color: '#ff3366', fontSize: 32 }} />
                </Box>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                        Alert <span className="gradient-text-red">Command</span>
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        System-wide notifications, maintenance overrides, and threshold configurations.
                    </Typography>
                </Box>
            </Box>

            <Grid container spacing={4}>
                {/* Broadcast & Config Section */}
                <Grid item xs={12} lg={5}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {/* Broadcast Message */}
                        <Card className="glass-card fadeInUp" sx={{ animationDelay: '0.2s' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <RadioIcon sx={{ color: '#ff3366' }} /> Broadcast Transmitter
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Transmission Payload"
                                    placeholder="Enter system-wide announcement..."
                                    value={broadcastMsg}
                                    onChange={(e) => setBroadcastMsg(e.target.value)}
                                    sx={{ mb: 3 }}
                                />
                                <Grid container spacing={2}>
                                    <Grid item xs={7}>
                                        <TextField
                                            select
                                            fullWidth
                                            label="Priority Level"
                                            value={broadcastSeverity}
                                            onChange={(e) => setBroadcastSeverity(e.target.value)}
                                        >
                                            <MenuItem value="info">INFO (Normal)</MenuItem>
                                            <MenuItem value="warning">WARNING (Urgent)</MenuItem>
                                            <MenuItem value="critical">CRITICAL (Emergency)</MenuItem>
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={5}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={handleBroadcast}
                                            disabled={submitting || !broadcastMsg.trim()}
                                            sx={{
                                                height: '100%',
                                                background: 'linear-gradient(45deg, #ff3366, #ff6b9d)',
                                                fontWeight: 800
                                            }}
                                        >
                                            TRANSMIT
                                        </Button>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                        {/* System Configuration */}
                        <Card className="glass-card fadeInUp" sx={{ animationDelay: '0.4s' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ConfigIcon sx={{ color: '#00d4ff' }} /> Infrastructure Parameters
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 800 }}>Maintenance Override</Typography>
                                            <Typography variant="caption" sx={{ opacity: 0.5 }}>Disable all user-facing modifications</Typography>
                                        </Box>
                                        <Switch
                                            checked={config?.maintenanceMode || false}
                                            onChange={(e) => handleUpdateConfig({ maintenanceMode: e.target.checked })}
                                            color="warning"
                                        />
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <TextField
                                            label="Global Moisture Threshold (%)"
                                            type="number"
                                            size="small"
                                            value={config?.defaultMoistureThreshold || ''}
                                            onChange={(e) => setConfig({ ...config, defaultMoistureThreshold: e.target.value })}
                                            InputProps={{ endAdornment: <IconButton size="small" onClick={() => handleUpdateConfig({ defaultMoistureThreshold: config.defaultMoistureThreshold })}><SaveIcon sx={{ fontSize: 18 }} /></IconButton> }}
                                        />
                                        <TextField
                                            label="Global Max Temp (°C)"
                                            type="number"
                                            size="small"
                                            value={config?.defaultTempMax || ''}
                                            onChange={(e) => setConfig({ ...config, defaultTempMax: e.target.value })}
                                            InputProps={{ endAdornment: <IconButton size="small" onClick={() => handleUpdateConfig({ defaultTempMax: config.defaultTempMax })}><SaveIcon sx={{ fontSize: 18 }} /></IconButton> }}
                                        />
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                </Grid>

                {/* Alert History Section */}
                <Grid item xs={12} lg={7}>
                    <Card className="glass-card fadeInUp" sx={{ height: '100%', animationDelay: '0.6s' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CriticalIcon sx={{ color: '#ffb800' }} /> Signal Logs
                                </Typography>
                                <IconButton size="small" onClick={loadData} sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                    <RefreshIcon />
                                </IconButton>
                            </Box>

                            {loading ? (
                                <Box display="flex" justifyContent="center" py={8}><CircularProgress size={24} /></Box>
                            ) : (
                                <TableContainer sx={{ maxHeight: 500 }}>
                                    <Table stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ background: 'transparent', fontWeight: 800, color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>SEVERITY</TableCell>
                                                <TableCell sx={{ background: 'transparent', fontWeight: 800, color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>EVENT DATA</TableCell>
                                                <TableCell sx={{ background: 'transparent', fontWeight: 800, color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>CHRONO</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {alerts.length === 0 ? (
                                                <TableRow><TableCell colSpan={3} align="center" sx={{ py: 8, opacity: 0.5 }}>No signals detected.</TableCell></TableRow>
                                            ) : (
                                                alerts.map((alert, i) => (
                                                    <TableRow key={alert._id} sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                                                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                {getSeverityIcon(alert.severity)}
                                                                {getSeverityChip(alert.severity)}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{alert.message}</Typography>
                                                            <Typography variant="caption" sx={{ opacity: 0.5 }}>Source: {alert.source.toUpperCase()}</Typography>
                                                        </TableCell>
                                                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                            <Typography variant="caption" sx={{ fontFamily: 'monospace', opacity: 0.5 }}>
                                                                {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Layout>
    );
};

export default AlertManagement;
