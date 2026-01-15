import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    Box,
    Paper,
    Typography,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    Button,
    CircularProgress,
    Divider,
    LinearProgress
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

export default function TestTaking() {
    const { testId } = useParams();
    const navigate = useNavigate();
    const [test, setTest] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { 0: 2, 1: 0 } -> questionIndex: optionIndex
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchTest = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/api/v1/tests/${testId}`);
                if (res.data.questions) {
                    res.data.questions.sort((a, b) => a.id - b.id);
                }
                setTest(res.data);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load test");
                navigate('/student/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchTest();
    }, [testId, navigate]);

    const handleOptionChange = (optionIndex) => {
        setAnswers({
            ...answers,
            [currentQuestionIndex]: optionIndex
        });
    };

    const handleNext = () => {
        if (currentQuestionIndex < test.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length < test.questions.length) {
            if (!window.confirm("You haven't answered all questions. Submit anyway?")) {
                return;
            }
        }

        setSubmitting(true);
        try {
            // Transform answers object to list ordered by question index (assuming test.questions is ordered)
            // Or backend logic: endpoint expects `answers: List[int]`
            // Let's verify backend expectation:
            // class ResultSubmit(BaseModel):
            //     test_id: int
            //     answers: List[int]

            // Backend logic iterates by index... brittle if not sorted, but let's assume order matches.
            // We need to construct array [ans0, ans1, ans2...]

            const answersArray = test.questions.map((_, idx) =>
                answers[idx] !== undefined ? parseInt(answers[idx]) : -1 // -1 for unanswered? Backend might strictly match correct_option which is >=0
            );

            const payload = {
                test_id: parseInt(testId),
                answers: answersArray
            };

            const res = await axios.post('http://localhost:8000/api/v1/tests/submit', payload);

            toast.success(`Test Submitted! Score: ${res.data.score}%`);
            navigate('/student/dashboard'); // Or show result page
        } catch (err) {
            console.error(err);
            toast.error("Submission failed. Try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    if (!test) return null;

    const currentQuestion = test.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / test.questions.length) * 100;

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5">{test.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                        Question {currentQuestionIndex + 1} of {test.questions.length}
                    </Typography>
                </Box>
                <LinearProgress variant="determinate" value={progress} sx={{ mb: 4, borderRadius: 1, height: 8 }} />

                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                    {currentQuestion.text}
                </Typography>

                <FormControl component="fieldset" sx={{ width: '100%', mb: 4 }}>
                    <RadioGroup
                        value={answers[currentQuestionIndex] !== undefined ? answers[currentQuestionIndex] : ''}
                        onChange={(e) => handleOptionChange(parseInt(e.target.value))}
                    >
                        {currentQuestion.options.map((opt, idx) => (
                            <FormControlLabel
                                key={idx}
                                value={idx}
                                control={<Radio />}
                                label={opt}
                                sx={{
                                    mb: 1,
                                    border: '1px solid #eee',
                                    borderRadius: 1,
                                    p: 1,
                                    ml: 0,
                                    mr: 0,
                                    '&:hover': { bgcolor: '#f9f9f9' }
                                }}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>

                <Divider sx={{ mb: 3 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                        disabled={currentQuestionIndex === 0}
                        onClick={handlePrev}
                    >
                        Previous
                    </Button>

                    {currentQuestionIndex === test.questions.length - 1 ? (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit}
                            disabled={submitting}
                            endIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                        >
                            Submit Test
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={handleNext}
                        >
                            Next
                        </Button>
                    )}
                </Box>
            </Paper>
        </Box>
    );
}
