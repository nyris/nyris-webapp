import { useState, useCallback } from 'react';

interface UseDragAndDropOptions {
  onDropCallback?: (files: File[]) => void;
}

interface UseDragAndDropReturn {
  isDragging: boolean;
  dragProps: {
    onDragOver: (event: React.DragEvent) => void;
    onDragLeave: (event: React.DragEvent) => void;
    onDrop: (event: React.DragEvent) => void;
  };
}

const useDragAndDrop = ({
  onDropCallback,
}: UseDragAndDropOptions = {}): UseDragAndDropReturn => {
  const [isDragging, setIsDragging] = useState(false);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);

      const droppedFiles = Array.from(event.dataTransfer.files);
      if (onDropCallback) {
        onDropCallback(droppedFiles);
      }
    },
    [onDropCallback],
  );

  return {
    isDragging,
    dragProps: {
      onDragOver,
      onDragLeave,
      onDrop,
    },
  };
};

export default useDragAndDrop;
