import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    Menu,
    MenuItem
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    WaterDrop as WaterDropIcon,
    Grass as GrassIcon,
    BarChart as BarChartIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    AdminPanelSettings as AdminIcon,
    People as PeopleIcon,
    Agriculture as AgricultureIcon,
    Visibility as VisibilityIcon,
    Assessment as AssessmentIcon,
    NotificationsActive as NotificationsActiveIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const drawerWidth = 240;

export default function Layout({ children }) {
    const { t } = useTranslation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const farmerMenuItems = [
        { text: t('nav.dashboard'), icon: <DashboardIcon />, path: '/dashboard' },
        { text: t('nav.irrigation'), icon: <WaterDropIcon />, path: '/irrigation' },
        { text: t('nav.crops'), icon: <GrassIcon />, path: '/crops' },
        { text: t('nav.analytics'), icon: <BarChartIcon />, path: '/analytics' },
        { text: t('nav.reports'), icon: <AssessmentIcon />, path: '/reports' },
        { text: t('nav.settings'), icon: <SettingsIcon />, path: '/settings' }
    ];

    const adminMenuItems = [
        { text: t('nav.admin'), icon: <AdminIcon />, path: '/admin' },
        { text: t('nav.users'), icon: <PeopleIcon />, path: '/admin/users' },
        { text: t('nav.adminCrops'), icon: <AgricultureIcon />, path: '/admin/crops' },
        { text: t('nav.monitoring'), icon: <VisibilityIcon />, path: '/admin/monitoring' },
        { text: t('nav.adminAnalytics'), icon: <AssessmentIcon />, path: '/admin/analytics' },
        { text: t('nav.alerts'), icon: <NotificationsActiveIcon />, path: '/admin/alerts' },
        { text: t('nav.settings'), icon: <SettingsIcon />, path: '/settings' }
    ];

    const menuItems = user?.role === 'admin' ? adminMenuItems : farmerMenuItems;

    const drawer = (
        <Box>
            <Toolbar>
                <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {t('nav.agroSmart')}
                </Typography>
            </Toolbar>
            <Divider />
            {user?.role === 'admin' && (
                <Box sx={{ p: 2, backgroundColor: 'rgba(156, 39, 176, 0.1)' }}>
                    <Typography variant="caption" color="secondary" fontWeight="bold">
                        ADMIN PANEL
                    </Typography>
                </Box>
            )}
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            selected={location.pathname === item.path}
                            onClick={() => {
                                navigate(item.path);
                                setMobileOpen(false);
                            }}
                            sx={{
                                '&.Mui-selected': {
                                    backgroundColor: 'rgba(102, 126, 234, 0.2)',
                                    borderRight: '3px solid',
                                    borderColor: 'primary.main'
                                }
                            }}
                        >
                            <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    backgroundColor: 'rgba(15, 15, 35, 0.6)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    boxShadow: 'none'
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 800, letterSpacing: '-0.02em' }}>
                        {menuItems.find(item => item.path === location.pathname)?.text || 'AgroSmart Hill'}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1 }}>{user?.name}</Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>{user?.role?.toUpperCase()} ACCOUNT</Typography>
                        </Box>
                        <IconButton onClick={handleMenuClick} sx={{ p: 0.5, border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Avatar sx={{
                                bgcolor: 'transparent',
                                width: 32,
                                height: 32,
                                background: 'linear-gradient(45deg, #00d4ff, #667eea)',
                                fontWeight: 800,
                                fontSize: '0.9rem'
                            }}>
                                {user?.name?.charAt(0).toUpperCase()}
                            </Avatar>
                        </IconButton>
                    </Box>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        PaperProps={{
                            sx: {
                                mt: 1.5,
                                background: 'rgba(20, 20, 45, 0.9)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                color: 'white'
                            }
                        }}
                    >
                        <MenuItem disabled sx={{ opacity: '1 !important' }}>
                            <Box sx={{ py: 0.5 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{user?.name}</Typography>
                                <Typography variant="caption" sx={{ opacity: 0.6 }}>{user?.email}</Typography>
                            </Box>
                        </MenuItem>
                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
                        <MenuItem onClick={handleLogout} sx={{ '&:hover': { background: 'rgba(255, 51, 102, 0.1)', color: '#ff3366' } }}>
                            <ListItemIcon>
                                <LogoutIcon fontSize="small" sx={{ color: 'inherit' }} />
                            </ListItemIcon>
                            {t('nav.logout')}
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            background: '#0a0e27',
                            borderRight: '1px solid rgba(255,255,255,0.05)'
                        }
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            background: '#0a0e27',
                            borderRight: '1px solid rgba(255,255,255,0.05)'
                        }
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, sm: 3, md: 4 },
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    minHeight: '100vh',
                    mt: 8,
                    background: 'radial-gradient(circle at 50% 50%, rgba(102, 126, 234, 0.05) 0%, transparent 50%)',
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
