import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    TextField,
    InputAdornment,
    Chip,
    Button,
    IconButton,
    Collapse,
    Divider,
    Fade
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterListIcon,
    Agriculture as AgricultureIcon,
    WaterDrop as WaterDropIcon,
    Thermostat as ThermostatIcon,
    Opacity as OpacityIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Science as ScienceIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CropDatabase = () => {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [category, setCategory] = useState('All');

    useEffect(() => {
        fetchCrops();
    }, []);

    const fetchCrops = async () => {
        try {
            const response = await axios.get(`${API_URL}/crops`);
            setCrops(response.data.crops || []);
        } catch (error) {
            console.error('Error fetching crops:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExpandAction = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const filteredCrops = crops.filter(crop => {
        const matchesSearch = crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            crop.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = category === 'All' || crop.category === category;
        return matchesSearch && matchesCategory;
    });

    const categories = ['All', ...new Set(crops.map(c => c.category))];

    return (
        <Layout>
            <Box className="animate-fade-in" sx={{ p: { xs: 2, md: 4 } }}>
                <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2 }}>
                    <Box>
                        <Typography variant="h4" className="gradient-text" fontWeight="800" gutterBottom>
                            Botanical Logic Repository
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Access precision parameters and climate resilience data for hill-optimized crops.
                        </Typography>
                    </Box>
                </Box>

                <Grid container spacing={3} mb={4}>
                    <Grid item xs={12} md={8}>
                        <TextField
                            fullWidth
                            placeholder="Identify crop strain or category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="glass-card"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: 'primary.main' }} />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: '15px' }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
                            {categories.map((cat) => (
                                <Chip
                                    key={cat}
                                    label={cat}
                                    onClick={() => setCategory(cat)}
                                    color={category === cat ? 'primary' : 'default'}
                                    variant={category === cat ? 'filled' : 'outlined'}
                                    sx={{
                                        backdropFilter: 'blur(10px)',
                                        background: category === cat ? '' : 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        fontWeight: 600
                                    }}
                                />
                            ))}
                        </Box>
                    </Grid>
                </Grid>

                <Grid container spacing={3}>
                    {filteredCrops.map((crop, index) => (
                        <Grid item xs={12} sm={6} md={4} key={crop._id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                            <Card className="glass-card hover-lift" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{
                                    height: 140,
                                    position: 'relative',
                                    background: `linear-gradient(135deg, rgba(0,212,255,0.1) 0%, rgba(102,126,234,0.1) 100%)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden'
                                }}>
                                    <AgricultureIcon sx={{ fontSize: 60, opacity: 0.2, position: 'absolute' }} />
                                    <Box sx={{ position: 'relative', textAlign: 'center', p: 2 }}>
                                        <Typography variant="h5" fontWeight="700" color="primary.light">
                                            {crop.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1.5 }}>
                                            {crop.scientificName || 'Botanical Entity'}
                                        </Typography>
                                    </Box>
                                </Box>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Chip
                                            label={crop.category}
                                            size="small"
                                            sx={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                                        />
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <WaterDropIcon fontSize="small" color="primary" />
                                            <Typography variant="body2" fontWeight="600">
                                                {crop.optimalSoilMoisture}%
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {crop.description || 'Precision-monitored crop with optimized irrigation thresholds for sloping terrains.'}
                                    </Typography>

                                    <Divider sx={{ my: 2, opacity: 0.1 }} />

                                    <Box sx={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">TEMP</Typography>
                                            <Typography variant="body2" fontWeight="700">{crop.optimalTemp?.min || 15}°-{crop.optimalTemp?.max || 30}°</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">GROWTH</Typography>
                                            <Typography variant="body2" fontWeight="700">{crop.growthDuration || 90} DAYS</Typography>
                                        </Box>
                                        <Box>
                                            <IconButton size="small" onClick={() => handleExpandAction(crop._id)} color="primary">
                                                {expandedId === crop._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                            </IconButton>
                                        </Box>
                                    </Box>

                                    <Collapse in={expandedId === crop._id} timeout="auto" unmountOnExit>
                                        <Box sx={{ mt: 2, p: 2, borderRadius: 2, background: 'rgba(255,255,255,0.02)' }}>
                                            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <ScienceIcon fontSize="small" /> Logical Thresholds
                                            </Typography>
                                            <Grid container spacing={1}>
                                                <Grid item xs={6}>
                                                    <Typography variant="caption" color="text.secondary">Humidity</Typography>
                                                    <Typography variant="body2">{crop.optimalHumidity?.min || 40}% - {crop.optimalHumidity?.max || 70}%</Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="caption" color="text.secondary">Sunlight</Typography>
                                                    <Typography variant="body2">{crop.sunlightRequirement || 'Full Sun'}</Typography>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Collapse>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {filteredCrops.length === 0 && !loading && (
                    <Box sx={{ textAlign: 'center', py: 10 }}>
                        <Typography variant="h6" color="text.secondary">
                            No botanical nodes match your search terminology.
                        </Typography>
                    </Box>
                )}
            </Box>
        </Layout>
    );
};

export default CropDatabase;
