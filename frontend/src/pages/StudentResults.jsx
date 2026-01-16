import { useState, useEffect } from 'react';
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
    CircularProgress
} from '@mui/material';
import { format } from 'date-fns';

export default function StudentResults() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                My Results
            </Typography>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="results table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Test Title</TableCell>
                            <TableCell align="right">Score</TableCell>
                            <TableCell align="right">Status</TableCell>
                            <TableCell align="right">Date Taken</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {results.length > 0 ? (
                            results.map((row) => (
                                <TableRow
                                    key={row.id}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">
                                        {row.test_title}
                                    </TableCell>
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
                                <TableCell colSpan={4} align="center">
                                    No results found. Take a test to see your progress!
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
