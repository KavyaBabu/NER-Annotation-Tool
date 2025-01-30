import React from 'react';
import { Box, Paper, Stack, IconButton, Typography, Chip, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { LABELS } from '../constants/annotationConstants';

export const AnnotationList = React.memo(({ annotations, onRemove }) => {
  if (annotations.length === 0) {
    return (
      <Alert 
        severity="info"
        sx={{
          borderRadius: '8px',
          border: '1px solid rgba(0,0,0,0.1)'
        }}
      >
        No annotations yet. Select some text to begin.
      </Alert>
    );
  }

  return (
    <Stack spacing={1}>
      {annotations.map((ann) => {
        const labelConfig = LABELS.find((l) => l.id === ann.label);
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
            <IconButton
              onClick={() => onRemove(ann.id)}
              color="error"
              size="small"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Paper>
        );
      })}
    </Stack>
  );
});
