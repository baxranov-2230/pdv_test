import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    Box, Paper, Typography, Grid,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    CircularProgress, Chip, FormControl, InputLabel, Select, MenuItem,
    Button, Skeleton,
} from '@mui/material';
import {
    Assignment as AssignmentIcon,
    PictureAsPdf as PdfIcon,
    TrendingUp as TrendingUpIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    FilterAlt as FilterAltIcon,
    Close as CloseIcon,
} from '@mui/icons-material';

function SummaryCard({ icon: Icon, label, value, color, light, border, loading }) {
    return (
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: `1px solid ${border}`, bgcolor: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: light, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon sx={{ color, fontSize: 22 }} />
            </Box>
            <Box>
                {loading ? <Skeleton width={50} height={28} /> : (
                    <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', color: '#0f172a', lineHeight: 1 }}>{value}</Typography>
                )}
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>{label}</Typography>
            </Box>
        </Paper>
    );
}

export default function ResultsViewer() {
    const [allResults, setAllResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [downloading, setDownloading] = useState(false);

    const [selectedGroup, setSelectedGroup] = useState('all');
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [selectedTeacher, setSelectedTeacher] = useState('all');

    useEffect(() => {
        Promise.all([
            axios.get('/api/v1/tests/results/all'),
            axios.get('/api/v1/subjects/'),
            axios.get('/api/v1/teachers/'),
        ])
            .then(([r, s, t]) => {
                setAllResults(r.data);
                setSubjects(s.data);
                setTeachers(t.data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const groups = useMemo(() => {
        return [...new Set(allResults.map((r) => r.group_id).filter(Boolean))].sort();
    }, [allResults]);

    const results = useMemo(() => {
        return allResults.filter((r) => {
            if (selectedGroup !== 'all' && r.group_id !== selectedGroup) return false;
            if (selectedSubject !== 'all' && String(r.subject_id) !== String(selectedSubject)) return false;
            if (selectedTeacher !== 'all' && String(r.teacher_id) !== String(selectedTeacher)) return false;
            return true;
        });
    }, [allResults, selectedGroup, selectedSubject, selectedTeacher]);

    const summary = useMemo(() => {
        if (!results.length) return { total: 0, avg: 0, pass: 0, passRate: 0 };
        const avg = results.reduce((s, r) => s + r.score, 0) / results.length;
        const pass = results.filter((r) => r.score >= 50).length;
        return { total: results.length, avg: avg.toFixed(1), pass, passRate: Math.round((pass / results.length) * 100) };
    }, [results]);

    const getScoreColor = (score) => score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
    const getScoreBg = (score) => score >= 80 ? '#f0fdf4' : score >= 50 ? '#fffbeb' : '#fef2f2';
    const getScoreBorder = (score) => score >= 80 ? '#bbf7d0' : score >= 50 ? '#fde68a' : '#fecaca';

    const handleDownloadPDF = async () => {
        if (selectedGroup === 'all') return;
        setDownloading(true);
        try {
            const params = {};
            if (selectedSubject !== 'all') params.subject_id = selectedSubject;
            if (selectedTeacher !== 'all') params.teacher_id = selectedTeacher;
            const response = await axios.get(`/api/v1/tests/results/download-pdf/${selectedGroup}`, { params, responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `natijalar_${selectedGroup}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            alert("PDF yuklab olishda xatolik yuz berdi");
        } finally {
            setDownloading(false);
        }
    };

    const hasFilters = selectedGroup !== 'all' || selectedSubject !== 'all' || selectedTeacher !== 'all';

    const selectSx = {
        '& .MuiOutlinedInput-root': { borderRadius: 2, '&.Mui-focused fieldset': { borderColor: '#6366f1' } },
        '& label.Mui-focused': { color: '#6366f1' },
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: '#fff7ed', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AssignmentIcon sx={{ color: '#f97316', fontSize: 24 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>Natijalar</Typography>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>Barcha test natijalari</Typography>
                    </Box>
                </Box>
            </Box>

            {/* Summary cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                    <SummaryCard loading={loading} icon={AssignmentIcon} label="Jami yechimlar" value={summary.total} color="#6366f1" light="#eef2ff" border="#c7d2fe" />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <SummaryCard loading={loading} icon={TrendingUpIcon} label="O'rtacha ball" value={`${summary.avg}%`} color="#0ea5e9" light="#f0f9ff" border="#bae6fd" />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <SummaryCard loading={loading} icon={CheckCircleIcon} label="O'tdi (≥50%)" value={summary.pass} color="#10b981" light="#f0fdf4" border="#bbf7d0" />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <SummaryCard loading={loading} icon={TrendingUpIcon} label="O'tish foizi" value={`${summary.passRate}%`} color="#f59e0b" light="#fffbeb" border="#fde68a" />
                </Grid>
            </Grid>

            {/* Filters */}
            <Paper elevation={0} sx={{ p: 2.5, mb: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}>
                    <FilterAltIcon fontSize="small" />
                    <Typography variant="body2" fontWeight={600}>Filtr:</Typography>
                </Box>

                <FormControl size="small" sx={{ minWidth: 160, ...selectSx }}>
                    <InputLabel>Guruh</InputLabel>
                    <Select value={selectedGroup} label="Guruh" onChange={(e) => setSelectedGroup(e.target.value)}>
                        <MenuItem value="all"><em>Barcha guruhlar</em></MenuItem>
                        {groups.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 160, ...selectSx }}>
                    <InputLabel>Fan</InputLabel>
                    <Select value={selectedSubject} label="Fan" onChange={(e) => setSelectedSubject(e.target.value)}>
                        <MenuItem value="all"><em>Barcha fanlar</em></MenuItem>
                        {subjects.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 180, ...selectSx }}>
                    <InputLabel>O'qituvchi</InputLabel>
                    <Select value={selectedTeacher} label="O'qituvchi" onChange={(e) => setSelectedTeacher(e.target.value)}>
                        <MenuItem value="all"><em>Barcha o'qituvchilar</em></MenuItem>
                        {teachers.map((t) => <MenuItem key={t.id} value={t.id}>{t.full_name}</MenuItem>)}
                    </Select>
                </FormControl>

                {hasFilters && (
                    <Button
                        size="small"
                        startIcon={<CloseIcon />}
                        onClick={() => { setSelectedGroup('all'); setSelectedSubject('all'); setSelectedTeacher('all'); }}
                        sx={{ borderRadius: 2, color: '#64748b', '&:hover': { bgcolor: '#f1f5f9' } }}
                    >
                        Tozalash
                    </Button>
                )}

                <Box sx={{ flexGrow: 1 }} />

                <Button
                    variant="contained"
                    size="small"
                    startIcon={downloading ? <CircularProgress size={14} color="inherit" /> : <PdfIcon />}
                    onClick={handleDownloadPDF}
                    disabled={selectedGroup === 'all' || downloading || results.length === 0}
                    sx={{
                        borderRadius: 2, fontWeight: 600,
                        bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' },
                        '&.Mui-disabled': { opacity: 0.5 },
                    }}
                >
                    {downloading ? 'Yuklanmoqda...' : 'PDF Yuklab olish'}
                </Button>
            </Paper>

            {selectedGroup === 'all' && (
                <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, bgcolor: '#f0f9ff', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: '#0284c7' }}>
                        PDF yuklab olish uchun avval guruhni tanlang
                    </Typography>
                </Box>
            )}

            {/* Table */}
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                {["Talaba", "Test", "Fan", "O'qituvchi", "Ball", "Sana", "Natija"].map((h, i) => (
                                    <TableCell
                                        key={h}
                                        align={i === 6 ? 'center' : 'left'}
                                        sx={{ fontWeight: 700, color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', py: 1.5, borderBottom: '2px solid #e2e8f0' }}
                                    >
                                        {h}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        {[...Array(7)].map((__, j) => (
                                            <TableCell key={j}><Skeleton /></TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : results.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                                        <AssignmentIcon sx={{ fontSize: 40, mb: 1, display: 'block', mx: 'auto', opacity: 0.3 }} />
                                        Natijalar topilmadi
                                    </TableCell>
                                </TableRow>
                            ) : (
                                results.map((r) => (
                                    <TableRow key={r.id} hover sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Box>
                                                <Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>
                                                    {r.student_name}
                                                </Typography>
                                                {r.group_id && (
                                                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>{r.group_id}</Typography>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ color: '#475569', fontSize: '0.875rem', maxWidth: 160 }}>
                                            <Typography noWrap sx={{ fontSize: '0.875rem', color: '#475569' }}>{r.test_title}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            {r.subject_name ? (
                                                <Chip label={r.subject_name} size="small" sx={{ bgcolor: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', fontWeight: 500, fontSize: '0.75rem' }} />
                                            ) : <Typography variant="caption" color="text.disabled">—</Typography>}
                                        </TableCell>
                                        <TableCell sx={{ color: '#64748b', fontSize: '0.875rem' }}>
                                            {r.teacher_name || '—'}
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{
                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                px: 1.5, py: 0.3, borderRadius: 1.5,
                                                bgcolor: getScoreBg(r.score), border: `1px solid ${getScoreBorder(r.score)}`,
                                            }}>
                                                <Typography sx={{ fontWeight: 700, color: getScoreColor(r.score), fontSize: '0.85rem' }}>
                                                    {r.score?.toFixed(1)}%
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ color: '#94a3b8', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                            {new Date(r.taken_at).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                icon={r.score >= 50 ? <CheckCircleIcon sx={{ fontSize: '14px !important' }} /> : <CancelIcon sx={{ fontSize: '14px !important' }} />}
                                                label={r.score >= 50 ? "O'tdi" : "O'tmadi"}
                                                size="small"
                                                sx={{
                                                    bgcolor: r.score >= 50 ? '#f0fdf4' : '#fef2f2',
                                                    color: r.score >= 50 ? '#16a34a' : '#dc2626',
                                                    border: `1px solid ${r.score >= 50 ? '#bbf7d0' : '#fecaca'}`,
                                                    fontWeight: 600, fontSize: '0.75rem',
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                {results.length > 0 && (
                    <Box sx={{ px: 3, py: 1.5, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                            Ko'rsatilmoqda: {results.length} ta natija
                        </Typography>
                    </Box>
                )}
            </Paper>
        </Box>
    );
}
