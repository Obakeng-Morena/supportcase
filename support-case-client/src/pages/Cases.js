import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TextField,
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCases, createCase, updateCase, deleteCase } from '../services/api';

const CaseSchema = Yup.object().shape({
  title: Yup.string().required('Required'),
  description: Yup.string().required('Required'),
});

const Cases = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editCase, setEditCase] = useState(null);

  const { data: cases = [] } = useQuery({
    queryKey: ['cases'],
    queryFn: getCases,
  });

  const createMutation = useMutation({
    mutationFn: createCase,
    onSuccess: () => {
      queryClient.invalidateQueries(['cases']);
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCase(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['cases']);
      handleClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCase,
    onSuccess: () => {
      queryClient.invalidateQueries(['cases']);
    },
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setEditCase(null);
  };

  const handleSubmit = (values) => {
    if (editCase) {
      updateMutation.mutate({ id: editCase.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleEdit = (caseItem) => {
    setEditCase(caseItem);
    setOpen(true);
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  return (
    <>
      <Button variant="contained" onClick={handleOpen} sx={{ mb: 2 }}>
        Add Support Case
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cases.map((caseItem) => (
            <TableRow key={caseItem.id}>
              <TableCell>{caseItem.title}</TableCell>
              <TableCell>{caseItem.description}</TableCell>
              <TableCell>
                <Button onClick={() => handleEdit(caseItem)}>Edit</Button>
                <Button onClick={() => handleDelete(caseItem.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editCase ? 'Edit Case' : 'Add Case'}</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={
              editCase || { title: '', description: '' }
            }
            validationSchema={CaseSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form>
                <Field
                  as={TextField}
                  name="title"
                  label="Title"
                  fullWidth
                  margin="normal"
                  error={touched.title && !!errors.title}
                  helperText={touched.title && errors.title}
                />
                <Field
                  as={TextField}
                  name="description"
                  label="Description"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={4}
                  error={touched.description && !!errors.description}
                  helperText={touched.description && errors.description}
                />
                <DialogActions>
                  <Button onClick={handleClose}>Cancel</Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={createMutation.isLoading || updateMutation.isLoading}
                  >
                    {editCase ? 'Update' : 'Create'}
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Cases;