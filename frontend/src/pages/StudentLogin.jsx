import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Alert
} from '@mui/material';
import { CameraAlt as CameraIcon, Login as LoginIcon } from '@mui/icons-material';
import { useAuth } from '../auth/AuthProvider';

export default function StudentLogin() {
    const navigate = useNavigate();
    const { login, setAuthData } = useAuth(); // Use auth provider to set token if we update context

    const webcamRef = useRef(null);
    const [studentId, setStudentId] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: ID, 2: Face
    const [capturedImage, setCapturedImage] = useState(null);

    const handleIdSubmit = async (e) => {
        e.preventDefault();
        if (!studentId.trim()) {
            toast.warning("Please enter your Student ID");
            return;
        }
        setStep(2);
    };

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setCapturedImage(imageSrc);
    }, [webcamRef]);

    const retake = () => {
        setCapturedImage(null);
    };

    const handleVerify = async () => {
        if (!capturedImage) return;

        setLoading(true);
        try {
            // Convert base64 to blob
            const fetchRes = await fetch(capturedImage);
            const blob = await fetchRes.blob();
            const file = new File([blob], "face.jpg", { type: "image/jpeg" });

            const formData = new FormData();
            formData.append('student_id', studentId);
            formData.append('file', file);

            const res = await axios.post('/api/v1/students/verify', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            const { access_token, student } = res.data;

            // Update Auth Context using helper
            setAuthData(access_token);

            toast.success(`Welcome, ${student.full_name}!`);
            navigate('/student/dashboard');

        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.detail || "Verification failed. Please try again.");
            setCapturedImage(null); // Reset to allow retry
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 500, textAlign: 'center' }}>
                <Typography variant="h4" component="h1" gutterBottom color="primary">
                    Student Login
                </Typography>

                {step === 1 ? (
                    <Box component="form" onSubmit={handleIdSubmit} sx={{ mt: 3 }}>
                        <Typography variant="body1" sx={{ mb: 3 }}>
                            Enter your unique Student ID to begin.
                        </Typography>
                        <TextField
                            fullWidth
                            label="Student ID"
                            variant="outlined"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            sx={{ mb: 3 }}
                            autoFocus
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            type="submit"
                            endIcon={<CameraIcon />}
                        >
                            Next: Face Verification
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            Position your face within the frame.
                        </Typography>

                        <Box sx={{ mb: 3, bgcolor: '#000', borderRadius: 2, overflow: 'hidden', position: 'relative', minHeight: 300 }}>
                            {capturedImage ? (
                                <img src={capturedImage} alt="Captured" style={{ width: '100%', display: 'block' }} />
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

                        {loading ? (
                            <CircularProgress />
                        ) : (
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                {capturedImage ? (
                                    <>
                                        <Button variant="outlined" onClick={retake}>
                                            Retake
                                        </Button>
                                        <Button variant="contained" onClick={handleVerify} endIcon={<LoginIcon />}>
                                            Verify & Login
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="outlined" onClick={() => setStep(1)}>
                                            Back
                                        </Button>
                                        <Button variant="contained" onClick={capture} startIcon={<CameraIcon />}>
                                            Capture Photo
                                        </Button>
                                    </>
                                )}
                            </Box>
                        )}
                    </Box>
                )}
            </Paper>
        </Box>
    );
}
