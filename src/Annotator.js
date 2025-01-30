import React, { useState, useCallback, useRef, useMemo, createContext } from 'react';
import { Container, Typography, Box, Button, Paper, Stack, Tooltip } from '@mui/material';
import { toast } from 'react-hot-toast';
import { LABELS, DOCUMENT } from './constants/annotationConstants';
import { calculateTextPosition, hasAnnotatedParent, checkOverlappingAnnotations } from './utils/textUtils';
import { AnnotatedText } from './components/AnnotatedText';
import { AnnotationList } from './components/AnnotationList';
import { ConfirmationDialog } from './components/ConfirmationDialog';
import { useAnnotations } from './hooks/useAnnotations';

export const AnnotationContext = createContext();

export default function Annotator() {
  const [selectedLabel, setSelectedLabel] = useState(LABELS[0]);
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

    if (hasAnnotatedParent(range.startContainer, container) || 
        hasAnnotatedParent(range.endContainer, container)) {
      toast.error('Cannot annotate over existing annotations!');
      return;
    }

    if (checkOverlappingAnnotations(start, end, annotations)) {
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

  const labelButtons = useMemo(() => (
    LABELS.map((label) => (
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
    ))
  ), [selectedLabel]);

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
            padding: 2,
            backgroundColor: 'white',
            zIndex: 1,
          }}
        >
          {labelButtons}
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
            text={DOCUMENT}
            annotations={annotations}
          />
        </Paper>

        <ConfirmationDialog
          open={showConfirmation}
          onConfirm={confirmAnnotation}
          onCancel={cancelAnnotation}
          annotation={pendingAnnotation}
          labelConfig={LABELS.find(l => l.id === pendingAnnotation?.label)}
        />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Annotations ({annotations.length})
          </Typography>
          
          <AnnotationList 
            annotations={annotations}
            onRemove={removeAnnotation}
          />

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