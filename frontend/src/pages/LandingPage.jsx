import React from 'react';
import { Box, Typography, Button, Container, Grid, Paper, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import InsightsIcon from '@mui/icons-material/Insights';
import SecurityIcon from '@mui/icons-material/Security';

const LandingPage = () => {
    const navigate = useNavigate();

    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const stagger = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const features = [
        {
            icon: <WaterDropIcon sx={{ fontSize: 40, color: '#00d4ff' }} />,
            title: 'Precision Irrigation',
            description: 'Intelligent water delivery based on real-time soil moisture and crop needs.'
        },
        {
            icon: <AgricultureIcon sx={{ fontSize: 40, color: '#00ff88' }} />,
            title: 'Crop Intelligence',
            description: 'Advanced monitoring and growth tracking for optimized hilly region farming.'
        },
        {
            icon: <InsightsIcon sx={{ fontSize: 40, color: '#ffb800' }} />,
            title: 'Data Analytics',
            description: 'Comprehensive insights into water usage, weather patterns, and crop health.'
        },
        {
            icon: <SecurityIcon sx={{ fontSize: 40, color: '#ff3366' }} />,
            title: 'Reliable Control',
            description: 'Automated and manual irrigation control with fail-safe remote monitoring.'
        }
    ];

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1428 100%)',
            color: 'white',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Animated Background Elements */}
            <Box
                component={motion.div}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 8, repeat: Infinity }}
                sx={{
                    position: 'absolute',
                    top: '-10%',
                    left: '-10%',
                    width: '40%',
                    height: '40%',
                    background: 'radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%)',
                    zIndex: 0
                }}
            />
            <Box
                component={motion.div}
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ duration: 10, repeat: Infinity, delay: 1 }}
                sx={{
                    position: 'absolute',
                    bottom: '-10%',
                    right: '-10%',
                    width: '50%',
                    height: '50%',
                    background: 'radial-gradient(circle, rgba(255, 107, 157, 0.1) 0%, transparent 70%)',
                    zIndex: 0
                }}
            />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pt: { xs: 8, md: 15 } }}>
                {/* Hero Section */}
                <Box
                    component={motion.div}
                    initial="initial"
                    animate="animate"
                    variants={stagger}
                    sx={{ textAlign: 'center', mb: 10 }}
                >
                    <motion.div variants={fadeIn}>
                        <Typography
                            variant="h1"
                            sx={{
                                fontSize: { xs: '3rem', md: '5rem' },
                                fontWeight: 800,
                                mb: 2,
                                background: 'linear-gradient(135deg, #fff 0%, #00d4ff 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '-0.03em'
                            }}
                        >
                            AgroSmart
                        </Typography>
                    </motion.div>

                    <motion.div variants={fadeIn}>
                        <Typography
                            variant="h2"
                            sx={{
                                fontSize: { xs: '1.2rem', md: '1.8rem' },
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontWeight: 400,
                                mb: 6,
                                maxWidth: '800px',
                                margin: '0 auto 48px'
                            }}
                        >
                            Revolutionizing Hilly Region Agriculture with Smart Irrigation and Real-time Telemetry.
                        </Typography>
                    </motion.div>

                    <motion.div variants={fadeIn}>
                        <Stack direction="row" spacing={3} justifyContent="center">
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/login')}
                                sx={{
                                    py: 2,
                                    px: 6,
                                    fontSize: '1.1rem',
                                    boxShadow: '0 8px 32px rgba(0, 212, 255, 0.3)'
                                }}
                            >
                                Get Started
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                sx={{
                                    py: 2,
                                    px: 6,
                                    fontSize: '1.1rem',
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                    color: 'white',
                                    '&:hover': {
                                        borderColor: '#00d4ff',
                                        background: 'rgba(0, 212, 255, 0.05)'
                                    }
                                }}
                            >
                                Learn More
                            </Button>
                        </Stack>
                    </motion.div>
                </Box>

                {/* Features Grid */}
                <Grid
                    container
                    spacing={4}
                    component={motion.div}
                    variants={stagger}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    sx={{ mb: 12 }}
                >
                    {features.map((feature, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Paper
                                component={motion.div}
                                variants={fadeIn}
                                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                                sx={{
                                    p: 4,
                                    height: '100%',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: 4,
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 2
                                }}
                            >
                                {feature.icon}
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    {feature.title}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                    {feature.description}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>

                {/* Footer simple */}
                <Box
                    component={motion.div}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    sx={{ py: 6, textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
                >
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                        © 2024 AgroSmart - Precision Agriculture Solved
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default LandingPage;
