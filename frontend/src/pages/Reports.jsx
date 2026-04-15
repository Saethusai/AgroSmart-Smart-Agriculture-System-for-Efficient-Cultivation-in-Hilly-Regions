import { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    MenuItem,
    CircularProgress,
    IconButton,
    LinearProgress,
    Tooltip
} from '@mui/material';
import {
    Download as DownloadIcon,
    Assessment as AssessmentIcon,
    CalendarToday as CalendarIcon,
    WaterDrop as WaterDropIcon,
    Opacity as OpacityIcon,
    Warning as WarningIcon,
    CheckBox as CheckBoxIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { reportsAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';

const ReportCard = ({ title, value, icon, color, subtitle }) => (
    <Card component={motion.div} whileHover={{ y: -5 }} className="glass-card">
        <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{
                    p: 1.5,
                    borderRadius: 2,
                    background: `rgba(${color}, 0.1)`,
                    color: `rgb(${color})`,
                    mr: 2,
                    display: 'flex'
                }}>
                    {icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
                    {title}
                </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                {value}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                {subtitle}
            </Typography>
        </CardContent>
    </Card>
);

export default function Reports() {
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [summary, setSummary] = useState(null);
    const [filters, setFilters] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        reportType: 'sensors'
    });

    const { showError, showSuccess } = useNotification();

    const fetchSummary = async () => {
        try {
            setLoading(true);
            const response = await reportsAPI.getSummary({
                startDate: filters.startDate,
                endDate: filters.endDate
            });
            setSummary(response.data);
        } catch (err) {
            showError('Failed to fetch report summary');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, [filters.startDate, filters.endDate]);

    const handleExport = async () => {
        try {
            setExporting(true);
            const response = await reportsAPI.exportData({
                type: filters.reportType,
                startDate: filters.startDate,
                endDate: filters.endDate
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${filters.reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            showSuccess(`${filters.reportType.charAt(0).toUpperCase() + filters.reportType.slice(1)} report exported successfully`);
        } catch (err) {
            showError('Export failed');
        } finally {
            setExporting(false);
        }
    };

    return (
        <Layout>
            <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                            Smart Farm Reports
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.7 }}>
                            Generate and export detailed analytics for your hilly terrain farm.
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            size="small"
                            type="date"
                            label="Start Date"
                            InputLabelProps={{ shrink: true }}
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        />
                        <TextField
                            size="small"
                            type="date"
                            label="End Date"
                            InputLabelProps={{ shrink: true }}
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        />
                    </Box>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <Grid container spacing={3} sx={{ mb: 6 }}>
                            <Grid item xs={12} md={4}>
                                <ReportCard
                                    title="Avg Soil Moisture"
                                    value={`${summary?.averages?.soilMoisture || 0}%`}
                                    icon={<OpacityIcon />}
                                    color="0, 212, 255"
                                    subtitle="Average across selected period"
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <ReportCard
                                    title="Total Water Used"
                                    value={`${summary?.averages?.waterUsed || 0}L`}
                                    icon={<WaterDropIcon />}
                                    color="102, 126, 234"
                                    subtitle={`${summary?.irrigationCount || 0} irrigation sessions`}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <ReportCard
                                    title="Terrain Risk Level"
                                    value={summary?.risk?.level || 'Low'}
                                    icon={<WarningIcon />}
                                    color={summary?.risk?.level === 'Critical' ? '255, 51, 102' : '0, 255, 136'}
                                    subtitle={`${summary?.risk?.score || 0}/100 Risk Score`}
                                />
                            </Grid>
                        </Grid>

                        <Card className="glass-card">
                            <CardContent sx={{ p: 4 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AssessmentIcon color="primary" /> Export Data For External Analysis
                                </Typography>
                                <Grid container spacing={3} alignItems="flex-end">
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            select
                                            fullWidth
                                            label="Select Data Source"
                                            value={filters.reportType}
                                            onChange={(e) => setFilters({ ...filters, reportType: e.target.value })}
                                        >
                                            <MenuItem value="sensors">Sensor Readings (Moisture, Temp, Humidity, Rain)</MenuItem>
                                            <MenuItem value="irrigation">Irrigation History (Duration, Volume, Reason)</MenuItem>
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            size="large"
                                            startIcon={exporting ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                                            onClick={handleExport}
                                            disabled={exporting}
                                            sx={{ py: 1.8 }}
                                        >
                                            {exporting ? 'Generating Report...' : 'Download CSV Report'}
                                        </Button>
                                    </Grid>
                                </Grid>
                                <Box sx={{ mt: 4, p: 2, borderRadius: 2, background: 'rgba(0,0,0,0.2)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
                                        Note: PDF reports with graphical visualizations are coming soon in the next update.
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </>
                )}
            </Box>
        </Layout>
    );
}
