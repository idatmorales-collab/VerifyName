import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Hide custom follower on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Check if target or parent is interactive
      const target = e.target as HTMLElement | null;
      if (target) {
        const clickable = target.closest(
          'button, a, input, select, textarea, label, [role="button"], .cursor-pointer'
        );
        setIsHovered(!!clickable);
      }
    };

    const onMouseDown = () => setIsMouseDown(true);
    const onMouseUp = () => setIsMouseDown(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Outer Cursor Ring */}
      <div
        className={`fixed pointer-events-none z-[9999] rounded-full border transition-transform duration-100 ease-out -translate-x-1/2 -translate-y-1/2 ${
          isHovered
            ? 'w-9 h-9 border-amber-500/80 bg-amber-500/15 scale-125 dark:border-amber-400 dark:bg-amber-400/20'
            : isMouseDown
            ? 'w-6 h-6 border-neutral-800 dark:border-white bg-neutral-800/10 dark:bg-white/10 scale-90'
            : 'w-7 h-7 border-neutral-900/60 dark:border-neutral-200/60 bg-neutral-900/5 dark:bg-white/5'
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`
        }}
      />

      {/* Inner Precision Cursor Dot */}
      <div
        className={`fixed pointer-events-none z-[9999] rounded-full transition-transform duration-75 ease-out -translate-x-1/2 -translate-y-1/2 ${
          isHovered
            ? 'w-2 h-2 bg-amber-500 dark:bg-amber-400 scale-125'
            : isMouseDown
            ? 'w-2.5 h-2.5 bg-neutral-900 dark:bg-white scale-110'
            : 'w-1.5 h-1.5 bg-neutral-900 dark:bg-white'
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`
        }}
      />
    </>
  );
};
