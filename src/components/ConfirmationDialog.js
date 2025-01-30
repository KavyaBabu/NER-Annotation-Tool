import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip
} from '@mui/material';

export const ConfirmationDialog = React.memo(({ 
  open, 
  onConfirm, 
  onCancel, 
  annotation, 
  labelConfig 
}) => (
  <Dialog 
    open={open} 
    onClose={onCancel}
    PaperProps={{
      sx: {
        width: '100%',
        maxWidth: '500px',
        borderRadius: '8px',
      }
    }}
  >
    <DialogTitle sx={{ pb: 1 }}>
      Confirm Annotation
    </DialogTitle>
    <DialogContent>
      <DialogContentText>
        Are you sure you want to add this annotation?
      </DialogContentText>
      {annotation && labelConfig && (
        <Box 
          sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: 'background.paper', 
            borderRadius: 1,
            border: '1px solid rgba(0,0,0,0.1)'
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Text: <strong>{annotation.text}</strong>
          </Typography>
          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Label: 
            <Chip 
              label={labelConfig.name} 
              size="small" 
              sx={{ backgroundColor: labelConfig.bgColor }}
            />
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block',
              mt: 1,
              color: 'text.secondary'
            }}
          >
            Position: {annotation.start} to {annotation.end}
          </Typography>
        </Box>
      )}
    </DialogContent>
    <DialogActions sx={{ p: 2, pt: 1 }}>
      <Button 
        onClick={onCancel}
        variant="outlined"
        color="inherit"
      >
        Cancel
      </Button>
      <Button 
        onClick={onConfirm}
        variant="contained" 
        color="primary"
        autoFocus
      >
        Confirm
      </Button>
    </DialogActions>
  </Dialog>
));
