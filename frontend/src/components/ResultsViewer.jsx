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
    Chip
} from '@mui/material';
import { Assessment as AssessmentIcon } from '@mui/icons-material';

export default function ResultsViewer() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await axios.get('/api/v1/tests/results/all');
                setResults(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

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
                                    No results available yet.
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
