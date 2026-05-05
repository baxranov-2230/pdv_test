import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import StudentManager from '../components/StudentManager';
import TestList from '../components/TestList';
import TestForm from '../components/TestForm';
import ResultsViewer from '../components/ResultsViewer';
import TeacherManager from '../components/TeacherManager';
import SubjectManager from '../components/SubjectManager';
import DashboardHome from '../components/DashboardHome';
import {
    Box, Drawer, List, Typography, ListItem, ListItemButton,
    ListItemIcon, ListItemText, Avatar, Tooltip, Divider, IconButton, Chip
} from '@mui/material';
import {
    People as PeopleIcon,
    Quiz as QuizIcon,
    Assignment as AssignmentIcon,
    Logout as LogoutIcon,
    School as SchoolIcon,
    MenuBook as MenuBookIcon,
    Dashboard as DashboardIcon,
    ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

const DRAWER_WIDTH = 264;

const NAV_ITEMS = [
    { text: 'Bosh sahifa', icon: DashboardIcon, path: '/admin', exact: true, color: '#a78bfa', bg: '#f5f3ff' },
    { text: "O'qituvchilar", icon: SchoolIcon, path: '/admin/teachers', color: '#60a5fa', bg: '#eff6ff' },
    { text: 'Talabalar', icon: PeopleIcon, path: '/admin/students', color: '#34d399', bg: '#f0fdf4' },
    { text: 'Fanlar', icon: MenuBookIcon, path: '/admin/subjects', color: '#fbbf24', bg: '#fffbeb' },
    { text: 'Testlar', icon: QuizIcon, path: '/admin/tests', color: '#f87171', bg: '#fef2f2' },
    { text: 'Natijalar', icon: AssignmentIcon, path: '/admin/results', color: '#fb923c', bg: '#fff7ed' },
];

export default function AdminDashboard() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (item) => {
        if (item.exact) {
            return location.pathname === '/admin' || location.pathname === '/admin/';
        }
        return location.pathname.startsWith(item.path);
    };

    const currentPage = NAV_ITEMS.find(isActive);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f1f5f9' }}>
            {/* ── Sidebar ── */}
            <Drawer
                variant="permanent"
                sx={{
                    width: DRAWER_WIDTH,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                        background: 'linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
                        border: 'none',
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                    },
                }}
            >
                {/* Brand */}
                <Box sx={{ px: 3, pt: 3, pb: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 42, height: 42, borderRadius: 2.5,
                        background: 'linear-gradient(135deg, #818cf8, #6366f1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 14px rgba(99,102,241,0.5)',
                        flexShrink: 0,
                    }}>
                        <QuizIcon sx={{ color: 'white', fontSize: 22 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.2, color: 'white' }}>
                            PDV Test
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1 }}>
                            Admin Panel
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mx: 2, mb: 1 }} />

                {/* Nav */}
                <List sx={{ px: 1.5, flexGrow: 1, py: 1 }}>
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item);
                        return (
                            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                                <ListItemButton
                                    onClick={() => navigate(item.path)}
                                    sx={{
                                        borderRadius: 2,
                                        py: 1.1,
                                        px: 1.5,
                                        position: 'relative',
                                        bgcolor: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                                        backdropFilter: active ? 'blur(8px)' : 'none',
                                        '&:hover': {
                                            bgcolor: active
                                                ? 'rgba(255,255,255,0.12)'
                                                : 'rgba(255,255,255,0.06)',
                                        },
                                        transition: 'background 0.15s',
                                    }}
                                >
                                    {active && (
                                        <Box sx={{
                                            position: 'absolute', left: 0, top: '20%',
                                            width: 3, height: '60%',
                                            borderRadius: '0 3px 3px 0',
                                            bgcolor: item.color,
                                        }} />
                                    )}
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        <Box sx={{
                                            width: 32, height: 32, borderRadius: 1.5,
                                            bgcolor: active
                                                ? `${item.color}26`
                                                : 'rgba(255,255,255,0.07)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'background 0.15s',
                                        }}>
                                            <Icon sx={{
                                                fontSize: 16,
                                                color: active ? item.color : 'rgba(255,255,255,0.5)',
                                                transition: 'color 0.15s',
                                            }} />
                                        </Box>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.text}
                                        primaryTypographyProps={{
                                            fontSize: '0.875rem',
                                            fontWeight: active ? 600 : 400,
                                            color: active ? 'white' : 'rgba(255,255,255,0.58)',
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>

                {/* User */}
                <Box sx={{ p: 2 }}>
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2 }} />
                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 1.5,
                        px: 1.5, py: 1.2, borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.07)',
                    }}>
                        <Avatar sx={{
                            width: 34, height: 34,
                            background: 'linear-gradient(135deg, #818cf8, #6366f1)',
                            fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
                        }}>
                            {user?.sub?.[0]?.toUpperCase() || 'A'}
                        </Avatar>
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography noWrap sx={{ color: 'white', fontWeight: 600, fontSize: '0.82rem', lineHeight: 1.3 }}>
                                {user?.sub || 'Admin'}
                            </Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>
                                {user?.role === 'teacher' ? "O'qituvchi" : 'Administrator'}
                            </Typography>
                        </Box>
                        <Tooltip title="Chiqish">
                            <IconButton
                                size="small"
                                onClick={handleLogout}
                                sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#f87171' }, flexShrink: 0 }}
                            >
                                <LogoutIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Drawer>

            {/* ── Main ── */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Top bar */}
                <Box sx={{
                    px: 3.5, py: 1.8,
                    bgcolor: 'white',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    position: 'sticky', top: 0, zIndex: 10,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>Admin</Typography>
                        <ChevronRightIcon sx={{ fontSize: 13, color: '#cbd5e1' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>
                            {currentPage?.text || 'Dashboard'}
                        </Typography>
                    </Box>
                    <Chip
                        label={user?.role === 'teacher' ? "O'qituvchi" : 'Admin'}
                        size="small"
                        sx={{
                            bgcolor: '#ede9fe', color: '#7c3aed',
                            fontWeight: 600, fontSize: '0.72rem',
                            height: 24, border: '1px solid #ddd6fe',
                        }}
                    />
                </Box>

                {/* Content */}
                <Box sx={{ flexGrow: 1, p: 3.5 }}>
                    <Routes>
                        <Route index element={<DashboardHome />} />
                        <Route path="teachers" element={<TeacherManager />} />
                        <Route path="students" element={<StudentManager />} />
                        <Route path="subjects" element={<SubjectManager />} />
                        <Route path="tests" element={<TestList />} />
                        <Route path="tests/create" element={<TestForm />} />
                        <Route path="tests/edit/:id" element={<TestForm />} />
                        <Route path="results" element={<ResultsViewer />} />
                    </Routes>
                </Box>
            </Box>
        </Box>
    );
}
