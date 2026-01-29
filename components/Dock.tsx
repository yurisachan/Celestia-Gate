import React from 'react';
import { motion } from 'framer-motion';
import { DEFAULT_CATEGORIES, getIcon } from '../constants';

interface DockProps {
  onLinkClick: (url: string) => void;
}

const Dock: React.FC<DockProps> = ({ onLinkClick }) => {
  // Flatten links from all available default categories safely
  // This prevents crashes if DEFAULT_CATEGORIES has fewer items than expected
  const dockItems = DEFAULT_CATEGORIES
    .flatMap(cat => cat.links)
    .slice(0, 7); // Limit to 7 items

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 flex justify-center items-end z-40 group pointer-events-none">
      {/* Interaction Area */}
      <div className="pointer-events-auto absolute bottom-0 h-24 w-full max-w-2xl flex flex-col items-center justify-end pb-2">
        
        {/* The Dock Container */}
        <motion.div
          className="flex items-end gap-2 px-4 py-3 bg-genshin-dark/70 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl mb-2 translate-y-[120%] group-hover:translate-y-0 transition-transform duration-300 ease-out"
        >
          {dockItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.2, y: -10 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onLinkClick(item.url)}
              className="relative p-3 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 text-genshin-gold hover:text-white hover:border-genshin-gold/50 hover:shadow-[0_0_15px_rgba(212,196,152,0.3)] transition-all tooltip-trigger"
              title={item.title}
            >
              {getIcon(item.iconName || 'Compass', { size: 24 })}
              {/* Tooltip */}
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 pointer-events-none whitespace-nowrap">
                {item.title}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* The White Bar Indicator (iOS/macOS style) */}
        <div className="w-32 h-1.5 bg-white/30 rounded-full group-hover:opacity-0 transition-opacity duration-300 mb-2" />
      </div>
    </div>
  );
};

export default Dock;