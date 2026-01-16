import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
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
    Radio,
    CircularProgress,
    IconButton,
    InputAdornment
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    PhotoCamera as PhotoIcon,
    Image as ImageIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import Editor from './Editor';

export default function TestForm() {
    const { id } = useParams();
    const isEditing = !!id;
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [subjects, setSubjects] = useState([]);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [questions, setQuestions] = useState([
        { text: '', image: null, options: [{ text: '', image: null }, { text: '', image: null }, { text: '', image: null }, { text: '', image: null }], correct_option: 0 }
    ]);

    useEffect(() => {
        fetchSubjects();
        if (isEditing) {
            fetchTest();
        }
    }, [id]);

    const fetchSubjects = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/v1/subjects/');
            setSubjects(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load subjects");
        }
    };

    const fetchTest = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:8000/api/v1/tests/${id}`);
            const test = res.data;
            setTitle(test.title);
            setDescription(test.description || '');
            setSelectedSubject(test.subject_id || '');

            // Normalize questions
            const normalizedQuestions = test.questions.map(q => ({
                text: q.text,
                image: q.image || null,
                correct_option: q.correct_option,
                options: q.options.map(opt => {
                    if (typeof opt === 'string') return { text: opt, image: null };
                    return { text: opt.text || '', image: opt.image || null };
                })
            }));
            setQuestions(normalizedQuestions);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load test");
            navigate('/admin/tests');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await axios.post('http://localhost:8000/api/v1/upload/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data.url;
        } catch (err) {
            console.error(err);
            toast.error("Image upload failed");
            return null;
        }
    };

    const addQuestion = () => {
        setQuestions([...questions, {
            text: '',
            image: null,
            options: [{ text: '', image: null }, { text: '', image: null }, { text: '', image: null }, { text: '', image: null }],
            correct_option: 0
        }]);
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const uploadQuestionImage = async (index, file) => {
        if (!file) return;
        const url = await handleImageUpload(file);
        if (url) {
            updateQuestion(index, 'image', url);
        }
    };

    const updateOption = (qIndex, oIndex, field, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex][field] = value;
        setQuestions(newQuestions);
    };

    const uploadOptionImage = async (qIndex, oIndex, file) => {
        if (!file) return;
        const url = await handleImageUpload(file);
        if (url) {
            updateOption(qIndex, oIndex, 'image', url);
        }
    };

    const removeQuestion = (index) => {
        if (questions.length > 1) {
            const newQuestions = [...questions];
            newQuestions.splice(index, 1);
            setQuestions(newQuestions);
        }
    };

    // Helper to trigger hidden file input
    const fileInputRefs = useRef({});
    const triggerFileInput = (key) => {
        if (fileInputRefs.current[key]) {
            fileInputRefs.current[key].click();
        }
    };

    const handleSave = async () => {
        if (!title || !selectedSubject) {
            toast.warning("Test title and Subject are required");
            return;
        }

        setSubmitting(true);
        try {
            // Prepare payload - options need to be cleaned up? 
            // The backend now accepts objects in options list.
            const payload = {
                title,
                description,
                subject_id: selectedSubject,
                questions
            };

            if (isEditing) {
                await axios.put(`http://localhost:8000/api/v1/tests/${id}`, payload);
                toast.success('Test updated successfully!');
            } else {
                await axios.post('http://localhost:8000/api/v1/tests/', payload);
                toast.success('Test created successfully!');
            }
            navigate('/admin/tests');
        } catch (err) {
            toast.error('Error saving test: ' + (err.response?.data?.detail || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/tests')} sx={{ mr: 2 }}>
                        Back
                    </Button>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {isEditing ? 'Edit Test' : 'Create New Test'}
                    </Typography>
                </Box>

                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            fullWidth
                            label="Subject"
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
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
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Test Title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={2}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </Grid>
                </Grid>

                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Questions</Typography>

                {questions.map((q, qIndex) => (
                    <Accordion key={qIndex} defaultExpanded sx={{ mb: 2, border: '1px solid #e0e0e0', borderRadius: '8px !important', '&:before': { display: 'none' } }} elevation={0}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#f8f9fa', borderRadius: '8px 8px 0 0' }}>
                            <Typography fontWeight="medium">Question {qIndex + 1}</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 3 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Question Text & Image</Typography>
                                        <Editor
                                            value={q.text}
                                            onChange={(val) => updateQuestion(qIndex, 'text', val)}
                                            placeholder="Type question here..."
                                        />
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Options:</Typography>
                                    {q.options.map((opt, oIndex) => (
                                        <Box key={oIndex} sx={{ display: 'flex', flexDirection: 'column', mb: 2, p: 2, border: '1px dashed #eee', borderRadius: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                                <Radio
                                                    checked={q.correct_option === oIndex}
                                                    onChange={() => updateQuestion(qIndex, 'correct_option', oIndex)}
                                                    sx={{ mt: 1 }}
                                                />
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                                        Option {oIndex + 1}
                                                    </Typography>
                                                    <Editor
                                                        value={opt.text}
                                                        onChange={val => updateOption(qIndex, oIndex, 'text', val)}
                                                        placeholder={`Option ${oIndex + 1}`}
                                                    />
                                                </Box>
                                            </Box>
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
                        startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        onClick={handleSave}
                        disabled={submitting}
                        sx={{ px: 4 }}
                    >
                        {submitting ? 'Saving...' : 'Save Test'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}
