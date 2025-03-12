import { useState, useCallback } from 'react';

interface UseDragAndDropOptions {
  onDropCallback?: (file: File) => void;
}

interface UseDragAndDropReturn {
  isDragging: boolean;
  dragProps: {
    onDragOver: (event: React.DragEvent) => void;
    onDragLeave: (event: React.DragEvent) => void;
    onDrop: (event: React.DragEvent) => void;
  };
}

const getImageFromUrl = async (
  url: string,
  onDownload: (file: File) => void,
) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], 'image.png', { type: blob.type });
    // URL.createObjectURL(file);
    if (onDownload) {
      onDownload(file);
    }
  } catch (err) {
    console.error('Failed to fetch image:', err);
  }
};

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
    async (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);

      const url =
        event.dataTransfer.getData('text/uri-list') ||
        event.dataTransfer.getData('text/plain');

      if (url && url.startsWith('http') && onDropCallback) {
        getImageFromUrl(url, onDropCallback);
        return;
      }

      if (onDropCallback) {
        onDropCallback(event.dataTransfer.files[0]);
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
