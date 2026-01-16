import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    Box,
    Paper,
    Typography,
    Button,
    Grid,
    TextField,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton
} from '@mui/material';
import {
    PersonAdd as PersonAddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';

export default function TeacherManager() {
    const [teachers, setTeachers] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        passport_serial: '', // Passport Series
        password: '', // Auth Password
        phone_number: '',
        jshshir: ''   // Profile JSHSHIR
    });

    const fetchTeachers = async () => {
        try {
            const res = await axios.get('/api/v1/teachers/');
            setTeachers(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load teachers");
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    const handleOpenDialog = (teacher = null) => {
        if (teacher) {
            setEditingTeacher(teacher);
            setFormData({
                full_name: teacher.full_name || '',
                passport_serial: teacher.passport_serial || teacher.username || '',
                password: '',
                phone_number: teacher.phone_number || '',
                jshshir: teacher.jshshir || ''
            });
        } else {
            setEditingTeacher(null);
            setFormData({
                full_name: '',
                passport_serial: '',
                password: '',
                phone_number: '',
                jshshir: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingTeacher(null);
    };

    const handleSubmit = async () => {
        try {
            if (editingTeacher) {
                // Update
                const payload = { ...formData };
                // Sync password with JSHSHIR if present
                if (payload.jshshir) {
                    payload.password = payload.jshshir;
                } else {
                    delete payload.password;
                }

                await axios.put(`/api/v1/teachers/${editingTeacher.id}`, payload);
                toast.success("Teacher updated successfully");
            } else {
                // Create
                if (!formData.passport_serial || !formData.jshshir || !formData.full_name) {
                    toast.warning("Full Name, Passport Serial and JSHSHIR are required");
                    return;
                }

                const payload = {
                    ...formData,
                    password: formData.jshshir // Set password to JSHSHIR
                };

                await axios.post('/api/v1/teachers/', payload);
                toast.success("Teacher created successfully");
            }
            fetchTeachers();
            handleCloseDialog();
        } catch (err) {
            toast.error("Operation failed: " + (err.response?.data?.detail || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this teacher?")) {
            try {
                await axios.delete(`/api/v1/teachers/${id}`);
                toast.success("Teacher deleted");
                fetchTeachers();
            } catch (err) {
                toast.error("Delete failed");
            }
        }
    };

    return (
        <Box>
            <Paper sx={{ p: 3, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5">Teacher Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Teacher
                </Button>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell><b>Full Name</b></TableCell>
                            <TableCell><b>Passport Serial</b></TableCell>
                            <TableCell><b>Phone Number</b></TableCell>
                            <TableCell align="right"><b>Actions</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {teachers.map((teacher) => (
                            <TableRow key={teacher.id} hover>
                                <TableCell>{teacher.full_name || "N/A"}</TableCell>
                                <TableCell>{teacher.passport_serial || teacher.username}</TableCell>
                                <TableCell>{teacher.phone_number || "N/A"}</TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => handleOpenDialog(teacher)} color="primary">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => handleDelete(teacher.id)} color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {teachers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">No teachers found</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Full Name"
                            fullWidth
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        />
                        <TextField
                            label="Passport Serial (Login)"
                            fullWidth
                            value={formData.passport_serial}
                            onChange={(e) => setFormData({ ...formData, passport_serial: e.target.value })}
                            disabled={!!editingTeacher}
                        />
                        <TextField
                            label="JSHSHIR (Password)"
                            fullWidth
                            value={formData.jshshir}
                            onChange={(e) => setFormData({ ...formData, jshshir: e.target.value })}
                        />
                        <TextField
                            label="Phone Number"
                            fullWidth
                            value={formData.phone_number}
                            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
