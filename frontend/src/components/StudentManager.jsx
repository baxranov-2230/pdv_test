import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    Box, Paper, Typography, Button, TextField, Grid,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions,
    IconButton, Avatar, Chip, Tooltip, CircularProgress,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    People as PeopleIcon,
    PhotoCamera as PhotoCameraIcon,
    Close as CloseIcon,
    Groups as GroupsIcon,
    CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
function avatarColor(name) {
    let hash = 0;
    for (const ch of name || '') hash = ch.charCodeAt(0) + hash * 31;
    return COLORS[Math.abs(hash) % COLORS.length];
}
function avatarInitials(name) {
    if (!name) return '?';
    return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function translateError(detail) {
    if (!detail) return "Noma'lum xatolik";
    if (detail.includes('Student ID already exists')) return "Bu talaba ID allaqachon mavjud";
    if (detail.includes('No face found')) return "Rasmda yuz topilmadi. Aniq yuz ko'ringan rasm yuklang";
    if (detail.includes('Multiple faces found')) return "Rasmda bir nechta yuz topildi. Faqat bitta yuz bo'lgan rasm yuklang";
    if (detail.includes('Error processing image')) return "Rasmni qayta ishlashda xatolik. Boshqa rasm sinab ko'ring";
    if (detail.includes('Student not found')) return "Talaba topilmadi";
    return detail;
}

export default function StudentManager() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    // Add dialog state
    const [openAdd, setOpenAdd] = useState(false);
    const [addFullName, setAddFullName] = useState('');
    const [addStudentId, setAddStudentId] = useState('');
    const [addGroupId, setAddGroupId] = useState('');
    const [addPhoto, setAddPhoto] = useState(null);
    const [addSubmitting, setAddSubmitting] = useState(false);

    // Edit dialog state
    const [openEdit, setOpenEdit] = useState(false);
    const [editStudent, setEditStudent] = useState(null);
    const [editFullName, setEditFullName] = useState('');
    const [editStudentId, setEditStudentId] = useState('');
    const [editGroupId, setEditGroupId] = useState('');
    const [editPhoto, setEditPhoto] = useState(null);
    const [editSubmitting, setEditSubmitting] = useState(false);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/v1/students/');
            setStudents(res.data);
        } catch {
            toast.error("Talabalarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStudents(); }, []);

    const handleCreate = async () => {
        if (!addFullName.trim() || !addStudentId.trim() || !addGroupId.trim() || !addPhoto) {
            toast.warning("Barcha maydonlarni to'ldiring va rasm yuklang");
            return;
        }
        setAddSubmitting(true);
        const formData = new FormData();
        formData.append('full_name', addFullName.trim());
        formData.append('student_id', addStudentId.trim());
        formData.append('group_id', addGroupId.trim());
        formData.append('file', addPhoto);
        try {
            await axios.post('/api/v1/students/', formData);
            toast.success("Talaba muvaffaqiyatli ro'yxatdan o'tkazildi");
            handleCloseAdd();
            fetchStudents();
        } catch (err) {
            toast.error(translateError(err.response?.data?.detail) || err.message);
        } finally {
            setAddSubmitting(false);
        }
    };

    const handleCloseAdd = () => {
        setOpenAdd(false);
        setAddFullName(''); setAddStudentId(''); setAddGroupId(''); setAddPhoto(null);
    };

    const handleOpenEdit = (student) => {
        setEditStudent(student);
        setEditFullName(student.full_name);
        setEditStudentId(student.student_id);
        setEditGroupId(student.group_id);
        setEditPhoto(null);
        setOpenEdit(true);
    };

    const handleCloseEdit = () => {
        setOpenEdit(false);
        setEditStudent(null);
        setEditFullName(''); setEditStudentId(''); setEditGroupId(''); setEditPhoto(null);
    };

    const handleUpdate = async () => {
        if (!editFullName.trim() || !editStudentId.trim() || !editGroupId.trim()) {
            toast.warning("Barcha maydonlarni to'ldiring");
            return;
        }
        setEditSubmitting(true);
        const formData = new FormData();
        formData.append('full_name', editFullName.trim());
        formData.append('student_id', editStudentId.trim());
        formData.append('group_id', editGroupId.trim());
        if (editPhoto) formData.append('file', editPhoto);
        try {
            await axios.put(`/api/v1/students/${editStudent.id}`, formData);
            toast.success("Talaba ma'lumotlari yangilandi");
            handleCloseEdit();
            fetchStudents();
        } catch (err) {
            toast.error(translateError(err.response?.data?.detail) || err.message);
        } finally {
            setEditSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Talabani o'chirishni tasdiqlaysizmi?")) return;
        try {
            await axios.delete(`/api/v1/students/${id}`);
            toast.success("O'chirildi");
            fetchStudents();
        } catch {
            toast.error("O'chirishda xatolik");
        }
    };

    const groups = [...new Set(students.map((s) => s.group_id).filter(Boolean))];

    const photoUploadBox = (photo, setPhoto) => (
        <Box
            component="label"
            sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 1,
                border: '2px dashed',
                borderColor: photo ? '#0ea5e9' : '#cbd5e1',
                borderRadius: 2.5, py: 3, px: 2,
                cursor: 'pointer',
                bgcolor: photo ? '#f0f9ff' : '#f8fafc',
                transition: 'all 0.2s',
                '&:hover': { borderColor: '#0ea5e9', bgcolor: '#f0f9ff' },
            }}
        >
            <PhotoCameraIcon sx={{ color: photo ? '#0ea5e9' : '#94a3b8', fontSize: 32 }} />
            <Typography variant="body2" sx={{ color: photo ? '#0284c7' : '#64748b', fontWeight: photo ? 600 : 400 }}>
                {photo ? photo.name : 'Yuz rasmi yuklash (klik qiling)'}
            </Typography>
            {!photo && (
                <Typography variant="caption" color="text.secondary">
                    JPG, PNG formatlar qabul qilinadi
                </Typography>
            )}
            <input type="file" hidden accept="image/*" onChange={(e) => setPhoto(e.target.files[0] || null)} />
        </Box>
    );

    const inputSx = {
        '& .MuiOutlinedInput-root': { borderRadius: 2, '&.Mui-focused fieldset': { borderColor: '#0ea5e9' } },
        '& label.Mui-focused': { color: '#0ea5e9' },
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        width: 48, height: 48, borderRadius: 2.5,
                        bgcolor: '#f0f9ff', border: '1px solid #bae6fd',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <PeopleIcon sx={{ color: '#0ea5e9', fontSize: 24 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>
                            Talabalar
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                            {students.length} ta talaba · {groups.length} ta guruh
                        </Typography>
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenAdd(true)}
                    sx={{
                        background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
                        borderRadius: 2, px: 2.5, fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(14,165,233,0.35)',
                        '&:hover': { background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' },
                    }}
                >
                    Talaba qo'shish
                </Button>
            </Box>

            {/* Guruh chips */}
            {groups.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2.5 }}>
                    {groups.map((g) => (
                        <Chip
                            key={g}
                            icon={<GroupsIcon />}
                            label={`${g} — ${students.filter((s) => s.group_id === g).length} ta`}
                            size="small"
                            sx={{ bgcolor: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd', fontWeight: 600 }}
                        />
                    ))}
                </Box>
            )}

            {/* Table */}
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                {["Talaba", "ID", "Guruh", "Holat", "Amallar"].map((h, i) => (
                                    <TableCell
                                        key={h}
                                        align={i === 4 ? 'right' : 'left'}
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
                                    <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                        <CircularProgress size={32} sx={{ color: '#0ea5e9' }} />
                                    </TableCell>
                                </TableRow>
                            ) : students.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                                        <PeopleIcon sx={{ fontSize: 40, mb: 1, display: 'block', mx: 'auto', opacity: 0.3 }} />
                                        Hozircha talabalar yo'q
                                    </TableCell>
                                </TableRow>
                            ) : (
                                students.map((student) => {
                                    const color = avatarColor(student.full_name);
                                    return (
                                        <TableRow key={student.id} hover sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                                            <TableCell sx={{ py: 1.8 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Avatar sx={{ width: 36, height: 36, bgcolor: `${color}20`, color, fontWeight: 700, fontSize: '0.8rem' }}>
                                                        {avatarInitials(student.full_name)}
                                                    </Avatar>
                                                    <Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>
                                                        {student.full_name}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ color: '#64748b', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                                                {student.student_id}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={student.group_id}
                                                    size="small"
                                                    sx={{ bgcolor: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd', fontWeight: 600 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
                                                    label="Faol"
                                                    size="small"
                                                    sx={{ bgcolor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontWeight: 600 }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                                                    <Tooltip title="Tahrirlash">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleOpenEdit(student)}
                                                            sx={{ color: '#0ea5e9', bgcolor: '#f0f9ff', '&:hover': { bgcolor: '#bae6fd' } }}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="O'chirish">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDelete(student.id)}
                                                            sx={{ color: '#ef4444', bgcolor: '#fef2f2', '&:hover': { bgcolor: '#fecaca' } }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Add Dialog */}
            <Dialog
                open={openAdd}
                onClose={handleCloseAdd}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
            >
                <DialogTitle sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <Typography fontWeight={700} color="#0f172a">
                        Yangi talabani ro'yxatga olish
                    </Typography>
                    <IconButton size="small" onClick={handleCloseAdd} sx={{ color: '#94a3b8' }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth size="small"
                                label="To'liq ism"
                                placeholder="Misol: Karimov Jasur Aliyevich"
                                value={addFullName}
                                onChange={(e) => setAddFullName(e.target.value)}
                                sx={inputSx}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth size="small"
                                label="Talaba ID"
                                placeholder="Misol: ST001"
                                value={addStudentId}
                                onChange={(e) => setAddStudentId(e.target.value)}
                                sx={inputSx}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth size="small"
                                label="Guruh ID"
                                placeholder="Misol: CS-101"
                                value={addGroupId}
                                onChange={(e) => setAddGroupId(e.target.value)}
                                sx={inputSx}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            {photoUploadBox(addPhoto, setAddPhoto)}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2.5, gap: 1 }}>
                    <Button onClick={handleCloseAdd} sx={{ borderRadius: 2, color: '#64748b', '&:hover': { bgcolor: '#f1f5f9' } }}>
                        Bekor
                    </Button>
                    <Button
                        onClick={handleCreate}
                        variant="contained"
                        disabled={addSubmitting}
                        sx={{
                            borderRadius: 2, px: 3, fontWeight: 600,
                            background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
                            '&:hover': { background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' },
                        }}
                    >
                        {addSubmitting ? <CircularProgress size={18} color="inherit" /> : "Ro'yxatdan o'tkazish"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog
                open={openEdit}
                onClose={handleCloseEdit}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
            >
                <DialogTitle sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#fff7ed', borderBottom: '1px solid #fed7aa' }}>
                    <Typography fontWeight={700} color="#0f172a">
                        Talaba ma'lumotlarini tahrirlash
                    </Typography>
                    <IconButton size="small" onClick={handleCloseEdit} sx={{ color: '#94a3b8' }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth size="small"
                                label="To'liq ism"
                                value={editFullName}
                                onChange={(e) => setEditFullName(e.target.value)}
                                sx={inputSx}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth size="small"
                                label="Talaba ID"
                                value={editStudentId}
                                onChange={(e) => setEditStudentId(e.target.value)}
                                sx={inputSx}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth size="small"
                                label="Guruh ID"
                                value={editGroupId}
                                onChange={(e) => setEditGroupId(e.target.value)}
                                sx={inputSx}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" sx={{ color: '#64748b', mb: 0.5, display: 'block' }}>
                                Yangi rasm yuklash ixtiyoriy — bo'sh qoldirsangiz avvalgi rasm saqlanadi
                            </Typography>
                            {photoUploadBox(editPhoto, setEditPhoto)}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2.5, gap: 1 }}>
                    <Button onClick={handleCloseEdit} sx={{ borderRadius: 2, color: '#64748b', '&:hover': { bgcolor: '#f1f5f9' } }}>
                        Bekor
                    </Button>
                    <Button
                        onClick={handleUpdate}
                        variant="contained"
                        disabled={editSubmitting}
                        sx={{
                            borderRadius: 2, px: 3, fontWeight: 600,
                            background: 'linear-gradient(135deg, #fb923c, #f97316)',
                            '&:hover': { background: 'linear-gradient(135deg, #f97316, #ea580c)' },
                        }}
                    >
                        {editSubmitting ? <CircularProgress size={18} color="inherit" /> : "Saqlash"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
