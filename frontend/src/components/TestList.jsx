import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    Box,
    Paper,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    CardActions,
    IconButton,
    Chip,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    Divider,
    Radio,
    CircularProgress
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Visibility as VisibilityIcon,
    Quiz as QuizIcon
} from '@mui/icons-material';

export default function TestList() {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewTest, setViewTest] = useState(null);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const navigate = useNavigate();

    const fetchTests = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/v1/tests/');
            setTests(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load tests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTests();
    }, []);

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setOpenDeleteDialog(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`/api/v1/tests/${deleteId}`);
            toast.success("Test deleted successfully");
            fetchTests();
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

    const isImage = (url) => {
        return url && (url.startsWith('/uploads') || url.startsWith('http'));
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Test Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/admin/tests/create')}
                    size="large"
                >
                    Create New Test
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : tests.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">No tests found. Click "Create New Test" to get started.</Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {tests.map((test) => (
                        <Grid item xs={12} sm={6} md={4} key={test.id}>
                            <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
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
                                    <Typography variant="body2" color="text.secondary" paragraph noWrap>
                                        {test.description || "No description"}
                                    </Typography>
                                    <Chip
                                        icon={<QuizIcon />}
                                        label={`${test.questions.length} Questions`}
                                        size="small"
                                        sx={{ bgcolor: '#eff6ff' }}
                                    />
                                </CardContent>
                                <Divider />
                                <CardActions sx={{ justifyContent: 'flex-end', bgcolor: '#fafafa' }}>
                                    <Tooltip title="View Details">
                                        <IconButton size="small" color="info" onClick={() => handleViewTest(test)}>
                                            <VisibilityIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edit">
                                        <IconButton size="small" color="primary" onClick={() => navigate(`/admin/tests/edit/${test.id}`)}>
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton size="small" color="error" onClick={() => handleDeleteClick(test.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

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
                                <Typography fontWeight="bold" gutterBottom component="div">
                                    <span style={{ marginRight: '8px' }}>{String.fromCharCode(65 + idx)})</span>
                                    <div
                                        className="rich-text-content"
                                        style={{ display: 'inline-block', verticalAlign: 'top' }}
                                        dangerouslySetInnerHTML={{ __html: q.text }}
                                    />
                                </Typography>
                                {q.image && (
                                    <Box sx={{ mb: 2 }}>
                                        <img
                                            src={`/rest${q.image}`}
                                            alt="Question"
                                            style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '4px' }}
                                        />
                                    </Box>
                                )}
                                <List dense>
                                    {q.options.map((opt, oIdx) => {
                                        const isObj = typeof opt === 'object';
                                        const text = isObj ? opt.text : opt;
                                        const image = isObj ? opt.image : null;

                                        return (
                                            <Grid container key={oIdx} alignItems="center" sx={{ mb: 1 }}>
                                                <Radio
                                                    checked={q.correct_option === oIdx}
                                                    readOnly
                                                    size="small"
                                                    disabled={q.correct_option !== oIdx}
                                                />
                                                <Box>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: q.correct_option === oIdx ? 'bold' : 'normal',
                                                            color: q.correct_option === oIdx ? 'success.main' : 'text.primary',
                                                            display: 'inline-block',
                                                            verticalAlign: 'top'
                                                        }}
                                                    >
                                                        <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: text }} />
                                                    </Typography>
                                                    {image && (
                                                        <img
                                                            src={`/rest${image}`}
                                                            alt="Option"
                                                            style={{ maxWidth: '150px', maxHeight: '100px', marginTop: '5px', borderRadius: '4px' }}
                                                        />
                                                    )}
                                                </Box>
                                            </Grid>
                                        );
                                    })}
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
        </Box>
    );
}
