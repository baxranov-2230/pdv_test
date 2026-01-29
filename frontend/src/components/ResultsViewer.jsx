import { useState, useEffect } from 'react';
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
import { Assessment as AssessmentIcon, PictureAsPdf as PdfIcon, Download as DownloadIcon } from '@mui/icons-material';

export default function ResultsViewer() {
    const [results, setResults] = useState([]);
    const [allResults, setAllResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGroup, setSelectedGroup] = useState('all');
    const [groups, setGroups] = useState([]);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await axios.get('/api/v1/tests/results/all');
                setAllResults(res.data);
                setResults(res.data);

                // Guruhlarni ajratish
                const uniqueGroups = [...new Set(
                    res.data
                        .filter(r => r.student_name && r.student_name !== 'Unknown')
                        .map(r => {
                            // Agar group_id mavjud bo'lsa, uni ishlatamiz
                            // Aks holda, talaba nomidan guruhni ajratib olishga harakat qilamiz
                            return r.group_id || extractGroupFromName(r.student_name);
                        })
                        .filter(g => g)
                )];
                setGroups(uniqueGroups);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    // Talaba nomidan guruhni ajratib olish (masalan: "Ali - PDV-101" formatidan)
    const extractGroupFromName = (name) => {
        const match = name.match(/([A-Z]+-\d+)/);
        return match ? match[1] : null;
    };

    const handleGroupChange = async (event) => {
        const groupId = event.target.value;
        setSelectedGroup(groupId);

        if (groupId === 'all') {
            setResults(allResults);
        } else {
            setLoading(true);
            try {
                const res = await axios.get(`/api/v1/tests/results/by-group/${groupId}`);
                setResults(res.data);
            } catch (err) {
                console.error(err);
                // Agar API xato bersa, client-side filterlash
                const filtered = allResults.filter(r =>
                    r.group_id === groupId || extractGroupFromName(r.student_name) === groupId
                );
                setResults(filtered);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDownloadPDF = async () => {
        if (selectedGroup === 'all') {
            alert('Iltimos, PDF yuklab olish uchun guruhni tanlang!');
            return;
        }

        setDownloading(true);
        try {
            const response = await axios.get(
                `/api/v1/tests/results/download-pdf/${selectedGroup}`,
                {
                    responseType: 'blob', // Important for PDF download
                }
            );

            // Faylni yuklab olish
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

            {/* Guruh tanlash va PDF yuklab olish */}
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel id="group-select-label">Guruh</InputLabel>
                        <Select
                            labelId="group-select-label"
                            id="group-select"
                            value={selectedGroup}
                            label="Guruh"
                            onChange={handleGroupChange}
                        >
                            <MenuItem value="all">
                                <em>Barcha guruhlar</em>
                            </MenuItem>
                            {groups.map((group) => (
                                <MenuItem key={group} value={group}>
                                    {group}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

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
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Score</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date Taken</TableCell>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Grade</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : results.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                    {selectedGroup === 'all'
                                        ? 'No results available yet.'
                                        : `${selectedGroup} guruhi uchun natijalar topilmadi.`}
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

