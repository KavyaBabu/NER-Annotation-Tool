import React, { useState, useCallback, useRef, createContext, useContext } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Chip,
  IconButton,
  Stack,
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-hot-toast';

const AnnotationContext = createContext();

const CONSTANTS = {
  LABELS: [
    { 
      id: 'person', 
      name: 'Person', 
      color: 'primary', 
      bgColor: '#90caf9',
      description: 'Names of people or characters'
    },
    { 
      id: 'organization', 
      name: 'Organization', 
      color: 'success', 
      bgColor: '#a5d6a7',
      description: 'Names of companies, institutions, or groups'
    },
    { 
      id: 'location', 
      name: 'Location', 
      color: 'warning', 
      bgColor: '#ffcc80',
      description: 'Names of places or geographical features'
    },
    { 
      id: 'misc', 
      name: 'Misc', 
      color: 'secondary', 
      bgColor: '#ce93d8',
      description: 'Other named entities'
    },
  ],
  STYLE: {
    ANNOTATION: {
      padding: '2px 4px',
      margin: '0 2px',
      borderRadius: '3px',
      lineHeight: '1.6em',
      display: 'inline-block',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      verticalAlign: 'baseline',
      boxDecorationBreak: 'clone',
      WebkitBoxDecorationBreak: 'clone',
    }
  },
  SAMPLE_TEXT: `After bowling Somerset out for 83 on the opening morning at Grace Road, 
Leicestershire extended their first innings by 94 runs before being bowled out for 296 with 
England discard Andy Caddick taking three for 83.`
};

const useAnnotations = (initialState = []) => {
  const [annotations, setAnnotations] = useState(initialState);
  const [pendingAnnotation, setPendingAnnotation] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const addAnnotation = useCallback((newAnnotation) => {
    setPendingAnnotation({
      ...newAnnotation,
      id: Date.now(),
      createdAt: new Date().toISOString()
    });
    setShowConfirmation(true);
  }, []);

  const confirmAnnotation = useCallback(() => {
    if (pendingAnnotation) {
      setAnnotations(prev => [...prev, pendingAnnotation].sort((a, b) => a.start - b.start));
      toast.success('Annotation added');
      setPendingAnnotation(null);
      setShowConfirmation(false);
    }
  }, [pendingAnnotation]);

  const cancelAnnotation = useCallback(() => {
    setPendingAnnotation(null);
    setShowConfirmation(false);
  }, []);

  const removeAnnotation = useCallback((id) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
    toast.success('Annotation removed');
  }, []);

  const clearAnnotations = useCallback(() => {
    setAnnotations([]);
    toast.success('All annotations cleared');
  }, []);

  return {
    annotations,
    pendingAnnotation,
    showConfirmation,
    addAnnotation,
    confirmAnnotation,
    cancelAnnotation,
    removeAnnotation,
    clearAnnotations
  };
};

const ConfirmationDialog = ({ open, onConfirm, onCancel, annotation, labelConfig }) => (
  <Dialog open={open} onClose={onCancel}>
    <DialogTitle>Confirm Annotation</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Are you sure you want to add this annotation?
      </DialogContentText>
      <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Text: <strong>{annotation?.text}</strong>
        </Typography>
        <Typography variant="subtitle2">
          Label: <Chip 
            label={labelConfig?.name} 
            size="small" 
            sx={{ backgroundColor: labelConfig?.bgColor }}
          />
        </Typography>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Cancel</Button>
      <Button onClick={onConfirm} variant="contained" color="primary">
        Confirm
      </Button>
    </DialogActions>
  </Dialog>
);

const AnnotatedText = ({ text, annotations, onTextSelect }) => {
  const textRef = useRef(null);

  const renderAnnotatedText = () => {
    if (!annotations.length) return text;

    const segments = [];
    let lastIndex = 0;

    const sortedAnnotations = [...annotations].sort((a, b) => a.start - b.start);

    sortedAnnotations.forEach((annotation) => {
      if (annotation.start > lastIndex) {
        segments.push({
          text: text.slice(lastIndex, annotation.start),
          isAnnotation: false,
          id: `text-${lastIndex}`
        });
      }

      segments.push({
        text: text.slice(annotation.start, annotation.end),
        isAnnotation: true,
        annotation,
        id: `annotation-${annotation.id}`
      });

      lastIndex = annotation.end;
    });

    if (lastIndex < text.length) {
      segments.push({
        text: text.slice(lastIndex),
        isAnnotation: false,
        id: `text-${lastIndex}`
      });
    }

    return segments.map((segment) => {
      if (segment.isAnnotation) {
        const label = CONSTANTS.LABELS.find(l => l.id === segment.annotation.label);
        return (
          <span
            key={segment.id}
            style={{
              ...CONSTANTS.STYLE.ANNOTATION,
              backgroundColor: label.bgColor,
              border: '1px solid rgba(0,0,0,0.1)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
            data-annotation-id={segment.annotation.id}
            title={`${label.name}: ${segment.text}`}
          >
            {segment.text}
          </span>
        );
      }
      return (
        <span 
          key={segment.id} 
          className="non-annotated"
          style={{ lineHeight: '1.6em' }}
        >
          {segment.text}
        </span>
      );
    });
  };

  return (
    <div
      ref={textRef}
      className="annotated-text-container"
      style={{ 
        whiteSpace: 'pre-wrap',
        lineHeight: 1.6,
        position: 'relative',
        wordBreak: 'break-word',
        cursor: 'text',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        hyphens: 'auto'
      }}
    >
      {renderAnnotatedText()}
    </div>
  );
};

export default function Annotator() {
  const [selectedLabel, setSelectedLabel] = useState(CONSTANTS.LABELS[0]);
  const {
    annotations,
    pendingAnnotation,
    showConfirmation,
    addAnnotation,
    confirmAnnotation,
    cancelAnnotation,
    removeAnnotation,
    clearAnnotations
  } = useAnnotations([]);
  const containerRef = useRef(null);

  const calculateTextPosition = (container, node, offset) => {
    let position = 0;
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let currentNode = walker.nextNode();
    while (currentNode && currentNode !== node) {
      position += currentNode.textContent.length;
      currentNode = walker.nextNode();
    }
    
    return position + offset;
  };

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();
    
    if (!selectedText) return;

    const container = containerRef.current.querySelector('.annotated-text-container');
    const start = calculateTextPosition(container, range.startContainer, range.startOffset);
    const end = calculateTextPosition(container, range.endContainer, range.endOffset);

    if (start === end) return;

    const hasAnnotatedParent = (node) => {
      let current = node;
      while (current && current !== container) {
        if (current.hasAttribute && current.hasAttribute('data-annotation-id')) {
          return true;
        }
        current = current.parentNode;
      }
      return false;
    };

    if (hasAnnotatedParent(range.startContainer) || hasAnnotatedParent(range.endContainer)) {
      toast.error('Cannot annotate over existing annotations!');
      return;
    }

    const isOverlapping = annotations.some(ann =>
      (start >= ann.start && start < ann.end) ||
      (end > ann.start && end <= ann.end) ||
      (start <= ann.start && end >= ann.end)
    );

    if (isOverlapping) {
      toast.error('Annotations cannot overlap!');
      return;
    }

    addAnnotation({
      start,
      end,
      text: selectedText,
      label: selectedLabel.id
    });

    selection.removeAllRanges();
  }, [selectedLabel, annotations, addAnnotation]);

  return (
    <AnnotationContext.Provider value={{ annotations, selectedLabel }}>
      <Container maxWidth="md" sx={{ py: 4 }} ref={containerRef}>
      <Typography variant="h4" component="h1" gutterBottom>
        Text Entity Annotator
      </Typography>

      <Stack 
        direction="row" 
        spacing={1} 
        sx={{ 
          mb: 3,
          pb: 2,
          borderBottom: '1px solid rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          zIndex: 1,
        }}
      >
        {CONSTANTS.LABELS.map((label) => (
          <Tooltip 
            key={label.id} 
            title={label.description}
            arrow
            placement="top"
          >
            <Button
              variant={selectedLabel.id === label.id ? 'contained' : 'outlined'}
              color={label.color}
              onClick={() => setSelectedLabel(label)}
              sx={{
                position: 'relative',
                transition: 'all 0.2s ease',
                minWidth: '120px',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                },
                '&::after': selectedLabel.id === label.id ? {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderBottom: '6px solid #fff'
                } : {}
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <div style={{
                  width: 12,
                  height: 12,
                  backgroundColor: label.bgColor,
                  borderRadius: '50%',
                  border: '1px solid rgba(0,0,0,0.1)'
                }} />
                {label.name}
              </Box>
            </Button>
          </Tooltip>
        ))}

        {annotations.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            onClick={clearAnnotations}
            sx={{ ml: 'auto !important' }}
          >
            Clear All
          </Button>
        )}
      </Stack>

      <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 3,
            backgroundColor: '#fff',
            position: 'relative',
            '&:hover': {
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            },
            transition: 'box-shadow 0.2s ease'
          }}
          onMouseUp={handleTextSelection}
        >
          <AnnotatedText
            text={CONSTANTS.SAMPLE_TEXT}
            annotations={annotations}
            onTextSelect={handleTextSelection}
          />
        </Paper>

        <ConfirmationDialog
          open={showConfirmation}
          onConfirm={confirmAnnotation}
          onCancel={cancelAnnotation}
          annotation={pendingAnnotation}
          labelConfig={CONSTANTS.LABELS.find(l => l.id === pendingAnnotation?.label)}
        />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Annotations ({annotations.length})
        </Typography>

        {annotations.length === 0 ? (
          <Alert 
            severity="info"
            sx={{
              borderRadius: '8px',
              border: '1px solid rgba(0,0,0,0.1)'
            }}
          >
            No annotations yet. Select some text to begin.
          </Alert>
        ) : (
          <Stack spacing={1}>
            {annotations.map((ann) => {
              const labelConfig = CONSTANTS.LABELS.find((l) => l.id === ann.label);
              return (
                <Paper
                  key={ann.id}
                  variant="outlined"
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateX(4px)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                    <Chip
                      label={labelConfig.name}
                      color={labelConfig.color}
                      size="small"
                      sx={{ 
                        backgroundColor: labelConfig.bgColor,
                        minWidth: '100px',
                        justifyContent: 'center'
                      }}
                    />
                    <Typography
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1
                      }}
                    >
                      {ann.text}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      onClick={() => removeAnnotation(ann.id)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
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
                overflowX: 'auto',
                borderRadius: '8px',
                border: '1px solid rgba(0,0,0,0.1)'
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
    </AnnotationContext.Provider>
  );
}