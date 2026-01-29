import React from 'react';
import { motion } from 'framer-motion';
import { GRID_ITEM_CLASS, GRID_GAP_CLASS } from '../constants';

interface GridBackgroundProps {
  visible: boolean;
  count?: number; // Approximate number of slots to show
}

const GridBackground: React.FC<GridBackgroundProps> = ({ visible, count = 24 }) => {
  if (!visible) return null;

  // Generate an array of empty slots
  const slots = Array.from({ length: count });

  return (
    <div 
      className={`absolute inset-0 flex flex-wrap justify-center content-start ${GRID_GAP_CLASS} pointer-events-none z-0 px-4`}
      style={{ paddingTop: '0px' }} // Padding handled by parent container
    >
      {slots.map((_, i) => (
        <motion.div
          key={`slot-${i}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2, delay: i * 0.01 }}
          className={`${GRID_ITEM_CLASS} flex flex-col items-center justify-start p-2`}
        >
          {/* Visual representation of an empty slot (Glassmorphism) - Removed Center Dot */}
          <div className="w-[72px] h-[72px] md:w-[88px] md:h-[88px] bg-white/5 rounded-[22px] border-2 border-dashed border-white/20 shadow-inner" />
        </motion.div>
      ))}
    </div>
  );
};

export default GridBackground;