import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCases } from '../services/api';
import { Container, Typography, TextField, Button } from '@mui/material';

const CaseDetail = () => {
  const { id } = useParams();
  const { data: cases } = useQuery({
    queryKey: ['cases'],
    queryFn: getCases,
  });

  const caseItem = cases?.find((c) => c.id === parseInt(id));

  if (!caseItem) return <Typography>Case not found</Typography>;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        {caseItem.title}
      </Typography>
      <Typography paragraph>{caseItem.description}</Typography>
      <Typography variant="h6">Comments</Typography>
      <TextField
        label="Add a comment"
        fullWidth
        margin="normal"
        multiline
        rows={4}
      />
      <Button variant="contained">Post Comment</Button>
      <Typography variant="h6" sx={{ mt: 2 }}>
        Attachments
      </Typography>
      <input type="file" />
    </Container>
  );
};

export default CaseDetail;