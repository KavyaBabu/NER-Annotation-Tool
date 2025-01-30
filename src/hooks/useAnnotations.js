
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export const useAnnotations = (initialState = []) => {
  const [annotations, setAnnotations] = useState(initialState);
  const [pendingAnnotation, setPendingAnnotation] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    try {
      const storedAnnotations = localStorage.getItem('annotations');
      if (storedAnnotations) {
        setAnnotations(JSON.parse(storedAnnotations));
      }
    } catch (error) {
      console.error('Error loading annotations:', error);
      toast.error('Failed to load saved annotations');
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('annotations', JSON.stringify(annotations));
    } catch (error) {
      console.error('Error saving annotations:', error);
      toast.error('Failed to save annotations');
    }
  }, [annotations]);

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
      setAnnotations(prev => {
        const newAnnotations = [...prev, pendingAnnotation];
        return newAnnotations.sort((a, b) => a.start - b.start);
      });
      toast.success('Annotation added successfully', {
        duration: 2000,
      });
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
    toast.success('Annotation removed successfully', {
      duration: 2000,
    });
  }, []);

  const clearAnnotations = useCallback(() => {
    setAnnotations([]);
    localStorage.removeItem('annotations');
    toast.success('All annotations cleared', {
      duration: 2000,
    });
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