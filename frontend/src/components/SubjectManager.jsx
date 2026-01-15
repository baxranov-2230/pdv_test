import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    Box,
    Paper,
    Typography,
    Button,
    TextField,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Book as BookIcon
} from '@mui/icons-material';

export default function SubjectManager() {
    const [subjects, setSubjects] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [newSubjectName, setNewSubjectName] = useState('');

    const fetchSubjects = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/v1/subjects/');
            setSubjects(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load subjects");
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    const handleCreate = async () => {
        if (!newSubjectName.trim()) {
            toast.warning("Subject name is required");
            return;
        }
        try {
            await axios.post('http://localhost:8000/api/v1/subjects/', { name: newSubjectName });
            toast.success("Subject created");
            setNewSubjectName('');
            setOpenDialog(false);
            fetchSubjects();
        } catch (err) {
            toast.error("Failed to create subject: " + (err.response?.data?.detail || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure? This might affect tests linked to this subject.")) {
            try {
                await axios.delete(`http://localhost:8000/api/v1/subjects/${id}`);
                toast.success("Subject deleted");
                fetchSubjects();
            } catch (err) {
                toast.error("Delete failed");
            }
        }
    };

    return (
        <Box>
            <Paper sx={{ p: 3, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BookIcon color="primary" /> Subject Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                >
                    Add Subject
                </Button>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell><b>ID</b></TableCell>
                            <TableCell><b>Name</b></TableCell>
                            <TableCell align="right"><b>Actions</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {subjects.map((sub) => (
                            <TableRow key={sub.id} hover>
                                <TableCell>{sub.id}</TableCell>
                                <TableCell>{sub.name}</TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" color="error" onClick={() => handleDelete(sub.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {subjects.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} align="center">No subjects found</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Add New Subject</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Subject Name"
                        fullWidth
                        variant="outlined"
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleCreate} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
