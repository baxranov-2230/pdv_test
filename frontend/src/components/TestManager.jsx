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
    ListItem,
    ListItemText,
    Container,
    IconButton,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Quiz as QuizIcon
} from '@mui/icons-material';

export default function TestManager() {
    const [tests, setTests] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);

    // Create Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [questions, setQuestions] = useState([
        { text: '', options: ['', '', '', ''], correct_option: 0 }
    ]);

    // View Test State
    const [viewTest, setViewTest] = useState(null);
    const [openViewDialog, setOpenViewDialog] = useState(false);

    const fetchTests = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/v1/tests/');
            setTests(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSubjects = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/v1/subjects/');
            setSubjects(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTests();
        fetchSubjects();
    }, []);

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

    const handleCreate = async () => {
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
            await axios.post('http://localhost:8000/api/v1/tests/', payload);
            toast.success('Test created successfully!');
            setTitle('');
            setDescription('');
            setSelectedSubject('');
            setQuestions([{ text: '', options: ['', '', '', ''], correct_option: 0 }]);
            fetchTests();
        } catch (err) {
            toast.error('Error creating test: ' + (err.response?.data?.detail || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleViewTest = (test) => {
        setViewTest(test);
        setOpenViewDialog(true);
    };

    return (
        <Grid container spacing={4}>
            {/* Create Test Section */}
            <Grid item xs={12} md={7}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AddIcon color="primary" /> Create New Test
                    </Typography>

                    <Box component="form" noValidate autoComplete="off" sx={{ mt: 3 }}>
                        <TextField
                            select
                            fullWidth
                            label="Select Subject"
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            sx={{ mb: 2 }}
                            SelectProps={{ native: true }}
                            InputLabelProps={{ shrink: true }}
                        >
                            <option value="">-- Select Subject --</option>
                            {subjects.map((sub) => (
                                <option key={sub.id} value={sub.id}>
                                    {sub.name}
                                </option>
                            ))}
                        </TextField>

                        <TextField
                            fullWidth
                            label="Test Title"
                            variant="outlined"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            sx={{ mb: 2 }}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            variant="outlined"
                            multiline
                            rows={3}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            sx={{ mb: 3 }}
                        />

                        <Typography variant="h6" gutterBottom>Questions</Typography>

                        {questions.map((q, qIndex) => (
                            <Accordion key={qIndex} defaultExpanded sx={{ mb: 2, border: '1px solid #eee' }} disableGutters elevation={0}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#fafafa' }}>
                                    <Typography fontWeight="bold">Question {qIndex + 1}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
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
                                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Options (Select Correct Answer):</Typography>
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
                                                Remove Question
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
                                onClick={handleCreate}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Test'}
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Grid>

            {/* Existing Tests Sidebar */}
            <Grid item xs={12} md={5}>
                <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <QuizIcon color="secondary" /> Existing Tests
                    </Typography>
                    <List>
                        {tests.length === 0 ? (
                            <Typography color="text.secondary">No tests created yet.</Typography>
                        ) : tests.map((t) => (
                            <Paper
                                key={t.id}
                                sx={{ mb: 2, p: 2, cursor: 'pointer', '&:hover': { bgcolor: '#f0f4ff' }, borderLeft: '4px solid #1976d2' }}
                                elevation={1}
                                onClick={() => handleViewTest(t)}
                            >
                                <Typography variant="h6" color="primary">{t.title}</Typography>
                                {t.subject && (
                                    <Typography variant="caption" sx={{ bgcolor: '#e3f2fd', px: 1, py: 0.5, borderRadius: 1, display: 'inline-block', mb: 1 }}>
                                        {t.subject.name}
                                    </Typography>
                                )}
                                <Typography variant="body2" color="text.secondary" noWrap>
                                    {t.description || "No description"}
                                </Typography>
                                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                    {t.questions.length} Questions
                                </Typography>
                            </Paper>
                        ))}
                    </List>
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
                                        <ListItem key={oIdx}>
                                            <ListItemText
                                                primary={opt}
                                                primaryTypographyProps={{
                                                    color: oIdx === q.correct_option ? 'success.main' : 'text.primary',
                                                    fontWeight: oIdx === q.correct_option ? 'bold' : 'normal'
                                                }}
                                            />
                                        </ListItem>
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
        </Grid>
    );
}
