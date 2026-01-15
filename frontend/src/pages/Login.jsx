import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Link,
    Avatar
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            username: '',
            password: ''
        },
        validationSchema: Yup.object({
            username: Yup.string().required('Username is required'),
            password: Yup.string().required('Password is required')
        }),
        onSubmit: async (values, { setSubmitting }) => {
            try {
                await login(values.username, values.password);
                toast.success('Welcome back, Admin!');
                navigate('/admin/students');
            } catch (err) {
                toast.error(err.response?.data?.detail || 'Login failed');
            } finally {
                setSubmitting(false);
            }
        }
    });

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper
                    elevation={6}
                    sx={{
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        borderRadius: 2
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Admin Sign in
                    </Typography>
                    <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={formik.values.username}
                            onChange={formik.handleChange}
                            error={formik.touched.username && Boolean(formik.errors.username)}
                            helperText={formik.touched.username && formik.errors.username}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            error={formik.touched.password && Boolean(formik.errors.password)}
                            helperText={formik.touched.password && formik.errors.password}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, p: 1.5, fontSize: '1rem' }}
                            disabled={formik.isSubmitting}
                        >
                            {formik.isSubmitting ? 'Signing in...' : 'Sign In'}
                        </Button>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Link href="/student-login" variant="body2">
                                {"Go to Student Login"}
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}
