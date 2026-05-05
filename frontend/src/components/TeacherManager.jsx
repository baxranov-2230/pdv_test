import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    Box, Paper, Typography, Button, TextField,
    TableContainer, Table, TableHead, TableBody, TableRow, TableCell,
    Dialog, DialogTitle, DialogContent, DialogActions,
    IconButton, Avatar, Chip, Tooltip, CircularProgress,
} from '@mui/material';
import {
    PersonAdd as PersonAddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    School as SchoolIcon,
    Close as CloseIcon,
    Phone as PhoneIcon,
    Badge as BadgeIcon,
} from '@mui/icons-material';

const PAGE_HEADER = {
    color: '#6366f1', light: '#eef2ff', border: '#c7d2fe',
};

function avatarInitials(name) {
    if (!name) return '?';
    return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
function avatarColor(name) {
    let hash = 0;
    for (const ch of name || '') hash = ch.charCodeAt(0) + hash * 31;
    return COLORS[Math.abs(hash) % COLORS.length];
}

export default function TeacherManager() {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        full_name: '', passport_serial: '', password: '', phone_number: '', jshshir: '',
    });

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/v1/teachers/');
            setTeachers(res.data);
        } catch {
            toast.error("O'qituvchilarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTeachers(); }, []);

    const handleOpenDialog = (teacher = null) => {
        if (teacher) {
            setEditingTeacher(teacher);
            setFormData({
                full_name: teacher.full_name || '',
                passport_serial: teacher.passport_serial || teacher.username || '',
                password: '',
                phone_number: teacher.phone_number || '',
                jshshir: teacher.jshshir || '',
            });
        } else {
            setEditingTeacher(null);
            setFormData({ full_name: '', passport_serial: '', password: '', phone_number: '', jshshir: '' });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingTeacher(null);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            if (editingTeacher) {
                const payload = { ...formData };
                if (payload.jshshir) payload.password = payload.jshshir;
                else delete payload.password;
                await axios.put(`/api/v1/teachers/${editingTeacher.id}`, payload);
                toast.success("O'qituvchi yangilandi");
            } else {
                if (!formData.passport_serial || !formData.jshshir || !formData.full_name) {
                    toast.warning("Ism, Passport seriyasi va JSHSHIR majburiy");
                    return;
                }
                await axios.post('/api/v1/teachers/', { ...formData, password: formData.jshshir });
                toast.success("O'qituvchi qo'shildi");
            }
            fetchTeachers();
            handleCloseDialog();
        } catch (err) {
            toast.error("Xatolik: " + (err.response?.data?.detail || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("O'qituvchini o'chirishni tasdiqlaysizmi?")) return;
        try {
            await axios.delete(`/api/v1/teachers/${id}`);
            toast.success("O'chirildi");
            fetchTeachers();
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
                        bgcolor: PAGE_HEADER.light, border: `1px solid ${PAGE_HEADER.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <SchoolIcon sx={{ color: PAGE_HEADER.color, fontSize: 24 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>
                            O'qituvchilar
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                            Jami {teachers.length} ta o'qituvchi
                        </Typography>
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{
                        background: 'linear-gradient(135deg, #818cf8, #6366f1)',
                        borderRadius: 2, px: 2.5, fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
                        '&:hover': { background: 'linear-gradient(135deg, #6366f1, #4f46e5)' },
                    }}
                >
                    Qo'shish
                </Button>
            </Box>

            {/* Table */}
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                {["F.I.O", "Login (Passport)", "Telefon", "Amallar"].map((h, i) => (
                                    <TableCell
                                        key={h}
                                        align={i === 3 ? 'right' : 'left'}
                                        sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', py: 1.5, borderBottom: '2px solid #e2e8f0' }}
                                    >
                                        {h}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                                        <CircularProgress size={32} sx={{ color: '#6366f1' }} />
                                    </TableCell>
                                </TableRow>
                            ) : teachers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                                        <SchoolIcon sx={{ fontSize: 40, mb: 1, display: 'block', mx: 'auto', opacity: 0.3 }} />
                                        Hozircha o'qituvchilar yo'q
                                    </TableCell>
                                </TableRow>
                            ) : (
                                teachers.map((teacher) => {
                                    const color = avatarColor(teacher.full_name);
                                    return (
                                        <TableRow key={teacher.id} hover sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                                            <TableCell sx={{ py: 1.8 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Avatar sx={{ width: 36, height: 36, bgcolor: `${color}20`, color, fontWeight: 700, fontSize: '0.8rem' }}>
                                                        {avatarInitials(teacher.full_name)}
                                                    </Avatar>
                                                    <Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>
                                                        {teacher.full_name || '—'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={<BadgeIcon sx={{ fontSize: '14px !important' }} />}
                                                    label={teacher.passport_serial || teacher.username}
                                                    size="small"
                                                    sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 500, fontSize: '0.78rem' }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ color: '#64748b', fontSize: '0.875rem' }}>
                                                {teacher.phone_number ? (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <PhoneIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                                                        {teacher.phone_number}
                                                    </Box>
                                                ) : '—'}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Tahrirlash">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenDialog(teacher)}
                                                        sx={{ color: '#6366f1', bgcolor: '#eef2ff', mr: 0.5, '&:hover': { bgcolor: '#c7d2fe' } }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="O'chirish">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDelete(teacher.id)}
                                                        sx={{ color: '#ef4444', bgcolor: '#fef2f2', '&:hover': { bgcolor: '#fecaca' } }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
            >
                <DialogTitle sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <Typography fontWeight={700} color="#0f172a">
                        {editingTeacher ? "O'qituvchini tahrirlash" : "Yangi o'qituvchi qo'shish"}
                    </Typography>
                    <IconButton size="small" onClick={handleCloseDialog} sx={{ color: '#94a3b8' }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {[
                            { label: "To'liq ism", key: 'full_name', placeholder: "Misol: Aliyev Sherzod Karimovich" },
                            { label: 'Passport seriyasi (Login)', key: 'passport_serial', placeholder: 'AB1234567', disabled: !!editingTeacher },
                            { label: 'JSHSHIR (Parol)', key: 'jshshir', placeholder: '14 raqamli JSHSHIR' },
                            { label: 'Telefon raqami', key: 'phone_number', placeholder: '+998901234567' },
                        ].map(({ label, key, placeholder, disabled }) => (
                            <TextField
                                key={key}
                                label={label}
                                fullWidth
                                size="small"
                                placeholder={placeholder}
                                value={formData[key]}
                                onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                                disabled={disabled}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                                    },
                                    '& label.Mui-focused': { color: '#6366f1' },
                                }}
                            />
                        ))}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2.5, gap: 1 }}>
                    <Button
                        onClick={handleCloseDialog}
                        sx={{ borderRadius: 2, color: '#64748b', '&:hover': { bgcolor: '#f1f5f9' } }}
                    >
                        Bekor
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={submitting}
                        sx={{
                            borderRadius: 2, px: 3, fontWeight: 600,
                            background: 'linear-gradient(135deg, #818cf8, #6366f1)',
                            '&:hover': { background: 'linear-gradient(135deg, #6366f1, #4f46e5)' },
                        }}
                    >
                        {submitting ? <CircularProgress size={18} color="inherit" /> : 'Saqlash'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
