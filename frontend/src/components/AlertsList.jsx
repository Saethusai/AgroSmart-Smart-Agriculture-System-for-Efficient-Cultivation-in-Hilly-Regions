import { List, ListItem, ListItemIcon, ListItemText, Paper, Typography, IconButton, Box } from '@mui/material';
import { Warning, Info, CheckCircle, Error, Close } from '@mui/icons-material';

const getAlertIcon = (type) => {
    switch (type) {
        case 'error':
            return <Error color="error" />;
        case 'warning':
            return <Warning color="warning" />;
        case 'success':
            return <CheckCircle color="success" />;
        default:
            return <Info color="info" />;
    }
};

export default function AlertsList({ alerts = [], onDismiss }) {
    if (alerts.length === 0) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">No alerts at this time</Typography>
            </Paper>
        );
    }

    return (
        <List sx={{ width: '100%' }}>
            {alerts.map((alert, index) => (
                <Paper
                    key={index}
                    sx={{
                        mb: 1,
                        transition: 'all 0.2s',
                        '&:hover': {
                            transform: 'translateX(4px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }
                    }}
                >
                    <ListItem
                        secondaryAction={
                            onDismiss && (
                                <IconButton edge="end" onClick={() => onDismiss(index)}>
                                    <Close />
                                </IconButton>
                            )
                        }
                    >
                        <ListItemIcon>
                            {getAlertIcon(alert.type)}
                        </ListItemIcon>
                        <ListItemText
                            primary={alert.title}
                            secondary={
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        {alert.message}
                                    </Typography>
                                    {alert.timestamp && (
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(alert.timestamp).toLocaleString()}
                                        </Typography>
                                    )}
                                </Box>
                            }
                        />
                    </ListItem>
                </Paper>
            ))}
        </List>
    );
}
