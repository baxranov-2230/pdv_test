import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button
} from '@mui/material';
import { format } from 'date-fns';

export default function StudentResults() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [selectedTeacher, setSelectedTeacher] = useState('all');

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await axios.get('/api/v1/tests/results/my');
                setResults(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    const subjects = useMemo(() => {
        const map = new Map();
        results.forEach(r => {
            if (r.subject_id && r.subject_name) map.set(r.subject_id, r.subject_name);
        });
        return Array.from(map, ([id, name]) => ({ id, name }));
    }, [results]);

    const teachers = useMemo(() => {
        const map = new Map();
        results.forEach(r => {
            if (r.teacher_id && r.teacher_name) map.set(r.teacher_id, r.teacher_name);
        });
        return Array.from(map, ([id, name]) => ({ id, name }));
    }, [results]);

    const filteredResults = useMemo(() => {
        return results.filter(r => {
            if (selectedSubject !== 'all' && String(r.subject_id) !== String(selectedSubject)) return false;
            if (selectedTeacher !== 'all' && String(r.teacher_id) !== String(selectedTeacher)) return false;
            return true;
        });
    }, [results, selectedSubject, selectedTeacher]);

    const resetFilters = () => {
        setSelectedSubject('all');
        setSelectedTeacher('all');
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                My Results
            </Typography>

            <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <FormControl sx={{ minWidth: 180 }} size="small">
                        <InputLabel id="subject-filter-label">Fan</InputLabel>
                        <Select
                            labelId="subject-filter-label"
                            value={selectedSubject}
                            label="Fan"
                            onChange={(e) => setSelectedSubject(e.target.value)}
                        >
                            <MenuItem value="all"><em>Barcha fanlar</em></MenuItem>
                            {subjects.map(s => (
                                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: 200 }} size="small">
                        <InputLabel id="teacher-filter-label">O'qituvchi</InputLabel>
                        <Select
                            labelId="teacher-filter-label"
                            value={selectedTeacher}
                            label="O'qituvchi"
                            onChange={(e) => setSelectedTeacher(e.target.value)}
                        >
                            <MenuItem value="all"><em>Barcha o'qituvchilar</em></MenuItem>
                            {teachers.map(t => (
                                <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button variant="outlined" size="small" onClick={resetFilters}>
                        Tozalash
                    </Button>
                </Box>
            </Paper>

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="results table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Test Title</TableCell>
                            <TableCell>Fan</TableCell>
                            <TableCell>O'qituvchi</TableCell>
                            <TableCell align="right">Score</TableCell>
                            <TableCell align="right">Status</TableCell>
                            <TableCell align="right">Date Taken</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredResults.length > 0 ? (
                            filteredResults.map((row) => (
                                <TableRow
                                    key={row.id}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">
                                        {row.test_title}
                                    </TableCell>
                                    <TableCell>{row.subject_name || '—'}</TableCell>
                                    <TableCell>{row.teacher_name || '—'}</TableCell>
                                    <TableCell align="right">
                                        <Typography fontWeight="bold" color={row.score >= 50 ? 'success.main' : 'error.main'}>
                                            {row.score.toFixed(1)}%
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Chip
                                            label={row.score >= 50 ? "Passed" : "Failed"}
                                            color={row.score >= 50 ? "success" : "error"}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        {row.taken_at ? format(new Date(row.taken_at), 'PPP p') : 'N/A'}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No results found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
