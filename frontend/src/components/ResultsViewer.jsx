import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Alert
} from '@mui/material';
import { PictureAsPdf as PdfIcon } from '@mui/icons-material';

export default function ResultsViewer() {
    const [allResults, setAllResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGroup, setSelectedGroup] = useState('all');
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [selectedTeacher, setSelectedTeacher] = useState('all');
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [resultsRes, subjectsRes, teachersRes] = await Promise.all([
                    axios.get('/api/v1/tests/results/all'),
                    axios.get('/api/v1/subjects/'),
                    axios.get('/api/v1/teachers/'),
                ]);
                setAllResults(resultsRes.data);
                setSubjects(subjectsRes.data);
                setTeachers(teachersRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const extractGroupFromName = (name) => {
        const match = name?.match(/([A-Z]+-\d+)/);
        return match ? match[1] : null;
    };

    const groups = useMemo(() => {
        return [...new Set(
            allResults
                .filter(r => r.student_name && r.student_name !== 'Unknown')
                .map(r => r.group_id || extractGroupFromName(r.student_name))
                .filter(Boolean)
        )];
    }, [allResults]);

    const results = useMemo(() => {
        return allResults.filter(r => {
            if (selectedGroup !== 'all') {
                const g = r.group_id || extractGroupFromName(r.student_name);
                if (g !== selectedGroup) return false;
            }
            if (selectedSubject !== 'all' && String(r.subject_id) !== String(selectedSubject)) {
                return false;
            }
            if (selectedTeacher !== 'all' && String(r.teacher_id) !== String(selectedTeacher)) {
                return false;
            }
            return true;
        });
    }, [allResults, selectedGroup, selectedSubject, selectedTeacher]);

    const handleDownloadPDF = async () => {
        if (selectedGroup === 'all') {
            alert('Iltimos, PDF yuklab olish uchun guruhni tanlang!');
            return;
        }

        setDownloading(true);
        try {
            const params = {};
            if (selectedSubject !== 'all') params.subject_id = selectedSubject;
            if (selectedTeacher !== 'all') params.teacher_id = selectedTeacher;

            const response = await axios.get(
                `/api/v1/tests/results/download-pdf/${selectedGroup}`,
                {
                    params,
                    responseType: 'blob',
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `test_results_${selectedGroup}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('PDF yuklab olishda xato:', err);
            alert('PDF yuklab olishda xatolik yuz berdi!');
        } finally {
            setDownloading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'success';
        if (score >= 50) return 'warning';
        return 'error';
    };

    const resetFilters = () => {
        setSelectedGroup('all');
        setSelectedSubject('all');
        setSelectedTeacher('all');
    };

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                    Test Results
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    View all student test submissions and scores.
                </Typography>
            </Box>

            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <FormControl sx={{ minWidth: 180 }}>
                        <InputLabel id="group-select-label">Guruh</InputLabel>
                        <Select
                            labelId="group-select-label"
                            value={selectedGroup}
                            label="Guruh"
                            onChange={(e) => setSelectedGroup(e.target.value)}
                        >
                            <MenuItem value="all"><em>Barcha guruhlar</em></MenuItem>
                            {groups.map((group) => (
                                <MenuItem key={group} value={group}>{group}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: 180 }}>
                        <InputLabel id="subject-select-label">Fan</InputLabel>
                        <Select
                            labelId="subject-select-label"
                            value={selectedSubject}
                            label="Fan"
                            onChange={(e) => setSelectedSubject(e.target.value)}
                        >
                            <MenuItem value="all"><em>Barcha fanlar</em></MenuItem>
                            {subjects.map((s) => (
                                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel id="teacher-select-label">O'qituvchi</InputLabel>
                        <Select
                            labelId="teacher-select-label"
                            value={selectedTeacher}
                            label="O'qituvchi"
                            onChange={(e) => setSelectedTeacher(e.target.value)}
                        >
                            <MenuItem value="all"><em>Barcha o'qituvchilar</em></MenuItem>
                            {teachers.map((t) => (
                                <MenuItem key={t.id} value={t.id}>{t.full_name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button variant="outlined" onClick={resetFilters}>
                        Tozalash
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
                        startIcon={downloading ? <CircularProgress size={20} color="inherit" /> : <PdfIcon />}
                        onClick={handleDownloadPDF}
                        disabled={selectedGroup === 'all' || downloading || results.length === 0}
                    >
                        {downloading ? 'Yuklanmoqda...' : 'PDF Yuklab Olish'}
                    </Button>

                    {selectedGroup === 'all' && (
                        <Alert severity="info" sx={{ flex: 1 }}>
                            PDF yuklab olish uchun guruhni tanlang
                        </Alert>
                    )}
                </Box>
            </Paper>

            <TableContainer component={Paper} elevation={2}>
                <Table sx={{ minWidth: 650 }} aria-label="results table">
                    <TableHead sx={{ bgcolor: 'secondary.light' }}>
                        <TableRow>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Student Name</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Test Title</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fan</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>O'qituvchi</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Score</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date Taken</TableCell>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Grade</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : results.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                    Natijalar topilmadi.
                                </TableCell>
                            </TableRow>
                        ) : (
                            results.map((r) => (
                                <TableRow
                                    key={r.id}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: '#f5f5f5' } }}
                                >
                                    <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                                        {r.student_name}
                                    </TableCell>
                                    <TableCell>{r.test_title}</TableCell>
                                    <TableCell>{r.subject_name || '—'}</TableCell>
                                    <TableCell>{r.teacher_name || '—'}</TableCell>
                                    <TableCell>
                                        <Typography fontWeight="bold" color={r.score >= 50 ? 'green' : 'red'}>
                                            {r.score?.toFixed(1)}%
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{new Date(r.taken_at).toLocaleString()}</TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={r.score >= 50 ? 'PASS' : 'FAIL'}
                                            color={getScoreColor(r.score)}
                                            size="small"
                                            variant="filled"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
