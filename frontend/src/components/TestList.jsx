import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    Box, Paper, Typography, Button, Grid, Card, CardContent, CardActions,
    IconButton, Chip, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
    List, Divider, Radio, CircularProgress,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Visibility as VisibilityIcon,
    Quiz as QuizIcon,
    MenuBook as MenuBookIcon,
    School as SchoolIcon,
    Close as CloseIcon,
    HelpOutline as HelpIcon,
} from '@mui/icons-material';

const CARD_ACCENTS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#f97316'];

export default function TestList() {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewTest, setViewTest] = useState(null);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const navigate = useNavigate();

    const fetchTests = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/v1/tests/');
            setTests(res.data);
        } catch {
            toast.error("Testlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTests(); }, []);

    const handleDeleteClick = (id) => { setDeleteId(id); setOpenDeleteDialog(true); };

    const confirmDelete = async () => {
        try {
            await axios.delete(`/api/v1/tests/${deleteId}`);
            toast.success("Test o'chirildi");
            fetchTests();
        } catch {
            toast.error("O'chirishda xatolik");
        } finally {
            setOpenDeleteDialog(false);
            setDeleteId(null);
        }
    };

    const handleViewTest = (test) => { setViewTest(test); setOpenViewDialog(true); };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <QuizIcon sx={{ color: '#ef4444', fontSize: 24 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>Testlar</Typography>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>Jami {tests.length} ta test</Typography>
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/admin/tests/create')}
                    sx={{
                        background: 'linear-gradient(135deg, #f87171, #ef4444)',
                        borderRadius: 2, px: 2.5, fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(239,68,68,0.35)',
                        '&:hover': { background: 'linear-gradient(135deg, #ef4444, #dc2626)' },
                    }}
                >
                    Yangi test
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                    <CircularProgress sx={{ color: '#ef4444' }} />
                </Box>
            ) : tests.length === 0 ? (
                <Paper elevation={0} sx={{ borderRadius: 3, border: '2px dashed #e2e8f0', p: 6, textAlign: 'center' }}>
                    <QuizIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                    <Typography color="text.secondary" fontWeight={500}>Hozircha testlar yo'q</Typography>
                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/admin/tests/create')}
                        sx={{ mt: 2, borderRadius: 2 }}
                    >
                        Birinchi testni yarating
                    </Button>
                </Paper>
            ) : (
                <Grid container spacing={2.5}>
                    {tests.map((test, idx) => {
                        const accent = CARD_ACCENTS[idx % CARD_ACCENTS.length];
                        return (
                            <Grid item xs={12} sm={6} lg={4} key={test.id}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        borderRadius: 3,
                                        border: '1px solid #e2e8f0',
                                        overflow: 'hidden',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-3px)',
                                            boxShadow: `0 12px 32px ${accent}18`,
                                            borderColor: `${accent}44`,
                                        },
                                    }}
                                >
                                    {/* Color accent bar */}
                                    <Box sx={{ height: 4, bgcolor: accent }} />
                                    <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                            <Typography
                                                sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem', lineHeight: 1.4, flexGrow: 1, mr: 1 }}
                                            >
                                                {test.title}
                                            </Typography>
                                        </Box>

                                        {test.description && (
                                            <Typography
                                                variant="body2"
                                                sx={{ color: '#64748b', mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                                            >
                                                {test.description}
                                            </Typography>
                                        )}

                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                                            <Chip
                                                icon={<HelpIcon sx={{ fontSize: '13px !important' }} />}
                                                label={`${test.questions.length} savol`}
                                                size="small"
                                                sx={{ bgcolor: `${accent}15`, color: accent, border: `1px solid ${accent}30`, fontWeight: 600, fontSize: '0.75rem' }}
                                            />
                                            {test.subject && (
                                                <Chip
                                                    icon={<MenuBookIcon sx={{ fontSize: '13px !important' }} />}
                                                    label={test.subject.name}
                                                    size="small"
                                                    sx={{ bgcolor: '#f1f5f9', color: '#475569', fontSize: '0.75rem' }}
                                                />
                                            )}
                                            {test.teacher && (
                                                <Chip
                                                    icon={<SchoolIcon sx={{ fontSize: '13px !important' }} />}
                                                    label={test.teacher.full_name}
                                                    size="small"
                                                    sx={{ bgcolor: '#f1f5f9', color: '#475569', fontSize: '0.75rem' }}
                                                />
                                            )}
                                        </Box>
                                    </CardContent>
                                    <Divider />
                                    <CardActions sx={{ px: 2, py: 1.2, bgcolor: '#f8fafc', justifyContent: 'flex-end', gap: 0.5 }}>
                                        <Tooltip title="Ko'rish">
                                            <IconButton size="small" onClick={() => handleViewTest(test)} sx={{ color: '#0ea5e9', bgcolor: '#f0f9ff', '&:hover': { bgcolor: '#bae6fd' } }}>
                                                <VisibilityIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Tahrirlash">
                                            <IconButton size="small" onClick={() => navigate(`/admin/tests/edit/${test.id}`)} sx={{ color: '#6366f1', bgcolor: '#eef2ff', '&:hover': { bgcolor: '#c7d2fe' } }}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="O'chirish">
                                            <IconButton size="small" onClick={() => handleDeleteClick(test.id)} sx={{ color: '#ef4444', bgcolor: '#fef2f2', '&:hover': { bgcolor: '#fecaca' } }}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </CardActions>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            {/* View Dialog */}
            <Dialog
                open={openViewDialog}
                onClose={() => setOpenViewDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
            >
                <DialogTitle sx={{
                    px: 3, py: 2.5,
                    background: 'linear-gradient(135deg, #0f0c29, #302b63)',
                    color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <Box>
                        <Typography fontWeight={700} fontSize="1rem">{viewTest?.title}</Typography>
                        {viewTest?.subject && (
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                {viewTest.subject.name}
                                {viewTest.teacher ? ` · ${viewTest.teacher.full_name}` : ''}
                            </Typography>
                        )}
                    </Box>
                    <IconButton size="small" onClick={() => setOpenViewDialog(false)} sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    {viewTest?.description && (
                        <Typography variant="body2" sx={{ color: '#64748b', mb: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                            {viewTest.description}
                        </Typography>
                    )}
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 2, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                        Savollar ({viewTest?.questions?.length})
                    </Typography>
                    <List disablePadding>
                        {viewTest?.questions?.map((q, idx) => (
                            <Paper key={q.id} elevation={0} sx={{ p: 2.5, mb: 2, border: '1px solid #e2e8f0', borderRadius: 2.5 }}>
                                <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                                    <Box sx={{ width: 26, height: 26, borderRadius: 1.5, bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Typography sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>{idx + 1}</Typography>
                                    </Box>
                                    <Typography
                                        component="div"
                                        sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem', '& *': { margin: 0 } }}
                                        dangerouslySetInnerHTML={{ __html: q.text }}
                                    />
                                </Box>
                                {q.image && <Box sx={{ mb: 1.5 }}><img src={q.image} alt="" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }} /></Box>}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, pl: 4.5 }}>
                                    {q.options.map((opt, oIdx) => {
                                        const isObj = typeof opt === 'object';
                                        const text = isObj ? opt.text : opt;
                                        const image = isObj ? opt.image : null;
                                        const correct = q.correct_option === oIdx;
                                        return (
                                            <Box
                                                key={oIdx}
                                                sx={{
                                                    display: 'flex', alignItems: 'flex-start', gap: 1,
                                                    p: 1, borderRadius: 1.5,
                                                    bgcolor: correct ? '#f0fdf4' : '#f8fafc',
                                                    border: `1px solid ${correct ? '#bbf7d0' : '#e2e8f0'}`,
                                                }}
                                            >
                                                <Radio checked={correct} readOnly size="small" disabled={!correct} sx={{ p: 0, mt: 0.1, color: correct ? '#10b981 !important' : undefined }} />
                                                <Box>
                                                    <Typography
                                                        component="div"
                                                        variant="body2"
                                                        sx={{ color: correct ? '#16a34a' : '#475569', fontWeight: correct ? 600 : 400, '& *': { margin: 0 } }}
                                                        dangerouslySetInnerHTML={{ __html: text }}
                                                    />
                                                    {image && <img src={image} alt="" style={{ maxWidth: 120, maxHeight: 80, marginTop: 4, borderRadius: 4 }} />}
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Paper>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e2e8f0' }}>
                    <Button onClick={() => setOpenViewDialog(false)} sx={{ borderRadius: 2, color: '#64748b' }}>Yopish</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ px: 3, pt: 3, pb: 1 }}>
                    <Typography fontWeight={700} color="#0f172a">Testni o'chirish</Typography>
                </DialogTitle>
                <DialogContent sx={{ px: 3 }}>
                    <Typography color="text.secondary">
                        Bu testni o'chirmoqchimisiz? Bu amal qaytarib bo'lmaydi va bog'liq natijalar ham o'chirilishi mumkin.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                    <Button onClick={() => setOpenDeleteDialog(false)} sx={{ borderRadius: 2, color: '#64748b' }}>Bekor</Button>
                    <Button
                        onClick={confirmDelete}
                        variant="contained"
                        sx={{ borderRadius: 2, bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}
                    >
                        O'chirish
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
