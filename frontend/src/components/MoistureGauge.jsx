import { Box, Typography } from '@mui/material';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function MoistureGauge({ value, optimalMin = 40, optimalMax = 80 }) {
    const getColor = () => {
        if (value < optimalMin) return '#ef4444'; // Red - too dry
        if (value > optimalMax) return '#3b82f6'; // Blue - too wet
        return '#10b981'; // Green - optimal
    };

    const getStatus = () => {
        if (value < optimalMin) return 'Too Dry';
        if (value > optimalMax) return 'Too Wet';
        return 'Optimal';
    };

    return (
        <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ width: 200, height: 200, margin: '0 auto', mb: 2 }}>
                <CircularProgressbar
                    value={value}
                    text={`${value}%`}
                    styles={buildStyles({
                        textSize: '20px',
                        pathColor: getColor(),
                        textColor: getColor(),
                        trailColor: 'rgba(255, 255, 255, 0.1)',
                        pathTransitionDuration: 0.5
                    })}
                />
            </Box>
            <Typography variant="h6" sx={{ color: getColor(), fontWeight: 600 }}>
                {getStatus()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
                Optimal: {optimalMin}% - {optimalMax}%
            </Typography>
        </Box>
    );
}
