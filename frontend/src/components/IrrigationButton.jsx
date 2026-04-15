import { useState } from 'react';
import { Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import { WaterDrop, Stop } from '@mui/icons-material';

export default function IrrigationButton({ isActive, onStart, onStop, loading = false }) {
    const [confirmDialog, setConfirmDialog] = useState(false);
    const [action, setAction] = useState(null);

    const handleClick = () => {
        setAction(isActive ? 'stop' : 'start');
        setConfirmDialog(true);
    };

    const handleConfirm = async () => {
        if (action === 'start') {
            await onStart();
        } else {
            await onStop();
        }
        setConfirmDialog(false);
    };

    const handleCancel = () => {
        setConfirmDialog(false);
        setAction(null);
    };

    return (
        <>
            <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleClick}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : (isActive ? <Stop /> : <WaterDrop />)}
                sx={{
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    backgroundColor: isActive ? 'error.main' : 'primary.main',
                    '&:hover': {
                        backgroundColor: isActive ? 'error.dark' : 'primary.dark',
                        transform: 'scale(1.02)'
                    },
                    transition: 'all 0.2s'
                }}
            >
                {loading ? 'Processing...' : (isActive ? 'Stop Irrigation' : 'Start Irrigation')}
            </Button>

            <Dialog open={confirmDialog} onClose={handleCancel}>
                <DialogTitle>
                    {action === 'start' ? 'Start Irrigation?' : 'Stop Irrigation?'}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {action === 'start'
                            ? 'Are you sure you want to start irrigation? This will activate the water pump.'
                            : 'Are you sure you want to stop irrigation? This will deactivate the water pump.'}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel}>Cancel</Button>
                    <Button
                        onClick={handleConfirm}
                        variant="contained"
                        color={action === 'start' ? 'primary' : 'error'}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
