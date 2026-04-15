import { Card, CardContent, Typography, Box } from '@mui/material';
import { TrendingUp, TrendingDown, Remove } from '@mui/icons-material';

export default function SensorCard({ title, value, unit, icon: Icon, trend, color = 'primary' }) {
    const getTrendIcon = () => {
        if (!trend) return null;
        if (trend > 0) return <TrendingUp fontSize="small" color="success" />;
        if (trend < 0) return <TrendingDown fontSize="small" color="error" />;
        return <Remove fontSize="small" />;
    };

    return (
        <Card
            className="fade-in"
            sx={{
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
                }
            }}
        >
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {title}
                    </Typography>
                    {Icon && (
                        <Box
                            sx={{
                                backgroundColor: `${color}.main`,
                                borderRadius: 2,
                                p: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Icon sx={{ color: 'white', fontSize: 24 }} />
                        </Box>
                    )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 700, color: `${color}.main` }}>
                        {value}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        {unit}
                    </Typography>
                </Box>
                {trend !== undefined && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                        {getTrendIcon()}
                        <Typography variant="caption" color="text.secondary">
                            {trend > 0 ? '+' : ''}{trend}% from last hour
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}
