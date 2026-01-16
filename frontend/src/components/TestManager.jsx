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
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider,
    Radio,
    FormControlLabel,
    List,
    Container,
    IconButton,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Tooltip,
    Card,
    CardContent,
    CardActions
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Edit as EditIcon,
    Visibility as VisibilityIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';

export default function TestManager() {
    const [tests, setTests] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [editingTestId, setEditingTestId] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [questions, setQuestions] = useState([
        { text: '', options: ['', '', '', ''], correct_option: 0 }
    ]);

    // View Test State
    const [viewTest, setViewTest] = useState(null);
    const [openViewDialog, setOpenViewDialog] = useState(false);

    // Delete Confirmation State
    const [deleteId, setDeleteId] = useState(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const fetchTests = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/v1/tests/');
            setTests(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load tests");
        }
    };

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
        fetchTests();
        fetchSubjects();
    }, []);

    const resetForm = () => {
        setIsEditing(false);
        setEditingTestId(null);
        setTitle('');
        setDescription('');
        setSelectedSubject('');
        setQuestions([{ text: '', options: ['', '', '', ''], correct_option: 0 }]);
    };

    const addQuestion = () => {
        setQuestions([...questions, { text: '', options: ['', '', '', ''], correct_option: 0 }]);
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const updateOption = (qIndex, oIndex, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const removeQuestion = (index) => {
        if (questions.length > 1) {
            const newQuestions = [...questions];
            newQuestions.splice(index, 1);
            setQuestions(newQuestions);
        }
    }

    const handleSave = async () => {
        if (!title || !selectedSubject) {
            toast.warning("Test title and Subject are required");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                title,
                description,
                subject_id: selectedSubject,
                questions
            };

            if (isEditing) {
                await axios.put(`http://localhost:8000/api/v1/tests/${editingTestId}`, payload);
                toast.success('Test updated successfully!');
            } else {
                await axios.post('http://localhost:8000/api/v1/tests/', payload);
                toast.success('Test created successfully!');
            }

            resetForm();
            fetchTests();
        } catch (err) {
            toast.error('Error saving test: ' + (err.response?.data?.detail || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (test) => {
        setIsEditing(true);
        setEditingTestId(test.id);
        setTitle(test.title);
        setDescription(test.description || '');
        setSelectedSubject(test.subject_id);
        // Map questions to match proper format if needed, though they should be consistent
        setQuestions(test.questions.map(q => ({
            text: q.text,
            options: [...q.options],
            correct_option: q.correct_option
        })));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setOpenDeleteDialog(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`http://localhost:8000/api/v1/tests/${deleteId}`);
            toast.success("Test deleted successfully");
            fetchTests();
            if (editingTestId === deleteId) {
                resetForm();
            }
        } catch (err) {
            toast.error("Failed to delete test");
        } finally {
            setOpenDeleteDialog(false);
            setDeleteId(null);
        }
    };

    const handleViewTest = (test) => {
        setViewTest(test);
        setOpenViewDialog(true);
    };

    return (
        <Grid container spacing={4}>
            {/* Create/Edit Test Section */}
            <Grid item xs={12} md={7}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
                            {isEditing ? <EditIcon color="primary" /> : <AddIcon color="primary" />}
                            {isEditing ? 'Edit Test' : 'Create New Test'}
                            {isEditing && <Chip label={`ID: ${editingTestId}`} size="small" sx={{ ml: 1 }} />}
                        </Typography>
                        {isEditing && (
                            <Button variant="outlined" color="secondary" startIcon={<CancelIcon />} onClick={resetForm}>
                                Cancel Edit
                            </Button>
                        )}
                    </Box>

                    <Box component="form" noValidate autoComplete="off">
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Subject"
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    SelectProps={{ native: true }}
                                    InputLabelProps={{ shrink: true }}
                                    variant="outlined"
                                >
                                    <option value="">-- Select Subject --</option>
                                    {subjects.map((sub) => (
                                        <option key={sub.id} value={sub.id}>
                                            {sub.name}
                                        </option>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Test Title"
                                    variant="outlined"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    variant="outlined"
                                    multiline
                                    rows={2}
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </Grid>
                        </Grid>

                        <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>Questions</Typography>

                        {questions.map((q, qIndex) => (
                            <Accordion key={qIndex} defaultExpanded sx={{ mb: 2, border: '1px solid #e0e0e0', borderRadius: '8px !important', '&:before': { display: 'none' } }} elevation={0}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#f8f9fa', borderRadius: '8px 8px 0 0' }}>
                                    <Typography fontWeight="medium">Question {qIndex + 1}</Typography>
                                </AccordionSummary>
                                <AccordionDetails sx={{ p: 3 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Question Text"
                                                value={q.text}
                                                onChange={e => updateQuestion(qIndex, 'text', e.target.value)}
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Options (Select radio for correct answer):</Typography>
                                            {q.options.map((opt, oIndex) => (
                                                <Box key={oIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <Radio
                                                        checked={q.correct_option === oIndex}
                                                        onChange={() => updateQuestion(qIndex, 'correct_option', oIndex)}
                                                        size="small"
                                                    />
                                                    <TextField
                                                        fullWidth
                                                        placeholder={`Option ${oIndex + 1}`}
                                                        value={opt}
                                                        onChange={e => updateOption(qIndex, oIndex, e.target.value)}
                                                        size="small"
                                                        variant="standard"
                                                        InputProps={{ disableUnderline: false }}
                                                    />
                                                </Box>
                                            ))}
                                        </Grid>
                                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button
                                                color="error"
                                                size="small"
                                                onClick={() => removeQuestion(qIndex)}
                                                startIcon={<DeleteIcon />}
                                                disabled={questions.length === 1}
                                            >
                                                Remove
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>
                        ))}

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                            <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={addQuestion}
                            >
                                Add Question
                            </Button>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                onClick={handleSave}
                                disabled={loading}
                                sx={{ px: 4 }}
                            >
                                {loading ? 'Saving...' : (isEditing ? 'Update Test' : 'Save Test')}
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Grid>

            {/* Existing Tests List */}
            <Grid item xs={12} md={5}>
                <Paper elevation={3} sx={{ p: 0, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                    <Box sx={{ p: 2, bgcolor: '#f4f6f8', borderBottom: '1px solid #e0e0e0' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                            Existing Tests ({tests.length})
                        </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
                        {tests.length === 0 ? (
                            <Box sx={{ textAlign: 'center', p: 4, color: 'text.secondary' }}>
                                <Typography>No tests found.</Typography>
                            </Box>
                        ) : (
                            <Grid container spacing={2}>
                                {tests.map((test) => (
                                    <Grid item xs={12} key={test.id}>
                                        <Card variant="outlined" sx={{
                                            borderRadius: 2,
                                            transition: '0.2s',
                                            '&:hover': {
                                                boxShadow: 3,
                                                borderColor: 'primary.main'
                                            }
                                        }}>
                                            <CardContent sx={{ pb: 1 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                    <Typography variant="h6" component="div" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                                                        {test.title}
                                                    </Typography>
                                                    {test.subject && (
                                                        <Chip
                                                            label={test.subject.name}
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                        />
                                                    )}
                                                </Box>
                                                <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1 }}>
                                                    {test.description || "No description"}
                                                </Typography>
                                                <Typography variant="caption" display="block">
                                                    {test.questions.length} Questions
                                                </Typography>
                                            </CardContent>
                                            <Divider />
                                            <CardActions sx={{ justifyContent: 'flex-end', bgcolor: '#fafafa' }}>
                                                <Tooltip title="View Details">
                                                    <IconButton size="small" color="info" onClick={() => handleViewTest(test)}>
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit">
                                                    <IconButton size="small" color="primary" onClick={() => handleEditClick(test)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton size="small" color="error" onClick={() => handleDeleteClick(test.id)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                </Paper>
            </Grid>

            {/* View Test Dialog */}
            <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>
                    {viewTest?.title}
                    {viewTest?.subject && <Typography variant="subtitle2" component="span" sx={{ ml: 2, opacity: 0.8 }}>({viewTest.subject.name})</Typography>}
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Typography variant="body1" paragraph>{viewTest?.description}</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="h6" gutterBottom>Questions ({viewTest?.questions?.length})</Typography>
                    <List>
                        {viewTest?.questions.map((q, idx) => (
                            <Paper key={q.id} elevation={1} sx={{ p: 2, mb: 2, bgcolor: '#f9f9f9' }}>
                                <Typography fontWeight="bold" gutterBottom>{idx + 1}. {q.text}</Typography>
                                <List dense>
                                    {q.options.map((opt, oIdx) => (
                                        <Grid container key={oIdx} alignItems="center" sx={{ mb: 0.5 }}>
                                            <Radio
                                                checked={q.correct_option === oIdx}
                                                readOnly
                                                size="small"
                                                disabled={q.correct_option !== oIdx}
                                                sx={{
                                                    color: q.correct_option === oIdx ? 'success.main' : 'action.disabled',
                                                    '&.Mui-checked': { color: 'success.main' }
                                                }}
                                            />
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: q.correct_option === oIdx ? 'bold' : 'normal',
                                                    color: q.correct_option === oIdx ? 'success.main' : 'text.primary'
                                                }}
                                            >
                                                {opt}
                                            </Typography>
                                        </Grid>
                                    ))}
                                </List>
                            </Paper>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this test? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
}
