import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Chip,
    CircularProgress,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    InputAdornment,
    Tooltip,
    Divider
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Grass as GrassIcon,
    Opacity as WaterIcon,
    Thermostat as TempIcon,
    Terrain as SoilIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    Agriculture as AgricultureIcon,
    Info as InfoIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import { getAllCrops } from '../services/cropService';
import { createCrop, updateCrop, deleteCrop } from '../services/adminService';
import { useNotification } from '../context/NotificationContext';
import Layout from '../components/Layout';

const CropManagement = () => {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedCrop, setSelectedCrop] = useState(null);
    const { showSuccess, showError } = useNotification();
    const [formData, setFormData] = useState({
        name: '',
        category: 'vegetable',
        description: '',
        waterRequirement: { min: 0, max: 0, optimal: 0 },
        soilMoisture: { min: 0, max: 0, optimal: 0 },
        temperature: { min: 0, max: 0, optimal: 0 },
        growingTips: '',
        harvestTime: ''
    });

    useEffect(() => {
        loadCrops();
    }, []);

    const loadCrops = async () => {
        try {
            setLoading(true);
            const data = await getAllCrops();
            setCrops(data.crops);
        } catch (error) {
            console.error('Error loading crops:', error);
            showError('Botanical repository synchronization failed');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (crop = null) => {
        if (crop) {
            setEditMode(true);
            setSelectedCrop(crop);
            setFormData(crop);
        } else {
            setEditMode(false);
            setSelectedCrop(null);
            setFormData({
                name: '',
                category: 'vegetable',
                description: '',
                waterRequirement: { min: 0, max: 0, optimal: 0 },
                soilMoisture: { min: 0, max: 0, optimal: 0 },
                temperature: { min: 0, max: 0, optimal: 0 },
                growingTips: '',
                harvestTime: ''
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditMode(false);
        setSelectedCrop(null);
    };

    const handleSubmit = async () => {
        try {
            if (editMode) {
                await updateCrop(selectedCrop._id, formData);
                showSuccess(`Botanical logic for "${formData.name}" updated`);
            } else {
                await createCrop(formData);
                showSuccess(`New botanical node "${formData.name}" initialized`);
            }
            handleCloseDialog();
            loadCrops();
        } catch (error) {
            console.error('Error saving crop:', error);
            showError('Agricultural logic commit failed');
        }
    };

    const handleDeleteClick = (crop) => {
        setSelectedCrop(crop);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteCrop(selectedCrop._id);
            showSuccess(`Botanical node "${selectedCrop.name}" purged`);
            setDeleteDialogOpen(false);
            setSelectedCrop(null);
            loadCrops();
        } catch (error) {
            console.error('Error deleting crop:', error);
            showError('Node purge operation failed');
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNestedInputChange = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: parseFloat(value) || 0
            }
        }));
    };

    return (
        <Layout>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'fadeInUp 0.6s ease-out' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: 2,
                            background: 'rgba(0, 255, 136, 0.1)',
                            display: 'flex',
                            border: '1px solid rgba(0, 255, 136, 0.2)'
                        }}
                    >
                        <AgricultureIcon sx={{ color: '#00ff88', fontSize: 32 }} />
                    </Box>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                            Agricultural <span className="gradient-text-green">Logic Repository</span>
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            Configure biological parameters and optimization algorithms for hilltop crops.
                        </Typography>
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    className="hover-lift"
                    sx={{
                        background: 'linear-gradient(45deg, #00ff88, #667eea)',
                        fontWeight: 800,
                        px: 3,
                        py: 1.2,
                        borderRadius: 3
                    }}
                >
                    Deploy New Botanical Node
                </Button>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" py={12}>
                    <CircularProgress sx={{ color: '#00ff88' }} />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {crops.map((crop, index) => (
                        <Grid item xs={12} sm={6} md={4} key={crop._id} sx={{ animation: `fadeInUp ${0.8 + (index * 0.1)}s ease-out` }}>
                            <Card className="glass-card hover-lift" sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        p: 1,
                                        background: 'rgba(255,255,255,0.05)',
                                        borderBottomLeftRadius: 12,
                                        zIndex: 2
                                    }}
                                >
                                    <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.1em', opacity: 0.7 }}>
                                        #{crop._id.substring(crop._id.length - 4).toUpperCase()}
                                    </Typography>
                                </Box>
                                <CardContent sx={{ flex: 1, pt: 4 }}>
                                    <Box display="flex" alignItems="center" mb={3}>
                                        <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', mr: 2 }}>
                                            <GrassIcon sx={{ fontSize: 32, color: '#00ff88' }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                                                {crop.name}
                                            </Typography>
                                            <Chip
                                                label={crop.category.toUpperCase()}
                                                size="small"
                                                sx={{
                                                    mt: 0.5,
                                                    height: 18,
                                                    fontSize: '0.6rem',
                                                    fontWeight: 900,
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid rgba(255,255,255,0.1)'
                                                }}
                                            />
                                        </Box>
                                    </Box>

                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 3, minHeight: '3em' }}>
                                        {crop.description}
                                    </Typography>

                                    <Grid container spacing={2}>
                                        {[
                                            { icon: <WaterIcon sx={{ fontSize: 16 }} />, label: 'HYDRATION', value: `${crop.waterRequirement.optimal}mm`, color: '#00d4ff' },
                                            { icon: <SoilIcon sx={{ fontSize: 16 }} />, label: 'SUBSTRATE', value: `${crop.soilMoisture.optimal}%`, color: '#b388ff' },
                                            { icon: <TempIcon sx={{ fontSize: 16 }} />, label: 'THERMAL', value: `${crop.temperature.optimal}°C`, color: '#ffb800' }
                                        ].map((stat, i) => (
                                            <Grid item xs={4} key={i}>
                                                <Box sx={{ p: 1, borderRadius: 2, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                                                    <Box sx={{ color: stat.color, mb: 0.5, display: 'flex', justifyContent: 'center' }}>{stat.icon}</Box>
                                                    <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, fontSize: '0.6rem', opacity: 0.4 }}>{stat.label}</Typography>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{stat.value}</Typography>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </CardContent>
                                <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
                                <CardActions sx={{ px: 2, py: 1.5, justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Tooltip title="Configure Parameters">
                                            <IconButton size="small" onClick={() => handleOpenDialog(crop)} sx={{ color: '#00d4ff', '&:hover': { background: 'rgba(0, 212, 255, 0.1)' } }}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete Node">
                                            <IconButton size="small" onClick={() => handleDeleteClick(crop)} sx={{ color: '#ff3366', '&:hover': { background: 'rgba(255, 51, 102, 0.1)' } }}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                    <Typography variant="caption" sx={{ opacity: 0.3, fontWeight: 700 }}>
                                        LOGIC V1.2
                                    </Typography>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Add/Edit Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        background: 'rgba(15, 25, 40, 0.98)',
                        backdropFilter: 'blur(30px)',
                        border: '1px solid rgba(0, 255, 136, 0.1)',
                        color: 'white',
                        borderRadius: 4
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <InfoIcon sx={{ color: '#00ff88' }} />
                    {editMode ? 'Modify Botanical Node Parameters' : 'Register New Biological Node'}
                </DialogTitle>
                <DialogContent sx={{ mt: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={7}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <TextField
                                    label="Biological Designation (Common Name)"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    fullWidth
                                    required
                                />
                                <FormControl fullWidth>
                                    <InputLabel>Biological Category</InputLabel>
                                    <Select
                                        value={formData.category}
                                        label="Biological Category"
                                        onChange={(e) => handleInputChange('category', e.target.value)}
                                    >
                                        <MenuItem value="vegetable">Vegetable Node</MenuItem>
                                        <MenuItem value="fruit">Pomological Node</MenuItem>
                                        <MenuItem value="grain">Cereal Node</MenuItem>
                                        <MenuItem value="pulse">Legume Node</MenuItem>
                                        <MenuItem value="spice">Aromatic Node</MenuItem>
                                        <MenuItem value="other">Other Node</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField
                                    label="Node Functional Description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    multiline
                                    rows={4}
                                    fullWidth
                                />
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={5}>
                            <Box sx={{ p: 2, borderRadius: 3, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#00ff88', mb: 2, display: 'block' }}>OPERATIONAL THRESHOLDS</Typography>

                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1.5, fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <WaterIcon sx={{ fontSize: 16, color: '#00d4ff' }} /> HYDRATION (MM/WEEK)
                                    </Typography>
                                    <Box display="flex" gap={1}>
                                        <TextField size="small" label="Min" type="number" value={formData.waterRequirement.min} onChange={(e) => handleNestedInputChange('waterRequirement', 'min', e.target.value)} />
                                        <TextField size="small" label="Opt" type="number" value={formData.waterRequirement.optimal} onChange={(e) => handleNestedInputChange('waterRequirement', 'optimal', e.target.value)} />
                                        <TextField size="small" label="Max" type="number" value={formData.waterRequirement.max} onChange={(e) => handleNestedInputChange('waterRequirement', 'max', e.target.value)} />
                                    </Box>
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1.5, fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <SoilIcon sx={{ fontSize: 16, color: '#b388ff' }} /> SUBSTRATE MOISTURE (%)
                                    </Typography>
                                    <Box display="flex" gap={1}>
                                        <TextField size="small" label="Min" type="number" value={formData.soilMoisture.min} onChange={(e) => handleNestedInputChange('soilMoisture', 'min', e.target.value)} />
                                        <TextField size="small" label="Opt" type="number" value={formData.soilMoisture.optimal} onChange={(e) => handleNestedInputChange('soilMoisture', 'optimal', e.target.value)} />
                                        <TextField size="small" label="Max" type="number" value={formData.soilMoisture.max} onChange={(e) => handleNestedInputChange('soilMoisture', 'max', e.target.value)} />
                                    </Box>
                                </Box>

                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 1.5, fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <TempIcon sx={{ fontSize: 16, color: '#ffb800' }} /> THERMAL GRADIENT (°C)
                                    </Typography>
                                    <Box display="flex" gap={1}>
                                        <TextField size="small" label="Min" type="number" value={formData.temperature.min} onChange={(e) => handleNestedInputChange('temperature', 'min', e.target.value)} />
                                        <TextField size="small" label="Opt" type="number" value={formData.temperature.optimal} onChange={(e) => handleNestedInputChange('temperature', 'optimal', e.target.value)} />
                                        <TextField size="small" label="Max" type="number" value={formData.temperature.max} onChange={(e) => handleNestedInputChange('temperature', 'max', e.target.value)} />
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.05)' }} />
                            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <TextField
                                    label="Cultivation Strategy & Technical Directives"
                                    value={formData.growingTips}
                                    onChange={(e) => handleInputChange('growingTips', e.target.value)}
                                    multiline
                                    rows={3}
                                    fullWidth
                                    placeholder="Enter optimized growth algorithms and maintenance directives..."
                                />
                                <TextField
                                    label="Projected Maturation Timeline"
                                    value={formData.harvestTime}
                                    onChange={(e) => handleInputChange('harvestTime', e.target.value)}
                                    fullWidth
                                    placeholder="e.g., 60-70 SOL cycles"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{ color: 'rgba(255,255,255,0.3)' }} />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 4, pt: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <Button onClick={handleCloseDialog} sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, px: 3 }}>
                        Abort Operation
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        startIcon={<SaveIcon />}
                        sx={{
                            background: 'linear-gradient(45deg, #00ff88, #667eea)',
                            fontWeight: 800,
                            px: 4,
                            py: 1.2,
                            borderRadius: 2
                        }}
                    >
                        {editMode ? 'Commit Logical Update' : 'Initialize Node Deployment'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                PaperProps={{
                    sx: {
                        background: 'rgba(20, 20, 45, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 51, 102, 0.2)',
                        color: 'white',
                        borderRadius: 4
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800, color: '#ff3366' }}>Authorize Node Purge</DialogTitle>
                <DialogContent>
                    <Typography sx={{ opacity: 0.8 }}>
                        Are you sure you want to permanently delete the botanical node <strong>{selectedCrop?.name}</strong>?
                        This will terminate all associated optimized cultivation strategies.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: 'white', opacity: 0.5 }}>Abort</Button>
                    <Button onClick={handleDeleteConfirm} sx={{ background: '#ff3366', color: 'white', fontWeight: 800, px: 3, '&:hover': { background: '#d62d58' } }}>Confirm Purge</Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
};

export default CropManagement;

