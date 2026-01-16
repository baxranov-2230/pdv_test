import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    IconButton,
    CircularProgress,
    Chip
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon, Person as PersonIcon, PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';

export default function StudentManager() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);

    // Form State
    const [fullName, setFullName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [groupId, setGroupId] = useState('');
    const [photo, setPhoto] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/rest/api/v1/students/');
            setStudents(res.data);
        } catch (err) {
            toast.error('Failed to fetch students');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleCreate = async () => {
        if (!fullName || !studentId || !groupId || !photo) {
            toast.warning("Please fill all fields and upload a photo.");
            return;
        }

        setSubmitting(true);
        const formData = new FormData();
        formData.append('full_name', fullName);
        formData.append('student_id', studentId);
        formData.append('group_id', groupId);
        formData.append('file', photo);

        try {
            await axios.post('/rest/api/v1/students/', formData);
            toast.success('Student registered successfully!');
            handleCloseDialog();
            fetchStudents();
        } catch (err) {
            toast.error('Error creating student: ' + (err.response?.data?.detail || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setFullName('');
        setStudentId('');
        setGroupId('');
        setPhoto(null);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                    Student Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                >
                    Add Student
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={2}>
                <Table sx={{ minWidth: 650 }} aria-label="students table">
                    <TableHead sx={{ bgcolor: 'primary.light' }}>
                        <TableRow>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Full Name</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Student ID</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Group</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : students.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                    No students found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            students.map((student) => (
                                <TableRow
                                    key={student.id}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: '#f5f5f5' } }}
                                >
                                    <TableCell component="th" scope="row">
                                        {student.id}
                                    </TableCell>
                                    <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PersonIcon color="action" /> {student.full_name}
                                    </TableCell>
                                    <TableCell>{student.student_id}</TableCell>
                                    <TableCell>
                                        <Chip label={student.group_id} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell>
                                        <Chip label="Active" color="success" size="small" />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add Student Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Register New Student</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Full Name"
                                variant="outlined"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Student ID"
                                variant="outlined"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Group ID"
                                variant="outlined"
                                value={groupId}
                                onChange={(e) => setGroupId(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                startIcon={<PhotoCameraIcon />}
                                sx={{ py: 2, borderStyle: 'dashed' }}
                            >
                                {photo ? photo.name : "Upload Face Photo"}
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={(e) => setPhoto(e.target.files[0])}
                                />
                            </Button>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
                    <Button onClick={handleCreate} variant="contained" disabled={submitting}>
                        {submitting ? 'Registering...' : 'Register'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
