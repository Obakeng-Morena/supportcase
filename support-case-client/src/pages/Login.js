import React from 'react';
import { Card, CardContent, Container, TextField, Button, Typography } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import { login } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { setAuthToken } from '../services/api';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Required'),
});

const Login = () => {
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuthToken(data.data.token);
      navigate('/cases');
    },
    onError: (error) => {
      console.error(error);
    },
  });

  return (
    <Container
      sx={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent>
          <Typography variant="h5" component="h1" gutterBottom>
            Login
          </Typography>
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LoginSchema}
            onSubmit={(values) => mutation.mutate(values)}
          >
            {({ errors, touched }) => (
              <Form>
                <Field
                  as={TextField}
                  name="email"
                  label="Email"
                  fullWidth
                  margin="normal"
                  error={touched.email && !!errors.email}
                  helperText={touched.email && errors.email}
                />
                <Field
                  as={TextField}
                  name="password"
                  label="Password"
                  type="password"
                  fullWidth
                  margin="normal"
                  error={touched.password && !!errors.password}
                  helperText={touched.password && errors.password}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                  disabled={mutation.isLoading}
                >
                  {mutation.isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Login;