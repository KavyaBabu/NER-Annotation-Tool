import React, { useMemo } from 'react';
import { LABELS, ANNOTATION_STYLE } from '../constants/annotationConstants';

export const AnnotatedText = React.memo(({ text, annotations }) => {
  const renderAnnotatedText = useMemo(() => {
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
        const label = LABELS.find(l => l.id === segment.annotation.label);
        return (
          <span
            key={segment.id}
            style={{
              ...ANNOTATION_STYLE,
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
  }, [text, annotations]);

  return (
    <div
      className="annotated-text-container"
      style={{ 
        lineHeight: 1.6,
        position: 'relative',
        wordBreak: 'break-word',
        cursor: 'text',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        hyphens: 'auto'
      }}
    >
      {renderAnnotatedText}
    </div>
  );
});

