import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    Box, Grid, Paper, Typography, Button, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions,
    IconButton, CircularProgress, Tooltip,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    MenuBook as MenuBookIcon,
    Close as CloseIcon,
    AutoStories as AutoStoriesIcon,
} from '@mui/icons-material';

const SUBJECT_COLORS = [
    { bg: '#eef2ff', text: '#6366f1', border: '#c7d2fe' },
    { bg: '#f0f9ff', text: '#0ea5e9', border: '#bae6fd' },
    { bg: '#f0fdf4', text: '#10b981', border: '#bbf7d0' },
    { bg: '#fffbeb', text: '#f59e0b', border: '#fde68a' },
    { bg: '#fef2f2', text: '#ef4444', border: '#fecaca' },
    { bg: '#f5f3ff', text: '#8b5cf6', border: '#ddd6fe' },
    { bg: '#fdf4ff', text: '#c026d3', border: '#f0abfc' },
    { bg: '#fff7ed', text: '#f97316', border: '#fed7aa' },
];

export default function SubjectManager() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [newSubjectName, setNewSubjectName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/v1/subjects/');
            setSubjects(res.data);
        } catch {
            toast.error("Fanlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSubjects(); }, []);

    const handleCreate = async () => {
        if (!newSubjectName.trim()) { toast.warning("Fan nomi kiritilishi shart"); return; }
        setSubmitting(true);
        try {
            await axios.post('/api/v1/subjects/', { name: newSubjectName });
            toast.success("Fan qo'shildi");
            setNewSubjectName('');
            setOpenDialog(false);
            fetchSubjects();
        } catch (err) {
            toast.error("Xatolik: " + (err.response?.data?.detail || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bu fan bilan bog'liq testlar ham ta'sirlanishi mumkin. O'chirishni tasdiqlaysizmi?")) return;
        try {
            await axios.delete(`/api/v1/subjects/${id}`);
            toast.success("Fan o'chirildi");
            fetchSubjects();
        } catch {
            toast.error("O'chirishda xatolik");
        }
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        width: 48, height: 48, borderRadius: 2.5,
                        bgcolor: '#fffbeb', border: '1px solid #fde68a',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <MenuBookIcon sx={{ color: '#f59e0b', fontSize: 24 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>
                            Fanlar
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                            Jami {subjects.length} ta fan
                        </Typography>
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                    sx={{
                        background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                        borderRadius: 2, px: 2.5, fontWeight: 600, color: '#78350f',
                        boxShadow: '0 4px 12px rgba(245,158,11,0.35)',
                        '&:hover': { background: 'linear-gradient(135deg, #f59e0b, #d97706)' },
                    }}
                >
                    Fan qo'shish
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                    <CircularProgress sx={{ color: '#f59e0b' }} />
                </Box>
            ) : subjects.length === 0 ? (
                <Paper elevation={0} sx={{ borderRadius: 3, border: '2px dashed #e2e8f0', p: 6, textAlign: 'center' }}>
                    <AutoStoriesIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                    <Typography color="text.secondary" fontWeight={500}>Hozircha fanlar yo'q</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        "Fan qo'shish" tugmasini bosing
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={2}>
                    {subjects.map((sub, idx) => {
                        const scheme = SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
                        return (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={sub.id}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2.5,
                                        borderRadius: 3,
                                        border: `1px solid ${scheme.border}`,
                                        bgcolor: 'white',
                                        display: 'flex', alignItems: 'center', gap: 2,
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: `0 8px 24px ${scheme.text}18`,
                                        },
                                    }}
                                >
                                    <Box sx={{
                                        width: 44, height: 44, borderRadius: 2,
                                        bgcolor: scheme.bg, border: `1px solid ${scheme.border}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        <AutoStoriesIcon sx={{ color: scheme.text, fontSize: 22 }} />
                                    </Box>
                                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                        <Typography noWrap sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>
                                            {sub.name}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                            ID: {sub.id}
                                        </Typography>
                                    </Box>
                                    <Tooltip title="O'chirish">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDelete(sub.id)}
                                            sx={{
                                                color: '#ef4444', bgcolor: '#fef2f2',
                                                flexShrink: 0,
                                                '&:hover': { bgcolor: '#fecaca' },
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            {/* Dialog */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
            >
                <DialogTitle sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <Typography fontWeight={700} color="#0f172a">Yangi fan qo'shish</Typography>
                    <IconButton size="small" onClick={() => setOpenDialog(false)} sx={{ color: '#94a3b8' }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
                    <TextField
                        autoFocus
                        fullWidth
                        size="small"
                        label="Fan nomi"
                        placeholder="Misol: Matematika"
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        sx={{
                            '& .MuiOutlinedInput-root': { borderRadius: 2, '&.Mui-focused fieldset': { borderColor: '#f59e0b' } },
                            '& label.Mui-focused': { color: '#f59e0b' },
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2.5, gap: 1 }}>
                    <Button onClick={() => setOpenDialog(false)} sx={{ borderRadius: 2, color: '#64748b', '&:hover': { bgcolor: '#f1f5f9' } }}>
                        Bekor
                    </Button>
                    <Button
                        onClick={handleCreate}
                        variant="contained"
                        disabled={submitting}
                        sx={{
                            borderRadius: 2, px: 3, fontWeight: 600, color: '#78350f',
                            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                            '&:hover': { background: 'linear-gradient(135deg, #f59e0b, #d97706)' },
                        }}
                    >
                        {submitting ? <CircularProgress size={18} sx={{ color: '#78350f' }} /> : "Qo'shish"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
