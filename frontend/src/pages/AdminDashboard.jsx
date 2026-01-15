import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import StudentManager from '../components/StudentManager';
import TestManager from '../components/TestManager';
import ResultsViewer from '../components/ResultsViewer';
import TeacherManager from '../components/TeacherManager';
import SubjectManager from '../components/SubjectManager';
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
    CssBaseline,
    Avatar,
    Menu,
    MenuItem,
    Tooltip
} from '@mui/material';
import {
    Menu as MenuIcon,
    People as PeopleIcon,
    Quiz as QuizIcon,
    Assignment as AssignmentIcon,
    Logout as LogoutIcon,
    Dashboard as DashboardIcon,
    School as SchoolIcon,
    MenuBook as MenuBookIcon
} from '@mui/icons-material';

const drawerWidth = 240;

export default function AdminDashboard() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        logout();
        navigate('/login');
    };

    const menuItems = [
        { text: 'Teachers', icon: <SchoolIcon />, path: '/admin/teachers' },
        { text: 'Students', icon: <PeopleIcon />, path: '/admin/students' },
        { text: 'Subjects', icon: <MenuBookIcon />, path: '/admin/subjects' },
        { text: 'Tests', icon: <QuizIcon />, path: '/admin/tests' },
        { text: 'Results', icon: <AssignmentIcon />, path: '/admin/results' },
    ];

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DashboardIcon /> Admin Portal
                    </Typography>
                    <div>
                        <Tooltip title="Account settings">
                            <IconButton
                                size="large"
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleMenu}
                                color="inherit"
                            >
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>A</Avatar>
                            </IconButton>
                        </Tooltip>
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
                            <MenuItem disabled>User: {user?.sub}</MenuItem>
                            <Divider />
                            <MenuItem onClick={handleLogout}>
                                <ListItemIcon>
                                    <LogoutIcon fontSize="small" />
                                </ListItemIcon>
                                Logout
                            </MenuItem>
                        </Menu>
                    </div>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        {menuItems.map((item) => (
                            <ListItem key={item.text} disablePadding>
                                <ListItemButton
                                    selected={location.pathname === item.path}
                                    onClick={() => navigate(item.path)}
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
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
                <Toolbar />
                <Routes>
                    <Route path="teachers" element={<TeacherManager />} />
                    <Route path="students" element={<StudentManager />} />
                    <Route path="subjects" element={<SubjectManager />} />
                    <Route path="tests" element={<TestManager />} />
                    <Route path="results" element={<ResultsViewer />} />
                    <Route path="*" element={
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10, opacity: 0.5 }}>
                            <DashboardIcon sx={{ fontSize: 60, mb: 2 }} />
                            <Typography variant="h5">Select an module from the sidebar</Typography>
                        </Box>
                    } />
                </Routes>
            </Box>
        </Box>
    );
}
