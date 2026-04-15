import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    TextField,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    InputAdornment,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Card,
    CardContent,
    Tooltip
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Block as BlockIcon,
    CheckCircle as CheckCircleIcon,
    Search as SearchIcon,
    Visibility as VisibilityIcon,
    People as PeopleIcon,
    FilterList as FilterIcon
} from '@mui/icons-material';
import { getAllUsers, updateUserStatus, deleteUser, getUserById } from '../services/adminService';
import { useNotification } from '../context/NotificationContext';
import Layout from '../components/Layout';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const { showSuccess, showError, showWarning } = useNotification();

    useEffect(() => {
        loadUsers();
    }, [search, roleFilter]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await getAllUsers({ search, role: roleFilter });
            setUsers(data.users);
        } catch (error) {
            console.error('Error loading users:', error);
            showError('Failed to synchronize user network data');
        } finally {
            setLoading(false);
        }
    };

    const handleViewUser = async (userId) => {
        try {
            const data = await getUserById(userId);
            setSelectedUser(data);
            setViewDialogOpen(true);
        } catch (error) {
            console.error('Error loading user details:', error);
            showError('Failed to retrieve botanical profile details');
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            await updateUserStatus(userId, !currentStatus);
            showSuccess(`User access ${!currentStatus ? 'restored' : 'suspended'} successfully`);
            loadUsers();
        } catch (error) {
            console.error('Error updating user status:', error);
            showError('Failed to modify user access permissions');
        }
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteUser(userToDelete._id);
            showSuccess('User account and associated telemetry purged');
            setDeleteDialogOpen(false);
            setUserToDelete(null);
            loadUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            showError(error.response?.data?.message || 'Purge operation failed');
        }
    };

    return (
        <Layout>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2, animation: 'fadeInUp 0.6s ease-out' }}>
                <Box
                    sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: 'rgba(0, 212, 255, 0.1)',
                        display: 'flex',
                        border: '1px solid rgba(0, 212, 255, 0.2)'
                    }}
                >
                    <PeopleIcon sx={{ color: '#00d4ff', fontSize: 32 }} />
                </Box>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                        User <span className="gradient-text">Network</span>
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        Manage farmer identities and system access infrastructure.
                    </Typography>
                </Box>
            </Box>

            <Card className="glass-card" sx={{ mb: 4, animation: 'fadeInUp 0.8s ease-out' }}>
                <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={7}>
                            <TextField
                                fullWidth
                                placeholder="Search by name, biometric ID, or contact details..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: '#00d4ff' }} />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={5}>
                            <Box display="flex" gap={2}>
                                <FormControl fullWidth>
                                    <InputLabel sx={{ color: 'rgba(255,255,255,0.5)' }}>Access Level</InputLabel>
                                    <Select
                                        value={roleFilter}
                                        label="Access Level"
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                        sx={{
                                            background: 'rgba(255,255,255,0.03)',
                                            '& .MuiSelect-select': { py: 1.5 }
                                        }}
                                    >
                                        <MenuItem value="">All Nodes</MenuItem>
                                        <MenuItem value="farmer">Farmers</MenuItem>
                                        <MenuItem value="admin">System Architects</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <TableContainer
                component={Card}
                className="glass-card"
                sx={{
                    animation: 'fadeInUp 1s ease-out',
                    maxHeight: 'calc(100vh - 400px)',
                    '& .MuiTableHead-root': {
                        background: 'rgba(255,255,255,0.02)',
                    }
                }}
            >
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ background: 'transparent', fontWeight: 800, color: 'rgba(255,255,255,0.5)' }}>BOTANIST / FARMER</TableCell>
                            <TableCell sx={{ background: 'transparent', fontWeight: 800, color: 'rgba(255,255,255,0.5)' }}>COMMUNICATION</TableCell>
                            <TableCell sx={{ background: 'transparent', fontWeight: 800, color: 'rgba(255,255,255,0.5)' }}>PRIVILEGE</TableCell>
                            <TableCell sx={{ background: 'transparent', fontWeight: 800, color: 'rgba(255,255,255,0.5)' }}>SITE DESIGNATION</TableCell>
                            <TableCell sx={{ background: 'transparent', fontWeight: 800, color: 'rgba(255,255,255,0.5)' }}>PULSE</TableCell>
                            <TableCell align="center" sx={{ background: 'transparent', fontWeight: 800, color: 'rgba(255,255,255,0.5)' }}>OPERATIONS</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                    <CircularProgress sx={{ color: '#00d4ff' }} />
                                    <Typography variant="body2" sx={{ mt: 2, color: 'rgba(255,255,255,0.4)' }}>Synchronizing network...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                    <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>No registered users found in this sector.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user._id} sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Typography sx={{ fontWeight: 700 }}>{user.name}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Typography variant="body2" sx={{ opacity: 0.8 }}>{user.email}</Typography>
                                        <Typography variant="caption" sx={{ display: 'block', opacity: 0.5 }}>{user.phone}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Chip
                                            label={user.role === 'admin' ? 'ARCHITECT' : 'FARMER'}
                                            size="small"
                                            sx={{
                                                fontWeight: 800,
                                                fontSize: '0.65rem',
                                                background: user.role === 'admin' ? 'rgba(255, 107, 157, 0.1)' : 'rgba(0, 212, 255, 0.1)',
                                                color: user.role === 'admin' ? '#ff6b9d' : '#00d4ff',
                                                border: `1px solid ${user.role === 'admin' ? 'rgba(255, 107, 157, 0.2)' : 'rgba(0, 212, 255, 0.2)'}`
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{user.farmDetails?.farmName || 'N/A'}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: user.isActive ? '#00ff88' : '#ff3366', boxShadow: `0 0 10px ${user.isActive ? '#00ff88' : '#ff3366'}` }} />
                                            <Typography variant="caption" sx={{ fontWeight: 800, color: user.isActive ? '#00ff88' : '#ff3366' }}>
                                                {user.isActive ? 'ONLINE' : 'LOCKED'}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center" sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                            <Tooltip title="View Profile Analytics">
                                                <IconButton size="small" onClick={() => handleViewUser(user._id)} sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#00d4ff', background: 'rgba(0, 212, 255, 0.1)' } }}>
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={user.isActive ? 'Suspend Access' : 'Restore Access'}>
                                                <IconButton size="small" onClick={() => handleToggleStatus(user._id, user.isActive)} sx={{ color: user.isActive ? 'rgba(255, 184, 0, 0.3)' : 'rgba(0, 255, 136, 0.3)', '&:hover': { color: user.isActive ? '#ffb800' : '#00ff88', background: user.isActive ? 'rgba(255, 184, 0, 0.1)' : 'rgba(0, 255, 136, 0.1)' } }}>
                                                    {user.isActive ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                                                </IconButton>
                                            </Tooltip>
                                            {user.role !== 'admin' && (
                                                <Tooltip title="Purge Record">
                                                    <IconButton size="small" onClick={() => handleDeleteClick(user)} sx={{ color: 'rgba(255, 51, 102, 0.3)', '&:hover': { color: '#ff3366', background: 'rgba(255, 51, 102, 0.1)' } }}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* View User Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        background: 'rgba(20, 20, 45, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white',
                        borderRadius: 4
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 2 }}>Botanical Profile Intelligence</DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {selectedUser && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 800 }}>Node Name</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 700, mb: 2 }}>{selectedUser.user.name}</Typography>

                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 800 }}>Digital Identifier</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 700, mb: 2 }}>{selectedUser.user.email}</Typography>

                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 800 }}>Communication Link</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 700, mb: 2 }}>{selectedUser.user.phone}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 800 }}>Site Designation</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 700, mb: 2 }}>{selectedUser.user.farmDetails?.farmName || 'N/A'}</Typography>

                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 800 }}>Site Area (Hectares)</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 700, mb: 2 }}>{selectedUser.user.farmDetails?.farmSize || 0} ha</Typography>

                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 800 }}>Deployment Level</Typography>
                                <Box sx={{ mt: 0.5 }}>
                                    <Chip label={selectedUser.user.role.toUpperCase()} size="small" sx={{ fontWeight: 800, background: 'rgba(255,255,255,0.05)', color: 'white' }} />
                                </Box>
                            </Grid>
                            <Grid item xs={12}>
                                <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: '#00d4ff' }}>Network Activity Telemetry</Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="h4" sx={{ fontWeight: 800 }}>{selectedUser.stats?.sensorDataCount || 0}</Typography>
                                            <Typography variant="caption" sx={{ opacity: 0.5 }}>SENSOR DATA POINTS</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="h4" sx={{ fontWeight: 800 }}>{selectedUser.stats?.irrigationCount || 0}</Typography>
                                            <Typography variant="caption" sx={{ opacity: 0.5 }}>IRRIGATION CYCLES</Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <Button onClick={() => setViewDialogOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>Close Signal</Button>
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
                        Are you sure you want to permanently delete the node <strong>{userToDelete?.name}</strong>?
                        This action will terminate all associated telemetry streams and log history.
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

export default UserManagement;

