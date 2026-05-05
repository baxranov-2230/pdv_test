import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Paper, Typography, CircularProgress, Skeleton } from '@mui/material';
import {
    School as SchoolIcon,
    People as PeopleIcon,
    MenuBook as MenuBookIcon,
    Quiz as QuizIcon,
    Assignment as AssignmentIcon,
    TrendingUp as TrendingUpIcon,
    ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

const CARDS = [
    {
        title: "O'qituvchilar",
        key: 'teachers',
        icon: SchoolIcon,
        color: '#6366f1',
        light: '#eef2ff',
        border: '#c7d2fe',
        path: '/admin/teachers',
    },
    {
        title: 'Talabalar',
        key: 'students',
        icon: PeopleIcon,
        color: '#0ea5e9',
        light: '#f0f9ff',
        border: '#bae6fd',
        path: '/admin/students',
    },
    {
        title: 'Fanlar',
        key: 'subjects',
        icon: MenuBookIcon,
        color: '#10b981',
        light: '#f0fdf4',
        border: '#bbf7d0',
        path: '/admin/subjects',
    },
    {
        title: 'Testlar',
        key: 'tests',
        icon: QuizIcon,
        color: '#f59e0b',
        light: '#fffbeb',
        border: '#fde68a',
        path: '/admin/tests',
    },
    {
        title: "Natijalar (jami)",
        key: 'results',
        icon: AssignmentIcon,
        color: '#ef4444',
        light: '#fef2f2',
        border: '#fecaca',
        path: '/admin/results',
    },
    {
        title: "O'rtacha ball",
        key: 'avgScore',
        icon: TrendingUpIcon,
        color: '#8b5cf6',
        light: '#f5f3ff',
        border: '#ddd6fe',
        path: '/admin/results',
        suffix: '%',
    },
];

function StatCard({ card, value, loading, onClick }) {
    const Icon = card.icon;
    return (
        <Paper
            onClick={onClick}
            elevation={0}
            sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${card.border}`,
                bgcolor: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: `0 12px 32px ${card.color}18`,
                    borderColor: card.color,
                },
                display: 'flex',
                alignItems: 'center',
                gap: 2.5,
            }}
        >
            <Box sx={{
                width: 56, height: 56, borderRadius: 2.5,
                bgcolor: card.light,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                border: `1px solid ${card.border}`,
            }}>
                <Icon sx={{ color: card.color, fontSize: 26 }} />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
                {loading ? (
                    <Skeleton width={60} height={36} />
                ) : (
                    <Typography sx={{ fontWeight: 800, fontSize: '1.75rem', lineHeight: 1, color: '#0f172a' }}>
                        {value ?? '—'}{card.suffix || ''}
                    </Typography>
                )}
                <Typography variant="body2" sx={{ color: '#64748b', mt: 0.4, fontWeight: 500 }}>
                    {card.title}
                </Typography>
            </Box>
            <ArrowForwardIcon sx={{ color: '#cbd5e1', fontSize: 18 }} />
        </Paper>
    );
}

export default function DashboardHome() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            axios.get('/api/v1/teachers/'),
            axios.get('/api/v1/students/'),
            axios.get('/api/v1/subjects/'),
            axios.get('/api/v1/tests/'),
            axios.get('/api/v1/tests/results/all'),
        ])
            .then(([t, s, sub, tests, res]) => {
                const results = res.data;
                const avg = results.length
                    ? (results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(1)
                    : '0';
                setStats({
                    teachers: t.data.length,
                    students: s.data.length,
                    subjects: sub.data.length,
                    tests: tests.data.length,
                    results: results.length,
                    avgScore: avg,
                });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#0f172a' }}>
                    Xush kelibsiz 👋
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                    Tizim bo'yicha umumiy statistika
                </Typography>
            </Box>

            <Grid container spacing={2.5}>
                {CARDS.map((card) => (
                    <Grid item xs={12} sm={6} lg={4} key={card.key}>
                        <StatCard
                            card={card}
                            value={stats[card.key]}
                            loading={loading}
                            onClick={() => navigate(card.path)}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
