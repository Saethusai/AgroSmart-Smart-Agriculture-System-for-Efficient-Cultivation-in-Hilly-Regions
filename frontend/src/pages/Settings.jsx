import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Switch,
    FormControlLabel,
    Divider,
    Slider,
    CircularProgress,
    Avatar,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    Settings as SettingsIcon,
    Person as PersonIcon,
    Notifications as NotificationsIcon,
    Security as SecurityIcon,
    Save as SaveIcon,
    Agriculture as AgricultureIcon,
    Language as LanguageIcon
} from '@mui/icons-material';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Layout from '../components/Layout';

const Settings = () => {
    const { t, i18n } = useTranslation();
    const { user, updateUser } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        farmName: user?.farmDetails?.farmName || '',
        cropType: user?.farmDetails?.cropType || '',
        slopeAngle: user?.farmDetails?.slopeAngle || 0,
        soilType: user?.farmDetails?.soilType || 'Loamy',
        smsAlerts: user?.preferences?.smsAlerts ?? true,
        emailAlerts: user?.preferences?.emailAlerts ?? true,
        lowMoisture: user?.preferences?.alertThresholds?.lowMoisture || 30,
        lowWaterTank: user?.preferences?.alertThresholds?.lowWaterTank || 20
    });

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSliderChange = (name) => (e, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updateData = {
                name: formData.name,
                phone: formData.phone,
                farmDetails: {
                    farmName: formData.farmName,
                    cropType: formData.cropType,
                    slopeAngle: formData.slopeAngle,
                    soilType: formData.soilType
                },
                preferences: {
                    smsAlerts: formData.smsAlerts,
                    emailAlerts: formData.emailAlerts,
                    alertThresholds: {
                        lowMoisture: formData.lowMoisture,
                        lowWaterTank: formData.lowWaterTank
                    }
                }
            };

            const response = await authAPI.updateProfile(updateData);
            updateUser(response.data.user);
            showSuccess(t('settings.successUpdate'));
        } catch (error) {
            console.error('Update settings error:', error);
            showError(t('settings.errorUpdate'));
        } finally {
            setLoading(false);
        }
    };

    const handleLanguageChange = (event) => {
        i18n.changeLanguage(event.target.value);
    };

    return (
        <Layout>
            <Box sx={{ mb: 4, animation: 'fadeInUp 0.6s ease-out' }}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    {t('settings.title1')} <span className="gradient-text">{t('settings.title2')}</span>
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    {t('settings.subtitle')}
                </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
                <Grid container spacing={4}>
                    {/* Profile Section */}
                    <Grid item xs={12} md={7} sx={{ animation: 'fadeInUp 0.8s ease-out' }}>
                        <Card className="glass-card">
                            <CardContent sx={{ p: 4 }}>
                                <Box display="flex" alignItems="center" gap={2} mb={4}>
                                    <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(0, 212, 255, 0.1)', color: '#00d4ff', display: 'flex' }}>
                                        <PersonIcon />
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>{t('settings.operatorIdentity')}</Typography>
                                </Box>

                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label={t('settings.fullName')}
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label={t('settings.phone')}
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label={t('settings.email')}
                                            value={user?.email}
                                            disabled
                                            helperText={t('settings.emailHelper')}
                                        />
                                    </Grid>
                                </Grid>

                                <Divider sx={{ my: 5, opacity: 0.1 }} />

                                <Box display="flex" alignItems="center" gap={2} mb={4}>
                                    <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88', display: 'flex' }}>
                                        <AgricultureIcon />
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>{t('settings.siteDesignation')}</Typography>
                                </Box>

                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label={t('settings.farmSectorName')}
                                            name="farmName"
                                            value={formData.farmName}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label={t('settings.primaryCrop')}
                                            name="cropType"
                                            value={formData.cropType}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            select
                                            fullWidth
                                            label={t('settings.soilClassification')}
                                            name="soilType"
                                            value={formData.soilType}
                                            onChange={handleChange}
                                        >
                                            {['Sandy', 'Loamy', 'Clay', 'Silty', 'Peaty', 'Saline'].map(option => (
                                                <MenuItem key={option} value={option}>{option}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ px: 1 }}>
                                            <Box display="flex" justifyContent="space-between" mb={1}>
                                                <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.6 }}>{t('settings.terrainSlopeAngle')}</Typography>
                                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#00ff88' }}>{formData.slopeAngle}°</Typography>
                                            </Box>
                                            <Slider
                                                value={formData.slopeAngle}
                                                onChange={handleSliderChange('slopeAngle')}
                                                min={0}
                                                max={60}
                                                sx={{ color: '#00ff88' }}
                                            />
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Alerts & Thresholds */}
                    <Grid item xs={12} md={5} sx={{ animation: 'fadeInUp 1s ease-out' }}>
                        <Card className="glass-card" sx={{ mb: 3 }}>
                            <CardContent sx={{ p: 4 }}>
                                <Box display="flex" alignItems="center" gap={2} mb={4}>
                                    <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255, 184, 0, 0.1)', color: '#ffb800', display: 'flex' }}>
                                        <NotificationsIcon />
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>{t('settings.telemetryAlerts')}</Typography>
                                </Box>

                                <Box display="flex" flexDirection="column" gap={2}>
                                    <FormControlLabel
                                        control={<Switch checked={formData.smsAlerts} onChange={handleChange} name="smsAlerts" color="primary" />}
                                        label={<Typography sx={{ fontWeight: 600 }}>{t('settings.smsNotification')}</Typography>}
                                    />
                                    <FormControlLabel
                                        control={<Switch checked={formData.emailAlerts} onChange={handleChange} name="emailAlerts" color="primary" />}
                                        label={<Typography sx={{ fontWeight: 600 }}>{t('settings.emailOperationalLogs')}</Typography>}
                                    />
                                </Box>

                                <Divider sx={{ my: 4, opacity: 0.1 }} />

                                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 3 }}>{t('settings.criticalThresholdLogic')}</Typography>

                                <Box sx={{ mb: 4 }}>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.6 }}>{t('settings.lowMoistureTrigger')}</Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#00d4ff' }}>{formData.lowMoisture}%</Typography>
                                    </Box>
                                    <Slider
                                        value={formData.lowMoisture}
                                        onChange={handleSliderChange('lowMoisture')}
                                        min={10}
                                        max={60}
                                        sx={{ color: '#00d4ff' }}
                                    />
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.6 }}>{t('settings.criticalWaterReserve')}</Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#ff3366' }}>{formData.lowWaterTank}%</Typography>
                                    </Box>
                                    <Slider
                                        value={formData.lowWaterTank}
                                        onChange={handleSliderChange('lowWaterTank')}
                                        min={5}
                                        max={40}
                                        sx={{ color: '#ff3366' }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>

                        <Card className="glass-card" sx={{ mb: 4 }}>
                            <CardContent sx={{ p: 4 }}>
                                <Box display="flex" alignItems="center" gap={2} mb={3}>
                                    <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(102, 126, 234, 0.1)', color: '#667eea', display: 'flex' }}>
                                        <LanguageIcon />
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>{t('settings.language')}</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 3 }}>
                                    {t('settings.selectLanguage')}
                                </Typography>
                                <FormControl fullWidth>
                                    <InputLabel id="language-select-label">{t('settings.language')}</InputLabel>
                                    <Select
                                        labelId="language-select-label"
                                        id="language-select"
                                        value={i18n.language || 'en'}
                                        label={t('settings.language')}
                                        onChange={handleLanguageChange}
                                        sx={{
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'rgba(255,255,255,0.2)'
                                            }
                                        }}
                                    >
                                        <MenuItem value="en">English (Default)</MenuItem>
                                        <MenuItem value="hi">हिंदी (Hindi)</MenuItem>
                                        <MenuItem value="te">తెలుగు (Telugu)</MenuItem>
                                        <MenuItem value="mr">मराठी (Marathi)</MenuItem>
                                        <MenuItem value="bn">বাংলা (Bengali)</MenuItem>
                                    </Select>
                                </FormControl>
                            </CardContent>
                        </Card>

                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                            sx={{ py: 2, fontWeight: 800, fontSize: '1rem' }}
                        >
                            {t('settings.commitUpdates')}
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Layout>
    );
};

export default Settings;
