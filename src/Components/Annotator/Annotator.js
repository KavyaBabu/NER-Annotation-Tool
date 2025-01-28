import React, { useState, useCallback } from 'react';
import { 
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Chip,
  IconButton,
  Stack,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-hot-toast';

const LABELS = [
  { id: 'person', name: 'Person', color: 'primary' },
  { id: 'organization', name: 'Organization', color: 'success' },
  { id: 'location', name: 'Location', color: 'warning' },
  { id: 'misc', name: 'Misc', color: 'secondary' }
];

const SAMPLE_TEXT = `After bowling Somerset out for 83 on the opening morning at Grace Road, 
Leicestershire extended their first innings by 94 runs before being bowled out for 296 with 
England discard Andy Caddick taking three for 83.`;

export default function Annotator() {
  const [selectedLabel, setSelectedLabel] = useState(LABELS[0]);
  const [annotations, setAnnotations] = useState([]);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    
    if (!selection.toString().trim()) return;

    const start = range.startOffset;
    const end = range.endOffset;
    const text = selection.toString();

    const isOverlapping = annotations.some(ann => 
      (start >= ann.start && start <= ann.end) ||
      (end >= ann.start && end <= ann.end)
    );

    if (isOverlapping) {
      toast.error('Annotations cannot overlap!');
      return;
    }

    setAnnotations(prev => [...prev, {
      id: Date.now(),
      start,
      end,
      text,
      label: selectedLabel.id
    }].sort((a, b) => a.start - b.start));

    selection.removeAllRanges();
  }, [selectedLabel, annotations]);

  const removeAnnotation = (id) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
    toast.success('Annotation removed');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Text Entity Annotator
      </Typography>
      
      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        {LABELS.map(label => (
          <Button
            key={label.id}
            variant={selectedLabel.id === label.id ? "contained" : "outlined"}
            color={label.color}
            onClick={() => setSelectedLabel(label)}
          >
            {label.name}
          </Button>
        ))}
      </Stack>

      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          cursor: 'text',
          backgroundColor: '#fff'
        }}
        onMouseUp={handleTextSelection}
      >
        <Typography>{SAMPLE_TEXT}</Typography>
      </Paper>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Annotations
        </Typography>
        
        {annotations.length === 0 ? (
          <Alert severity="info">
            No annotations yet. Select some text to begin.
          </Alert>
        ) : (
          <Stack spacing={1}>
            {annotations.map(ann => {
              const labelConfig = LABELS.find(l => l.id === ann.label);
              return (
                <Paper
                  key={ann.id}
                  variant="outlined"
                  sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={labelConfig.name}
                      color={labelConfig.color}
                      size="small"
                    />
                    <Typography>{ann.text}</Typography>
                  </Box>
                  <IconButton
                    onClick={() => removeAnnotation(ann.id)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Paper>
              );
            })}
          </Stack>
        )}

        {annotations.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              JSON Output
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                backgroundColor: '#f5f5f5',
                overflowX: 'auto'
              }}
            >
              <pre style={{ margin: 0 }}>
                {JSON.stringify(annotations, null, 2)}
              </pre>
            </Paper>
          </Box>
        )}
      </Box>
    </Container>
  );
}