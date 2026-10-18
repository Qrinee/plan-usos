'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseBottomSheetDragProps {
  onClose: () => void;
}

export function useBottomSheetDrag({ onClose }: UseBottomSheetDragProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartY = useRef<number | null>(null);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 230);
  }, [isClosing, onClose]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleClose]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    if (deltaY > 0) {
      setDragY(deltaY);
    } else {
      setDragY(deltaY * 0.15);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartY.current === null) return;
    touchStartY.current = null;
    setIsDragging(false);
    if (dragY > 60) {
      handleClose();
    } else {
      setDragY(0);
    }
  };

  const resetDrag = useCallback(() => {
    setIsClosing(false);
    setDragY(0);
    setIsDragging(false);
  }, []);

  return {
    isClosing,
    dragY,
    isDragging,
    handleClose,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    resetDrag,
  };
}
