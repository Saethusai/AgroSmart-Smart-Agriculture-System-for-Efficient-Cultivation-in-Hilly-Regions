import { createContext, useContext, useState, useEffect } from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';
import socketService from '../services/socket';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within NotificationProvider');
    }
    return context;
};

function SlideTransition(props) {
    return <Slide {...props} direction="down" />;
}

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success', // 'success', 'error', 'warning', 'info'
        duration: 4000
    });

    useEffect(() => {
        // Listen for system broadcasts
        const handleBroadcast = (data) => {
            showNotification(data.message, data.severity || 'info', 10000);
        };

        // Listen for maintenance updates
        const handleMaintenance = (data) => {
            const message = data.enabled ?
                '🚧 SYSTEM MAINTENANCE: The system is now in read-only mode for scheduled maintenance.' :
                '✅ MAINTENANCE COMPLETE: System services have been fully restored.';
            showNotification(message, data.enabled ? 'warning' : 'success', 15000);
        };

        socketService.on('system_broadcast', handleBroadcast);
        socketService.on('maintenance_update', handleMaintenance);

        return () => {
            socketService.off('system_broadcast', handleBroadcast);
            socketService.off('maintenance_update', handleMaintenance);
        };
    }, []);

    const showNotification = (message, severity = 'success', duration = 4000) => {
        setNotification({
            open: true,
            message,
            severity,
            duration
        });
    };

    const showSuccess = (message) => showNotification(message, 'success');
    const showError = (message) => showNotification(message, 'error');
    const showWarning = (message) => showNotification(message, 'warning');
    const showInfo = (message) => showNotification(message, 'info');

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setNotification(prev => ({ ...prev, open: false }));
    };

    return (
        <NotificationContext.Provider
            value={{
                showNotification,
                showSuccess,
                showError,
                showWarning,
                showInfo
            }}
        >
            {children}
            <Snackbar
                open={notification.open}
                autoHideDuration={notification.duration}
                onClose={handleClose}
                TransitionComponent={SlideTransition}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{
                    mt: 8,
                    '& .MuiAlert-root': {
                        backdropFilter: 'blur(20px)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                    }
                }}
            >
                <Alert
                    onClose={handleClose}
                    severity={notification.severity}
                    variant="filled"
                    sx={{
                        width: '100%',
                        fontWeight: 600,
                        fontSize: '0.95rem'
                    }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </NotificationContext.Provider>
    );
};
