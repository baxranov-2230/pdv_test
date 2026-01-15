import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { PlayArrow, CheckCircle, Warning, CameraAlt } from '@mui/icons-material';
import { useAuth } from '../auth/AuthProvider';
import Webcam from 'react-webcam';
import { toast } from 'react-toastify';
import { useRef } from 'react';

export default function StudentDashboard() {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth();

    // Verification State
    const [verifyOpen, setVerifyOpen] = useState(false);
    const [selectedTestId, setSelectedTestId] = useState(null);
    const [verifying, setVerifying] = useState(false);
    const webcamRef = useRef(null);
    const [capturedImg, setCapturedImg] = useState(null);

    useEffect(() => {
        const fetchTests = async () => {
            try {
                // In future: endpoint to get "assigned" tests or just all open tests
                const res = await axios.get('http://localhost:8000/api/v1/tests/');
                setTests(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTests();
    }, []);

    const handleStartClick = (testId) => {
        setSelectedTestId(testId);
        setCapturedImg(null);
        setVerifyOpen(true);
    };

    const handleCapture = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setCapturedImg(imageSrc);
    };

    const handleRetake = () => {
        setCapturedImg(null);
    };

    const handleVerifyAndStart = async () => {
        if (!capturedImg) return;
        setVerifying(true);
        try {
            // Convert base64 to blob
            const fetchRes = await fetch(capturedImg);
            const blob = await fetchRes.blob();
            const file = new File([blob], "verification.jpg", { type: "image/jpeg" });

            const formData = new FormData();
            formData.append('file', file);

            await axios.post('http://localhost:8000/api/v1/students/verify-match', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success("Verification successful! Starting test...");
            setVerifyOpen(false);
            navigate(`/student/test/${selectedTestId}`);

        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.detail || "Verification failed. Please try again.");
            setCapturedImg(null);
        } finally {
            setVerifying(false);
        }
    };

    const handleClose = () => {
        setVerifyOpen(false);
        setSelectedTestId(null);
        setCapturedImg(null);
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Available Tests
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Welcome, {user?.full_name || 'Student'}. Select a test to begin.
            </Typography>

            <Grid container spacing={3}>
                {tests.map((test) => (
                    <Grid item key={test.id} xs={12} sm={6} md={4}>
                        <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h5" component="div" gutterBottom>
                                    {test.title}
                                </Typography>
                                {test.subject && (
                                    <Chip label={test.subject.name} color="primary" size="small" sx={{ mb: 2 }} />
                                )}
                                <Typography variant="body2" color="text.secondary">
                                    {test.description || "No description provided."}
                                </Typography>
                                <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                                    {test.questions.length} Questions
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button
                                    size="large"
                                    variant="contained"
                                    fullWidth
                                    startIcon={<PlayArrow />}
                                    onClick={() => handleStartClick(test.id)}
                                >
                                    Start Test
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {tests.length === 0 && (
                <Box sx={{ textAlign: 'center', mt: 5, opacity: 0.6 }}>
                    <Warning sx={{ fontSize: 60, mb: 1 }} />
                    <Typography>No tests are currently available for you.</Typography>
                </Box>
            )}

            {/* Verification Dialog */}
            <Dialog open={verifyOpen} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Verify Identity</DialogTitle>
                <DialogContent>
                    <Typography gutterBottom>
                        Please verify your face before starting the exam.
                    </Typography>
                    <Box sx={{ mt: 2, bgcolor: '#000', borderRadius: 2, overflow: 'hidden', minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {capturedImg ? (
                            <img src={capturedImg} alt="Captured" style={{ width: '100%' }} />
                        ) : (
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                width="100%"
                                videoConstraints={{ facingMode: "user" }}
                            />
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={verifying}>Cancel</Button>
                    {!capturedImg ? (
                        <Button onClick={handleCapture} variant="contained" startIcon={<CameraAlt />}>Capture</Button>
                    ) : (
                        <>
                            <Button onClick={handleRetake} disabled={verifying}>Retake</Button>
                            <Button
                                onClick={handleVerifyAndStart}
                                variant="contained"
                                color="primary"
                                disabled={verifying}
                            >
                                {verifying ? 'Verifying...' : 'Verify & Start'}
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
}
