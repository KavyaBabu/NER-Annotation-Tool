export const calculateTextPosition = (container, node, offset) => {
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
  
  export const hasAnnotatedParent = (node, container) => {
    let current = node;
    while (current && current !== container) {
      if (current.hasAttribute && current.hasAttribute('data-annotation-id')) {
        return true;
      }
      current = current.parentNode;
    }
    return false;
  };
  
  export const checkOverlappingAnnotations = (start, end, annotations) => {
    return annotations.some(ann =>
      (start >= ann.start && start < ann.end) ||
      (end > ann.start && end <= ann.end) ||
      (start <= ann.start && end >= ann.end)
    );
  };
  