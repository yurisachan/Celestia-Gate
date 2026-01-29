import React, { useRef } from 'react';
import { motion, PanInfo, useDragControls } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { getIcon, GRID_ITEM_CLASS } from '../constants';
import { LinkItem, Category } from '../types';

interface DesktopIconProps {
  item: Category | LinkItem; 
  onClick: () => void;
  onDelete?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onLongPress?: () => void; 
  isEditMode?: boolean;
  onDragStart?: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
  onDrag?: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
  onDragEnd?: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
  layoutId?: string;
  className?: string;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ 
  item, onClick, onDelete, onContextMenu, onLongPress, isEditMode, 
  onDragStart, onDrag, onDragEnd, layoutId, className 
}) => {
  const isFolder = 'links' in item;
  const folderSize = isFolder ? (item as Category).folderSize || '3x3' : '3x3';
  const controls = useDragControls();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Track if a drag is active to prevent click
  const isDraggingRef = useRef(false);

  // Folder Preview Grid Logic
  const gridClass = folderSize === '2x2' 
    ? 'grid-cols-2 grid-rows-2' 
    : 'grid-cols-3 grid-rows-3';
  const iconLimit = folderSize === '2x2' ? 4 : 9;
  
  // Create fixed-size array for preview to ensure grid shape persists even if empty
  const previewItems = isFolder 
    ? Array.from({ length: iconLimit }, (_, i) => (item as Category).links[i] || null)
    : [];

  // Jiggle Animation for Edit Mode
  const jiggleVariants = {
    idle: { rotate: 0 },
    jiggle: { 
      rotate: [-1.5, 1.5, -1.5], 
      transition: { 
        repeat: Infinity, 
        duration: 0.25,
      } 
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = false;

    if (isEditMode) {
        controls.start(e);
    } else {
        timerRef.current = setTimeout(() => {
            isDraggingRef.current = true; 
            if (onLongPress) onLongPress();
            controls.start(e);
        }, 500); 
    }
  };

  const handlePointerUp = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleDragStartInternal = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      isDraggingRef.current = true;
      if (onDragStart) onDragStart(event, info);
  };

  const handleDragEndInternal = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (onDragEnd) onDragEnd(event, info);
      setTimeout(() => {
          isDraggingRef.current = false;
      }, 100);
  };

  const handleClick = (e: React.MouseEvent) => {
      if (isDraggingRef.current) {
          e.stopPropagation();
          return;
      }
      onClick();
  };

  const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault(); 
      if (onDelete) onDelete();
  };

  const boxClass = "w-[72px] h-[72px] md:w-[88px] md:h-[88px] bg-[#1e2235]/70 backdrop-blur-md rounded-[22px] border border-white/10 shadow-[0_4px_10px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-200 group-hover:border-genshin-gold/50 group-hover:shadow-[0_0_15px_rgba(212,196,152,0.3)]";

  return (
    <motion.div
      layoutId={layoutId}
      drag
      dragControls={controls}
      dragListener={false} 
      dragSnapToOrigin={true}
      dragMomentum={false}
      dragElastic={0.1}
      transition={{ type: "spring", stiffness: 500, damping: 30, mass: 1 }}
      whileDrag={{ scale: 1.15, zIndex: 100, cursor: 'grabbing' }}
      whileHover={{ scale: isEditMode ? 1 : 1.05, zIndex: 10 }}
      whileTap={{ scale: 0.95 }}
      variants={jiggleVariants}
      animate={isEditMode ? "jiggle" : "idle"}
      initial="idle"
      onDragStart={handleDragStartInternal}
      onDrag={onDrag}
      onDragEnd={handleDragEndInternal}
      onContextMenu={onContextMenu}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className={`${GRID_ITEM_CLASS} flex flex-col items-center justify-start p-2 cursor-pointer group relative select-none touch-none ${className || ''}`}
      onClick={handleClick}
    >
      {/* Visual Box Wrapper for Positioning Badge */}
      <div className="relative">
          {/* Main Visual Box */}
          <div className={`${boxClass} ${isFolder ? `p-1.5 grid ${gridClass} gap-1` : 'flex items-center justify-center'}`}>
            {isFolder ? (
              previewItems.map((subItem, idx) => (
                <div 
                  key={subItem ? subItem.id : `empty-${idx}`} 
                  className="w-full h-full rounded-[10px] bg-white/10 flex items-center justify-center overflow-hidden"
                >
                    {subItem ? (
                        subItem.iconUrl ? (
                            <img src={subItem.iconUrl} alt="" className="w-full h-full object-cover pointer-events-none" />
                        ) : (
                            <div className="scale-[0.6] text-genshin-gold">
                                {getIcon(subItem.iconName || 'Compass', { size: 24 })}
                            </div>
                        )
                    ) : null}
                </div>
              ))
            ) : (
              <>
                {(item as LinkItem).iconUrl ? (
                    <img 
                        src={(item as LinkItem).iconUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover pointer-events-none"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                    />
                ) : null}
                <div className={`${(item as LinkItem).iconUrl ? 'hidden' : 'flex'} w-full h-full items-center justify-center text-genshin-gold`}>
                    {getIcon((item as LinkItem).iconName || 'Compass', { size: 36 })}
                </div>
              </>
            )}
          </div>

          {/* Delete Badge */}
          {isEditMode && onDelete && (
            <motion.button
                className="absolute -top-1 -right-1 w-7 h-7 bg-gray-600/90 hover:bg-red-500 text-white flex items-center justify-center rounded-full shadow-lg border border-white/40 transition-colors z-[100]"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onPointerDown={(e) => {
                    e.stopPropagation();
                }}
                onMouseDown={(e) => {
                    e.stopPropagation();
                }}
                onClick={handleDelete}
            >
                <Trash2 size={13} strokeWidth={2.5} className="pointer-events-none" />
            </motion.button>
          )}
      </div>

      {/* Label */}
      <span className="mt-2 text-xs md:text-sm text-center text-gray-200 font-medium drop-shadow-md w-full px-1 truncate font-sans tracking-wide">
        {item.title}
      </span>

    </motion.div>
  );
};

export default DesktopIcon;