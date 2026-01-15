import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    Container,
    CssBaseline,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Avatar,
    Menu,
    MenuItem
} from '@mui/material';
import {
    School as SchoolIcon,
    Dashboard as DashboardIcon,
    AssignmentTurnedIn as ResultsIcon,
    Menu as MenuIcon,
    ExitToApp as LogoutIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from '../auth/AuthProvider';

const drawerWidth = 240;

export default function StudentLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const drawerContent = (
        <div>
            <Toolbar sx={{ justifyContent: 'center', py: 2 }}>
                <SchoolIcon sx={{ mr: 1, fontSize: 32, color: 'primary.main' }} />
                <Typography variant="h6" color="primary" noWrap>
                    Student Portal
                </Typography>
            </Toolbar>
            <List>
                <ListItem
                    button
                    selected={location.pathname === '/student/dashboard'}
                    onClick={() => navigate('/student/dashboard')}
                >
                    <ListItemIcon>
                        <DashboardIcon color={location.pathname === '/student/dashboard' ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Dashboard" />
                </ListItem>
                <ListItem
                    button
                    selected={location.pathname === '/student/results'}
                    onClick={() => navigate('/student/results')}
                >
                    <ListItemIcon>
                        <ResultsIcon color={location.pathname === '/student/results' ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="My Results" />
                </ListItem>
            </List>
        </div>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
            <CssBaseline />

            {/* AppBar */}
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    bgcolor: 'white',
                    color: 'text.primary',
                    boxShadow: 1
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Box sx={{ flexGrow: 1 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
                            {user?.full_name}
                        </Typography>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenu}
                            color="inherit"
                        >
                            <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                <PersonIcon />
                            </Avatar>
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem onClick={handleLogout}>
                                <ListItemIcon>
                                    <LogoutIcon fontSize="small" />
                                </ListItemIcon>
                                Logout
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
                aria-label="mailbox folders"
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawerContent}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawerContent}
                </Drawer>
            </Box>

            {/* Content */}
            <Box
                component="main"
                sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: 8 }}
            >
                <Outlet />
            </Box>
        </Box>
    );
}
