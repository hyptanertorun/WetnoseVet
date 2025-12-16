import React, { useEffect, useState } from 'react';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [cursorText, setCursorText] = useState('');

  useEffect(() => {
    const updatePosition = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseOver = (e) => {
      const target = e.target.closest('[data-cursor]');
      if (target) {
        setIsHovering(true);
        setCursorText(target.getAttribute('data-cursor') || '');
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target.closest('[data-cursor]');
      if (target) {
        setIsHovering(false);
        setCursorText('');
      }
    };

    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  return (
    <>
      {/* Main Cursor */}
      <div
        className="fixed pointer-events-none z-[9999] mix-blend-difference hidden lg:block"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)'
        }}
      >
        {/* Outer Ring */}
        <div
          className={`absolute rounded-full border-2 border-white transition-all duration-300 ease-out ${
            isHovering ? 'w-20 h-20 opacity-100' : 'w-10 h-10 opacity-70'
          } ${isClicking ? 'scale-75' : 'scale-100'}`}
          style={{ transform: 'translate(-50%, -50%)' }}
        />
        
        {/* Inner Dot */}
        <div
          className={`absolute bg-white rounded-full transition-all duration-150 ${
            isHovering ? 'w-2 h-2' : 'w-3 h-3'
          } ${isClicking ? 'scale-150' : 'scale-100'}`}
          style={{ transform: 'translate(-50%, -50%)' }}
        />

        {/* Cursor Text */}
        {cursorText && (
          <div 
            className="absolute whitespace-nowrap text-white text-xs font-medium tracking-wider uppercase"
            style={{ 
              transform: 'translate(-50%, -50%)',
              top: '50%',
              left: '50%'
            }}
          >
            {cursorText}
          </div>
        )}
      </div>

      {/* Trailing Effect */}
      <div
        className="fixed pointer-events-none z-[9998] w-6 h-6 rounded-full bg-teal-500/30 blur-sm hidden lg:block"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)',
          transition: 'all 0.15s ease-out'
        }}
      />
    </>
  );
};

export default CustomCursor;
