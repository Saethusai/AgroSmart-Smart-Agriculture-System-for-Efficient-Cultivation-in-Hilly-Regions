import { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Divider,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Switch,
    TextField,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';
import {
    WaterDrop as WaterDropIcon,
    History as HistoryIcon,
    PlayArrow as StartIcon,
    Stop as StopIcon,
    Science as ScienceIcon,
    Schedule as ScheduleIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    CloudOff as RainIcon,
    Landscape as TerrainIcon
} from '@mui/icons-material';
import { irrigationAPI, sensorsAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import Layout from '../components/Layout';
import axios from "axios";
const IrrigationControl = () => {
    const { showError, showSuccess, showInfo } = useNotification();
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeIrrigation, setActiveIrrigation] = useState(null);
    const [history, setHistory] = useState([]);
    const [recommendation, setRecommendation] = useState(null);
    const [latestMoisture, setLatestMoisture] = useState(null);
    const [latestTemp, setLatestTemp] = useState(null);
    const [latestHumidity, setLatestHumidity] = useState(null);
    const [latestWaterLevel, setLatestWaterLevel] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newSchedule, setNewSchedule] = useState({
        startTime: '06:00',
        days: ['Monday', 'Wednesday', 'Friday'],
        duration: 15,
        smartConditions: {
            skipIfRaining: true,
            moistureThreshold: 60,
            preventLaharRisk: true
        }
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [statusRes, historyRes, recRes, sensorRes, schedulesRes] = await Promise.all([
                irrigationAPI.getStatus(),
                irrigationAPI.getLogs({ limit: 10 }),
                irrigationAPI.getRecommendation(),
                sensorsAPI.getLatest(),
                irrigationAPI.getSchedules()
            ]);

            setActiveIrrigation(statusRes.data.irrigation);
            setHistory(historyRes.data.logs);
            setRecommendation(recRes.data.recommendation);
            setLatestMoisture(sensorRes.data?.data?.soilMoisture);
            setLatestTemp(sensorRes.data?.data?.temperature);
            setLatestHumidity(sensorRes.data?.data?.humidity);
            setLatestWaterLevel(sensorRes.data?.data?.waterTankLevel);
            setSchedules(schedulesRes.data.schedules);
        } catch (error) {
            console.error('Error loading irrigation data:', error);
            showError('Failed to synchronize hydration controllers');
        } finally {
            setLoading(false);
        }
    };

    const handleScheduleToggle = async (id, isEnabled) => {
        try {
            await irrigationAPI.updateSchedule(id, { isEnabled: !isEnabled });
            showSuccess('Schedule visibility status synchronized');
            loadData();
        } catch (error) {
            showError('Configuration propagation failed');
        }
    };

    const handleDeleteSchedule = async (id) => {
        try {
            await irrigationAPI.deleteSchedule(id);
            showSuccess('Schedule node removed from registry');
            loadData();
        } catch (error) {
            showError('Deletion sequence failed');
        }
    };

    const handleAddSchedule = async () => {
        try {
            await irrigationAPI.createSchedule(newSchedule);
            showSuccess('New hydraulic plan synchronized');
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            showError('Synchronization of new plan failed');
        }
    };

    const handleStart = async () => {

        setActionLoading(true);

        try {

            // Create record in irrigationlogs collection through existing API
            const logRes = await irrigationAPI.start({ reason: 'user' });

            showSuccess("Valves Activated");

            setActiveIrrigation({ status: "ON", _id: logRes.data?.irrigationId });

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
            
            // Stop the log record
            if (activeIrrigation && activeIrrigation._id) {
                await irrigationAPI.stop(activeIrrigation._id);
            }

            // Update UI
            showSuccess("Valves Deactivated");

            setActiveIrrigation(null);

        } catch (error) {

            console.error(error);
            showError("Failed to turn OFF pump");

        } finally {

            setActionLoading(false);

        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <Layout>
                <Box display="flex" justifyContent="center" py={12}>
                    <CircularProgress sx={{ color: '#00d4ff' }} />
                </Box>
            </Layout>
        );
    }

    return (
        <Layout>
            <Box sx={{ mb: 4, animation: 'fadeInUp 0.6s ease-out' }}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    Hydraulic <span className="gradient-text">Interface</span>
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Manual override and automated hydration logic for sloping terrain nodes.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Control Panel */}
                <Grid item xs={12} md={6} sx={{ animation: 'fadeInUp 0.8s ease-out' }}>
                    <Card className="glass-card" sx={{ height: '100%' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box display="flex" alignItems="center" gap={2} mb={4}>
                                <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(0, 212, 255, 0.1)', color: '#00d4ff', display: 'flex' }}>
                                    <WaterDropIcon sx={{ fontSize: 32 }} />
                                </Box>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Hydraulic Actuators</Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.5, textTransform: 'uppercase', fontWeight: 800 }}>Primary Field Node: Field-1</Typography>
                                </Box>
                            </Box>

                            <Box sx={{ p: 3, borderRadius: 4, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', mb: 4 }}>
                                <Box display="flex" justifyContent="space-between" mb={2}>
                                    <Typography variant="body2" sx={{ fontWeight: 700, opacity: 0.7 }}>Network Status</Typography>
                                    <Chip
                                        label={activeIrrigation ? 'STREAMING' : 'IDLE'}
                                        size="small"
                                        sx={{
                                            fontWeight: 800,
                                            background: activeIrrigation ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255,255,255,0.05)',
                                            color: activeIrrigation ? '#00ff88' : 'rgba(255,255,255,0.4)',
                                            border: `1px solid ${activeIrrigation ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255,255,255,0.1)'}`
                                        }}
                                    />
                                </Box>
                                <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
                                    {activeIrrigation ? 'Valves Activated' : 'Valves Deactivated'}
                                </Typography>
                                <Box display="flex" gap={2}>
                                    {!activeIrrigation ? (
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            size="large"
                                            startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : <StartIcon />}
                                            onClick={handleStart}
                                            disabled={actionLoading}
                                            sx={{ py: 2 }}
                                        >
                                            Initiate Flow
                                        </Button>
                                    ) : (
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            color="error"
                                            size="large"
                                            startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : <StopIcon />}
                                            onClick={handleStop}
                                            disabled={actionLoading}
                                            sx={{ py: 2, background: '#ff3366', '&:hover': { background: '#d62d58' } }}
                                        >
                                            Terminate Flow
                                        </Button>
                                    )}
                                </Box>
                            </Box>

                            <Box display="flex" gap={3} flexWrap="wrap">
                                <Box>
                                    <Typography variant="caption" sx={{ opacity: 0.5, fontWeight: 800, display: 'block', mb: 0.5 }}>SOIL MOISTURE</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{(latestMoisture !== undefined && latestMoisture !== null) ? `${latestMoisture}%` : 'N/A'}</Typography>
                                </Box>
                                <Divider orientation="vertical" flexItem sx={{ opacity: 0.1 }} />
                                <Box>
                                    <Typography variant="caption" sx={{ opacity: 0.5, fontWeight: 800, display: 'block', mb: 0.5 }}>TEMPERATURE</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{(latestTemp !== undefined && latestTemp !== null) ? `${latestTemp.toFixed(1)}°C` : 'N/A'}</Typography>
                                </Box>
                                <Divider orientation="vertical" flexItem sx={{ opacity: 0.1 }} />
                                <Box>
                                    <Typography variant="caption" sx={{ opacity: 0.5, fontWeight: 800, display: 'block', mb: 0.5 }}>HUMIDITY</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{(latestHumidity !== undefined && latestHumidity !== null)  ? `${latestHumidity}%` : 'N/A'}</Typography>
                                </Box>
                                <Divider orientation="vertical" flexItem sx={{ opacity: 0.1 }} />
                                <Box>
                                    <Typography variant="caption" sx={{ opacity: 0.5, fontWeight: 800, display: 'block', mb: 0.5 }}>WATER LEVEL</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{(latestWaterLevel !== undefined && latestWaterLevel !== null)  ? `${latestWaterLevel}%` : 'N/A'}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* AI Recommendation Panel */}
                <Grid item xs={12} md={6} sx={{ animation: 'fadeInUp 1s ease-out' }}>
                    <Card className="glass-card" sx={{ height: '100%', position: 'relative' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box display="flex" alignItems="center" gap={2} mb={4}>
                                <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(179, 136, 255, 0.1)', color: '#b388ff', display: 'flex' }}>
                                    <ScienceIcon sx={{ fontSize: 32 }} />
                                </Box>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Decision Intelligence</Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.5, textTransform: 'uppercase', fontWeight: 800 }}>Algorithmic Analysis of Sensor Matrix</Typography>
                                </Box>
                            </Box>

                            {recommendation ? (
                                <Box>
                                    <Box sx={{ p: 3, borderRadius: 3, background: recommendation.shouldIrrigate ? 'rgba(0, 212, 255, 0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${recommendation.shouldIrrigate ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255,255,255,0.1)'}`, mb: 4 }}>
                                        <Typography variant="body1" sx={{ fontWeight: 700, mb: 1, color: recommendation.shouldIrrigate ? '#00d4ff' : (recommendation.alert || recommendation.reason.includes('No sensor data') ? '#ff3366' : 'white') }}>
                                            {recommendation.shouldIrrigate 
                                                ? 'Hydration Recommended' 
                                                : (recommendation.alert === 'CRITICAL_LOW_WATER' 
                                                    ? 'Operation Halted: Low Water Resource' 
                                                    : (recommendation.reason.includes('No sensor data') 
                                                        ? 'System Offline' 
                                                        : 'Optimal Moisture Detected'))}
                                        </Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                            {recommendation.reason}. {recommendation.estimatedDuration ? `Calculated cycle: ${recommendation.estimatedDuration} minutes.` : ''}
                                        </Typography>
                                    </Box>

                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>Hydraulic Schedule Logic</Typography>
                                    <Box display="flex" flexDirection="column" gap={2}>
                                        {[
                                            { time: '06:00 AM', action: 'Dawn Hydration Cycle', status: 'Scheduled' },
                                            { time: '06:00 PM', action: 'Sunset Optimization', status: 'Scheduled' }
                                        ].map((item, i) => (
                                            <Box key={i} display="flex" justifyContent="space-between" alignItems="center" sx={{ p: 2, background: 'rgba(255,255,255,0.01)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.03)' }}>
                                                <Box display="flex" alignItems="center" gap={2}>
                                                    <ScheduleIcon sx={{ fontSize: 18, opacity: 0.3 }} />
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.time}</Typography>
                                                        <Typography variant="caption" sx={{ opacity: 0.5 }}>{item.action}</Typography>
                                                    </Box>
                                                </Box>
                                                <Chip label={item.status} size="small" sx={{ fontSize: '0.6rem', fontWeight: 800, background: 'rgba(255,255,255,0.05)' }} />
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            ) : (
                                <Box display="flex" justifyContent="center" py={4}>
                                    <CircularProgress size={24} sx={{ color: '#b388ff' }} />
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Smart Planning Section */}
                <Grid item xs={12} sx={{ animation: 'fadeInUp 1.1s ease-out', mb: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} mt={1}>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>Smart Planning <span className="gradient-text">Automation</span></Typography>
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={() => setIsModalOpen(true)}
                            sx={{ border: '1px solid rgba(0, 212, 255, 0.3)', color: '#00d4ff' }}
                        >
                            New Plan
                        </Button>
                    </Box>
                    <Grid container spacing={2}>
                        {schedules.length === 0 ? (
                            <Grid item xs={12}>
                                <Card className="glass-card" sx={{ borderStyle: 'dashed', opacity: 0.6 }}>
                                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                        <Typography variant="body2">No automated plans detected in your sector logic.</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ) : (
                            schedules.map((schedule) => (
                                <Grid item xs={12} md={4} key={schedule._id}>
                                    <Card className="glass-card" sx={{ opacity: schedule.isEnabled ? 1 : 0.5 }}>
                                        <CardContent>
                                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                                <Box>
                                                    <Typography variant="h5" sx={{ fontWeight: 800 }}>{schedule.startTime}</Typography>
                                                    <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700 }}>{schedule.days.join(', ')}</Typography>
                                                </Box>
                                                <Switch
                                                    checked={schedule.isEnabled}
                                                    onChange={() => handleScheduleToggle(schedule._id, schedule.isEnabled)}
                                                    size="small"
                                                />
                                            </Box>
                                            <Divider sx={{ my: 1.5, opacity: 0.05 }} />
                                            <Box display="flex" gap={1} mb={2}>
                                                <Tooltip title="Rain Skip Active">
                                                    <RainIcon sx={{ fontSize: 18, color: schedule.smartConditions.skipIfRaining ? '#00d4ff' : 'rgba(255,255,255,0.1)' }} />
                                                </Tooltip>
                                                <Tooltip title="Terrain Risk Guard">
                                                    <TerrainIcon sx={{ fontSize: 18, color: schedule.smartConditions.preventLaharRisk ? '#00ff88' : 'rgba(255,255,255,0.1)' }} />
                                                </Tooltip>
                                            </Box>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Typography variant="caption" sx={{ fontWeight: 800 }}>{schedule.duration} min cycle</Typography>
                                                <IconButton size="small" onClick={() => handleDeleteSchedule(schedule._id)} sx={{ color: 'rgba(255,255,255,0.2)', '&:hover': { color: '#ff3366' } }}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))
                        )}
                    </Grid>
                </Grid>

                {/* Operational History */}
                <Grid item xs={12} sx={{ animation: 'fadeInUp 1.2s ease-out' }}>
                    <Card className="glass-card">
                        <CardContent sx={{ p: 4 }}>
                            <Box display="flex" alignItems="center" gap={2} mb={4}>
                                <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255, 255, 255, 0.05)', color: 'white', display: 'flex' }}>
                                    <HistoryIcon sx={{ fontSize: 32 }} />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>Deployment Log History</Typography>
                            </Box>

                            <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent' }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ background: 'rgba(255,255,255,0.02)', fontWeight: 800, opacity: 0.5 }}>TIMESTAMP</TableCell>
                                            <TableCell sx={{ background: 'rgba(255,255,255,0.02)', fontWeight: 800, opacity: 0.5 }}>TYPE</TableCell>
                                            <TableCell sx={{ background: 'rgba(255,255,255,0.02)', fontWeight: 800, opacity: 0.5 }}>REASON</TableCell>
                                            <TableCell sx={{ background: 'rgba(255,255,255,0.02)', fontWeight: 800, opacity: 0.5 }}>METRICS</TableCell>
                                            <TableCell sx={{ background: 'rgba(255,255,255,0.02)', fontWeight: 800, opacity: 0.5 }}>STATUS</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {history.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center" sx={{ py: 4, opacity: 0.5 }}>
                                                    No deployment logs detected in current sector.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            history.map((log) => (
                                                <TableRow key={log._id} sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                                                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 600 }}>
                                                        {formatDate(log.startTime)}
                                                    </TableCell>
                                                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <Chip
                                                            label={log.triggerType.toUpperCase()}
                                                            size="small"
                                                            sx={{
                                                                fontSize: '0.65rem',
                                                                fontWeight: 800,
                                                                background: log.triggerType === 'Manual' ? 'rgba(102, 126, 234, 0.1)' : 'rgba(0, 255, 136, 0.1)',
                                                                color: log.triggerType === 'Manual' ? '#667eea' : '#00ff88'
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', opacity: 0.7 }}>
                                                        {log.triggerReason}
                                                    </TableCell>
                                                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{log.waterVolume || 0}L distributed</Typography>
                                                        <Typography variant="caption" sx={{ opacity: 0.5 }}>{log.duration || 0} min cycle</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: log.status === 'Completed' ? '#00ff88' : '#ffb800' }} />
                                                            <Typography variant="caption" sx={{ fontWeight: 800 }}>{log.status.toUpperCase()}</Typography>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Add Schedule Modal */}
            <Dialog
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                PaperProps={{
                    sx: {
                        background: 'rgba(15, 15, 35, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white',
                        maxWidth: 500
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>Hydraulic Control <span className="gradient-text">Planner</span></DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', gap: 2, mb: 3, mt: 1 }}>
                        <TextField
                            fullWidth
                            label="Start Time"
                            type="time"
                            value={newSchedule.startTime}
                            onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            fullWidth
                            label="Cycle Duration (Min)"
                            type="number"
                            value={newSchedule.duration}
                            onChange={(e) => setNewSchedule({ ...newSchedule, duration: parseInt(e.target.value) })}
                        />
                    </Box>

                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, opacity: 0.7 }}>SELECT OPERATION DAYS</Typography>
                    <ToggleButtonGroup
                        fullWidth
                        value={newSchedule.days}
                        onChange={(e, val) => setNewSchedule({ ...newSchedule, days: val })}
                        sx={{ mb: 4, flexWrap: 'wrap', gap: 1, '& .MuiToggleButton-root': { border: '1px solid rgba(255,255,255,0.1) !important', color: 'white', borderRadius: '8px !important' } }}
                    >
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                            <ToggleButton key={day} value={day} sx={{ px: 1.5 }}>{day.substring(0, 3)}</ToggleButton>
                        ))}
                    </ToggleButtonGroup>

                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, opacity: 0.7 }}>INTELLECTUAL OVERRIDES</Typography>
                    <FormGroup>
                        <FormControlLabel
                            control={<Checkbox checked={newSchedule.smartConditions.skipIfRaining} onChange={(e) => setNewSchedule({ ...newSchedule, smartConditions: { ...newSchedule.smartConditions, skipIfRaining: e.target.checked } })} />}
                            label={<Typography variant="body2">Automatic Precipitation Skip</Typography>}
                        />
                        <FormControlLabel
                            control={<Checkbox checked={newSchedule.smartConditions.preventLaharRisk} onChange={(e) => setNewSchedule({ ...newSchedule, smartConditions: { ...newSchedule.smartConditions, preventLaharRisk: e.target.checked } })} />}
                            label={<Typography variant="body2">Terrain Stability Guard (Stop if risk is High)</Typography>}
                        />
                    </FormGroup>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setIsModalOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)' }}>Abort</Button>
                    <Button variant="contained" onClick={handleAddSchedule} sx={{ fontWeight: 800 }}>Commit Plan</Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
};

export default IrrigationControl;
